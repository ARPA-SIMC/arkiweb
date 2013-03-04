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
#include <arki/configfile.h>
#include <arki/matcher.h>

#define ARKIWEB_RESTRICT_VAR "ARKIWEB_RESTRICT"

namespace arkiweb {

namespace authorization {

class User {
 private:
	std::string m_name;
	size_t m_maxcount;
	unsigned long long m_maxsize;

	User();

 public:
	static User get(const std::string& name);
	static User get();

	std::string name() const;
	bool is_allowed_dataset(const arki::ConfigFile& cfg) const;
	bool is_allowed(const arki::Matcher& matcher, const arki::ConfigFile& cfg) const;
};

}
}
