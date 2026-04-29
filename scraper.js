const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrape() {
  try {
    const { data } = await axios.get('https://wiki.biligame.com/dongsen/%E5%B0%8F%E5%8A%A8%E7%89%A9%E5%9B%BE%E9%89%B4', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    const villagers = [];
    
    // Find the wikitable
    $('table.wikitable tbody tr').each((i, el) => {
      // Skip header row
      if (i === 0) return;
      
      const tds = $(el).find('td');
      if (tds.length > 0) {
        const name = $(tds[0]).text().trim(); // usually first column is Name or Avatar. Let's get both just in case.
        // Actually, wiki tables often have: Avatar, Name, Gender, Personality, Species, Birthday.
        // Let's dump the raw text array to see.
        const rowData = [];
        $(el).find('td, th').each((j, td) => {
          rowData.push($(td).text().trim());
        });
        
        // Try to find the name from the a tag to be sure.
        const nameNode = $(el).find('a').first();
        const extractedName = nameNode.text().trim();
        
        if (rowData.length > 3 && extractedName) {
           villagers.push(rowData);
        }
      }
    });
    
    fs.writeFileSync('raw_villagers.json', JSON.stringify(villagers, null, 2));
    console.log(`Scraped ${villagers.length} villagers`);
  } catch (err) {
    console.error('Error scraping:', err.message);
  }
}

scrape();
