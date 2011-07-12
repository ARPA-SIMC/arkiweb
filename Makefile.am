ACLOCAL_AMFLAGS = -I m4

SUBDIRS = embedded/cgicc arkiweb src

pkgdatadir = $(datarootdir)/$(PACKAGE)

pkgdata_DATA = website.tar.gz

website.tar.gz: $(webfiles)
	tar czf $@ $(webfiles)

webfiles = \
	   website/arkiweb.css \
	   website/arkiweb.js \
	   website/arkiweb-parser.js \
	   website/index.html \
	   website/jquery-ui-timepicker-addon.css \
	   website/jquery-ui-timepicker-addon.js \
	   website/jquery.utils.js \
	   website/loader.gif
	   
CLEANFILES = website.tar.gz

EXTRA_DIST = $(webfiles)

doc_DATA = README
