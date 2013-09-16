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
#ifndef ARKIWEB_UTILS_H
#define ARKIWEB_UTILS_H

#include <string>
#include <set>

#include <arki/configfile.h>

#define ARKIWEB_CONFIG_VAR "ARKIWEB_CONFIG"

namespace arkiweb {
namespace utils {

/**
 * Create a default ConfigFile
 */
void setToDefault(arki::ConfigFile& cfg);
/**
 * Create a default ConfigFile, restricted to given datasets
 */
void setToDefault(arki::ConfigFile& cfg, const std::set<std::string>& dsfilter);

}
}

#endif
