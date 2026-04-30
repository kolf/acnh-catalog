const fs = require('fs');
const cheerio = require('cheerio');

function generate() {
  const htmlContent = fs.readFileSync('records_page.html', 'utf-8');
  const $ = cheerio.load(htmlContent);
  
  const records = [];
  
  $('table.wikitable.sortable tbody tr').each((i, el) => {
    if ($(el).find('th').length > 0) return; // Skip headers
    
    const tds = $(el).find('td');
    if (tds.length >= 9) {
      const num = $(tds[0]).text().trim();
      const name = $(tds[1]).text().trim();
      const english = $(tds[2]).text().trim();
      const japanese = $(tds[3]).text().trim();
      
      const imgNode = $(tds[4]).find('img');
      let imageUrl = '';
      if (imgNode.length > 0) {
        imageUrl = imgNode.attr('src');
        if (imageUrl && imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        }
      }
      
      const source = $(tds[5]).text().trim();
      const buyPrice = $(tds[6]).text().trim();
      const sellPrice = $(tds[7]).text().trim();
      const notes = $(tds[8]).text().trim();
      
      if (name) {
        records.push({ num, name, english, japanese, imageUrl, source, buyPrice, sellPrice, notes });
      }
    }
  });

  console.log(`Extracted ${records.length} records`);

  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer">
  <title>动森唱片图鉴 (A4 打印版)</title>
  <link rel="stylesheet" href="styles_full_table.css">
  <style>
    .avatar-img {
      width: 64px;
      height: 64px;
      object-fit: contain;
      border-radius: 4px; /* Square cover */
      border: 2px solid #c2185b; /* Magenta border for records */
      background: #fce4ec;
    }
    .avatar-col {
      width: 80px;
      text-align: center;
    }
    th {
      white-space: nowrap;
      background-color: #ad1457; /* Dark magenta header */
      color: white;
    }
    .name-col {
      white-space: nowrap;
      font-weight: bold;
      color: #880e4f;
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
      border: 2px solid #ad1457;
    }
    .header {
      border-color: #ad1457;
      box-shadow: 4px 4px 0 rgba(173, 20, 87, 0.3);
    }
    .header h1 {
      color: #ad1457;
    }
  </style>
</head>
<body>
  <div class="a4-page">
    <div class="header">
      <h1><span>🎵</span> 动森唱片图鉴 - K.K. <span>🎸</span></h1>
      
    </div>
    <table class="villager-table">
      <thead>
        <tr>
          <th class="avatar-col">封面</th>
          <th>唱片名称</th>
          <th>英文名</th>
          <th>日文名</th>
          <th>来源</th>
          <th>买入/卖出</th>
          <th class="check-col">收集</th>
        </tr>
      </thead>
      <tbody>`;

  for (const rec of records) {
    const avatarHtml = rec.imageUrl ? `<img src="${rec.imageUrl}" class="avatar-img" alt="${rec.name}" loading="lazy">` : '💿';
    html += `
        <tr>
          <td class="avatar-col">${avatarHtml}</td>
          <td class="name-col">${rec.name}</td>
          <td><div class="text-small">${rec.english}</div></td>
          <td><div class="text-small">${rec.japanese}</div></td>
          <td><div class="text-small">${rec.source}</div></td>
          <td>
            <div class="text-small" style="color: #d32f2f;">买: ${rec.buyPrice}</div>
            <div class="text-small" style="color: #388e3c;">卖: ${rec.sellPrice}</div>
          </td>
          <td class="check-col"><div class="check-circle"></div></td>
        </tr>`;
  }

  html += `
      </tbody>
    </table>
    <div class="footer">
      周六晚上别忘了去广场听 K.K. 的演唱会哦！点播没有的歌曲还能拿到专属唱片。 —— 动物森友会专属收集册
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('records_table.html', html);
  console.log('Generated records_table.html with images');
}

generate();
