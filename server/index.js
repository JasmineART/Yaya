require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Render.com outbound IP addresses for allowlisting
// These IPs may need to be whitelisted in external services (Stripe, payment gateways, etc.)
const RENDER_OUTBOUND_IPS = [
  '44.229.227.142',
  '54.188.71.94',
  '52.13.128.108',
  '74.220.48.0/24',
  '74.220.56.0/24'
];

// CORS configuration - allow requests from your domain
const corsOptions = {
  origin: [
    'https://pastelpoetics.com',
    'https://www.pastelpoetics.com',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://127.0.0.1:8080'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// basic rate limiting
const limiter = rateLimit({ windowMs: 60*1000, max: 60 });
app.use(limiter);

// Read Stripe secret from environment variables
// Priority order: SECRET_TEST_KEY (Render) > STRIPE_SECRET_KEY > STRIPE_SECRET_LIVE_KEY
const fs = require('fs');
const _rawStripe = process.env.SECRET_TEST_KEY || process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_LIVE_KEY || process.env.STRIPE_SECRET || process.env.STRIPE_LIVE_SECRET || (() => {
  try {
    // Docker/Render secrets are sometimes mounted at /run/secrets/<name>
    return fs.readFileSync('/run/secrets/stripe', 'utf8');
  } catch (e) {
    return '';
  }
})();

// Sanitize the secret: trim whitespace and strip surrounding quotes (in case env was pasted with quotes)
const stripeSecret = _rawStripe && typeof _rawStripe === 'string' ? _rawStripe.trim().replace(/^\"|\"$/g, '').replace(/^\'|\'$/g, '') : '';
const stripe = stripeSecret ? Stripe(stripeSecret) : null;
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE || '';
const supabase = (supabaseUrl && supabaseServiceRole) ? createClient(supabaseUrl, supabaseServiceRole) : null;
const nodemailer = require('nodemailer');

// Log server configuration on startup (no secrets)
console.log('🔧 Server Configuration:');
if (stripe) {
  const hint = stripeSecret && stripeSecret.length ? `${stripeSecret.slice(0, 8)}...${stripeSecret.slice(-8)}` : 'configured';
  console.log('  Stripe: ✅ Configured (' + hint + ')');
} else {
  console.log('  Stripe: ❌ NOT CONFIGURED');
}
if (stripeSecret) {
  console.log('  STRIPE key: set (' + stripeSecret.length + ' chars)');
} else {
  console.log('  ⚠️  No Stripe secret key found in environment or /run/secrets/stripe');
}
console.log('  Supabase:', supabase ? '✅ Configured' : '⚠️  Not configured');
console.log('  CORS Origins:', corsOptions.origin);
const smtpHost = process.env.SMTP_HOST;
let mailer = null;
if(smtpHost){
  mailer = nodemailer.createTransport({host:process.env.SMTP_HOST,port:parseInt(process.env.SMTP_PORT||587,10),secure:false,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
}
// Firebase Admin (optional) - initialize with service account JSON in env or path
const admin = require('firebase-admin');
let firestore = null;
const firebaseServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT || '';
const firebaseServiceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '';
if(firebaseServiceAccount || firebaseServiceAccountPath){
  try{
    const serviceAccount = firebaseServiceAccount ? JSON.parse(firebaseServiceAccount) : require(firebaseServiceAccountPath);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    firestore = admin.firestore();
    console.log('Firebase Admin initialized');
  }catch(e){
    console.warn('Firebase Admin init failed', e && e.message ? e.message : e);
  }
}
// In-memory sent emails for local tests (do not rely on this in production)
const sentEmails = [];

const sendgridKey = process.env.SENDGRID_API_KEY;
let sendgrid = null;
if(sendgridKey){
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(sendgridKey);
  sendgrid = sgMail;
}

// Root endpoint with configuration status
app.get('/', (req, res) => {
  res.json({
    ok: true,
    server: 'Yaya payments mock server',
    configured: {
      stripe: stripe !== null,
      supabase: supabase !== null
    }
  });
});

// Health check endpoint with environment diagnostics (no secrets exposed)
app.get('/_health', (req, res) => {
  const has_STRIPE_SECRET_LIVE_KEY = !!process.env.STRIPE_SECRET_LIVE_KEY;
  const has_STRIPE_SECRET_KEY = !!process.env.STRIPE_SECRET_KEY;
  const has_other_stripe_env = !!(process.env.STRIPE_SECRET || process.env.STRIPE_LIVE_SECRET);
  const key_length = stripeSecret ? stripeSecret.length : 0;

  res.json({
    ok: true,
    environment: {
      stripe: {
        configured: stripe !== null,
        has_STRIPE_SECRET_LIVE_KEY,
        has_STRIPE_SECRET_KEY,
        has_other_stripe_env,
        key_length,
        expected_length: 'varies'
      },
      supabase: {
        configured: supabase !== null,
        has_SUPABASE_URL: !!process.env.SUPABASE_URL,
        has_SUPABASE_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE
      },
      email: {
        smtp_configured: mailer !== null,
        sendgrid_configured: !!process.env.SENDGRID_API_KEY
      }
    },
    status: {
      ready_for_payments: stripe !== null,
      ready_for_orders: supabase !== null,
      ready_for_emails: mailer !== null || !!process.env.SENDGRID_API_KEY
    }
  });
});

// Create a Stripe Checkout session
// BILLING LOGIC:
// 1. Frontend sends: items (with original prices), subtotal (already discounted), discountAmount, shipping, tax, total
// 2. Backend calculates discount ratio from original item prices to match frontend's discounted subtotal
// 3. Each item's price is reduced proportionally by the discount ratio
// 4. Shipping and tax are added as separate line items (already calculated on discounted subtotal by frontend)
// 5. Stripe charges: (discounted items total) + shipping + tax
// 6. We verify Stripe's total matches frontend's total and log any discrepancies
app.post('/create-stripe-session', async (req,res)=>{
  if(!stripe) return res.status(500).json({error:'Stripe not configured'});
  try{
    const {items, customer, discountAmount, discountCode, shipping, tax, taxRate, subtotal, total, successUrl, cancelUrl} = req.body;
    const normalizedShipping = Number(shipping) || 0;
    const normalizedTax = Number(tax) || 0;
    const normalizedTaxRate = Number(taxRate) || 0;
    const normalizedSubtotal = Number(subtotal) || 0;
    const normalizedTotal = Number(total) || 0;
    
    // Debug logging
    console.log('📦 Stripe session request received:', {
      itemsCount: items?.length,
      customer: customer?.name,
      shipping: normalizedShipping,
      tax: normalizedTax,
      subtotal: normalizedSubtotal,
      total: normalizedTotal,
      discountCode,
      discountAmount
    });
    
    if(!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({error:'Items array is required'});
    }
    
    // Calculate the original subtotal from items (before discount)
    const calculatedOriginalSubtotal = items.reduce((sum, item) => {
      return sum + ((Number(item.price) || 0) * (Number(item.quantity || item.qty) || 1));
    }, 0);
    
    // The frontend sends 'subtotal' which is the ORIGINAL subtotal (before discount)
    // We use this to verify calculations match, then apply discount
    const originalSubtotal = normalizedSubtotal || calculatedOriginalSubtotal;
    const normalizedDiscountAmount = Math.max(0, Math.min(Number(discountAmount) || 0, originalSubtotal));
    let discountRatio = 1;
    
    if (normalizedDiscountAmount > 0 && originalSubtotal > 0) {
      // Calculate ratio: if $100 original becomes $80 after $20 discount, ratio = 0.8
      const discountedSubtotal = originalSubtotal - normalizedDiscountAmount;
      discountRatio = discountedSubtotal / originalSubtotal;
      console.log('💰 Discount calculation:', {
        originalSubtotal: originalSubtotal.toFixed(2),
        discountAmount: normalizedDiscountAmount.toFixed(2),
        discountedSubtotal: discountedSubtotal.toFixed(2),
        discountRatio: discountRatio.toFixed(4)
      });
    }
    
    // Map items to line_items for Stripe with discounted prices
    const line_items = items.map(item => {
      const originalPrice = Number(item.price) || 0;
      const discountedPrice = originalPrice * discountRatio; // Apply discount proportionally to match frontend
      
      const product_data = {
        name: item.name || item.title || 'Product',
        images: item.image ? [`${req.headers.origin || 'https://pastelpoetics.com'}/${item.image}`] : []
      };
      
      // Only add description if it has a value (Stripe doesn't allow empty strings)
      if (item.description) {
        product_data.description = item.description;
      }
      
      // Add discount indicator to product name if discount applied
      if (normalizedDiscountAmount > 0 && discountCode) {
        product_data.name = `${product_data.name} (${discountCode} applied)`;
      }
      
      return {
        price_data: {
          currency: 'usd',
          product_data,
          unit_amount: Math.round(discountedPrice * 100) // Convert to cents with discount applied
        },
        quantity: Number(item.quantity || item.qty) || 1
      };
    });
    
    // Note: Stripe doesn't support negative line items
    // Discounts are handled by reducing the subtotal before adding shipping/tax
    // The discount info is stored in metadata for reference
    
    console.log('🔍 Checking shipping and tax values:', {
      shipping: normalizedShipping,
      shippingType: typeof normalizedShipping,
      shippingGreaterThanZero: normalizedShipping > 0,
      tax: normalizedTax,
      taxType: typeof normalizedTax,
      taxGreaterThanZero: normalizedTax > 0
    });
    
    // Add shipping as a line item
    if (normalizedShipping > 0) {
      console.log('✅ Adding shipping line item: $' + normalizedShipping);
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Standard Shipping',
            description: 'Processing time: 2 to 3 business days before shipping'
          },
              unit_amount: Math.round(normalizedShipping * 100)
        },
        quantity: 1
      });
    } else {
      console.log('❌ Shipping NOT added:', { shipping: normalizedShipping, condition: normalizedShipping > 0 });
    }
    
    // Add tax as a line item
    if (normalizedTax > 0) {
      console.log('✅ Adding tax line item: $' + normalizedTax);
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Sales Tax (${normalizedTaxRate ? (normalizedTaxRate * 100).toFixed(1) : '8.5'}%)`,
            description: 'State and local sales tax'
          },
          unit_amount: Math.round(normalizedTax * 100)
        },
        quantity: 1
      });
    } else {
      console.log('❌ Tax NOT added:', { tax: normalizedTax, condition: normalizedTax > 0 });
    }
    
    // Log line items being sent to Stripe
    console.log('📋 Line items for Stripe:', line_items.map(li => ({
      name: li.price_data.product_data.name,
      amount: `$${(li.price_data.unit_amount / 100).toFixed(2)}`,
      qty: li.quantity
    })));
    
    const stripeTotal = line_items.reduce((sum, item) => {
      return sum + (item.price_data.unit_amount * item.quantity);
    }, 0) / 100;
    
    console.log('💵 Stripe checkout total will be: $' + stripeTotal.toFixed(2));
    console.log('💵 Frontend calculated total: $' + normalizedTotal.toFixed(2));
    
    // Verify totals match (within 1 cent due to rounding)
    const totalDifference = Math.abs(stripeTotal - normalizedTotal);
    if (totalDifference > 0.01) {
      console.warn('⚠️ TOTAL MISMATCH! Stripe will charge $' + stripeTotal.toFixed(2) + ' but frontend calculated $' + normalizedTotal.toFixed(2));
      console.warn('⚠️ Difference: $' + totalDifference.toFixed(2));
    } else {
      console.log('✅ Total verification passed - Stripe charge matches frontend calculation');
    }
    
    // Create Stripe checkout session
    const sessionConfig = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: successUrl || 'https://pastelpoetics.com/success.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl || 'https://pastelpoetics.com/cart.html',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU']
      },
      billing_address_collection: 'required',
      metadata: {
        customer_name: customer?.name || 'Guest',
        discount_code: discountCode || '',
        discount_amount: normalizedDiscountAmount.toString(),
        shipping_amount: normalizedShipping.toString(),
        tax_amount: normalizedTax.toString(),
        tax_rate: normalizedTaxRate.toString(),
        order_source: 'yaya_website'
      }
    };
    
    // Add customer email if provided
    if (customer && customer.email) {
      sessionConfig.customer_email = customer.email;
    }
    
    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    // Store order information in Supabase
    if(supabase){
      try{
        const discountedSubtotal = originalSubtotal - normalizedDiscountAmount;
        await supabase.from('orders').insert([{
          stripe_session_id: session.id,
          customer_email: customer?.email || '',
          customer_name: customer?.name || '',
          total_amount: stripeTotal,  // Use actual Stripe total, not frontend calculation
          subtotal_amount: discountedSubtotal,  // Discounted subtotal (after discount applied)
          discount_code: discountCode || '',
          discount_amount: normalizedDiscountAmount,
          shipping_amount: normalizedShipping,
          tax_amount: normalizedTax,
          metadata: {items, customer, frontend_total: normalizedTotal, original_subtotal: originalSubtotal},
          status: 'created',
          created_at: new Date().toISOString()
        }]); 
        console.log('✅ Order stored in Supabase with Stripe total: $' + stripeTotal.toFixed(2));
      } catch(e) {
        console.warn('supabase insert failed',e);
      }
    }
    
    console.log('✅ Stripe session created:', { 
      sessionId: session.id, 
      originalSubtotal: calculatedOriginalSubtotal.toFixed(2),
      discountedSubtotal: (originalSubtotal - normalizedDiscountAmount).toFixed(2),
      discountCode,
      discountAmount: normalizedDiscountAmount.toFixed(2),
      shipping: normalizedShipping.toFixed(2),
      tax: normalizedTax.toFixed(2),
      stripeChargeTotal: stripeTotal.toFixed(2),
      frontendTotal: normalizedTotal.toFixed(2)
    });
    res.json({url: session.url, id: session.id});
    
  }catch(err){
    console.error('❌ Stripe session creation failed:', err);
    res.status(500).json({error: err.message});
  }
});

// Create a PayPal order (server-side). This example uses OAuth to get token and create an order. Requires PAYPAL_CLIENT_ID and PAYPAL_SECRET
app.post('/create-paypal-order', [
  body('items').isArray().notEmpty(),
  body('items.*.id').isInt(),
  body('items.*.qty').isInt({min:1})
], async (req,res)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if(!clientId || !secret) return res.status(500).json({error:'PayPal not configured'});
  try{
    // get access token
    const tokenRes = await fetch(`https://api-m.sandbox.paypal.com/v1/oauth2/token`,{method:'POST',headers:{'Authorization':'Basic '+Buffer.from(clientId+':'+secret).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'});
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;
    // Build order
    const {items, returnUrl, cancelUrl} = req.body;
    const total = (items||[]).reduce((s,it)=>s + it.price*it.qty,0).toFixed(2);
    const orderBody = {intent:'CAPTURE',purchase_units:[{amount:{currency_code:'USD',value:total}}],application_context:{return_url:returnUrl || 'http://localhost:8000/index.html',cancel_url:cancelUrl || 'http://localhost:8000/cart.html'}};
    const orderRes = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders',{method:'POST',headers:{'Authorization':'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify(orderBody)});
    const orderJson = await orderRes.json();
    if(supabase){
      try{ await supabase.from('orders').insert([{paypal_order_id:orderJson.id,metadata:{items},status:'created',created_at:new Date().toISOString()}]); }catch(e){console.warn('supabase insert failed',e)}
    }
    res.json(orderJson);
  }catch(err){console.error(err);res.status(500).json({error:err.message})}
});

