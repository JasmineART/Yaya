require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// basic rate limiting
const limiter = rateLimit({ windowMs: 60*1000, max: 60 });
app.use(limiter);

const stripeSecret = process.env.STRIPE_SECRET || '';
const stripe = stripeSecret ? Stripe(stripeSecret) : null;
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE || '';
const supabase = (supabaseUrl && supabaseServiceRole) ? createClient(supabaseUrl, supabaseServiceRole) : null;
const nodemailer = require('nodemailer');
const smtpHost = process.env.SMTP_HOST;
let mailer = null;
if(smtpHost){
  mailer = nodemailer.createTransport({host:process.env.SMTP_HOST,port:parseInt(process.env.SMTP_PORT||587,10),secure:false,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
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

app.get('/',(req,res)=>res.json({ok:true,server:'Yaya payments mock server'}));

// Create a Stripe Checkout session
app.post('/create-stripe-session', [
  body('items').isArray().notEmpty(),
  body('items.*.id').isInt(),
  body('items.*.qty').isInt({min:1})
], async (req,res)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});
  if(!stripe) return res.status(500).json({error:'Stripe not configured'});
  try{
    const {items, successUrl, cancelUrl} = req.body;
    // Map items to line_items
    const line_items = (items||[]).map(it=>({price_data:{currency:'usd',product_data:{name:it.title},unit_amount:Math.round(it.price*100)},quantity:it.qty}));
    const session = await stripe.checkout.sessions.create({payment_method_types:['card'],mode:'payment',line_items,success_url:successUrl || 'http://localhost:8000/index.html',cancel_url:cancelUrl || 'http://localhost:8000/cart.html'});
    // Optionally persist an order placeholder in Supabase
    if(supabase){
      try{ await supabase.from('orders').insert([{stripe_session_id:session.id,metadata:{items},status:'created',created_at:new Date().toISOString()}]); }catch(e){console.warn('supabase insert failed',e)}
    }
    res.json({url:session.url, id: session.id});
  }catch(err){
    console.error(err);
    res.status(500).json({error:err.message});
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
app.listen(port,()=>console.log('Server running on',port));

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
const fs = require('fs');
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
