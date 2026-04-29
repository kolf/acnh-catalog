const fs = require('fs');
const cheerio = require('cheerio');

function generate() {
  const htmlContent = fs.readFileSync('museum_page.html', 'utf-8');
  const $ = cheerio.load(htmlContent);
  
  const fishes = [];
  
  // The first CardSelectTr on the museum page is the fish table
  $('#CardSelectTr tbody tr').each((i, el) => {
    // Skip header row
    if ($(el).attr('id') === 'CardSelectTabHeader') return;
    
    const tds = $(el).find('td');
    if (tds.length >= 7) {
      // Extract image src and name
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
      const monthsNorth = $(tds[3]).text().trim();
      // tds[4] is south months
      const time = $(tds[5]).text().trim();
      const price = $(tds[6]).text().trim();
      
      if (name) {
        fishes.push({ name, imageUrl, location, shadowSize, monthsNorth, time, price });
      }
    }
  });

  console.log(`Extracted ${fishes.length} fishes`);

  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer">
  <title>动森博物馆鱼类图鉴 (A4 打印版)</title>
  <link rel="stylesheet" href="styles_full_table.css">
  <style>
    .avatar-img {
      width: 64px;
      height: 64px;
      object-fit: contain;
      border-radius: 50%;
      border: 2px solid #64b5f6; /* Blueish border for fish */
      background: #e3f2fd;
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
      color: #1565c0;
    }
    .check-col {
      white-space: nowrap;
    }
    .text-small {
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="a4-page">
    <div class="header">
      <h1><span>🐟</span> 动森博物馆图鉴 - 鱼类 <span>🐟</span></h1>
      <div class="island-info">
        <div>小岛名称：<span></span></div>
        <div>岛主名字：<span></span></div>
      </div>
    </div>
    <table class="villager-table">
      <thead>
        <tr>
          <th class="avatar-col">图片</th>
          <th>鱼类名称</th>
          <th>出现场所</th>
          <th>鱼影尺寸</th>
          <th>出现月份(北)</th>
          <th>出现时间</th>
          <th>价格</th>
          <th class="check-col">收集</th>
        </tr>
      </thead>
      <tbody>`;

  for (const f of fishes) {
    const avatarHtml = f.imageUrl ? `<img src="${f.imageUrl}" class="avatar-img" alt="${f.name}" loading="lazy">` : '🐟';
    html += `
        <tr>
          <td class="avatar-col">${avatarHtml}</td>
          <td class="name-col">${f.name}</td>
          <td>${f.location}</td>
          <td>${f.shadowSize}</td>
          <td class="text-small">${f.monthsNorth}</td>
          <td class="text-small">${f.time}</td>
          <td>${f.price}</td>
          <td class="check-col"><div class="check-circle"></div></td>
        </tr>`;
  }

  html += `
      </tbody>
    </table>
    <div class="footer">
      带着这本图鉴，去捕捉所有的鱼儿填满博物馆吧！ —— 动物森友会专属收集册
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('fish_table.html', html);
  console.log('Generated fish_table.html with images');
}

generate();
