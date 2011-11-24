publicdir = $(datarootdir)/$(PACKAGE)/public

public_DATA = arkiweb.js arkiweb.min.js arkiweb.css

JS = \
     arkiweb/config.js \
     arkiweb/parser.js \
     arkiweb/models/dataset.js \
     arkiweb/models/field.js \
     arkiweb/collections/datasets.js \
     arkiweb/collections/fields.js \
     arkiweb/views/application.js \
     arkiweb/views/map.js \
     arkiweb/views/datasets-selection.js \
     arkiweb/views/fields-selection.js \
     arkiweb/views/summary.js \
     arkiweb/templates/application.js \
     arkiweb/templates/datasets-selection.js \
     arkiweb/templates/datasets-selection-item.js \
     arkiweb/templates/fields-selection.js \
     arkiweb/templates/fields-selection-item.js \
     arkiweb/templates/fields-selection-reftime.js \
     arkiweb/templates/summary.js \
     arkiweb/templates/summary-item.js

TEMPLATES = \
	    arkiweb/templates/application.eco \
	    arkiweb/templates/datasets-selection.eco \
	    arkiweb/templates/datasets-selection-item.eco \
	    arkiweb/templates/fields-selection.eco \
	    arkiweb/templates/fields-selection-item.eco \
	    arkiweb/templates/fields-selection-reftime.eco \
	    arkiweb/templates/summary.eco \
	    arkiweb/templates/summary-item.eco

LESS = css/arkiweb.less

arkiweb.js: $(JS)
	cat $^ > $@

arkiweb.min.js: arkiweb.js
	$(UGLIFYJS) -o $@ $^

arkiweb.css: $(LESS)
	$(LESSC) $^ $@

.eco.js:
	$(ECO) $< -i arkiweb.templates

EXTRA_DIST = arkiweb.js arkiweb.min.js arkiweb.css $(JS) $(LESS) $(TEMPLATES)
