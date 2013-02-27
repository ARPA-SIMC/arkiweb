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
#include <arkiweb/data.h>

#include <memory>
#include <arki/dataset.h>
#include <arki/dataset/merged.h>

namespace arkiweb {
namespace data {

Printer::Printer(const arki::ConfigFile &cfg, 
								 const std::string &query,
								 const std::string &postproc,
								 std::ostream& out) : m_cfg(cfg), m_query(), out(out)
{
	arki::Matcher matcher = arki::Matcher::parse(query);
	if (!postproc.empty())
		m_query.setPostprocess(matcher, postproc);
	else
		m_query.setData(matcher);
}
void Printer::print() {
	arki::dataset::AutoMerged merged(m_cfg);
	merged.queryBytes(m_query, out);
	out.flush();
}

}
}
