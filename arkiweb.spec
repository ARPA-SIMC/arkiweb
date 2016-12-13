Name:           arkiweb
Version:        0.23
Release:        1%{?dist}
Summary:        Web support for Arkimet

License:        GPLv2+
URL:            http://www.smr.arpa.emr.it
Source0:        %{name}-%{version}.tar.gz

BuildRequires:  libtool, pkgconfig, arkimet-devel >= 1.0, cgicc-devel

%description
Web support for Arkimet

%prep
%setup -q


%build
%configure
make %{?_smp_mflags}


%install
rm -rf $RPM_BUILD_ROOT
%make_install


%files
%doc
%doc %{_docdir}/%{name}
%defattr(-,root,root,-)
%dir %{_libdir}/arkiweb
%{_libdir}/arkiweb/datasets
%{_libdir}/arkiweb/summary
%{_libdir}/arkiweb/fields
%{_libdir}/arkiweb/data
%dir %{_datadir}/arkiweb
%{_datadir}/arkiweb/*

%changelog
* Tue Dec 13 2016 Emanuele Di Giacomo <edigiacomo@arpae.it> - 0.23-1%{dist}
- Fixed postprocessor parser

* Wed Nov 09 2016 Emanuele Di Giacomo <edigiacomo@arpae.it> - 0.22-1%{dist}
- Fix segfault on BinaryDataEmitter

* Thu Oct 13 2016 Emanuele Di Giacomo <edigiacomo@arpae.it> - 0.21-1%{dist}
- Header files in dist

* Thu Oct 13 2016 Emanuele Di Giacomo <edigiacomo@arpae.it> - 0.20-1%{dist}
- Compiled against system cgicc

* Mon Oct 03 2016 Emanuele Di Giacomo <edigiacomo@arpae.it> - 0.19-1%{dist}
- Removed wibble
- Removed uglifyjs and lesscss
- Updated cgicc version

* Wed Jul 13 2016 Emanuele Di Giacomo <edigiacomo@arpae.it> - 0.18-1%{dist}
- Compiled against arkimet 1.0

* Thu Mar 05 2015 Emanuele Di Giacomo <edigiacomo@arpa.emr.it> - 0.17-1%{dist}
- Compiled against arkimet 0.80

* Thu Mar 20 2014 Emanuele Di Giacomo <edigiacomo@arpa.emr.it> - 0.16.1-2%{dist}
- Compiled against arkimet 0.75-2876

* Thu Mar 13 2014 Emanuele Di Giacomo <edigiacomo@arpa.emr.it> - 0.16-1%{dist}
- Fixed bug in singlepoint web interface

* Wed Feb 26 2014 Emanuele Di Giacomo <edigiacomo@arpa.emr.it> - 0.16-1%{dist}
- Updated interface for singlepoint postprocessor
- Optional cached summary
- Removed embedded wibble

* Wed Aug 28 2013 Emanuele Di Giacomo <edigiacomo@arpa.emr.it> - 0.15-1%{dist}
- First package release
