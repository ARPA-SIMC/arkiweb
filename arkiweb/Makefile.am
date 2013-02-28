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
			processor.cc \
			processor.h \
			summary.cc \
			summary.h

check_PROGRAMS = arkiweb-test

arkiweb_test_CPPFLAGS = -I$(top_srcdir) -I$(top_builddir)

arkiweb_test_LDADD = \
		     $(top_builddir)/wibble/libwibble.la \
		     $(builddir)/libarkiweb.la \
		     -larkimet

arkiweb_test_SOURCES = \
		       arkiweb-test.cc \
		       processor-tut.cc
