publicdir = $(datarootdir)/$(PACKAGE)/public

JSFILES =  \
	   models/dataset.js \
	   models/field.js \
	   models/field-value.js \
	   collections/datasets.js \
	   collections/fields.js \
	   collections/field-values.js \
	   views/summary-stats.js \
	   views/fields-selection-section.js \
	   views/error.js \
	   views/postprocessors.js \
	   views/datasets-selection-item.js \
	   views/summary.js \
	   views/summary-section-item.js \
	   views/postprocessor.js \
	   views/map.js \
	   views/main.js \
	   views/fields-selection-section-item.js \
	   views/abstract-postprocessor.js \
	   views/fields-selection-stats-section.js \
	   views/fields-selection.js \
	   views/datasets-selection.js \
	   views/postprocessors/singlepoint.js \
	   views/postprocessors/subarea.js \
	   views/summary-section.js \
	   routers/router.js

public_DATA = \
	      ajax-loader.gif \
	      arkiweb-parser.js \
	      arkiweb.css \
	      arkiweb.html \
	      arkiweb.js \
	      index.html \
	      jquery.arkiweb.js

doc_DATA = docs/arkiweb.html

arkiweb.js: $(JSFILES) require.js
	./yoke.js require.js > $@

EXTRA_DIST = $(public_DATA) $(JSFILES) require.js $(doc_DATA)
