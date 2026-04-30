const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

async function testGenerateImage(inputFile) {
  console.log(`Processing ${inputFile}...`);
  
  const html = fs.readFileSync(inputFile, 'utf-8');
  const $ = cheerio.load(html);
  
  const rows = $('tbody tr').toArray();
  const headerHtml = $('.header').prop('outerHTML');
  const footerHtml = $('.footer').prop('outerHTML');
  const theadHtml = $('thead').prop('outerHTML');
  const tableClasses = $('table').attr('class');
  
  // Reduced to 8 rows to accommodate larger fonts and avatars
  const rowsPerPage = 8; 
  let newPagesHtml = '';
  
  for (let i = 0; i < rows.length; i += rowsPerPage) {
    const chunk = rows.slice(i, i + rowsPerPage);
    const chunkHtml = chunk.map(r => $(r).prop('outerHTML')).join('');
    
    newPagesHtml += `
    <div class="a4-page screenshot-page" id="page-${i}" style="display: none;">
      ${headerHtml}
      <table class="${tableClasses}">
        ${theadHtml}
        <tbody>
          ${chunkHtml}
        </tbody>
      </table>
      <div style="flex-grow: 1;"></div>
      ${footerHtml}
    </div>
    `;
  }
  
  $('body').html(newPagesHtml);
  
  // Force exactly A4 dimensions AND increase font sizes significantly
  $('head').append(`
    <style>
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 794px !important;
        height: 1123px !important;
        background: #e0f7fa !important;
        overflow: hidden !important;
        font-size: 16px !important;
      }
      .screenshot-page {
        margin: 0 !important;
        box-shadow: none !important;
        width: 794px !important;
        height: 1123px !important;
        min-height: 1123px !important;
        max-height: 1123px !important;
        padding: 15mm !important;
        box-sizing: border-box !important;
        flex-direction: column;
        border: none !important;
        background-color: var(--bg-color);
        background-image: radial-gradient(#dcedc8 20%, transparent 20%),
          radial-gradient(#dcedc8 20%, transparent 20%);
        background-position: 0 0, 10px 10px;
        background-size: 20px 20px;
      }
      /* Enlarged Typography for better reading */
      .header h1 { font-size: 42px !important; }
      .name-col { font-size: 22px !important; }
      .text-small, div[style*="font-size: 11px"], div[style*="font-size:10px"] { 
        font-size: 15px !important; 
        line-height: 1.5 !important;
      }
      th { font-size: 20px !important; padding: 12px 8px !important; }
      td { font-size: 16px !important; padding: 10px 8px !important; }
      .avatar-img { width: 76px !important; height: 76px !important; }
      .footer { margin-top: auto; font-size: 16px !important; font-weight: bold; }
    </style>
  `);
  
  const tempHtmlPath = path.join(__dirname, 'temp_test.html');
  fs.writeFileSync(tempHtmlPath, $.html());
  
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
  
  console.log('Loading page into Puppeteer...');
  const fileUrl = `file://${tempHtmlPath}`;
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  
  // Wait explicitly for web fonts to load
  console.log('Waiting for fonts to load...');
  await page.evaluateHandle('document.fonts.ready');
  // Add a small extra delay just to be absolutely sure the font renders
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const outDir = path.join(__dirname, 'output_images');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }
  
  const baseName = path.basename(inputFile, '.html');
  const numPages = Math.ceil(rows.length / rowsPerPage);
  
  console.log('Taking full-page A4 screenshots...');
  for (let i = 0; i < numPages; i++) {
    const pageId = `#page-${i * rowsPerPage}`;
    
    await page.evaluate((id) => {
      document.querySelectorAll('.screenshot-page').forEach(el => el.style.display = 'none');
      document.querySelector(id).style.display = 'flex';
    }, pageId);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const outPath = path.join(outDir, `${baseName}_page_${i + 1}.png`);
    await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 794, height: 1123 } });
    console.log(`Saved ${outPath}`);
  }
  
  await browser.close();
  fs.unlinkSync(tempHtmlPath);
  console.log('Done!');
}

testGenerateImage('fish_table.html').catch(console.error);
