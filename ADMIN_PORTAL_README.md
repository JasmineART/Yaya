# Yaya Starchild Admin Portal

A comprehensive admin dashboard for managing the Yaya Starchild website content, products, and coupons with automatic deployment.

## ✨ Features

- **Product Management**: Add, edit, and delete products with ease
- **Coupon Management**: Create and manage discount codes
- **Content Management**: Edit website text and content
- **Credential Management**: Update admin login credentials
- **Automatic Deployment**: Changes are automatically committed and deployed to live site
- **Backup & Export**: Download site data backups
- **User-Friendly Interface**: Designed for non-technical users

## 🚀 Getting Started

### Access the Admin Portal

1. Visit any page on the website
2. Scroll to the footer and click "Admin Login"
3. Or directly visit: `/admin-login.html`

### Default Credentials

- **Username**: `AdminYaya`
- **Password**: `poem_123`

### Admin Dashboard Sections

#### 1. Overview
- View site statistics
- Quick access to key metrics
- Site status overview

#### 2. Product Management
- **Add New Products**: Complete product information forms
- **Current Products**: View, edit, or delete existing products
- **Product Fields**:
  - Title
  - Price
  - Description
  - Icon (Font Awesome class)
  - ISBN (optional)
  - Image path

#### 3. Coupon Management
- **Add New Coupons**: Create discount codes
- **Coupon Types**:
  - Percentage off (e.g., 25% off)
  - Flat dollar amount (e.g., $10 off)
  - Buy one get 2nd 50% off
- **Active Coupons**: View and manage existing coupons

#### 4. Content Management
- **Homepage Content**: Update tagline and hero text
- **About Page**: Edit author biography
- Real-time content updates

#### 5. Settings
- **Change Credentials**: Update admin username/password
- **Backup & Export**: Download site data
- **Security**: Session management

## 💾 Save & Deploy

The **green "Save & Deploy Site" button** appears whenever you make changes:

1. Make your edits in any section
2. Green button appears in bottom-right corner
3. Click to commit changes and deploy to live site
4. Automatic Git commit and push
5. GitHub Pages deployment triggered

## 🔧 Technical Details

### Architecture

- **Frontend**: Pure HTML/CSS/JavaScript dashboard
- **Backend**: Express.js API for file operations
- **Database**: File-based (products.js, app.js modifications)
- **Deployment**: Git commits trigger GitHub Actions
- **Authentication**: Session-based with credential updates

### File Updates

The admin system updates these files automatically:

- `products.js` - Product catalog
- `app.js` - Discount codes and site functionality  
- `index.html`, `about.html` - Content updates
- Git commits with timestamps

### Security Features

- Session-based authentication (4-hour expiration)
- Credential encryption in transit
- Admin-only file access
- Automatic logout on session expiry

## 🛠️ Development

### Starting the Admin API Server

```bash
# Start the admin API backend
npm run admin

# Or manually
node start-admin-api.js
```

The API runs on port 3001 by default.

### API Endpoints

- `GET /api/admin/data` - Get current site data
- `POST /api/admin/products` - Update products
- `POST /api/admin/coupons` - Update coupons  
- `POST /api/admin/content` - Update content
- `POST /api/admin/deploy` - Deploy site changes
- `POST /api/admin/credentials` - Update admin credentials

### File Structure

```
admin-login.html          # Admin login page
admin-dashboard.html      # Main admin interface
admin-dashboard.js        # Frontend dashboard logic
admin-api.js             # Backend API server
start-admin-api.js       # API server startup script
admin-credentials.json   # Stored credentials (auto-generated)
```

## 🎨 Customization

### Adding New Content Fields

1. Add form fields to `admin-dashboard.html`
2. Add handling in `admin-dashboard.js`
3. Add API endpoint in `admin-api.js`
4. Add file update logic for target HTML files

### Styling

Admin styles are embedded in the HTML files and inherit from the main `styles.css`. The admin interface uses the site's existing design system with glassmorphism effects.

## 🔒 Security Notes

- Change default credentials immediately after first login
- Admin pages are marked `noindex, nofollow`
- Sessions expire after 4 hours of inactivity
- All changes are logged via Git commits
- Admin API requires authentication tokens

## 📞 Support

For technical issues or questions about the admin portal, the system includes:

- Built-in error messages and status updates
- Console logging for debugging
- Automatic fallback to local-only mode if API unavailable
- Export functionality for data backup

## 🎯 Best Practices

1. **Regular Backups**: Use the export feature regularly
2. **Test Changes**: Review products/coupons before major updates
3. **Credential Security**: Update default passwords
4. **Monitor Deployments**: Watch for successful deployment confirmations
5. **Content Staging**: Make changes during low-traffic periods

The admin portal is designed to be intuitive and safe for non-technical users while providing powerful content management capabilities.