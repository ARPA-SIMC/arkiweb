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
#include <arki/runtime.h>
#include <arki/formatter.h>

namespace arkiweb {
namespace summary {

Printer::Printer(const arki::ConfigFile &cfg, 
                 arki::Emitter &emitter,
                 const std::string &query)
    : m_cfg(cfg), m_emitter(emitter), 
    m_matcher(arki::Matcher::parse(query)) {}
    
void Printer::print() {
  arki::Summary summary;
  for (arki::ConfigFile::const_section_iterator i = m_cfg.sectionBegin();
       i != m_cfg.sectionEnd(); ++i) {
    arki::Summary s;
    arki::ReadonlyDataset *ds = arki::ReadonlyDataset::create(*i->second);
    ds->querySummary(m_matcher, s);
    summary.add(s);
    delete ds;
  }
  struct Serialiser : public arki::summary::Visitor {
    const arki::Summary summary;
    arki::Emitter &emitter;
    arki::Formatter *formatter;

    Serialiser(const arki::Summary &summary, arki::Emitter &emitter)
        : summary(summary), emitter(emitter), formatter(arki::Formatter::create()) {}

    bool operator()(const std::vector< arki::UItem<> >& md,
                    const arki::UItem<arki::summary::Stats>& stats) {
      emitter.start_mapping();
      for (std::vector< arki::UItem<> >::const_iterator i = md.begin();
           i != md.end(); ++i) {
        if (!i->defined()) continue;
        emitter.add((*i)->tag());
        emitter.start_mapping();
        if (formatter) emitter.add("desc", (*formatter)(*i));
        (*i)->serialiseLocal(emitter, formatter);
        emitter.end_mapping();
      }
      emitter.add(stats->tag());
      emitter.start_mapping();
      stats->serialiseLocal(emitter, formatter);
      emitter.end_mapping();
      emitter.end_mapping();
    }
    void serialise() {
      emitter.start_list();
      summary.visit(*this);
      emitter.end_list();
    } 
  } serialiser(summary, m_emitter);
  /*
  struct Serialiser : public arki::summary::Visitor {
    const arki::Summary summary;
    arki::Emitter &emitter;

    std::map<std::string, std::set< arki::UItem<> > > fields;
    arki::summary::Stats statistics;
    arki::Formatter *formatter;

    Serialiser(const arki::Summary &summary, arki::Emitter &emitter)
        : summary(summary), emitter(emitter), formatter(arki::Formatter::create()) {}

    bool operator()(const std::vector< arki::UItem<> >& md,
                    const arki::UItem<arki::summary::Stats>& stats) {
      for (std::vector< arki::UItem<> >::const_iterator i = md.begin();
           i != md.end(); ++i) {
        if (!i->defined()) continue;
        fields[(*i)->tag()].insert(*i);
        statistics.merge(*stats);
      }
    }

    void serialise() {
      summary.visit(*this);
      emitter.start_mapping();

      emitter.add("fields");
      emitter.start_mapping();
      for (std::map<std::string, std::set< arki::UItem<> > >::iterator i = fields.begin();
           i != fields.end(); ++i) {
        emitter.add(i->first);
        emitter.start_list();
        for (std::set< arki::UItem<> >::const_iterator j = i->second.begin();
             j != i->second.end(); ++j) {
          emitter.start_mapping();
          (*j)->serialiseLocal(emitter, formatter);
          emitter.add("desc", (*formatter)(*j));
          emitter.end_mapping();
        }
        emitter.end_list();
      }
      emitter.end_mapping();

      emitter.add("metadatastats");
      emitter.start_mapping();
      statistics.serialiseLocal(emitter, formatter);
      emitter.end_mapping();


      emitter.end_mapping();
    }

  } serialiser(summary, m_emitter);
  */
  serialiser.serialise();
}

}
}
