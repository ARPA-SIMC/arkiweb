publicdir = $(datarootdir)/$(PACKAGE)/public

JS_FILES = \
	   javascript/arkiweb.js \
	   javascript/parser.js \
	   javascript/models/dataset.js \
	   javascript/models/field.js \
	   javascript/models/field-value.js \
	   javascript/collections/datasets.js \
	   javascript/collections/fields.js \
	   javascript/collections/field-values.js \
	   javascript/views/summary-stats.js \
	   javascript/views/fields-selection-section.js \
	   javascript/views/error.js \
	   javascript/views/postprocessors.js \
	   javascript/views/datasets-selection-item.js \
	   javascript/views/summary.js \
	   javascript/views/summary-section-item.js \
	   javascript/views/postprocessor.js \
	   javascript/views/map.js \
	   javascript/views/main.js \
	   javascript/views/fields-selection-section-item.js \
	   javascript/views/abstract-postprocessor.js \
	   javascript/views/fields-selection-stats-section.js \
	   javascript/views/fields-selection.js \
	   javascript/views/datasets-selection.js \
	   javascript/views/postprocessors/singlepoint.js \
	   javascript/views/postprocessors/subarea.js \
	   javascript/views/summary-section.js \
	   javascript/routers/router.js \
	   javascript/templates/main.js \
	   javascript/templates/datasets-selection-item.js \
	   javascript/templates/dataset-description.js \
	   javascript/templates/fields-selection-section.js \
	   javascript/templates/fields-selection-section-item.js \
	   javascript/templates/fields-selection-stats-section.js \
	   javascript/templates/summary.js \
	   javascript/templates/summary-stats.js \
	   javascript/templates/summary-section.js \
	   javascript/templates/summary-section-item.js \
	   javascript/templates/postprocessor.js

CSS_FILES = stylesheets/arkiweb.css

IMG_FILES = images/ajax-loader.gif

public_DATA = \
	      images/ajax-loader.gif \
	      stylesheets/arkiweb.css \
	      arkiweb.js \
	      arkiweb.min.js \
	      index.html \
	      javascript/jquery.arkiweb.js

arkiweb.js: javascript/arkiweb.js $(JS_FILES)
	./yoke.js $< > $@

arkiweb.min.js: arkiweb.js
	yui-compressor $< > $@

.eco.js:
	eco $< -i arkiweb.templates

EXTRA_DIST = $(JS_FILES) $(CSS_FILES) $(IMG_FILES) arkiweb.js arkiweb.min.js
