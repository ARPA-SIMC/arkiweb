Name:           arkiweb
Version:        0.15
Release:        1%{?dist}
Summary:        Web support for Arkimet

License:        GPLv2+
URL:            http://www.smr.arpa.emr.it
Source0:        %{name}-%{version}.tar.gz

BuildRequires:  libtool, pkgconfig, arkimet-devel

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
* Wed Aug 28 2013 Emanuele Di Giacomo <edigiacomo@arpa.emr.it> - 0.15-1%{dist}
- First package release
