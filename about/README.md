# Student Groups Directory Builder

A zero-dependency pipeline that compiles group listings from a local CSV into a multi-filtered, adaptive grid UI on a static HTML page.

## System Architecture

```
[data.csv] ──(make directory / build.py)──► [student-groups.html]
                                                     │
               ┌─────────────────────────────────────┴─────────────────────────────────────┐
               ▼                                                                           ▼
     Runtime UI Hydration                                                        Dynamic Style Adapters
• Self-generating sidebar checkboxes                                     • Adaptive card tags based on `cat`
• String-matching search on text input                                   • Dynamic button branding based on `link` domain

```

---

## Quick Start

### Prerequisites

* Python 3.x (Standard library only)
* GNU `make`

### Commands

```bash
# Default build (data.csv -> student-groups.html)
make directory

# Override parameters
make directory CSV=test.csv HTML=tmpl.html OUT=index.html VAR=myCustomArray

```

---

## Maintenance Rules

### 1. CSV Schema (`data.csv`)

Keep column names exact. Order does not matter.

```csv
name,cat,org,desc,link
NUS Amplified,Music,NUS Centre For the Arts,,https://nusync.nus.edu.sg/...
Babushkraft,Craft,Acacia College,Creative group,https://www.instagram.com/...

```

### 2. Layout Logic (No Hand-Editing Required)

* **Sidebar Filters**: Do not hardcode checkboxes. Adding a new unique `cat` (Category) or `org` (Organisation) to the CSV auto-generates its respective sidebar filter on page load.
* **Smart CTA Buttons**: The UI scans the `link` column value at runtime to apply brand styling (e.g., NUS Orange, Instagram Pink). If left blank, it automatically renders a disabled, grayed-out button.
* **Data Targeting**: The Python script relies on a literal regex match for `const groupData = [ ... ];` inside the HTML file to execute updates. Avoid refactoring this variable structure.