# Makefile
#
# Usage:
#   make directory
#
# Optional overrides:
#   make directory CSV=mydata.csv HTML=mytemplate.html OUT=index.html
#
# Defaults below assume these files sit in the same folder as this Makefile:
#   data.csv       -> your CSV data
#   template.html  -> your HTML file that already contains (or will contain)
#                     a `const groupData = [ ... ];` block
#   output.html    -> the compiled result (overwritten every run)

CSV  ?= data.csv
HTML ?= student-groups.html
OUT  ?= student-groups.html
VAR  ?= groupData

.PHONY: directory
directory:
	python3 build.py $(CSV) $(HTML) $(OUT) --var $(VAR)