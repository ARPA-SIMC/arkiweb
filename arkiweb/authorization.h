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
#define ARKIWEB_MAXCOUNT_VAR "ARKIWEB_MAXCOUNT"
#define ARKIWEB_MAXSIZE_VAR  "ARKIWEB_MAXSIZE"
#define ARKIWEB_FILTER_VAR "ARKIWEB_FILTER"

namespace arkiweb {

namespace authorization {

/**
 * User class for authorization
 *
 * A user has a unique name and some permissions on data download.
 */
class User {
 private:
    /// user name
	std::string m_name;
    /// max number of downloaded data
	size_t m_maxcount;
    /// max size of downloaded data
	unsigned long long m_maxsize;
    /// filter
    std::string m_filter;

	User();

 public:
    /**
     * User factory
     *
     * The user is created from the environment variables
     * `ARKIWEB_RESTRICT_VAR`, `ARKIWEB_MAXCOUNT_VAR` and
     * `ARKIWEB_MAXSIZE_VAR`. These variables point to variables
     * containing the values for the user members.
     */
	static User get();

	std::string name() const;
    /// Return true if the dataset is allowed for this user
	bool is_allowed_dataset(const arki::ConfigFile& cfg) const;
    /// Return true if the query against the configfile is allowed
	bool is_allowed(const arki::Matcher& matcher, const arki::ConfigFile& cfg) const;
    /// Remove unallowed datasets from configfile
	void remove_unallowed(arki::ConfigFile& cfg) const;
    /// Return filter matcher
    arki::Matcher get_filter() const;
};

}
}
