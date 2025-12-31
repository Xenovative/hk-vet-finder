# HK Vet Finder - VPS Deployment Guide

## 1. Prerequisites
- Ubuntu 20.04/22.04 VPS
- Node.js 18+ and npm installed
- Nginx installed
- Git (if pulling from a repo)

## 2. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (via NVM recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20

# Install PM2 globally
npm install -g pm2
```

## 3. Application Deployment
1. Upload your code to `/var/www/hk-vet-finder`.
2. Create your `.env.local` file with API keys:
   ```bash
   OPENAI_API_KEY=your_key
   GEMINI_API_KEY=your_key
   NEXT_PUBLIC_AI_POWERED=true
   ```
3. Run the deployment script:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

## 4. Nginx Configuration
Create `/etc/nginx/sites-available/hkvetfinder`:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Link and restart:
```bash
sudo ln -s /etc/nginx/sites-available/hkvetfinder /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 5. SSL (Certbot)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your_domain.com
```
