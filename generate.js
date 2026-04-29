const fs = require('fs');
const cheerio = require('cheerio');

function generate() {
  const htmlContent = fs.readFileSync('page.html', 'utf-8');
  const $ = cheerio.load(htmlContent);
  
  const villagers = [];
  
  $('#CardSelectTr tbody tr').each((i, el) => {
    if ($(el).attr('id') === 'CardSelectTabHeader') return;
    
    const tds = $(el).find('td');
    if (tds.length >= 6) {
      // Extract the name
      const nameNode = $(tds[0]).find('a').last();
      const name = nameNode.text().trim() || $(tds[0]).text().trim();
      
      // Extract the image src
      // Bilibili wiki images have srcset and src. 'src' might be a tiny thumb, try to get the 60px or 80px version, or just 'src'.
      const imgNode = $(tds[0]).find('img');
      let avatarUrl = '';
      if (imgNode.length > 0) {
        avatarUrl = imgNode.attr('src');
        // If it starts with //, prepend https:
        if (avatarUrl && avatarUrl.startsWith('//')) {
          avatarUrl = 'https:' + avatarUrl;
        }
      }

      const gender = $(tds[1]).text().trim();
      const personality = $(tds[2]).text().trim();
      const species = $(tds[3]).text().trim();
      const birthday = $(tds[4]).text().trim();
      const catchphrase = $(tds[5]).text().trim();
      
      // Some names contain unwanted text if they are just parsed by .text(). 
      // The previous scraper actually worked fine for names.
      if (name) {
        villagers.push({ name, avatarUrl, gender, personality, species, birthday, catchphrase });
      }
    }
  });

  console.log(`Extracted ${villagers.length} villagers`);

  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Add no-referrer to bypass hotlink protection for bilibili images -->
  <meta name="referrer" content="no-referrer">
  <title>动森全岛民详细图鉴 (A4 打印版)</title>
  <link rel="stylesheet" href="styles_full_table.css">
  <style>
    .avatar-img {
      width: 64px;
      height: 64px;
      object-fit: contain;
      border-radius: 50%;
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
    }
    .check-col {
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div class="a4-page">
    <div class="header">
      <h1><span>📖</span> 动森全岛民详细图鉴 <span>📖</span></h1>
      <div class="island-info">
        <div>小岛名称：<span></span></div>
        <div>岛主名字：<span></span></div>
      </div>
    </div>
    <table class="villager-table">
      <thead>
        <tr>
          <th class="avatar-col">头像</th>
          <th>名字</th>
          <th>性别</th>
          <th>性格</th>
          <th>种族</th>
          <th>生日</th>
          <th>口头禅</th>
          <th class="check-col">收集</th>
        </tr>
      </thead>
      <tbody>`;

  for (const v of villagers) {
    let genderText = v.gender;
    if (v.gender === '♂') genderText = '男';
    else if (v.gender === '♀') genderText = '女';
    
    const genderIcon = v.gender === '♂' ? `<span class="gender-m">${genderText}</span>` : `<span class="gender-f">${genderText}</span>`;
    const avatarHtml = v.avatarUrl ? `<img src="${v.avatarUrl}" class="avatar-img" alt="${v.name}" loading="lazy">` : '🐾';
    html += `
        <tr>
          <td class="avatar-col">${avatarHtml}</td>
          <td class="name-col">${v.name}</td>
          <td>${genderIcon}</td>
          <td>${v.personality}</td>
          <td>${v.species}</td>
          <td>${v.birthday}</td>
          <td>${v.catchphrase}</td>
          <td class="check-col"><div class="check-circle"></div></td>
        </tr>`;
  }

  html += `
      </tbody>
    </table>
    <div class="footer">
      带着这本图鉴，去寻找你的梦中情岛民吧！ —— 动物森友会专属收集册
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('full_villagers_table.html', html);
  console.log('Generated full_villagers_table.html with images');
}

generate();
