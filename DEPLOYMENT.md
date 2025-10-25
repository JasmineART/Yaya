# GitHub Pages Deployment Guide

## 🌟 Yaya Starchild Poetry Website

This repository contains the source code for Yaya Starchild's poetry website, featuring the book "Suncatcher Spirit" and official merchandise.

## 🚀 GitHub Pages Deployment

### Automatic Deployment
This site is configured for automatic deployment to GitHub Pages using GitHub Actions:

1. **Push to main branch** - Automatically triggers deployment
2. **GitHub Actions builds** - Runs `npm run build` to prepare static files  
3. **Deploys to GitHub Pages** - Site becomes available at your GitHub Pages URL

### Manual Deployment Setup

To set up GitHub Pages for your repository:

1. Go to your repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The workflow file is already configured in `.github/workflows/deploy.yml`

### Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm start
# Opens at http://localhost:3000

# Build for GitHub Pages
npm run build
# Creates /dist directory with static files
```

### Site Structure

- `index.html` - Homepage with book showcase
- `shop.html` - Product catalog
- `product.html` - Individual product pages
- `about.html` - Author biography
- `cart.html` - Shopping cart
- `checkout.html` - Purchase flow
- `styles.css` - Main stylesheet with glass morphism design
- `assets/` - Images, logos, and media files

### Features

- ✨ **Glass Morphism Design** - Beautiful transparent effects
- 📱 **Fully Responsive** - Works on all devices
- 🛒 **E-commerce Ready** - Shopping cart and checkout flow
- 🎨 **Interactive Elements** - Smooth animations and hover effects
- 📚 **Book Showcase** - Poetry collection presentation
- 🏪 **Merchandise Store** - Stickers and book variants

### Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Cinzel, Inter)
- **Deployment**: GitHub Pages with GitHub Actions

### GitHub Pages URL

Once deployed, your site will be available at:
`https://[username].github.io/[repository-name]`

For custom domains, add a `CNAME` file to the root directory.

---

© 2025 Yaya Starchild • Pastel Poetics • Made with magic ✨