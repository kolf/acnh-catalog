const fs = require('fs');
const cheerio = require('cheerio');

function generate() {
  const htmlContent = fs.readFileSync('plants_page.html', 'utf-8');
  const $ = cheerio.load(htmlContent);
  
  const plants = [];
  const seen = new Set();
  
  $('table.wikitable th, table.wikitable td').each((i, el) => {
    // some cells have multiple images (recipes), we skip them
    const imgs = $(el).find('img');
    if (imgs.length > 1) return;
    
    let imageUrl = '';
    if (imgs.length === 1) {
      imageUrl = imgs.first().attr('src');
      if (imageUrl && imageUrl.startsWith('//')) {
        imageUrl = 'https:' + imageUrl;
      }
    }
    
    // Get text pieces
    const pTags = $(el).find('p');
    let name = '';
    let price = '';
    
    if (pTags.length >= 1) {
      name = $(pTags[0]).text().trim();
      if (pTags.length >= 2) {
        price = $(pTags[1]).text().trim();
      }
    } else {
      // Replace <br> with space to preserve separation
      $(el).find('br').replaceWith(' ');
      const fullText = $(el).text().trim().replace(/\\s+/g, ' ');
      if (!fullText.includes('+')) {
         const parts = fullText.split(' ');
         name = parts[0];
         if (parts.length >= 2) {
           price = parts[1];
         }
      }
    }
      
    if (name && name !== '+' && !seen.has(name)) {
      seen.add(name);
      plants.push({ name, price, imageUrl });
    }
  });

  console.log(`Extracted ${plants.length} plants`);

  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer">
  <title>动森植物图鉴 (A4 打印版)</title>
  <link rel="stylesheet" href="styles.css">
  <style>
    body {
      background-color: #f1f8e9;
    }
    .grid-container {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 12px;
      padding: 10px 0;
    }
    .grid-card {
      border: 2px solid #558b2f;
      border-radius: 8px;
      text-align: center;
      padding: 10px 5px;
      background: #ffffff;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }
    .grid-card img {
      width: 48px;
      height: 48px;
      object-fit: contain;
      margin-bottom: 5px;
    }
    .grid-card .name {
      font-weight: bold;
      font-size: 11px;
      color: #33691e;
      line-height: 1.2;
      margin-bottom: 3px;
    }
    .grid-card .price {
      font-size: 10px;
      color: #d32f2f;
    }
    .check-circle {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 14px;
      height: 14px;
      border: 1px solid #9e9e9e;
      border-radius: 50%;
      background: white;
    }
    .header {
      border-color: #558b2f;
      margin-bottom: 10px;
    }
    .header h1 {
      color: #33691e;
    }
  </style>
</head>
<body>
  <div class="a4-page">
    <div class="header">
      <h1><span>🌿</span> 动森植物图鉴 <span>🍎</span></h1>
      
    </div>
    <div class="grid-container">`;

  for (const p of plants) {
    const avatarHtml = p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}" loading="lazy">` : '🌿';
    html += `
      <div class="grid-card">
        <div class="check-circle"></div>
        ${avatarHtml}
        <div class="name">${p.name}</div>
        <div class="price">${p.price ? '售价: ' + p.price : ''}</div>
      </div>`;
  }

  html += `
    </div>
    <div class="footer" style="margin-top: 15px; color: #558b2f; text-align: center; font-size: 12px; clear: both;">
      种下种子，收获满园春色！ —— 动物森友会专属收集册
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('plants_grid.html', html);
  console.log('Generated plants_grid.html with images');
}

generate();
