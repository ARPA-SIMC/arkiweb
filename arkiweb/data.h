/*
 * data - data utilities
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
#ifndef ARKIWEB_DATA_H
#define ARKIWEB_DATA_H

#include <iostream>

#include <arki/configfile.h>
#include <arki/dataset.h>

namespace arkiweb {
namespace data {

class Printer {
 public:
  Printer(const arki::ConfigFile &cfg,
					const std::string &query,
					const std::string &postproc,
					std::ostream& out);
  void print();
 private:
	arki::ConfigFile m_cfg;
	arki::dataset::ByteQuery m_query;
	std::ostream& out;

	bool check_authorization();
};

}
}
#endif
