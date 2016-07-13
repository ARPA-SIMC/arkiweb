/*
 * authorization - authorization utilities
 *
 * Copyright (C) 2013  ARPA-SIM <urpsim@smr.arpa.emr.it>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Author: Emanuele Di Giacomo <edigiacomo@arpa.emr.it>
 */
#include <arkiweb/authorization.h>

#include <cstdlib>

#include <arki/runtime.h>
#include <arki/summary.h>

namespace arkiweb {
namespace authorization {

User::User() : m_name(""), m_maxcount(0), m_maxsize(0) {}

User User::get() {
	User u;
	char* x = NULL, *y = NULL;
	// Restrict
	x = ::getenv(ARKIWEB_RESTRICT_VAR);
	if (x) {
		y = ::getenv(x);
		if (y)
			u.m_name = y;
	}
	// Maxcount
	x = ::getenv(ARKIWEB_MAXCOUNT_VAR);
	if (x) {
		y = ::getenv(x);
		if (y)
			u.m_maxcount = strtoull(y, NULL, 10);
	}
	// Maxsize
	x = ::getenv(ARKIWEB_MAXSIZE_VAR);
	if (x) {
		y = ::getenv(x);
		if (y)
			u.m_maxsize = strtoull(y, NULL, 10);
	}
    // Filter
    x = ::getenv(ARKIWEB_FILTER_VAR);
    if (x) {
        y = ::getenv(x);
        if (y)
            u.m_filter = y;
    }
	return u;
}

std::string User::name() const { return m_name; }

bool User::is_allowed_dataset(const arki::ConfigFile& cfg) const {
	arki::runtime::Restrict rest(m_name);
	return rest.is_allowed(cfg);
}
bool User::is_allowed(const arki::Matcher& matcher, const arki::ConfigFile& cfg) const {
	if (m_name.empty())
		return true;

	arki::Summary summary;
	for (arki::ConfigFile::const_section_iterator i = cfg.sectionBegin();
			 i != cfg.sectionEnd(); ++i) {
		const arki::ConfigFile& c = *i->second;
		if (!is_allowed_dataset(c))
			return false;
		arki::Summary s;
		std::auto_ptr<arki::dataset::Reader> ds(arki::dataset::Reader::create(c));
		ds->query_summary(matcher, s);
		summary.add(s);
	}
	return true;
}
void User::remove_unallowed(arki::ConfigFile& cfg) const {
	arki::runtime::Restrict rest(m_name);
	rest.remove_unallowed(cfg);
}

}
}
