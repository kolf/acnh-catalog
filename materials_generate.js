const fs = require('fs');
const cheerio = require('cheerio');

function generate() {
  const htmlContent = fs.readFileSync('materials_page.html', 'utf-8');
  const $ = cheerio.load(htmlContent);
  
  const materials = [];
  
  $('table.wikitable tbody tr').each((i, el) => {
    // Skip header row
    if ($(el).find('th').length > 0) return;
    
    const tds = $(el).find('td');
    if (tds.length >= 8) {
      // Extract image src
      const imgNode = $(tds[0]).find('img');
      let imageUrl = '';
      if (imgNode.length > 0) {
        imageUrl = imgNode.attr('src');
        if (imageUrl && imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        }
      }

      const name = $(tds[1]).text().trim();
      const nameJa = $(tds[3]).text().trim();
      const nameEn = $(tds[4]).text().trim();
      const stackSize = $(tds[5]).text().trim();
      const price = $(tds[7]).text().trim();
      
      if (name) {
        materials.push({ name, imageUrl, nameJa, nameEn, stackSize, price });
      }
    }
  });

  console.log(`Extracted ${materials.length} materials`);

  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer">
  <title>动森全素材收集图鉴 (A4 打印版)</title>
  <link rel="stylesheet" href="styles_full_table.css">
  <style>
    .avatar-img {
      width: 64px;
      height: 64px;
      object-fit: contain;
      border-radius: 12px; /* Slightly squarish for items */
      border: 2px solid var(--leaf-green);
      background: #fdf6e3;
    }
    .avatar-col {
      width: 80px;
      text-align: center;
    }
    th {
      white-space: nowrap;
    }
    .name-col {
      white-space: nowrap;
      font-weight: bold;
      color: var(--leaf-green);
      font-size: 14px;
    }
    .check-col {
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div class="a4-page">
    <div class="header">
      <h1><span>🪵</span> 动森全素材图鉴 <span>🪵</span></h1>
      
    </div>
    <table class="villager-table">
      <thead>
        <tr>
          <th class="avatar-col">图片</th>
          <th>素材名称</th>
          <th>外语名</th>
          <th>属性与价格</th>
          <th class="check-col">收集</th>
        </tr>
      </thead>
      <tbody>`;

  for (const m of materials) {
    const avatarHtml = m.imageUrl ? `<img src="${m.imageUrl}" class="avatar-img" alt="${m.name}" loading="lazy">` : '🪨';
    html += `
        <tr>
          <td class="avatar-col">${avatarHtml}</td>
          <td class="name-col">${m.name}</td>
          <td>
            <div style="font-size: 11px; color: #555;">
              英: ${m.nameEn}<br>
              日: ${m.nameJa}
            </div>
          </td>
          <td>
            <div style="font-size: 11px; color: #555;">
              堆叠: ${m.stackSize}<br>
              价格: <span style="color: #d32f2f; font-weight: bold;">${m.price} 铃钱</span>
            </div>
          </td>
          <td class="check-col"><div class="check-circle"></div></td>
        </tr>`;
  }

  html += `
      </tbody>
    </table>
    <div class="footer">
      带着这本图鉴，去收集各种各样的素材吧！ —— 动物森友会专属收集册
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('materials_table.html', html);
  console.log('Generated materials_table.html with images');
}

generate();
