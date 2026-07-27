const sharp = require('sharp');
const fs = require('fs');

async function processImage() {
  const inputPath = 'c:/Users/HP/Desktop/Kaya Market/kayamarket/public/t-1.png';
  const outputPath = 'c:/Users/HP/Desktop/Kaya Market/kayamarket/public/t-1.png';
  
  const { data, info } = await sharp(inputPath)
    .raw()
    .toBuffer({ resolveWithObject: true });
    
  const width = info.width;
  const height = info.height;
  const channels = info.channels; // 3 (RGB)
  
  // Create an RGBA buffer (width * height * 4)
  const rgbaData = Buffer.alloc(width * height * 4);
  
  // Flood fill algorithm to detect background black pixels starting from borders
  const visited = new Uint8Array(width * height);
  const queue = [];
  
  // Helper to get index
  const getIndex = (x, y) => (y * width + x) * channels;
  const getRgb = (x, y) => {
    const idx = (y * width + x) * channels;
    return [data[idx], data[idx + 1], data[idx + 2]];
  };
  
  // Add all border pixels to queue if they are near-black
  // Threshold for background black: max RGB value <= 25 (very dark / black)
  const isDark = (r, g, b) => (r <= 22 && g <= 22 && b <= 22);
  
  for (let x = 0; x < width; x++) {
    const [r1, g1, b1] = getRgb(x, 0);
    if (isDark(r1, g1, b1)) {
      visited[x] = 1;
      queue.push(x, 0);
    }
    const [r2, g2, b2] = getRgb(x, height - 1);
    if (isDark(r2, g2, b2)) {
      visited[(height - 1) * width + x] = 1;
      queue.push(x, height - 1);
    }
  }
  
  for (let y = 0; y < height; y++) {
    const [r1, g1, b1] = getRgb(0, y);
    if (isDark(r1, g1, b1)) {
      visited[y * width] = 1;
      queue.push(0, y);
    }
    const [r2, g2, b2] = getRgb(width - 1, y);
    if (isDark(r2, g2, b2)) {
      visited[y * width + width - 1] = 1;
      queue.push(width - 1, y);
    }
  }
  
  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];
    
    // Check 4 neighbors
    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1]
    ];
    
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const npos = ny * width + nx;
        if (!visited[npos]) {
          const [r, g, b] = getRgb(nx, ny);
          if (isDark(r, g, b)) {
            visited[npos] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }
  
  // Now copy RGB data to RGBA data, setting Alpha based on visited background status and edge smoothing
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 3;
      const dstIdx = (y * width + x) * 4;
      const pos = y * width + x;
      
      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];
      
      if (visited[pos]) {
        // Background pixel -> Transparent
        rgbaData[dstIdx] = 0;
        rgbaData[dstIdx + 1] = 0;
        rgbaData[dstIdx + 2] = 0;
        rgbaData[dstIdx + 3] = 0;
      } else {
        // Check if this pixel is on the outer edge (adjacent to visited background)
        let hasBgNeighbor = false;
        const neighbors = [
          [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1],
          [x + 1, y + 1], [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1]
        ];
        
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (visited[ny * width + nx]) {
              hasBgNeighbor = true;
              break;
            }
          }
        }
        
        rgbaData[dstIdx] = r;
        rgbaData[dstIdx + 1] = g;
        rgbaData[dstIdx + 2] = b;
        
        if (hasBgNeighbor && (r < 40 && g < 40 && b < 40)) {
          // Anti-aliased transition edge pixel
          const maxVal = Math.max(r, g, b);
          const alpha = Math.min(255, Math.max(0, Math.round((maxVal / 40) * 255)));
          rgbaData[dstIdx + 3] = alpha;
        } else {
          rgbaData[dstIdx + 3] = 255;
        }
      }
    }
  }
  
  // Save as RGBA PNG
  await sharp(rgbaData, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
  .png({ compressionLevel: 9 })
  .toFile('c:/Users/HP/Desktop/Kaya Market/kayamarket/public/t-1-clean.png');
  
  console.log('Successfully created t-1-clean.png!');
}

processImage().catch(console.error);
