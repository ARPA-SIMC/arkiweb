#                                               -*- Autoconf -*-
# Process this file with autoconf to produce a configure script.

AC_PREREQ([2.63])
AC_INIT([arkiweb], [0.2], [edigiacomo@arpa.emr.it])
AC_CONFIG_SRCDIR([configure.ac])
AC_CONFIG_HEADERS([config.h wibble/config.h])

AC_PROG_CXX
AC_PROG_CC
AM_INIT_AUTOMAKE([foreign nostdinc subdir-objects])
LT_INIT

AM_CONDITIONAL([WIBBLE_STANDALONE], [false])

AC_CHECK_HEADER([arki/libconfig.h],
		[],
		[AC_MSG_ERROR([arkimet headers not found])])

AC_CONFIG_FILES([Makefile
                 wibble/Makefile
                 arkiweb/Makefile
		 src/Makefile
		 httpd/Makefile
		 public/Makefile])
AC_OUTPUT
