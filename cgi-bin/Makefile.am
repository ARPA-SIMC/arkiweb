cgidir = $(pkglibdir)

AM_CPPFLAGS = -I$(top_builddir) -I$(top_srcdir) $(CGICC_CFLAGS)

LDADD = $(top_builddir)/arkiweb/libarkiweb.la $(CGICC_LIBS) -lcgicc -larkimet

cgi_PROGRAMS = datasets summary fields data

datasets_SOURCES = datasets.cc

datasets_LDADD = $(LDADD)

summary_SOURCES = summary.cc

summary_LDADD = $(LDADD)

fields_SOURCES = fields.cc

fields_LDADD = $(LDADD)

data_SOURCES = data.cc

data_LDADD = $(LDADD)
