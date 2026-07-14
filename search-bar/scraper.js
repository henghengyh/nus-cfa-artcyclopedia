const fs = require('fs');

const urls = [
  'https://nus-cac.com/',
  'https://nus-cac.com/venue',
  'https://nus-cac.com/funding',
  'https://nus-cac.com/publicity-resources',
  'https://nus-cac.com/student-groups',
  'https://nus-cac.com/equipment-loaning',
  'https://nus-cac.com/about'
];

// Helper function to decode encoded HTML entities inside srcdoc
function decodeHtmlEntities(str) {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x26;/g, '&');
}

async function buildIndex() {
  const searchIndex = [];

  for (const url of urls) {
    try {
      console.log(`Fetching site index from: ${url}`);
      
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

      // Extract raw body contents
      const bodyMatch = html.match(/<body[^>]*>([\s\S]+?)<\/body>/i);
      let bodyText = bodyMatch ? bodyMatch[1] : html;

      // 🔍 DETECT & EXTRACT Trapped Content in Hostinger iFrames
      const srcdocRegex = /srcdoc\s*=\s*["']([\s\S]*?)["']/gi;
      let match;
      let extractedEmbedContents = "";

      while ((match = srcdocRegex.exec(bodyText)) !== null) {
        const rawSrcdoc = match[1];
        // Decode the entities so the tag stripper can clean it properly later
        const decodedSrcdoc = decodeHtmlEntities(rawSrcdoc);
        extractedEmbedContents += " " + decodedSrcdoc;
      }

      if (extractedEmbedContents) {
        console.log(`   └─ Found and unpacked inline iframe code block!`);
        bodyText += " " + extractedEmbedContents;
      }

      // Clean HTML tags, scripts, and CSS styling
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

  // Save the database
  fs.writeFileSync('search-index.json', JSON.stringify(searchIndex, null, 2));
  console.log(`🏁 Successfully wrote ${searchIndex.length} pages to search-index.json!`);
}

buildIndex();