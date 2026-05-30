const fs = require('fs');
const path = require('path');

// Read the template HTML (index.html which now has links/script src instead of inline)
const template = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');

// Read the files to inline
const css = fs.readFileSync(path.join(__dirname, 'css', 'style.css'), 'utf-8');
const articles = fs.readFileSync(path.join(__dirname, 'js', 'articles.js'), 'utf-8');
const mainJs = fs.readFileSync(path.join(__dirname, 'js', 'main.js'), 'utf-8');

// Replace the external resource tags with inline versions
let result = template;

// Replace CSS link with inline <style>
result = result.replace(
  '<link rel="stylesheet" href="css/style.css">',
  '<style>\n' + css + '\n    </style>'
);

// Replace the two script tags with one inline script block (articles first, then main)
// Use regex to be flexible about whitespace between script tags
result = result.replace(
  /<script src="js\/articles\.js"><\/script>\s*<script src="js\/main\.js"><\/script>/,
  '<script>\n        ' + articles + '\n\n        ' + mainJs + '\n    </script>'
);

// Fix image path back to relative for dist (dist/index.html -> ../images/avatar.jpg -> images/avatar.jpg)
// Actually the template already uses images/avatar.jpg. But in dist/ we need images/ at same level.
// The build copies images to dist/images, so images/avatar.jpg works.
// No path change needed since we maintain the same relative structure.

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write the built file
fs.writeFileSync(path.join(distDir, 'index.html'), result);
console.log('Built dist/index.html successfully!');

// Copy images directory to dist
const imagesDir = path.join(__dirname, 'images');
const distImagesDir = path.join(distDir, 'images');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(imagesDir)) {
  copyDir(imagesDir, distImagesDir);
  console.log('Copied images/ to dist/images/');
}

// Copy _redirects for Cloudflare Pages
const redirectsSrc = path.join(__dirname, '_redirects');
if (fs.existsSync(redirectsSrc)) {
  fs.copyFileSync(redirectsSrc, path.join(distDir, '_redirects'));
  console.log('Copied _redirects to dist/');
}

console.log('Build complete!');
