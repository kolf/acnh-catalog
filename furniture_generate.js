const fs = require('fs');
const cheerio = require('cheerio');

function generate() {
  const htmlContent = fs.readFileSync('furniture_page.html', 'utf-8');
  const $ = cheerio.load(htmlContent);
  
  const items = [];
  const seen = new Set();
  
  $('table.CardSelect.wikitable tr').each((i, el) => {
    if (i === 0) return; // skip header
    
    const tds = $(el).find('td');
    if (tds.length < 9) return;
    
    let imageUrl = $(tds[0]).find('img').attr('src');
    if (imageUrl && imageUrl.startsWith('//')) {
      imageUrl = 'https:' + imageUrl;
    }
    
    const name = $(tds[2]).text().trim();
    if (!name || seen.has(name)) return;
    seen.add(name);
    
    const buyPrice = $(tds[3]).text().trim();
    const sellPrice = $(tds[4]).text().trim();
    const orderType = $(tds[6]).text().trim();
    const category = $(tds[7]).text().trim();
    const size = $(tds[8]).text().trim();
    
    items.push({
      imageUrl,
      name,
      buyPrice,
      sellPrice,
      orderType,
      category,
      size
    });
  });

  console.log(`Extracted ${items.length} unique furniture items`);

  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer">
  <title>动森家具图鉴 (A4 打印版)</title>
  <link rel="stylesheet" href="styles_full_table.css">
  <style>
    .avatar-img {
      width: 64px;
      height: 64px;
      object-fit: contain;
      border-radius: 50%;
      border: 2px solid #e65100;
      background: #fff3e0;
    }
    .avatar-col {
      width: 80px;
      text-align: center;
    }
    th {
      white-space: nowrap;
      background-color: #e65100;
      color: white;
    }
    .name-col {
      white-space: nowrap;
      font-weight: bold;
      color: #e65100;
      font-size: 15px;
    }
    .check-col {
      white-space: nowrap;
      width: 60px;
    }
    .villager-table {
      border: 2px solid #e65100;
    }
    .header {
      border-color: #e65100;
    }
    .header h1 {
      color: #e65100;
    }
    .price-text {
      font-size: 11px;
      color: #757575;
    }
    .price-val {
      font-weight: bold;
      color: #d32f2f;
    }
    .text-small {
      font-size: 12px;
      color: #5d4037;
    }
  </style>
</head>
<body>
  <div class="a4-page">
    <div class="header">
      <h1><span>🛋️</span> 动森家具图鉴 <span>🪑</span></h1>
      
    </div>
    
    <table class="villager-table">
      <thead>
        <tr>
          <th class="avatar-col">图片</th>
          <th>家具名称</th>
          <th>分类</th>
          <th>价格 (买/卖)</th>
          <th>尺寸与订购</th>
          <th class="check-col">收集</th>
        </tr>
      </thead>
      <tbody>`;

  for (const item of items) {
    const avatarHtml = item.imageUrl ? `<img src="${item.imageUrl}" class="avatar-img" alt="${item.name}" loading="lazy">` : '🛋️';
    html += `
        <tr>
          <td class="avatar-col">${avatarHtml}</td>
          <td class="name-col">${item.name}</td>
          <td><div class="text-small">${item.category}</div></td>
          <td>
            <div class="price-text">买: <span class="price-val">${item.buyPrice}</span></div>
            <div class="price-text">卖: <span class="price-val">${item.sellPrice}</span></div>
          </td>
          <td><div class="text-small">尺寸: <b>${item.size}</b><br>${item.orderType}</div></td>
          <td class="check-col"><div class="check-circle"></div></td>
        </tr>`;
  }

  html += `
      </tbody>
    </table>
    
    <div class="footer">
      打造梦想家园！ —— 动物森友会专属收集册
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('furniture_print.html', html);
  console.log('Generated furniture_print.html');
}

generate();
