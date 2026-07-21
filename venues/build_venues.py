#!/usr/bin/env python3
"""
build_venues.py
---------------
1. Reads an unrolled CSV file (flexible header matching for venue details).
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


def parse_capacity(raw_cap: str) -> int:
    """Extracts the first or highest integer found in a capacity string (e.g., '1607 - 1710 pax' -> 1710)."""
    if not raw_cap:
        return 0
    numbers = [int(n) for n in re.findall(r"\d+", str(raw_cap))]
    return max(numbers) if numbers else 0


def read_csv_rows(csv_path: str):
    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            raise ValueError("CSV file has no header row detected.")
        
        # Normalize header keys to lowercase stripped strings for easy lookup
        normalized_rows = []
        for row in reader:
            norm_row = {k.strip().lower(): (v or "").strip() for k, v in row.items() if k}
            normalized_rows.append(norm_row)
        return normalized_rows


def build_js_block(rows, var_name):
    lines = [f"    const {var_name} = ["]
    for i, row in enumerate(rows):
        cluster = row.get("cluster", "")
        subcategory = row.get("subcategory", "")
        
        # Handle header variations for venue name
        venue_name = row.get("name") or row.get("venue name") or row.get("venue_name") or ""
        
        # Parse capacity flexibly
        raw_cap = row.get("capacity", "")
        capacity = parse_capacity(raw_cap)

        # Parse facilities array
        raw_fac = row.get("facilities", "")
        if raw_fac:
            delimiter = ";;" if ";;" in raw_fac else ";"
            facilities_list = [f.strip() for f in raw_fac.split(delimiter) if f.strip()]
        else:
            facilities_list = []
        
        # Extract additional fields if coming from consolidated master CSV format
        platform = row.get("booking platform / route") or row.get("booking platform") or ""
        hours = row.get("bookable / operating hours") or row.get("bookable hours") or ""
        cancel_period = row.get("cancellation period") or ""
        instructions = row.get("booking instructions & notes") or row.get("notes") or ""
        
        # Build composite remarks if dedicated detailed columns are provided
        raw_remarks = row.get("remarks", "")
        if not raw_remarks and (platform or hours or instructions):
            remark_parts = []
            if hours:
                remark_parts.append(f"Hours: {hours}")
            if platform:
                remark_parts.append(f"Platform: {platform}")
            if cancel_period:
                remark_parts.append(f"Cancel: {cancel_period}")
            if instructions:
                remark_parts.append(instructions)
            remarks = " | ".join(remark_parts)
        else:
            remarks = raw_remarks

        image_path = row.get("image", "")

        facilities_js_array = json.dumps(facilities_list, ensure_ascii=False)

        item_str = (
            f'      {{ '
            f'cluster: {js_string_literal(cluster)}, '
            f'subcategory: {js_string_literal(subcategory)}, '
            f'name: {js_string_literal(venue_name)}, '
            f'capacity: {capacity}, '
            f'facilities: {facilities_js_array}, '
            f'image: {js_string_literal(image_path)}, '
            f'remarks: {js_string_literal(remarks)} '
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
            if "body" in html_text:
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

    print(f"✅ Successfully compiled {len(rows)} venues from '{args.input_csv}' into '{args.output_html}' "
          f"(variable: {args.var}).")


if __name__ == "__main__":
    main()