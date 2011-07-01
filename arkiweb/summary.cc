#include <arkiweb/summary.h>

#include <arki/summary.h>
#include <arki/formatter.h>

namespace arkiweb {

namespace summary {

Serialiser::Serialiser(arki::Emitter &e, arki::Formatter *f,
           arki::Summary &summary)
    : emitter(e), formatter(f), summary(summary) {}

Serialiser::~Serialiser() {}

ExtendedSerialiser::ExtendedSerialiser(arki::Emitter &e, arki::Formatter *f,
                                       arki::Summary &summary)
    : Serialiser(e, f, summary) {}

bool ExtendedSerialiser::operator()(const std::vector< arki::UItem<> >& md,
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

void ExtendedSerialiser::serialise() {
  emitter.start_mapping();
  emitter.add("items");
  emitter.start_list();
  summary.visit(*this);
  emitter.end_list();
  emitter.end_mapping();
}

MergeSerialiser::MergeSerialiser(arki::Emitter &e, 
                                 arki::Formatter *f,
                                 arki::Summary &summary)
    : Serialiser(e, f, summary) {}

bool MergeSerialiser::operator()(const std::vector< arki::UItem<> >& md,
                                 const arki::UItem<arki::summary::Stats>& stats) {
  for (std::vector< arki::UItem<> >::const_iterator i = md.begin();
       i != md.end(); ++i) {
    if (!i->defined()) continue;
    fields[(*i)->tag()].insert(*i);
    statistics.merge(*stats);
  }
}

void MergeSerialiser::serialise() {
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
      if (formatter) emitter.add("desc", (*formatter)(*j));
      emitter.end_mapping();
    }
    emitter.end_list();
  }
  emitter.end_mapping();

  emitter.add("stats");
  emitter.start_mapping();
  statistics.serialiseLocal(emitter, formatter);
  emitter.end_mapping();

  emitter.end_mapping();
}


Printer::Printer(const arki::ConfigFile &cfg,
          const arki::runtime::Restrict &restr,
          arki::Emitter &emitter,
          const std::string query,
          const bool &extended)
    : cfg(cfg), restr(restr), emitter(emitter), 
    query(query), extended(extended) {
    }

Printer::~Printer() {}

void Printer::print() {
  arki::runtime::init();

  arki::Summary summary;

  arki::Matcher matcher = arki::Matcher::parse(query);

  for (arki::ConfigFile::const_section_iterator c = cfg.sectionBegin();
       c != cfg.sectionEnd(); ++c) {
    arki::Summary s;
    arki::ReadonlyDataset *ds = arki::ReadonlyDataset::create(*c->second);
    ds->querySummary(matcher, s);
    summary.add(s);
    delete ds;
  }

  Serialiser *serialiser = NULL;

  if (extended)
    serialiser = new ExtendedSerialiser(emitter, 
                                        arki::Formatter::create(), 
                                        summary);
  else
    serialiser = new MergeSerialiser(emitter, 
                                     arki::Formatter::create(), 
                                     summary);
  serialiser->serialise();

  delete serialiser;
}

}

}