// Client can post newsletter and comments to the server which will insert to Supabase
app.post('/newsletter', [body('email').isEmail(), body('g-recaptcha-response').optional()], async (req,res)=>{
  if(!supabase) return res.status(500).json({error:'supabase not configured'});
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});
  const {email} = req.body;
  // verify recaptcha if provided
  const recaptcha = req.body['g-recaptcha-response'] || req.headers['x-recaptcha-token'];
  if(process.env.RECAPTCHA_SECRET && recaptcha){
    const r = await fetch(`https://www.google.com/recaptcha/api/siteverify`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:`secret=${process.env.RECAPTCHA_SECRET}&response=${recaptcha}`});
    const jr = await r.json();
    if(!jr.success) return res.status(400).json({error:'recaptcha failed'});
  }
  try{
    const {error} = await supabase.from('newsletter').insert([{email,created_at:new Date().toISOString()}]);
    if(error) throw error;
    res.json({ok:true});
  }catch(err){res.status(500).json({error:err.message});}
});

app.post('/comments', [body('name').isLength({min:1}), body('text').isLength({min:1}), body('g-recaptcha-response').optional()], async (req,res)=>{
  if(!supabase) return res.status(500).json({error:'supabase not configured'});
  const recaptcha = req.body['g-recaptcha-response'] || req.headers['x-recaptcha-token'];
  if(process.env.RECAPTCHA_SECRET && recaptcha){
    const r = await fetch(`https://www.google.com/recaptcha/api/siteverify`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:`secret=${process.env.RECAPTCHA_SECRET}&response=${recaptcha}`});
    const jr = await r.json();
    if(!jr.success) return res.status(400).json({error:'recaptcha failed'});
  }
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});
  const {name,text} = req.body;
  try{
    const {error} = await supabase.from('comments').insert([{name,text,created_at:new Date().toISOString()}]);
    if(error) throw error;
    res.json({ok:true});
  }catch(err){res.status(500).json({error:err.message});}
});

