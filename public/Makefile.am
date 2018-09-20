publicdir = $(datarootdir)/$(PACKAGE)/public

public_DATA = arkiweb.js arkiweb.css

nobase_dist_public_DATA = \
			  lib/jquery-ui.css \
			  lib/backbone.js \
			  lib/jquery.blockUI.js \
			  lib/jquery.layout.js \
			  lib/jquery.min.js \
			  lib/jquery-ui.js \
			  lib/jquery-ui-timepicker-addon.js \
			  lib/OpenLayers.js \
			  lib/theme/default/style.css \
			  lib/strftime.js \
			  lib/underscore.js

JS = \
     $(builddir)/arkiweb/config.js \
     $(srcdir)/arkiweb/parser.js \
     $(srcdir)/arkiweb/models/dataset.js \
     $(srcdir)/arkiweb/models/field.js \
     $(srcdir)/arkiweb/collections/datasets.js \
     $(srcdir)/arkiweb/collections/fields.js \
     $(srcdir)/arkiweb/views/application.js \
     $(srcdir)/arkiweb/views/map.js \
     $(srcdir)/arkiweb/views/datasets-selection.js \
     $(srcdir)/arkiweb/views/fields-selection.js \
     $(srcdir)/arkiweb/views/summary.js \
     $(srcdir)/arkiweb/views/postprocessors.js \
     $(srcdir)/arkiweb/templates/application.js \
     $(srcdir)/arkiweb/templates/datasets-selection.js \
     $(srcdir)/arkiweb/templates/datasets-selection-item.js \
     $(srcdir)/arkiweb/templates/fields-selection.js \
     $(srcdir)/arkiweb/templates/fields-selection-item.js \
     $(srcdir)/arkiweb/templates/fields-selection-reftime.js \
     $(srcdir)/arkiweb/templates/summary.js \
     $(srcdir)/arkiweb/templates/summary-item.js \
     $(srcdir)/arkiweb/templates/postprocessor.js \
     $(srcdir)/arkiweb/postprocessors/singlepoint.js \
     $(srcdir)/arkiweb/postprocessors/subarea.js \
     $(srcdir)/arkiweb/postprocessors/seriet.js \
     $(srcdir)/arkiweb/postprocessors/json.js

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

arkiweb.js: $(JS)
	cat $^ > $@

SUFFIXES = .eco .js.in .js

if HAVE_ECO

.eco.js:
	$(ECO) $< -i arkiweb.templates -p > $@

endif

#.js.in.js:
#	sed -e "s,[@]PACKAGE_VERSION[@],$(PACKAGE_VERSION),g" $^ > $@


EXTRA_DIST = arkiweb.js arkiweb.css $(JS) $(TEMPLATES) index.html

CLEANFILES = arkiweb.js

htmlexampledir = $(docdir)/html/example

htmlexample_DATA = index.html
