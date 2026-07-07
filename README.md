# NUS CFA Artcyclopedia
This is a repository to store embedded code for www.nus-cfa.com.

## Introduction

A dynamic, searchable, and filterable directory web application showcasing various arts, culture, and interest student groups across the National University of Singapore (NUS), including groups under the NUS Centre For the Arts (CFA), Halls of Residence, Residential Colleges, and independent student interest groups.

## 📂 Repository Structure

*   `student-groups.html` — The main frontend user interface featuring a responsive grid layout, sidebar filters (by Category and Organisation), and live local text search.
*   `data.csv` — The central data source containing raw records of all student groups (Names, Categories, Organisations, Descriptions, and Links).
*   `build.py` — A Python build script used to process `data.csv` and automatically populate/generate the dynamic parts of the frontend configuration (such as `output.js` or directly updating the HTML script blocks).
*   `Makefile` — Provides convenient shortcut commands for building, testing, or deploying the directory.
*   `search-bar.html` — A reusable search component or widget.

---

## 🚀 Features

*   🔍 **Live Local Text Search:** Instantly filters student group cards by typing keywords.
*   🗂️ **Dynamic Sidebar Filtering:** Auto-populated checkbox filters separating groups by **Category** (e.g., Music, Dance, Theatre, Craft, Visual Arts) and **Organisation** (e.g., NUS Centre For the Arts, Tembusu College, Eusoff Hall).
*   📱 **Responsive Design:** A clean, campus-themed CSS grid system that scales beautifully from large desktop monitors down to mobile viewports.
*   🔗 **Direct Integration:** Every group card includes direct links to official platforms like NUSync or Instagram.

---

## 🛠️ How It Works & Automation

Instead of manually editing the large `groupData` array inside `student-groups.html`, the workflow is automated using Python:

1.  **Modify Data:** Add, remove, or update student groups directly in `data.csv`.
2.  **Run Build Script:** The `build.py` script parses the updated CSV file and updates the JavaScript data structures so that the web page reflects the latest changes automatically.

### Commands

If you use the included `Makefile`, you can rebuild the project simply by running:
```bash
make directory