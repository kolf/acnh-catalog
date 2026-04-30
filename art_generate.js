const fs = require('fs');
const cheerio = require('cheerio');

function generate() {
  const htmlContent = fs.readFileSync('art_page.html', 'utf-8');
  const $ = cheerio.load(htmlContent);
  
  const arts = [];
  
  $('.CardSelect tbody tr').each((i, el) => {
    // Skip header row
    if ($(el).find('th').length > 0) return;
    
    const tds = $(el).find('td');
    if (tds.length >= 7) {
      const imgNode = $(tds[0]).find('img');
      let imageUrl = '';
      if (imgNode.length > 0) {
        imageUrl = imgNode.attr('src');
        if (imageUrl && imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        }
      }
      // td[1] is Name
      let name = $(tds[1]).text().trim();
      
      const authenticity = $(tds[2]).text().trim(); // 真/假 or empty
      const isForSale = $(tds[3]).text().trim();
      const size = $(tds[4]).text().trim();
      const type = $(tds[5]).text().trim();
      const price = $(tds[6]).text().trim();
      
      // If there are fakes, we should append whether it's genuine or fake to the name for clarity
      if (authenticity) {
        name = name + ` (${authenticity})`;
      }

      if (name) {
        arts.push({ name, imageUrl, authenticity, isForSale, size, type, price });
      }
    }
  });

  console.log(`Extracted ${arts.length} art pieces`);

  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer">
  <title>动森博物馆艺术品图鉴 (A4 打印版)</title>
  <link rel="stylesheet" href="styles_full_table.css">
  <style>
    .avatar-img {
      width: 64px;
      height: 64px;
      object-fit: contain;
      border-radius: 8px; /* Square with rounded corners for art */
      border: 2px solid #8e24aa; /* Purple border for art */
      background: #f3e5f5;
    }
    .avatar-col {
      width: 80px;
      text-align: center;
    }
    th {
      white-space: nowrap;
      background-color: #6a1b9a; /* Dark purple header */
      color: white;
    }
    .name-col {
      white-space: nowrap;
      font-weight: bold;
      color: #4a148c;
    }
    .fake-art {
      color: #d32f2f; /* Red color for fake art */
      font-weight: normal;
      font-size: 12px;
    }
    .check-col {
      white-space: nowrap;
    }
    .villager-table {
      border: 2px solid #6a1b9a;
    }
    .header {
      border-color: #6a1b9a;
      box-shadow: 4px 4px 0 rgba(106, 27, 154, 0.3);
    }
    .header h1 {
      color: #6a1b9a;
    }
  </style>
</head>
<body>
  <div class="a4-page">
    <div class="header">
      <h1><span>🎨</span> 动森博物馆图鉴 - 艺术品 <span>🎨</span></h1>
      
    </div>
    <table class="villager-table">
      <thead>
        <tr>
          <th class="avatar-col">图片</th>
          <th>艺术品名称</th>
          <th>属性(真伪/尺寸/类型)</th>
          <th>价格</th>
          <th class="check-col">收集</th>
        </tr>
      </thead>
      <tbody>`;

  for (const art of arts) {
    const avatarHtml = art.imageUrl ? `<img src="${art.imageUrl}" class="avatar-img" alt="${art.name}" loading="lazy">` : '🖼️';
    const authDisplay = art.authenticity === '假' ? '<span style="color:#d32f2f; font-weight:bold;">赝品</span>' : (art.authenticity === '真' ? '<span style="color:#388e3c; font-weight:bold;">真品</span>' : '<span style="color:#388e3c; font-weight:bold;">唯一(真)</span>');
    
    html += `
        <tr>
          <td class="avatar-col">${avatarHtml}</td>
          <td class="name-col">${art.name}</td>
          <td>
            <div style="font-size: 11px; color: #4a148c; line-height: 1.4;">
              真伪: ${authDisplay}<br>
              尺寸: ${art.size}<br>
              类型: ${art.type}
            </div>
          </td>
          <td>${art.price}</td>
          <td class="check-col"><div class="check-circle"></div></td>
        </tr>`;
  }

  html += `
      </tbody>
    </table>
    <div class="footer">
      带着这本图鉴，去狐利的黑店里擦亮眼睛淘宝吧！ —— 动物森友会专属收集册
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('art_table.html', html);
  console.log('Generated art_table.html with images');
}

generate();
