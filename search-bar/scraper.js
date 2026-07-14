const fs = require('fs');

// The active NUS-CAC links you want to crawl
const urls = [
  'https://nus-cac.com/',
  'https://nus-cac.com/venue',
  'https://nus-cac.com/funding',
  'https://nus-cac.com/publicity-resources',
  'https://nus-cac.com/student-groups',
  'https://nus-cac.com/equipment-loaning',
  'https://nus-cac.com/about'
];

async function buildIndex() {
  const searchIndex = [];

  for (const url of urls) {
    try {
      console.log(`Fetching site index from: ${url}`);
      
      // Native fetch automatically handles SSL/TLS handshakes and follows 301/302 redirects
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const html = await response.text();

      // Extract the Page Title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : url;

      // Extract and clean Body Text
      const bodyMatch = html.match(/<body[^>]*>([\s\S]+?)<\/body>/i);
      let bodyText = bodyMatch ? bodyMatch[1] : html;
      
      bodyText = bodyText
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') 
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')   
        .replace(/<[^>]+>/g, ' ')                         
        .replace(/\s+/g, ' ')                             
        .trim()
        .toLowerCase();

      searchIndex.push({
        title: title,
        url: url,
        content: bodyText
      });
      
      console.log(`✅ Successfully indexed: "${title}"`);

    } catch (error) {
      console.warn(`⚠️ Skipped URL: ${url} (Reason: ${error.message})`);
    }
  }

  // Save the compiled data
  fs.writeFileSync('search-index.json', JSON.stringify(searchIndex, null, 2));
  console.log(`🏁 Done! Successfully wrote ${searchIndex.length} pages to search-index.json!`);
}

buildIndex();