// Read comments (server-side proxy to Supabase)
app.get('/comments', async (req,res)=>{
  if(!supabase) return res.status(500).json({error:'supabase not configured'});
  try{
    const {data,error} = await supabase.from('comments').select('name,text,created_at').order('created_at',{ascending:false}).limit(50);
    if(error) throw error;
    res.json(data);
  }catch(err){res.status(500).json({error:err.message});}
});

const port = process.env.PORT || 4242;
app.listen(port, () => {
  console.log('🚀 Server running on port', port);
  console.log('💳 Ready to process payments:', stripe !== null);
  console.log('📊 Health check available at: /_health');
});

// Stripe webhook endpoint for order finalization (optional)
app.post('/webhook/stripe', express.raw({type:'application/json'}), (req,res)=>{
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event = null;
  try{
    if(webhookSecret){ event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret); }
    else { event = req.body; }
  }catch(err){ console.error('Webhook error',err.message); return res.status(400).send(`Webhook Error: ${err.message}`); }

  if(event && event.type === 'checkout.session.completed'){
    const session = event.data.object;
    // update order record in supabase
    if(supabase){
      supabase.from('orders').update({status:'paid',paid_at:new Date().toISOString()}).eq('stripe_session_id', session.id).then(async ()=>{
        // try to send confirmation email if session contains customer_details
        try{
          const orderRes = await supabase.from('orders').select('*').eq('stripe_session_id', session.id).limit(1).single();
          const order = orderRes.data;
          const email = session.customer_details && session.customer_details.email;
          if(mailer && email){
            // Use HTML template if available
            try{
              const tpl = fs.readFileSync(__dirname + '/templates/confirmation_email.html','utf8');
              const html = tpl.replace('{{NAME}}', (order && order.metadata && order.metadata.customer_name) || 'Friend').replace('{{ORDER_ID}}', order.id);
              await mailer.sendMail({from:process.env.SMTP_USER,to:email,subject:'Yaya Starchild — Order confirmation',text:`Thanks for your order! Order id: ${order.id}`,html});
              sentEmails.push({to:email,subject:'Order confirmation',orderId:order.id,html});
            }catch(e){
              await mailer.sendMail({from:process.env.SMTP_USER,to:email,subject:'Yaya Starchild — Order confirmation',text:`Thanks for your order! Order id: ${order.id}`});
              sentEmails.push({to:email,subject:'Order confirmation',orderId:order.id});
            }
          }
        }catch(e){console.warn('confirm email failed',e)}
      }).catch(()=>{});
    }
  }
  res.json({received:true});
});

