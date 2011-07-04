#                                               -*- Autoconf -*-
# Process this file with autoconf to produce a configure script.

AC_PREREQ([2.67])
AC_INIT([arkiweb], [0.1], [edigiacomo@arpa.emr.it])
AC_CONFIG_SRCDIR([configure.ac])
AC_CONFIG_HEADERS([config.h])
AC_CONFIG_MACRO_DIR([m4])
AC_CONFIG_SUBDIRS([embedded/cgicc])

AC_PROG_CPP
AC_PROG_CXX
AM_INIT_AUTOMAKE([foreign subdir-objects nostdinc])
LT_INIT

#AC_LANG([C++])
#SAVED_LDFLAGS="$LDFLAGS"
#LDFLAGS="$LDFLAGS -lcgicc"
#AC_LINK_IFELSE([AC_LANG_PROGRAM([
#		#include <cgicc/Cgicc.h>
#		],
#		[cgicc::Cgicc cgi;])],
#		[LIBS="$LIBS -lcgicc"],
#		[AC_MSG_ERROR([libcgicc not found])])
#LDFLAGS="$SAVED_LDFLAGS"

AC_CONFIG_FILES([Makefile
                 arkiweb/Makefile
		 src/Makefile])
AC_OUTPUT
