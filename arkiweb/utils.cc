/*
 * utils - utilities
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
#include <arkiweb/utils.h>

#include <arki/runtime/config.h>
#include <wibble/exception.h>
#include <arkiweb/authorization.h>

namespace arkiweb {
namespace utils {

static std::string configpath() {
  char *path = ::getenv(ARKIWEB_CONFIG_VAR);
  if (!path)
    throw wibble::exception::Consistency("Reading " ARKIWEB_CONFIG_VAR,
                                         ARKIWEB_CONFIG_VAR " not set");
  return path;
}

void setToDefault(arki::ConfigFile& cfg)
{
  arki::runtime::parseConfigFile(cfg, configpath());
  arki::runtime::Restrict restr(authorization::User::get().name());
  for (arki::ConfigFile::section_iterator i = cfg.sectionBegin();
       i != cfg.sectionEnd(); ++i) {
    i->second->setValue(std::string("id"),
                        i->first);
    i->second->setValue(std::string("allowed"), 
                        ( restr.is_allowed(*(i->second)) ? "true" : "false" ));
  }
}

void setToDefault(arki::ConfigFile& cfg, const std::set<std::string>& dsfilter)
{
	setToDefault(cfg);

	for (arki::ConfigFile::section_iterator i = cfg.sectionBegin();
			 i != cfg.sectionEnd(); ++i) {
		if (dsfilter.find(i->first) == dsfilter.end())
			cfg.deleteSection(i->first);
	}
}

}
}