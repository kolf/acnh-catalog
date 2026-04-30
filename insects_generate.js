const fs = require('fs');
const cheerio = require('cheerio');

function generate() {
  const htmlContent = fs.readFileSync('insects_page.html', 'utf-8');
  const $ = cheerio.load(htmlContent);
  
  const insects = [];
  
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
      const weather = $(tds[2]).text().trim();
      const monthsNorth = $(tds[3]).text().trim();
      const time = $(tds[5]).text().trim();
      const price = $(tds[6]).text().trim();
      
      if (name) {
        insects.push({ name, imageUrl, location, weather, monthsNorth, time, price });
      }
    }
  });

  console.log(`Extracted ${insects.length} insects`);

  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer">
  <title>动森博物馆昆虫图鉴 (A4 打印版)</title>
  <link rel="stylesheet" href="styles_full_table.css">
  <style>
    .avatar-img {
      width: 64px;
      height: 64px;
      object-fit: contain;
      border-radius: 50%;
      border: 2px solid #81c784; /* Green border for insects */
      background: #e8f5e9;
    }
    .avatar-col {
      width: 80px;
      text-align: center;
    }
    th {
      white-space: nowrap;
      background-color: #388e3c; /* Darker green header for insects */
    }
    .name-col {
      white-space: nowrap;
      font-weight: bold;
      color: #2e7d32;
    }
    .check-col {
      white-space: nowrap;
    }
    .text-small {
      font-size: 10px;
    }
    /* Let's reset the table border for insect theme */
    .villager-table {
      border: 2px solid #388e3c;
    }
  </style>
</head>
<body>
  <div class="a4-page">
    <div class="header" style="border-color: #388e3c; box-shadow: 4px 4px 0 rgba(56, 142, 60, 0.3);">
      <h1 style="color: #388e3c;"><span>🦋</span> 动森博物馆图鉴 - 昆虫 <span>🦋</span></h1>
      
    </div>
    <table class="villager-table">
      <thead>
        <tr>
          <th class="avatar-col">图片</th>
          <th>昆虫名称</th>
          <th>场所/天气/价格</th>
          <th>出现月份(北)</th>
          <th>出现时间</th>
          <th class="check-col">收集</th>
        </tr>
      </thead>
      <tbody>`;

  for (const ins of insects) {
    const avatarHtml = ins.imageUrl ? `<img src="${ins.imageUrl}" class="avatar-img" alt="${ins.name}" loading="lazy">` : '🦋';
    html += `
        <tr>
          <td class="avatar-col">${avatarHtml}</td>
          <td class="name-col">${ins.name}</td>
          <td>
            <div style="font-size: 11px; color: #5d4037;">
              场所: <b>${ins.location}</b><br>
              天气: ${ins.weather || '无'}<br>
              价格: <span style="color: #d32f2f; font-weight: bold;">${ins.price}</span>
            </div>
          </td>
          <td class="text-small">${ins.monthsNorth}</td>
          <td class="text-small">${ins.time}</td>
          <td class="check-col"><div class="check-circle"></div></td>
        </tr>`;
  }

  html += `
      </tbody>
    </table>
    <div class="footer">
      带着这本图鉴，去野外寻找那些迷人的昆虫吧！ —— 动物森友会专属收集册
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('insects_table.html', html);
  console.log('Generated insects_table.html with images');
}

generate();