// Serve a simple order confirmation page
app.get('/order-confirmation/:id', async (req,res)=>{
  const id = req.params.id;
  try{
    const tpl = fs.readFileSync(__dirname + '/templates/order_confirmation.html','utf8');
    res.send(tpl.replace('{{ORDER_ID}}', id));
  }catch(e){res.status(500).send('Error loading template');}
});

// Debug endpoints for tests (only intended for local dev)
app.get('/_debug/sent-emails', (req,res)=>{
  res.json(sentEmails);
});

app.get('/_debug/orders', async (req,res)=>{
  if(!supabase) return res.status(500).json({error:'supabase not configured'});
  try{
    const {data,error} = await supabase.from('orders').select('*').order('created_at',{ascending:false}).limit(50);
    if(error) throw error;
    res.json(data);
  }catch(e){res.status(500).json({error:e.message});}
});

// New endpoint: accept order submissions, persist to Firebase Firestore (if configured) and send an email to COMPANY_EMAIL
app.post('/submit-order', [
  body('name').isLength({min:1}),
  body('email').isEmail(),
  body('items').isArray({min:1})
], async (req,res)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});
  const {name,email,address,city,items,giftWrap,pay} = req.body;
  const order = {name,email,address,city,items,giftWrap:!!giftWrap,pay,created_at:new Date().toISOString()};
  try{
    let docId = null;
    if(firestore){
      const docRef = await firestore.collection('orders').add(order);
      docId = docRef.id;
    }else if(supabase){
      try{ const {data,error} = await supabase.from('orders').insert([Object.assign({},order,{created_at:new Date().toISOString()})]).select(); if(error) console.warn('supabase order insert failed',error); else if(data && data[0] && data[0].id) docId = data[0].id; }catch(e){console.warn('supabase insert error',e)}
    }

    // Prepare email body
    const summary = (items||[]).map(i=>`<li>${i.title || i.id} × ${i.qty} — $${(i.price||0).toFixed ? (i.price||0).toFixed(2) : (i.price||0)}</li>`).join('');
    const html = `<p>New order received</p><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Address:</strong> ${address || ''} ${city || ''}</p><p><strong>Items:</strong></p><ul>${summary}</ul><p><strong>Gift wrap:</strong> ${giftWrap ? 'Yes' : 'No'}</p><p><strong>Order ID:</strong> ${docId || 'n/a'}</p>`;

    const recipient = process.env.COMPANY_EMAIL || process.env.EMAIL_TO || process.env.SMTP_USER;
    if(!recipient) console.warn('No COMPANY_EMAIL configured; order will be stored but not emailed');

    if(process.env.SENDGRID_API_KEY && recipient){
      try{
        await sendgrid.send({to:recipient,from:process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@yaya.example',subject:'New Yaya order',html});
        sentEmails.push({to:recipient,subject:'New Yaya order',orderId:docId});
      }catch(e){console.warn('SendGrid send failed',e)}
    }else if(mailer && recipient){
      try{
        await mailer.sendMail({from:process.env.EMAIL_FROM || process.env.SMTP_USER, to: recipient, subject: 'New Yaya order', text: `New order from ${name} (${email})`, html});
        sentEmails.push({to:recipient,subject:'New Yaya order',orderId:docId});
      }catch(e){console.warn('Mailer send failed',e)}
    }

    res.json({ok:true,id:docId});
  }catch(err){
    console.error('submit-order failed',err);
    res.status(500).json({error:err.message});
  }
});
