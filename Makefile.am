SUBDIRS = embedded/cgicc arkiweb cgi-bin httpd public

doc_DATA = README ChangeLog

EXTRA_DIST = README ChangeLog

if HAVE_ASCIIDOC

doc_DATA += README.html

EXTRA_DIST += README.html

README.html: README
	asciidoc -a toc $^

endif
