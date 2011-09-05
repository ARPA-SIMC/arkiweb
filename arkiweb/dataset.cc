/*
 * dataset - dataset utilities
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
#include <arkiweb/dataset.h>

#include <wibble/regexp.h>

namespace arkiweb {
namespace dataset {

Printer::Printer(const arki::ConfigFile &cfg,
                 arki::Emitter &emitter) : m_cfg(cfg), m_emitter(emitter)
  {
    m_keys.insert("id");
    m_keys.insert("name"); 
    m_keys.insert("allowed");
    m_keys.insert("description");
    m_keys.insert("bounding");
    m_keys.insert("postprocess");
  }

void Printer::print() {
  using arki::ConfigFile;
  
  m_emitter.start_list();
  for (ConfigFile::const_section_iterator i = m_cfg.sectionBegin();
       i != m_cfg.sectionEnd(); ++i) {
    m_emitter.start_mapping();

    for (std::set<std::string>::const_iterator j = m_keys.begin();
         j != m_keys.end(); ++j) {
      std::string value = i->second->value(*j);
      m_emitter.add(*j);
      /* restriction */
      if (*j == "allowed") {
        m_emitter.add(ConfigFile::boolValue(value, false));
        continue;
      }
      /* postprocess */
      if (*j == "postprocess") {
        using wibble::Splitter;
        Splitter splitter("[[:space:]]*,[[:space:]]*|[[:space:]]+", REG_EXTENDED);
        m_emitter.start_list();
        for (Splitter::const_iterator k = splitter.begin(value);
             k != splitter.end(); ++k) {
          m_emitter.add(*k);
        }
        m_emitter.end_list();
        continue;
      }
      m_emitter.add(value);
    }
   
    m_emitter.end_mapping();
  }
  m_emitter.end_list();
}

}
}
