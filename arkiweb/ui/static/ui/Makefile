VERSION=$(shell cd ../../../../ && python3 setup.py --version)

JS = \
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
     arkiweb/views/postprocessors.js \
     arkiweb/templates/application.js \
     arkiweb/templates/datasets-selection.js \
     arkiweb/templates/datasets-selection-item.js \
     arkiweb/templates/fields-selection.js \
     arkiweb/templates/fields-selection-item.js \
     arkiweb/templates/fields-selection-reftime.js \
     arkiweb/templates/summary.js \
     arkiweb/templates/summary-item.js \
     arkiweb/templates/postprocessor.js \
     arkiweb/postprocessors/singlepoint.js \
     arkiweb/postprocessors/subarea.js \
     arkiweb/postprocessors/seriet.js \
     arkiweb/postprocessors/json.js

TEMPLATES = \
	    arkiweb/templates/application.eco \
	    arkiweb/templates/datasets-selection.eco \
	    arkiweb/templates/datasets-selection-item.eco \
	    arkiweb/templates/fields-selection.eco \
	    arkiweb/templates/fields-selection-item.eco \
	    arkiweb/templates/fields-selection-reftime.eco \
	    arkiweb/templates/summary.eco \
	    arkiweb/templates/summary-item.eco \
	    arkiweb/templates/postprocessor.eco

all: arkiweb.js

config.js: arkiweb/config.js.in
	sed -e "s,[@]PACKAGE_VERSION[@],$(VERSION),g" $^ > $@


arkiweb.js: config.js $(JS)
	cat $^ > $@

# SUFFIXES = .eco .js.in .js
# 
# if HAVE_ECO
# 
# .eco.js:
# 	$(ECO) $< -i arkiweb.templates -p > $@
# 
# endif

#.js.in.js:
#	sed -e "s,[@]PACKAGE_VERSION[@],$(PACKAGE_VERSION),g" $^ > $@

clean:
	rm -f config.js arkiweb.js
