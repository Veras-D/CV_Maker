import fs from 'fs';
import path from 'path';

const iconsDir = path.join(process.cwd(), 'src-tauri', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Valid 32x32 PNG base64
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOwgAADsIBFShKgAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAOSURBVFiJY2AYBaNgFAYVAAAE4AAB24gTkwAAAABJRU5ErkJggg==';
const pngBuffer = Buffer.from(base64Png, 'base64');

fs.writeFileSync(path.join(iconsDir, '32x32.png'), pngBuffer);
fs.writeFileSync(path.join(iconsDir, '128x128.png'), pngBuffer);
fs.writeFileSync(path.join(iconsDir, '128x128@2x.png'), pngBuffer);
fs.writeFileSync(path.join(iconsDir, 'icon.icns'), pngBuffer);
fs.writeFileSync(path.join(iconsDir, 'icon.ico'), pngBuffer);

console.log("Icons generated successfully in src-tauri/icons/");
