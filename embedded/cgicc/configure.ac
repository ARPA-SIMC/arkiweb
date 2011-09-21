dnl -*-m4-*-
dnl $Id: configure.ac,v 1.12 2008/05/18 19:42:41 sebdiaz Exp $

dnl Process this file with autoconf to produce a configure script.
AC_INIT(cgicc, 3.2.9, bug-cgicc@gnu.org)
AC_CONFIG_SRCDIR(cgicc/Cgicc.cpp)
AC_REVISION([$Revision: 1.12 $])
AC_CONFIG_AUX_DIR(support)
AC_PREFIX_DEFAULT(/usr)
AM_INIT_AUTOMAKE
AM_CONFIG_HEADER(cgicc/config.h)

AC_LANG_CPLUSPLUS

dnl Checks for programs.
AC_PROG_CXX
AC_PROG_INSTALL
AC_PROG_LIBTOOL

dnl setup for networking functions
AC_CHECK_LIB(nsl, gethostbyaddr, LIB_NET="-lnsl")
AC_SUBST(LIB_NET)

dnl check whether to link against libstdc++
dnl CGICC_CHECK_LINK_STDCPP

dnl Checks for header files
AC_CHECK_HEADERS([sys/time.h sys/utsname.h])

dnl Determine host system type
AC_DEFINE_UNQUOTED(HOST, "$host", [The host system cgicc was configured for])

dnl Enable maximum compiler warnings for g++
AC_MSG_CHECKING(maximum C++ compiler warning level)
if test "$GXX" = yes; then
  CXXFLAGS_WARN="-Wall -W -pedantic"
  CXXFLAGS="$CXXFLAGS_WARN $CXXFLAGS"
fi
AC_MSG_RESULT($CXXFLAGS_WARN)
unset CXXFLAGS_WARN

dnl Checks for library functions.
AC_CHECK_FUNCS(gettimeofday uname)

dnl Always output certain files
AC_CONFIG_FILES([Makefile cgicc/Makefile cgicc/CgiDefs.h])

AC_OUTPUT
