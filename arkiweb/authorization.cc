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

User User::get(const std::string& name) {
	User u;
	u.m_name = name;
#warning TODO maxcount, maxsize and matcher filter implementation
	return u;
}
User User::get() {
	char *x = ::getenv(ARKIWEB_RESTRICT_VAR);

	std::string name = ( x == NULL ? "" : x);

	return User::get(name);
}

bool User::is_allowed(const std::string& query, const arki::ConfigFile& cfg)
{
	if (m_name.empty())
		return true;

	arki::runtime::Restrict rest(m_name);
	arki::Summary summary;
	arki::Matcher matcher = arki::Matcher::parse(query);
	for (arki::ConfigFile::const_section_iterator i = cfg.sectionBegin();
			 i != cfg.sectionEnd(); ++i) {
		const arki::ConfigFile& c = *i->second;
		if (!rest.is_allowed(c))
			return false;
		arki::Summary s;
		std::auto_ptr<arki::ReadonlyDataset> ds(arki::ReadonlyDataset::create(c));
		ds->querySummary(matcher, s);
		summary.add(s);
	}
	if (m_maxcount > 0 && summary.count() > m_maxcount)
		return false;
	if (m_maxsize > 0 && summary.size() > m_maxsize)
		return false;
	return true;
}

}
}
