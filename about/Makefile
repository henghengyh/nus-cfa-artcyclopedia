# Makefile
#
# Usage:
#   make events
#
# Optional overrides:
#   make events CSV=my_events.csv HTML=about_template.html OUT=about.html
#
# Defaults below:
#   events.csv   -> your CSV data
#   about.html   -> your HTML file containing the `const eventsData = [ ... ];` block
#   about.html   -> the compiled output (safely overwritten)

CSV  ?= events.csv
HTML ?= about.html
OUT  ?= about.html
VAR  ?= eventsData

.PHONY: events
events:
	python3 build_events.py $(CSV) $(HTML) $(OUT) --var $(VAR)