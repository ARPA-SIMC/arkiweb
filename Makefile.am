SUBDIRS = arkiweb src

pkgdatadir = $(datarootdir)/$(PACKAGE)

pkgdata_DATA = website.tar.gz

website.tar.gz:
	tar czf $@ $(webfiles)

webfiles = \
	   website/arkiweb-config.js \
	   website/arkiweb.css \
	   website/arkiweb.js \
	   website/arkiweb-parser.js \
	   website/index.html \
	   website/jquery.js \
	   website/jquery.tablesorter.css \
	   website/jquery.tablesorter.js \
	   website/jquery-ui-timepicker-addon.css \
	   website/jquery-ui-timepicker-addon.js \
	   website/jquery.utils.js \
	   website/OpenLayers-2.10.tar.gz
	   
CLEANFILES = website.tar.gz

EXTRA_DIST = $(webfiles)

doc_DATA = README
