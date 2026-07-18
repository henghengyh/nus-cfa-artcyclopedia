# CAC Events Carousel Builder

A clean, static-build pipeline designed to compile structured event information from a local CSV file into an interactive, touch-friendly, glassmorphic carousel component on a static HTML page.

This repository decouples content management (CSV) from layout rendering (HTML/JS), allowing non-technical collaborators to update event listings easily without altering layout source code.

---

## Architecture & Data Flow

The build tool uses Python to parse tabular CSV records and directly overwrite/inject an inline JavaScript array literal (`const eventsData`) inside your production target HTML template.

```
                  ┌────────────┐
                  │ events.csv │  ◄── (Manage content here)
                  └─────┬──────┘
                        │
                        ▼
             ┌──────────────────┐
             │ build_events.py  │  ◄── (Compiles records to JS array)
             └──────────┬───────┘
                        │
     ┌──────────────────┼─────────────────┐
     ▼                  ▼                 ▼
[Search Template]  [Find Array]    [Overwrite Template]
about.html   ──►  const eventsData  ──►   about.html (Updated)

```

1. **Content Management (`events.csv`)**: Maintain your titles, photos, and Instagram call-to-actions.
2. **Build Compilation (`build_events.py`)**: Reads the CSV, parses records, escapes variables safely into double-quoted JSON strings, and executes a Regex-based string injection.
3. **Frontend Dynamic Hydration (`about.html`)**: The client-side DOM parsing engine takes the compiled array, resolves the relative image file names to raw GitHub assets, and renders the layout.

---

## Project Structure

```bash
├── Makefile               # Task automation wrapper (configures defaults & overrides)
├── build_events.py        # Python 3 parsing and injection compiler script
├── events.csv             # Pure data source containing event listings
└── about.html             # Target HTML page (contains raw markup, layout, and JS logic)

```

---

## Getting Started

### Prerequisites

* Python 3.x (no external dependencies required; uses standard libraries `csv`, `json`, `re`, `argparse`).
* `make` utility (standard on macOS/Linux; available via Chocolatey or WSL on Windows).

### Quick Compile (Default Run)

To compile the default source configurations (`events.csv` parsed into `about.html`), simply run:

```bash
make events

```

### Advanced Build Overrides

You can dynamically override variables inside the Makefile directly from the command line:

```bash
make events CSV=custom_data.csv HTML=templates/input.html OUT=dist/about.html VAR=customArrayName

```

* **`CSV`**: Source file holding raw data (default: `events.csv`)
* **`HTML`**: Input target containing the script block template (default: `about.html`)
* **`OUT`**: Final compiled output file destination (default: `about.html`)
* **`VAR`**: The JavaScript variable identifier to locate and replace (default: `eventsData`)

---

## Developer Integration Guide

### 1. The CSV Schema (`events.csv`)

Your content should match the following head signatures exactly. Field ordering does not matter as the python script handles structural alignment natively.

```csv
title,photo,url
CAC Run & Bond,run-and-bond.jpg,https://www.instagram.com/nuscac/
CAC Welcome Tea,welcome-tea.jpg,https://www.instagram.com/nuscac/

```

### 2. The HTML Injection Target (`about.html`)

The build script is design-aware. It executes a multi-line regex check seeking the specific initialization statement: `const eventsData = [ ... ];`.

Place this array inside the `<script>` tag of your component. Your HTML template should be formatted as follows:

```html
<script>
  document.addEventListener("DOMContentLoaded", () => {
    
    // 1. JSON Array containing all active CAC Events
    const eventsData = [
      { "title": "CAC Run & Bond", "photo": "run-and-bond.jpg", "url": "https://www.instagram.com/nuscac/" }
    ];

    // Base path constructed to pull raw images from GitHub Repository
    const baseImgUrl = "https://raw.githubusercontent.com/henghengyh/nus-cfa-artcyclopedia/main/photos/about/";
    
    // Render and interactive scrolling logic ...
  });
</script>

```

> ⚠️ **Fallback Protocol**: If the regex pattern matches zero existing declarations, the script automatically catches the exception, creates a new `<script>` wrapper block, and safely injects it right before the closing `</script>` or `</body>` boundary tag in your document.

---

## Client Features & Styling Rules

* **Aspect-Ratio Responsive Locking**: Image frames use an aspect-locked responsive wrapper combined with `object-fit: cover` to safeguard the slider grid from uneven image sizing.
* **Scroll Engine**: Driven natively by CSS scroll snap and JavaScript `scrollBy` utilities allowing smooth touchpad, touch-swipe, and scroll-button interactions without external slider libraries (e.g., Splide or Slick).
* **Performance Optimizations**: Native browser-level `loading="lazy"` dynamic attribute rendering is set on all generated image nodes to minimize loading impact on larger decks.