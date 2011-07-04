AM_CPPFLAGS = -I$(top_builddir) -I$(top_srcdir)

DEVEL_LDADD=$(top_builddir)/arkiweb/libarkiweb.la -lcgicc -larkimet

cgidir = $(libdir)/$(PACKAGE)/cgi-bin

cgi_PROGRAMS = arkiweb-dataset-list arkiweb-summary arkiweb-extended-summary arkiweb-download

arkiweb_dataset_list_LDADD = $(DEVEL_LDADD)

arkiweb_dataset_list_SOURCES = arkiweb-dataset-list.cc

arkiweb_summary_LDADD = $(DEVEL_LDADD)

arkiweb_summary_SOURCES = arkiweb-summary.cc

arkiweb_extended_summary_LDADD = $(DEVEL_LDADD)

arkiweb_extended_summary_SOURCES = arkiweb-extended-summary.cc

arkiweb_download_LDADD = $(DEVEL_LDADD)

arkiweb_download_SOURCES = arkiweb-download.cc
