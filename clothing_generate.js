const fs = require('fs');
const cheerio = require('cheerio');

function generate() {
  const htmlContent = fs.readFileSync('clothing_page.html', 'utf-8');
  const $ = cheerio.load(htmlContent);
  
  const items = [];
  const seen = new Set();
  
  $('#CardSelectTr tbody tr').each((i, el) => {
    if ($(el).attr('id') === 'CardSelectTabHeader') return;
    
    const tds = $(el).find('td');
    if (tds.length < 6) return;
    
    let imageUrl = $(tds[0]).find('img').attr('src');
    if (imageUrl && imageUrl.startsWith('//')) {
      imageUrl = 'https:' + imageUrl;
    }
    
    const name = $(tds[0]).text().trim();
    if (!name || seen.has(name)) return;
    seen.add(name);
    
    const category = $(tds[1]).text().trim();
    const buyPrice = $(tds[3]).text().trim();
    const sellPrice = $(tds[4]).text().trim();
    
    items.push({
      imageUrl,
      name,
      buyPrice,
      sellPrice,
      category
    });
  });

  console.log(`Extracted ${items.length} unique clothing items`);

  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer">
  <title>动森服饰图鉴 (A4 打印版)</title>
  <link rel="stylesheet" href="styles_full_table.css">
  <style>
    .avatar-img {
      width: 64px;
      height: 64px;
      object-fit: contain;
      border-radius: 50%;
      border: 2px solid #d81b60; /* Pink border */
      background: #fce4ec;
    }
    .avatar-col {
      width: 80px;
      text-align: center;
    }
    th {
      white-space: nowrap;
      background-color: #d81b60;
      color: white;
    }
    .name-col {
      white-space: nowrap;
      font-weight: bold;
      color: #d81b60;
      font-size: 15px;
    }
    .check-col {
      white-space: nowrap;
      width: 60px;
    }
    .villager-table {
      border: 2px solid #d81b60;
    }
    .header {
      border-color: #d81b60;
      box-shadow: 4px 4px 0 rgba(216, 27, 96, 0.3);
    }
    .header h1 {
      color: #d81b60;
    }
    .price-text {
      font-size: 11px;
      color: #757575;
    }
    .price-val {
      font-weight: bold;
      color: #c2185b;
    }
    .text-small {
      font-size: 12px;
      color: #880e4f;
    }
  </style>
</head>
<body>
  <div class="a4-page">
    <div class="header">
      <h1><span>👗</span> 动森服饰图鉴 <span>👕</span></h1>
      
    </div>
    
    <table class="villager-table">
      <thead>
        <tr>
          <th class="avatar-col">图片</th>
          <th>服饰名称</th>
          <th>分类</th>
          <th>价格 (买/卖)</th>
          <th class="check-col">收集</th>
        </tr>
      </thead>
      <tbody>`;

  for (const item of items) {
    const avatarHtml = item.imageUrl ? `<img src="${item.imageUrl}" class="avatar-img" alt="${item.name}" loading="lazy">` : '👕';
    html += `
        <tr>
          <td class="avatar-col">${avatarHtml}</td>
          <td class="name-col">${item.name}</td>
          <td><div class="text-small">${item.category}</div></td>
          <td>
            <div class="price-text">买: <span class="price-val">${item.buyPrice}</span></div>
            <div class="price-text">卖: <span class="price-val">${item.sellPrice}</span></div>
          </td>
          <td class="check-col"><div class="check-circle"></div></td>
        </tr>`;
  }

  html += `
      </tbody>
    </table>
    
    <div class="footer">
      成为全岛最靓的仔！ —— 动物森友会专属收集册
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('clothing_print.html', html);
  console.log('Generated clothing_print.html');
}

generate();
