/*
 * summary - summary utilities
 *
 * Copyright (C) 2011  ARPA-SIM <urpsim@smr.arpa.emr.it>
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
#include <arkiweb/summary.h>
#include <arki/summary.h>
#include <arki/summary/stats.h>

namespace arkiweb {
namespace summary {

Printer::Printer(const arki::ConfigFile &cfg, 
                 arki::Emitter &emitter,
                 const std::string &query)
    : m_cfg(cfg), m_emitter(emitter), 
    m_matcher(arki::Matcher::parse(query)) {}
    

void Printer::print() {
  m_emitter.start_mapping();

  m_emitter.add("fields");
  m_emitter.start_mapping();
  m_emitter.end_mapping();

  m_emitter.add("summarystats");
  m_emitter.start_mapping();
  m_emitter.end_mapping();
  
  m_emitter.end_mapping();
}

}
}
