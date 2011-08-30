noinst_LTLIBRARIES = libarkiweb.la

libarkiweb_la_CPPFLAGS = -I$(top_srcdir) -I$(top_builddir)

libarkiweb_la_LIBADD = $(top_builddir)/wibble/libwibble.la -larkimet

libarkiweb_la_SOURCES = \
			configfile.cc \
			configfile.h \
			cgi.cc \
			cgi.h \
			dataset.cc \
			dataset.h \
			restrict.cc \
			restrict.h
