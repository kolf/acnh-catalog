const fs = require('fs');
const cheerio = require('cheerio');

function generate() {
  const htmlContent = fs.readFileSync('sea_creatures_page.html', 'utf-8');
  const $ = cheerio.load(htmlContent);
  
  const creatures = [];
  
  $('#CardSelectTr tbody tr').each((i, el) => {
    if ($(el).attr('id') === 'CardSelectTabHeader') return;
    
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
      const name = $(tds[0]).text().trim();
      const location = $(tds[1]).text().trim();
      const shadowSize = $(tds[2]).text().trim();
      const northMonths = $(tds[3]).text().trim();
      const southMonths = $(tds[4]).text().trim();
      const time = $(tds[5]).text().trim();
      const price = $(tds[6]).text().trim();
      
      if (name) {
        creatures.push({ name, imageUrl, location, shadowSize, northMonths, southMonths, time, price });
      }
    }
  });

  console.log(`Extracted ${creatures.length} sea creatures`);

  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer">
  <title>动森博物馆海洋生物图鉴 (A4 打印版)</title>
  <link rel="stylesheet" href="styles_full_table.css">
  <style>
    .avatar-img {
      width: 64px;
      height: 64px;
      object-fit: contain;
      border-radius: 50%;
      border: 2px solid #00acc1; /* Cyan border for sea creatures */
      background: #e0f7fa;
    }
    .avatar-col {
      width: 80px;
      text-align: center;
    }
    th {
      white-space: nowrap;
      background-color: #00838f; /* Dark cyan header */
      color: white;
    }
    .name-col {
      white-space: nowrap;
      font-weight: bold;
      color: #006064;
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
      border: 2px solid #00838f;
    }
    .header {
      border-color: #00838f;
      box-shadow: 4px 4px 0 rgba(0, 131, 143, 0.3);
    }
    .header h1 {
      color: #00838f;
    }
  </style>
</head>
<body>
  <div class="a4-page">
    <div class="header">
      <h1><span>🤿</span> 动森博物馆图鉴 - 海洋生物 <span>🐚</span></h1>
      
    </div>
    <table class="villager-table">
      <thead>
        <tr>
          <th class="avatar-col">图片</th>
          <th>名称</th>
          <th>影子大小</th>
          <th style="width: 20%;">出现月份 (北/南半球)</th>
          <th style="width: 20%;">出现时间</th>
          <th>价格</th>
          <th class="check-col">收集</th>
        </tr>
      </thead>
      <tbody>`;

  for (const cr of creatures) {
    const avatarHtml = cr.imageUrl ? `<img src="${cr.imageUrl}" class="avatar-img" alt="${cr.name}" loading="lazy">` : '🤿';
    
    // Format months to be more compact
    let north = cr.northMonths.replace(/（/g, '(').replace(/）/g, ')');
    let south = cr.southMonths.replace(/（/g, '(').replace(/）/g, ')');
    
    html += `
        <tr>
          <td class="avatar-col">${avatarHtml}</td>
          <td class="name-col">${cr.name}</td>
          <td>${cr.shadowSize}</td>
          <td>
            <div class="text-small" style="color: #0277bd; margin-bottom: 2px;">北: ${north}</div>
            <div class="text-small" style="color: #ef6c00;">南: ${south}</div>
          </td>
          <td><div class="text-small">${cr.time}</div></td>
          <td>${cr.price}</td>
          <td class="check-col"><div class="check-circle"></div></td>
        </tr>`;
  }

  html += `
      </tbody>
    </table>
    <div class="footer">
      带着这本图鉴，穿上潜水服去海底寻宝吧！ —— 动物森友会专属收集册
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('sea_creatures_table.html', html);
  console.log('Generated sea_creatures_table.html with images');
}

generate();
