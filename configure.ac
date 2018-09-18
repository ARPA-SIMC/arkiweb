#                                               -*- Autoconf -*-
# Process this file with autoconf to produce a configure script.

AC_PREREQ([2.63])
AC_INIT([arkiweb], [0.25], [edigiacomo@arpae.it])
AC_CONFIG_SRCDIR([configure.ac])
AC_CONFIG_HEADERS([config.h])
AC_CONFIG_MACRO_DIR([m4])

AC_PROG_CXX
AC_PROG_CC
AM_INIT_AUTOMAKE([foreign nostdinc subdir-objects])
LT_INIT

dnl Use c++11
AX_CXX_COMPILE_STDCXX_11(noext)

AC_CHECK_HEADER([arki/libconfig.h],
		[],
		[AC_MSG_ERROR([arkimet headers not found])])

AC_PATH_PROG([ECO], [eco])

test x$ECO != x && have_eco=yes || have_eco=no

AM_CONDITIONAL([HAVE_ECO], [test x$have_eco = xyes])


PKG_CHECK_MODULES(CGICC, cgicc > 3.2)

AC_CONFIG_FILES([Makefile
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
===================================================================
])
