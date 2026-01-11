# Deployment Guide

Complete step-by-step guide to deploy your Strapi application to Hetzner Cloud.

## Prerequisites

- Hetzner Cloud account
- GitHub repository with your code
- Domain names configured (optional but recommended)

## Step 1: Create Hetzner Cloud Server

1. **Create a new server:**
   - Type: **CX23** (2 vCPU, 4GB RAM, 40GB SSD)
   - Image: **Ubuntu 22.04 LTS** or **24.04 LTS**
   - Location: Choose your preferred location
   - SSH Key: Select your SSH key (created earlier)
   - Cloud Config: Copy contents from `cloud-config.yml`

2. **Note your server IP address** (e.g., `YOUR_SERVER_IP`)

## Step 2: Initial Server Setup

1. **SSH into your server:**
   ```bash
   ssh hetzner
   # or: ssh -i ~/.ssh/hetzner_cloud root@YOUR_SERVER_IP
   ```

2. **Verify Docker is installed:**
   ```bash
   docker --version
   docker-compose --version
   ```

3. **Clone your repository:**
   ```bash
   cd /root
   git clone YOUR_GITHUB_REPO_URL dekunstmakers-strapi
   cd dekunstmakers-strapi
   ```

## Step 3: Configure Environment Variables

1. **Create `.env` file on your server:**
   ```bash
   nano .env
   ```

2. **Add required variables:**
   ```env
   # GitHub Container Registry
   GITHUB_OWNER=your-github-username
   # GITHUB_TOKEN=your-token  # Only needed for private repositories

   # Database
   DATABASE_CLIENT=postgres
   DATABASE_HOST=postgres
   DATABASE_PORT=5432
   DATABASE_NAME=strapi
   DATABASE_USERNAME=strapi
   DATABASE_PASSWORD=YOUR_STRONG_PASSWORD

   # Strapi Secrets
   APP_KEYS=YOUR_APP_KEYS
   API_TOKEN_SALT=YOUR_API_TOKEN_SALT
   ADMIN_JWT_SECRET=YOUR_ADMIN_JWT_SECRET
   TRANSFER_TOKEN_SALT=YOUR_TRANSFER_TOKEN_SALT
   JWT_SECRET=YOUR_JWT_SECRET

   # Traefik/SSL
   ACME_EMAIL=your-email@example.com

   # Node Environment
   NODE_ENV=production

   # Server Configuration
   HOST=0.0.0.0
   PORT=1337
   ```

3. **Generate Strapi secrets:**
   ```bash
   openssl rand -base64 32  # Run this 5 times for the secrets above
   ```

## Step 4: Update Docker Compose Configuration

1. **Update `docker-compose.yml` (if needed):**
   - The image uses `ghcr.io/${GITHUB_OWNER}/dekunstmakers-strapi:latest`
   - Set `GITHUB_OWNER` in your `.env` file (your GitHub username)

2. **Update domain names** (if using custom domains):
   - Replace `admin.dekunstmakers.com` with your domain
   - Replace `traefik.dekunstmakers.com` with your Traefik dashboard domain

## Step 6: Configure DNS

Point your domains to your server IP:

- `admin.dekunstmakers.com` → `YOUR_SERVER_IP`
- `traefik.dekunstmakers.com` → `YOUR_SERVER_IP`

## Step 7: Set Up GitHub Secrets

In your GitHub repository: **Settings → Secrets and variables → Actions**

Add these secrets:

- `SERVER_HOST`: Your server IP address
- `SSH_PRIVATE_KEY`: Contents of your SSH private key (`~/.ssh/hetzner_cloud`)

**To get your SSH private key:**
```bash
cat ~/.ssh/hetzner_cloud
```

Copy the entire output (including `-----BEGIN` and `-----END` lines) and paste it into the GitHub Secret.

**Note:** GitHub Container Registry authentication uses `GITHUB_TOKEN` automatically - no separate registry account needed.

## Step 8: Initial Deployment

**Important:** If your repository is **private**, you need to authenticate Docker to pull from GitHub Container Registry:

```bash
# On your server, login to ghcr.io
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

Create a GitHub Personal Access Token with `read:packages` permission and add it to your `.env` as `GITHUB_TOKEN`.

For **public repositories**, authentication is not required.

1. **Build and start containers:**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

2. **Check logs:**
   ```bash
   docker-compose logs -f strapi
   ```

3. **Verify services are running:**
   ```bash
   docker-compose ps
   ```

4. **Check Traefik dashboard:**
   - Visit `http://traefik.dekunstmakers.com:8081` (or your configured domain)

## Step 9: Access Strapi Admin

1. **Visit your admin URL:**
   - `https://admin.dekunstmakers.com/admin` (or your configured domain)

2. **Create your admin account** (first time only)

## Step 10: Deploy a Release

**Deployment is manual - create a release first, then deploy it.**

1. **Create a release** (without deploying):
   - Go to your repository → **Releases** → **Create a new release**
   - Choose a tag (e.g., `v1.0.0`) or create a new one
   - Add release notes
   - Click **"Publish release"**

2. **Deploy the release**:
   - Go to **Actions** tab → **"Deploy to Hetzner"** workflow
   - Click **"Run workflow"** button
   - **Option A**: Leave tag empty to deploy the latest release
   - **Option B**: Enter a specific release tag (e.g., `v1.0.0`)
   - Click **"Run workflow"**

**Note:** GitHub doesn't support adding a deploy button directly on release pages. You need to go to Actions and run the workflow manually. To deploy the latest release, just leave the tag field empty.

**The workflow will:**
- Build Docker image with the release tag
- Push to GitHub Container Registry (tagged + latest)
- SSH into server and deploy the release

4. **Monitor deployment:**
   ```bash
   docker-compose logs -f strapi
   ```

## Troubleshooting

### Containers won't start
```bash
docker-compose logs
docker-compose ps
```


### SSL certificate issues
- Ensure DNS is pointing to your server
- Check Traefik logs: `docker-compose logs traefik`
- Wait a few minutes for Let's Encrypt to issue certificates

### Database connection issues
```bash
docker-compose logs postgres
docker-compose exec postgres psql -U strapi -d strapi
```

## Maintenance

### Update application
- Create a new GitHub Release
- Then manually trigger deployment via **Actions** → **"Deploy to Hetzner"** → **"Run workflow"** (enter the release tag)

### Manual update
```bash
cd /root/dekunstmakers-strapi
git pull
docker-compose build strapi
docker-compose up -d strapi
```

### Backup database
```bash
docker-compose exec postgres pg_dump -U strapi strapi > backup_$(date +%Y%m%d).sql
```

### View logs
```bash
docker-compose logs -f strapi
docker-compose logs -f postgres
docker-compose logs -f traefik
```

## Security Checklist

- ✅ Strong passwords for database
- ✅ Strong tokens for Strapi secrets
- ✅ HTTPS enabled (Traefik SSL)
- ✅ Rate limiting configured
- ✅ IP whitelisting configured
- ✅ Firewall configured (UFW)
- ✅ `.env` file not committed to git
