const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');
const PUBLIC_DIR = path.join(__dirname, 'public');
const SRC_DIR = path.join(__dirname, 'src');

// Utility to recursively copy directories
function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

// 1. Clean & Prepare dist directory
if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR);

// 2. Copy public directory to dist
copyRecursiveSync(PUBLIC_DIR, DIST_DIR);

// 3. Copy src directory to dist/src
copyRecursiveSync(SRC_DIR, path.join(DIST_DIR, 'src'));

// 4. Inject Environment Variables into index.html
const indexPath = path.join(DIST_DIR, 'index.html');
if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    
    // Inject Maps API Key
    const mapsKey = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_MAPS_API_KEY_PLACEHOLDER';
    html = html.replace('{{GOOGLE_MAPS_API_KEY}}', mapsKey);
    
    fs.writeFileSync(indexPath, html);
    console.log('✓ Injected GOOGLE_MAPS_API_KEY into index.html');
}

// 5. Check total build size
function getFolderSize(directory) {
    let size = 0;
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);
        size += stats.isDirectory() ? getFolderSize(filePath) : stats.size;
    }
    return size;
}

const buildSizeMB = (getFolderSize(DIST_DIR) / (1024 * 1024)).toFixed(2);
console.log(`✓ Build complete. Total size: ${buildSizeMB} MB`);

if (buildSizeMB > 1.0) {
    console.warn('⚠️ WARNING: Build size exceeds 1MB limit for submission!');
}
