noinst_LTLIBRARIES = libarkiweb.la

libarkiweb_la_CPPFLAGS = -I$(top_srcdir) -I$(top_builddir)

libarkiweb_la_LIBADD = \
		       $(top_builddir)/wibble/libwibble.la \
		       -larkimet

libarkiweb_la_SOURCES = \
			authorization.cc \
			authorization.h \
			configfile.cc \
			configfile.h \
			data.cc \
			data.h \
			dataset.cc \
			dataset.h \
			fields.cc \
			fields.h \
			restrict.cc \
			restrict.h \
			summary.cc \
			summary.h
