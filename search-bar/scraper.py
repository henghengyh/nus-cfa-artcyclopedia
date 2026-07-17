import os
import re
import json
import urllib.request
import urllib.error

# Target production URLs to crawl
URLS = [
    'https://nus-cac.com/',
    'https://nus-cac.com/venue',
    'https://nus-cac.com/funding',
    'https://nus-cac.com/publicity-resources',
    'https://nus-cac.com/student-groups',
    'https://nus-cac.com/equipment-loaning',
    'https://nus-cac.com/about'
]

# Map URLs to their respective external dictionary files
BACKUP_MAPPING = {
    'https://nus-cac.com/venue': 'backups/venue.txt',
    'https://nus-cac.com/student-groups': 'backups/student-groups.txt',
    'https://nus-cac.com/about': 'backups/about.txt'
}

def load_local_backup(file_path):
    """Helper to safely read external plaintext keyword dictionaries."""
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    print(f"⚠️ Warning: Backup file '{file_path}' not found.")
    return ""

def clean_html(html_content):
    """Strips tags, scripts, styles, and sanitizes whitespace strings."""
    # Remove script and style chunks entirely
    text = re.sub(r'<script[^>]*>[\s\S]*?</script>', ' ', html_content, flags=re.IGNORECASE)
    text = re.sub(r'<style[^>]*>[\s\S]*?</style>', ' ', text, flags=re.IGNORECASE)
    # Strip remaining HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Collapse multiple whitespaces/newlines into a single space
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()

def build_index():
    search_index = []
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'}

    for url in URLS:
        title = url
        body_text = ""
        
        print(f"Fetching site index from: {url}")
        req = urllib.request.Request(url, headers=headers)
        
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                html = response.read().decode('utf-8')
                
                # Extract page title
                title_match = re.search(r'<title[^>]*>([^<]+)</title>', html, re.IGNORECASE)
                if title_match:
                    title = title_match.group(1).strip()
                
                # Isolate body text if possible
                body_match = re.search(r'<body[^>]*>([\s\S]+?)</body>', html, re.IGNORECASE)
                body_text = body_match.group(1) if body_match else html
                
        except (urllib.error.URLError, Exception) as e:
            print(f"⚠️ Live crawl failed or blocked for {url}. Root error: {e}")

        # 🛡️ GUARANTEED INJECTION LAYER
        if url in BACKUP_MAPPING:
            backup_file = BACKUP_MAPPING[url]
            print(f"   └─ Injecting backup dictionary from: {backup_file}")
            body_text += " " + load_local_backup(backup_file)

        # Run string normalization engine
        cleaned_content = clean_html(body_text)

        if len(cleaned_content) > 0:
            search_index.append({
                "title": title,
                "url": url,
                "content": cleaned_content
            })
            print(f"✅ Successfully indexed: \"{title}\"")
        else:
            print(f"❌ Skipped {url}: No usable structural content scraped.")

    # Write dictionary to destination target
    output_file = 'search-index.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(search_index, f, indent=2, ensure_ascii=False)
        
    print(f"\n🏁 Finished! Wrote {len(search_index)} parsed pages to {output_file}")

if __name__ == '__main__':
    build_index()