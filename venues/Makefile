# Pipeline Configuration Variables
VENUE_CSV    ?= venues.csv
HTML_TEMPLATE ?= venue.html
OUT_HTML     ?= venue.html

.PHONY: all events venues

# Run both operations simultaneously
all: venues

venues:
	python3 build_venues.py $(VENUE_CSV) $(HTML_TEMPLATE) $(OUT_HTML) --var venuesData