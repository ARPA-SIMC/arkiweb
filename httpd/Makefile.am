httpdconfdir = $(datarootdir)/$(PACKAGE)/httpd

httpdconf_DATA = arkiweb.conf

arkiweb.conf: arkiweb.conf.in
	sed -e 's,@PKGLIBDIR@,$(pkglibdir),g' $< > $@

EXTRA_DIST = arkiweb.conf.in

CLEANFILES = arkiweb.conf
