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

async function buildIndex() {
  const searchIndex = [];

  for (const url of urls) {
    try {
      console.log(`Fetching HTML from: ${url}`);
      const response = await fetch(url);
      if (!response.ok) continue;
      
      const html = await response.text();

      // 1. Extract the Page Title via regex
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : url;

      // 2. Extract Body Text (strips out HTML tags so we can find clean keywords)
      const bodyMatch = html.match(/<body[^>]*>([\s\S]+?)<\/body>/i);
      let bodyText = bodyMatch ? bodyMatch[1] : html;
      bodyText = bodyText
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')   // Remove styles
        .replace(/<[^>]+>/g, ' ')                         // Strip HTML tags
        .replace(/\s+/g, ' ')                             // Clean up spacing
        .toLowerCase();

      searchIndex.push({
        title: title,
        url: url,
        content: bodyText // The search bar will look through this text
      });
    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error.message);
    }
  }

  // Save the compiled data to a static JSON file
  fs.writeFileSync('search-index.json', JSON.stringify(searchIndex, null, 2));
  console.log('Successfully built search-index.json!');
}

buildIndex();