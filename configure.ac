#                                               -*- Autoconf -*-
# Process this file with autoconf to produce a configure script.

AC_PREREQ([2.63])
AC_INIT([arkiweb], [0.6.3], [edigiacomo@arpa.emr.it])
AC_CONFIG_SRCDIR([configure.ac])
AC_CONFIG_HEADERS([config.h wibble/config.h])
AC_CONFIG_SUBDIRS([embedded/cgicc])

AC_PROG_CXX
AC_PROG_CC
AM_INIT_AUTOMAKE([foreign nostdinc subdir-objects])
LT_INIT

AM_CONDITIONAL([WIBBLE_STANDALONE], [false])

AC_CHECK_HEADER([arki/libconfig.h],
		[],
		[AC_MSG_ERROR([arkimet headers not found])])

AC_PATH_PROG([ECO], [eco])
AC_PATH_PROG([LESSC], [lessc])
AC_PATH_PROG([UGLIFYJS], [uglifyjs])
AC_PATH_PROG([ASCIIDOC], [asciidoc])

test x$ECO != x && have_eco=yes || have_eco=no
test x$LESSC != x && have_lessc=yes || have_lessc=no
test x$UGLIFYJS != x && have_uglifyjs=yes || have_uglifyjs=no
test x$ASCIIDOC != x && have_asciidoc=yes || have_asciidoc=no

AM_CONDITIONAL([HAVE_ECO], [test x$have_eco = xyes])
AM_CONDITIONAL([HAVE_LESSC], [test x$have_lessc = xyes])
AM_CONDITIONAL([HAVE_UGLIFYJS], [test x$have_uglifyjs = xyes])
AM_CONDITIONAL([HAVE_ASCIIDOC], [test x$have_asciidoc = xyes])

AC_CONFIG_FILES([Makefile
                 wibble/Makefile
                 arkiweb/Makefile
		 cgi-bin/Makefile
		 httpd/Makefile
		 public/Makefile
		 public/arkiweb/config.js])
AC_OUTPUT

AC_MSG_NOTICE([
===================================================================
${PACKAGE_STRING}
- eco:		$have_eco (public/arkiweb/templates/*.eco compiler)
- lessc:	$have_lessc (public/css/*.less compiler)
- uglifyjs:	$have_uglifyjs (public/arkiweb.min.js compiler)
- asciidoc:	$have_asciidoc (README -> README.html compiler)
===================================================================
])
