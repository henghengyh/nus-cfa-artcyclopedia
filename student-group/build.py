#!/usr/bin/env python3
"""
build.py
--------
1. Reads a CSV file (columns: name, cat, desc, link).
2. Converts it to a JS array-of-objects literal (e.g. groupData).
3. Finds the existing `const groupData = [ ... ];` block inside an HTML
   template and replaces it with the freshly generated data.
   - If no such block exists yet, it inserts one right before </script>.
4. Writes the result to the output HTML file, OVERWRITING it if it exists.

Usage:
    python build.py <input.csv> <template.html> <output.html> [--var groupData]
"""

import argparse
import csv
import json
import re
import sys


def js_string_literal(value: str) -> str:
    if value is None:
        value = ""
    return json.dumps(str(value), ensure_ascii=False)


def read_csv_rows(csv_path: str):
    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            raise ValueError("CSV file has no header row / no columns detected.")
        rows = [row for row in reader]
        return reader.fieldnames, rows


def build_js_block(rows, fields, var_name):
    lines = [f"const {var_name} = ["]
    for i, row in enumerate(rows):
        parts = [f'{field}: {js_string_literal(row.get(field, ""))}' for field in fields]
        comma = "," if i < len(rows) - 1 else ""
        lines.append("    { " + ", ".join(parts) + " }" + comma)
    lines.append("  ];")
    return "\n".join(lines)


def inject_into_html(html_text, js_block, var_name):
    # Match: const <var_name> = [ ... ];  (non-greedy, across multiple lines)
    pattern = re.compile(
        r"const\s+" + re.escape(var_name) + r"\s*=\s*\[.*?\];",
        re.DOTALL
    )

    if pattern.search(html_text):
        new_html = pattern.sub(js_block, html_text, count=1)
    else:
        # No existing block found -> insert just before the first closing </script>
        insertion_point = html_text.find("</script>")
        if insertion_point == -1:
            # No <script> tag at all -> append a new script block before </body>
            script_wrapped = f"<script>\n  {js_block}\n</script>\n"
            if "</body>" in html_text:
                new_html = html_text.replace("</body>", script_wrapped + "</body>")
            else:
                new_html = html_text + "\n" + script_wrapped
        else:
            new_html = html_text[:insertion_point] + "  " + js_block + "\n" + html_text[insertion_point:]

    return new_html


def main():
    parser = argparse.ArgumentParser(description="Compile CSV -> JS -> HTML in one shot.")
    parser.add_argument("input_csv", help="Path to input CSV file")
    parser.add_argument("template_html", help="Path to source HTML template")
    parser.add_argument("output_html", help="Path to output HTML file (overwritten if it exists)")
    parser.add_argument("--var", default="groupData", help="JS variable name (default: groupData)")
    parser.add_argument("--fields", default=None, help="Comma-separated column order override")
    args = parser.parse_args()

    fieldnames, rows = read_csv_rows(args.input_csv)

    if args.fields:
        fields = [f.strip() for f in args.fields.split(",")]
        missing = [f for f in fields if f not in fieldnames]
        if missing:
            sys.exit(f"Error: requested field(s) not found in CSV header: {missing}\n"
                      f"CSV header columns are: {fieldnames}")
    else:
        fields = fieldnames

    js_block = build_js_block(rows, fields, args.var)

    with open(args.template_html, "r", encoding="utf-8") as f:
        html_text = f.read()

    new_html = inject_into_html(html_text, js_block, args.var)

    # Overwrite (or create) the output file
    with open(args.output_html, "w", encoding="utf-8") as f:
        f.write(new_html)

    print(f"Compiled {len(rows)} records from {args.input_csv} into {args.output_html} "
          f"(variable: {args.var}).")


if __name__ == "__main__":
    main()