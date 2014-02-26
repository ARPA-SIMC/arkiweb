SUBDIRS = embedded/cgicc arkiweb cgi-bin httpd public

doc_DATA = README ChangeLog README.html

EXTRA_DIST = README ChangeLog README.html

if HAVE_ASCIIDOC

README.html: README
	asciidoc -a toc $^

endif
