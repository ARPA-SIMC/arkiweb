cgidir = $(pkglibdir)

AM_CPPFLAGS = -I$(top_builddir) -I$(top_srcdir)

LDADD = $(top_builddir)/arkiweb/libarkiweb.la $(top_builddir)/wibble/libwibble.la -larkimet

cgi_PROGRAMS = datasets summary extended-summary data

datasets_SOURCES = datasets.cc

datasets_LDADD = $(LDADD)

summary_SOURCES = summary.cc

summary_LDADD = $(LDADD)

extended_summary_SOURCES = extended-summary.cc

extended_summary_LDADD = $(LDADD)

data_SOURCES = data.cc

data_LDADD = $(LDADD)
