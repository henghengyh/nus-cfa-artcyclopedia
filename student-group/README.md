# Student Groups Directory Builder

A static compile pipeline that converts tabular group listings from a local CSV file into an interactive, multi-filtered web interface. This workflow decouples raw administrative spreadsheet editing from code development.

## Architectural Flow & Logic

```
   ┌──────────────┐
   │   data.csv   │  ◄── (Add/Edit listings here)
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │   build.py   │  ◄── (Injects rows into HTML script array)
   └──────┬───────┘
          │
          ▼
┌───────────────────────────────────────┐
│          student-groups.html          │
│ ───────────────────────────────────── │
│  [1. Extracted JS Data Array]         │ ◄── Managed by python
│  [2. Dynamic Filter Checkboxes]       │ ◄── Generated from 'cat' & 'org' keys
│  [3. Live Sub-string Filter & DOM]    │ ◄── Refreshes grid on input/clicks
└───────────────────────────────────────┘

```

1. **Automation Script (`build.py`)**: Locates the multiline `const groupData = [ ... ];` block in your HTML document and replaces it with freshly sanitized records from the CSV file.
2. **Dynamic UI Generation**: On page load, the Javascript module parses the array, extracts unique categories (`cat`) and organizations (`org`), and dynamically populates the sidebar checkbox controls.
3. **Adaptive UI Engine**: Card tag background colors adapt automatically based on category metadata, while the action button changes its branding theme (NUSync Orange, Instagram Pink, etc.) by evaluating the structural string pattern of the `link` column.

---

## Technical Specifications

### Prerequisites

* Python 3.x (Standard libraries only; zero dependencies).
* GNU `make`.

### Build Commands

To run the compilation step using default files (`data.csv` $\rightarrow$ `student-groups.html`), run:

```bash
make directory

```

To run a runtime override against separate workspace branches:

```bash
make directory CSV=test.csv HTML=template.html OUT=index.html VAR=myCustomArray

```

---

## Data Schema & Maintenance

When maintaining or updating records inside `data.csv`, the following structure must be meticulously preserved:

```csv
name,cat,org,desc,link
NUS Amplified,Music,NUS Centre For the Arts,,https://nusync.nus.edu.sg/...
Babushkraft,Craft,Acacia College,Creative group,https://www.instagram.com/...

```

### Maintenance Rules for Developers:

* **Automated Sidebar Filters**: Do **not** hardcode checkboxes into the HTML layout template. Adding a new unique `cat` or `org` value directly to a row inside the CSV file will cause the frontend interface to instantly construct matching filter options during runtime.
* **Smart Action Buttons**: The layout automatically handles missing links. If a row's `link` column is left entirely blank, the template changes the call-to-action into a clean, grayed-out `Not Available` element button.