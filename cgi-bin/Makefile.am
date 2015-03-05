cgidir = $(pkglibdir)

AM_CPPFLAGS = -I$(top_builddir) -I$(top_srcdir) -I$(top_srcdir)/embedded/cgicc -I$(top_builddir)/embedded/cgicc $(WIBBLE_CFLAGS)

LDADD = $(top_builddir)/arkiweb/libarkiweb.la \
	$(WIBBLE_LIBS) \
	$(top_builddir)/embedded/cgicc/cgicc/libcgicc.la \
	-larkimet

cgi_PROGRAMS = datasets summary fields data

datasets_SOURCES = datasets.cc

datasets_LDADD = $(LDADD)

summary_SOURCES = summary.cc

summary_LDADD = $(LDADD)

fields_SOURCES = fields.cc

fields_LDADD = $(LDADD)

data_SOURCES = data.cc

data_LDADD = $(LDADD)
