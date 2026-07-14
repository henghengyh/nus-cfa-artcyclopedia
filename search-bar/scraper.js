const fs = require('fs');

// The links you want your search bar to crawl
const urls = [
  'https://nus-cac.com/',
  'https://nus-cac.com/venue',
  'https://nus-cac.com/funding',
  'https://nus-cac.com/publicity-resources',
  'https://nus-cac.com/student-groups',
  'https://nus-cac.com/equipment-loaning',
  'https://nus-cac.com/about'
];

// Helper function to fetch HTML content securely without external fetch dependencies
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Status Code: ${res.statusCode}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', err => reject(err));
  });
}

async function buildIndex() {
  const searchIndex = [];

  for (const url of urls) {
    try {
      console.log(`Fetching site index from: ${url}`);
      const html = await fetchHtml(url);

      // Extract <title> value using simple regex matching
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : url;

      // Extract content from <body> block and strip layout markup
      const bodyMatch = html.match(/<body[^>]*>([\s\S]+?)<\/body>/i);
      let bodyText = bodyMatch ? bodyMatch[1] : html;
      
      bodyText = bodyText
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')   // Remove styles
        .replace(/<[^>]+>/g, ' ')                         // Strip tags
        .replace(/\s+/g, ' ')                             // Clean multiple spaces
        .trim()
        .toLowerCase();

      searchIndex.push({
        title: title,
        url: url,
        content: bodyText
      });
    } catch (error) {
      console.error(`Skipping URL: ${url} due to error:`, error.message);
    }
  }

  // Output compiled JSON static database locally
  fs.writeFileSync('search-index.json', JSON.stringify(searchIndex, null, 2));
  console.log('Successfully written index database to search-index.json!');
}

buildIndex();