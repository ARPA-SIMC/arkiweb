cgidir = $(pkglibdir)

AM_CPPFLAGS = -I$(top_builddir) -I$(top_srcdir)

LDADD = $(top_builddir)/arkiweb/libarkiweb.la $(top_builddir)/wibble/libwibble.la -larkimet

cgi_PROGRAMS = datasets summary metadata data

datasets_SOURCES = datasets.cc

datasets_LDADD = $(LDADD)

summary_SOURCES = summary.cc

summary_LDADD = $(LDADD)

metadata_SOURCES = metadata.cc

metadata_LDADD = $(LDADD)

data_SOURCES = data.cc

data_LDADD = $(LDADD)
