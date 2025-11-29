# GitHub Pages Deployment

This repository includes a GitHub Actions workflow that automatically deploys the Preact frontend to GitHub Pages.

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**

### 2. Configure Environment Variables (Optional)

If you want to connect to a production backend API:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **Variables** tab
3. Click **New repository variable**
4. Add variable:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend-api-url.com`

If you don't set this variable, it will default to `http://localhost:5000`.

### 3. Deploy

The workflow will automatically trigger on:
- **Push to main branch**: Every time you push to main, it will rebuild and redeploy
- **Manual trigger**: Go to **Actions** → **Deploy to GitHub Pages** → **Run workflow**

### 4. Access Your Site

After the first successful deployment, your site will be available at:
```
https://[your-username].github.io/Agile-Planning-Poker/
```

## How It Works

The workflow:
1. Checks out the code
2. Sets up Node.js 18
3. Installs dependencies with `npm ci`
4. Builds the Preact app with production settings
5. Uploads the `dist` folder as a GitHub Pages artifact
6. Deploys to GitHub Pages

## Local Development vs Production

- **Local**: Uses base path `/` and connects to `http://localhost:5000` by default
- **Production**: Uses base path `/Agile-Planning-Poker/` and connects to the configured `VITE_API_URL`

## Troubleshooting

### Build fails
- Check the Actions tab for error logs
- Ensure all dependencies are listed in `package.json`
- Make sure the build succeeds locally with `npm run build`

### Site not updating
- Check that the workflow completed successfully in the Actions tab
- GitHub Pages can take a few minutes to update
- Clear your browser cache

### Routes not working (404 on refresh)
- GitHub Pages serves static files and doesn't support client-side routing by default
- The app uses hash-based routing (`/#/path`) which works with GitHub Pages
- If you see 404 errors, ensure you're accessing routes via hash (e.g., `/#/join` not `/join`)
