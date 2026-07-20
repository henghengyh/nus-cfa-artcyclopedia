#!/usr/bin/env python3
"""
build_venues.py
---------------
1. Reads a CSV file (columns: cluster, subcategory, venues).
2. Converts it into a structured JS array-of-objects literal (e.g. venuesData).
3. Finds the existing `const venuesData = [ ... ];` block inside your HTML template
   and injects the new data.
4. Writes the result to the output HTML file.
"""

import argparse
import csv
import json
import re
import sys


def js_string_literal(value: str) -> str:
    return json.dumps(str(value or ""), ensure_ascii=False)


def read_csv_rows(csv_path: str):
    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            raise ValueError("CSV file has no header row detected.")
        return [row for row in reader]


def build_js_block(rows, var_name):
    lines = [f"    const {var_name} = ["]
    for i, row in enumerate(rows):
        cluster = row.get("cluster", "").strip()
        subcategory = row.get("subcategory", "").strip()
        
        # Split individual venues on double-semicolons and strip whitespaces
        venues_raw = row.get("venues", "").split(";;")
        venues_list = [v.strip() for v in venues_raw if v.strip()]
        venues_js_array = json.dumps(venues_list, ensure_ascii=False)

        item_str = (
            f'      {{ '
            f'cluster: {js_string_literal(cluster)}, '
            f'subcategory: {js_string_literal(subcategory)}, '
            f'venues: {venues_js_array} '
            f'}}'
        )
        comma = "," if i < len(rows) - 1 else ""
        lines.append(item_str + comma)
    lines.append("    ];")
    return "\n".join(lines)


def inject_into_html(html_text, js_block, var_name):
    pattern = re.compile(
        r"const\s+" + re.escape(var_name) + r"\s*=\s*\[.*?\]\s*;",
        re.DOTALL
    )

    if pattern.search(html_text):
        new_html = pattern.sub(js_block, html_text, count=1)
    else:
        insertion_point = html_text.find("</script>")
        if insertion_point == -1:
            script_wrapped = f"<script>\n  {js_block}\n</script>\n"
            if "</body>" in html_text:
                new_html = html_text.replace("</body>", script_wrapped + "</body>")
            else:
                new_html = html_text + "\n" + script_wrapped
        else:
            new_html = html_text[:insertion_point] + "  " + js_block + "\n" + html_text[insertion_point:]

    return new_html


def main():
    parser = argparse.ArgumentParser(description="Compile CSV -> JS -> HTML for CAC Venues.")
    parser.add_argument("input_csv", help="Path to input CSV file")
    parser.add_argument("template_html", help="Path to source HTML template")
    parser.add_argument("output_html", help="Path to output HTML file")
    parser.add_argument("--var", default="venuesData", help="JS variable name")
    args = parser.parse_args()

    try:
        rows = read_csv_rows(args.input_csv)
    except Exception as e:
        sys.exit(f"Error reading CSV: {e}")

    js_block = build_js_block(rows, args.var)

    with open(args.template_html, "r", encoding="utf-8") as f:
        html_text = f.read()

    new_html = inject_into_html(html_text, js_block, args.var)

    with open(args.output_html, "w", encoding="utf-8") as f:
        f.write(new_html)

    print(f"✅ Successfully compiled {len(rows)} clusters from '{args.input_csv}' into '{args.output_html}' "
          f"(variable: {args.var}).")


if __name__ == "__main__":
    main()