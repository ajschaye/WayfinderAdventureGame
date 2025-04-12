#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('Starting static build process...');
  
  try {
    // 1. Build the client app
    console.log('Building the client application...');
    await execAsync('npm run build');
    
    // 2. Create a static server file that can serve the app in production
    console.log('Creating static server configuration...');
    
    // Create a simple server if needed for static hosting
    const staticServerContent = `// This file can be used to serve the static app if needed
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`Static server running on port \${PORT}\`);
});
`;
    
    await fs.writeFile(path.join(__dirname, 'dist', 'static-server.js'), staticServerContent);
    
    // 3. Copy static assets that might not be handled by Vite
    console.log('Ensuring all static assets are copied...');
    
    // Make sure the assets directory exists
    try {
      await fs.mkdir(path.join(__dirname, 'dist', 'public', 'sounds'), { recursive: true });
    } catch (err) {
      console.log('Sounds directory already exists');
    }
    
    // Copy sound files
    const soundsDir = path.join(__dirname, 'client', 'public', 'sounds');
    const soundFiles = await fs.readdir(soundsDir);
    
    for (const file of soundFiles) {
      const src = path.join(soundsDir, file);
      const dest = path.join(__dirname, 'dist', 'public', 'sounds', file);
      await fs.copyFile(src, dest);
      console.log(`Copied ${file} to dist/public/sounds/`);
    }
    
    // 4. Create a manifest or readme for deployment
    const readmeContent = `# Fire Rescue Adventure - Static Build

This is a statically built version of the Fire Rescue Adventure game.

## Deployment Instructions

1. The entire application is in the \`dist/public\` directory.
2. Deploy the contents of this directory to any static hosting service like:
   - Netlify
   - Vercel
   - GitHub Pages
   - Any web server that can serve static files

3. If you need a simple server for the static app, you can use the included \`static-server.js\` file.
   To use it:
   
   \`\`\`
   node static-server.js
   \`\`\`

## Game Features

- Grid-based fire rescue game
- Responsive design for various screen sizes
- Interactive controls (keyboard and touch)
- Sound effects and background music
- Obstacle avoidance and fire extinguishing mechanics

Enjoy the game!
`;
    
    await fs.writeFile(path.join(__dirname, 'dist', 'README.md'), readmeContent);
    
    console.log('\nStatic build complete! The built app is in the dist/public directory.');
    console.log('You can deploy this directory to any static hosting provider.');
    
  } catch (error) {
    console.error('Error during build process:', error);
    process.exit(1);
  }
}

main();