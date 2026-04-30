const fs = require('fs');
const cheerio = require('cheerio');

function generate() {
  const htmlContent = fs.readFileSync('fossil_page.html', 'utf-8');
  const $ = cheerio.load(htmlContent);
  
  const fossils = [];
  
  $('#CardSelectTr tbody tr').each((i, el) => {
    if ($(el).attr('id') === 'CardSelectTabHeader') return;
    
    const tds = $(el).find('td');
    if (tds.length >= 5) {
      const imgNode = $(tds[0]).find('img');
      let imageUrl = '';
      if (imgNode.length > 0) {
        imageUrl = imgNode.attr('src');
        if (imageUrl && imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        }
      }
      const name = $(tds[0]).text().trim();
      const english = $(tds[1]).text().trim();
      const japanese = $(tds[2]).text().trim();
      const price = $(tds[3]).text().trim();
      const description = $(tds[4]).text().trim();
      
      if (name) {
        fossils.push({ name, imageUrl, english, japanese, price, description });
      }
    }
  });

  console.log(`Extracted ${fossils.length} fossils`);

  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer">
  <title>动森博物馆化石图鉴 (A4 打印版)</title>
  <link rel="stylesheet" href="styles_full_table.css">
  <style>
    .avatar-img {
      width: 64px;
      height: 64px;
      object-fit: contain;
      border-radius: 50%;
      border: 2px solid #8d6e63; /* Brown border for fossils */
      background: #efebe9;
    }
    .avatar-col {
      width: 80px;
      text-align: center;
    }
    th {
      white-space: nowrap;
      background-color: #5d4037; /* Dark brown header */
      color: white;
    }
    .name-col {
      white-space: nowrap;
      font-weight: bold;
      color: #4e342e;
    }
    .check-col {
      white-space: nowrap;
      width: 60px;
    }
    .text-small {
      font-size: 10px;
      color: #555;
    }
    .villager-table {
      border: 2px solid #5d4037;
    }
    .header {
      border-color: #5d4037;
      box-shadow: 4px 4px 0 rgba(93, 64, 55, 0.3);
    }
    .header h1 {
      color: #5d4037;
    }
  </style>
</head>
<body>
  <div class="a4-page">
    <div class="header">
      <h1><span>🦖</span> 动森博物馆图鉴 - 化石 <span>🦕</span></h1>
      
    </div>
    <table class="villager-table">
      <thead>
        <tr>
          <th class="avatar-col">图片</th>
          <th>化石名称</th>
          <th>外语名(英/日)</th>
          <th>价格</th>
          <th style="width: 40%">傅达的介绍</th>
          <th class="check-col">收集</th>
        </tr>
      </thead>
      <tbody>`;

  for (const fos of fossils) {
    const avatarHtml = fos.imageUrl ? `<img src="${fos.imageUrl}" class="avatar-img" alt="${fos.name}" loading="lazy">` : '🦴';
    html += `
        <tr>
          <td class="avatar-col">${avatarHtml}</td>
          <td class="name-col">${fos.name}</td>
          <td>
            <div style="font-size:10px; color:#555;">
              英: ${fos.english}<br>
              日: ${fos.japanese}
            </div>
          </td>
          <td>${fos.price}</td>
          <td><div class="text-small">${fos.description}</div></td>
          <td class="check-col"><div class="check-circle"></div></td>
        </tr>`;
  }

  html += `
      </tbody>
    </table>
    <div class="footer">
      带着这本图鉴，去挖掘深埋在地下的远古秘密吧！ —— 动物森友会专属收集册
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('fossil_table.html', html);
  console.log('Generated fossil_table.html with images');
}

generate();
