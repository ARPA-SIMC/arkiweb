noinst_LTLIBRARIES = libarkiweb.la

libarkiweb_la_CPPFLAGS = -I$(top_srcdir) -I$(top_builddir)

libarkiweb_la_LIBADD = \
		       -larkimet

libarkiweb_la_SOURCES = \
			authorization.cc \
			authorization.h \
			emitter.cc \
			emitter.h \
			encoding.cc \
			encoding.h \
			processor.cc \
			processor.h \
			utils.cc \
			utils.h \
			wobble/string.cc \
			wobble/sys.cc \
			wobble/tests.cc \
			wobble/tests-main.cc

check_PROGRAMS = arkiweb-test

arkiweb_test_CPPFLAGS = -I$(top_srcdir) -I$(top_builddir)

arkiweb_test_LDADD = \
		     $(builddir)/libarkiweb.la \
		     -larkimet

arkiweb_test_SOURCES = \
		       arkiweb-test.cc
