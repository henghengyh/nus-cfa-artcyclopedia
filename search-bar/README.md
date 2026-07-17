# Site Search Indexer (`scraper.js`)

A zero-dependency Node.js script that crawls the live production domain to compile a text dictionary into a centralized local `search-index.json` file.

## Workflow File Strategy

Move the large strings out of the script file. Store them as flat text files in a dedicated `backups/` directory:

```bash
├── scraper.js
└── backups/
    ├── venue.txt
    ├── student-groups.txt
    └── about.txt

```

### Refactored Script Structure

Update the top of your script to load the file contents cleanly without breaking your logic:

```javascript
const fs = require('fs');
const path = require('path');

const manualContentBackups = {
  'https://nus-cac.com/venue': fs.readFileSync(path.join(__dirname, 'backups/venue.txt'), 'utf8'),
  'https://nus-cac.com/student-groups': fs.readFileSync(path.join(__dirname, 'backups/student-groups.txt'), 'utf8'),
  'https://nus-cac.com/about': fs.readFileSync(path.join(__dirname, 'backups/about.txt'), 'utf8')
};

```

---

## Operations Guide

### Execution

Run the pipeline directly via Node:

```bash
node scraper.js

```

### Why the Backups Matter

Hostinger or modern SPA frameworks frequently block or obscure client-side dynamic JavaScript rendering during a vanilla server-side raw crawl. The script uses a **Guaranteed Injection Architecture**:

```
      [Fetch Live URL Target]
                 │
        ┌────────┴────────┐
        ▼                 ▼
   (200 Success)    (Fetch Fails / Blocked)
  Parse live HTML    Keep empty canvas
        │                 │
        └────────┬────────┘
                 ▼
    [Append backup text block]
                 │
                 ▼
      [Sanitize markup/spaces]
                 │
                 ▼
       (search-index.json)

```

Whether the network frame completes perfectly or hits a timeout wall, the fallback dictionary text string is appended to the body string block, guaranteeing a functional search interface.

### Maintenance Checklist

* **Adding Pages**: To index a new site directory branch, append the absolute reference string to the `urls` collection array.
* **Updating Content**: When CCAs change or new physical locations are configured on the site layout, update the raw values inside the specific `backups/*.txt` file. Never use HTML syntax or delimiters inside the backup file—only single, space-separated plaintext strings.