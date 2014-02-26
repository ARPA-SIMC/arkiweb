httpdconfdir = $(datarootdir)/$(PACKAGE)/httpd

publicdir = $(datarootdir)/$(PACKAGE)/public

httpdconf_DATA = arkiweb.conf

arkiweb.conf: arkiweb.conf.in
	sed \
		-e 's,@PKGLIBDIR@,$(pkglibdir),g' \
		-e 's,@PUBLICDIR@,$(publicdir),g' \
		$< > $@

EXTRA_DIST = arkiweb.conf.in

CLEANFILES = arkiweb.conf
