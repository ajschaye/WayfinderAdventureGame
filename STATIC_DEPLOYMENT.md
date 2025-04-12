# Static Deployment Guide for Fire Rescue Adventure

This guide explains how to build and deploy the Fire Rescue Adventure game as a static application without requiring a backend server.

## Prerequisites

- Node.js and npm installed
- A static web hosting service (Netlify, Vercel, GitHub Pages, etc.)

## Building for Static Deployment

### Option 1: Using the Automated Build Script

1. Make sure the build script is executable:
   ```bash
   chmod +x build-static.sh
   ```

2. Run the build script:
   ```bash
   ./build-static.sh
   ```

3. The built static files will be in the `dist/public` directory.

### Option 2: Manual Build Process

1. Make the static build script executable:
   ```bash
   chmod +x static-build.js
   ```

2. Run the static build script:
   ```bash
   node static-build.js
   ```

3. The built static files will be in the `dist/public` directory.

## Testing Locally

To test the static build locally before deployment:

1. Navigate to the dist directory:
   ```bash
   cd dist
   ```

2. Run the included static server:
   ```bash
   node static-server.js
   ```

3. Open your browser and navigate to http://localhost:5000

## Deployment Options

### Netlify

1. Sign up for Netlify (if you haven't already)
2. From the Netlify dashboard, click "New site from Git" or drag and drop the `dist/public` directory into the Netlify dashboard.
3. If using drag and drop, your site will be deployed immediately.

### Vercel

1. Sign up for Vercel (if you haven't already)
2. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Navigate to the `dist/public` directory and run:
   ```bash
   vercel
   ```
4. Follow the prompts to deploy your site.

### GitHub Pages

1. Create a new GitHub repository or use an existing one
2. Copy the contents of `dist/public` to your repository
3. Enable GitHub Pages in your repository settings
4. Select the branch and folder where your static files are located

### Other Static Hosting

You can deploy the contents of the `dist/public` directory to any static web hosting service, including:

- Firebase Hosting
- Surge.sh
- Amazon S3
- Google Cloud Storage
- Azure Static Web Apps
- Digital Ocean App Platform

## Important Notes

1. The game is fully client-side and requires no backend server to run.
2. All assets (images, sounds, etc.) are included in the static build.
3. The game works best on modern browsers with JavaScript enabled.
4. The game is responsive and works on both desktop and mobile devices.

## Troubleshooting

If you encounter issues with the static build:

1. Make sure all dependencies are installed:
   ```bash
   npm install
   ```

2. Check for errors in the build process:
   ```bash
   node static-build.js
   ```

3. Verify that all assets are correctly copied to the `dist/public` directory.

4. Test the build locally to identify any issues before deploying.

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)