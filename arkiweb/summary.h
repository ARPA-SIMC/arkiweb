#ifndef ARKIWEB_SUMMARY_H
#define ARKIWEB_SUMMARY_H

#include <arki/configfile.h>
#include <arki/runtime.h>
#include <arki/emitter.h>
#include <arki/summary.h>
#include <arki/summary/stats.h>

#include <string>
#include <set>

namespace arkiweb {

namespace summary {

struct MergeSerialiser : public arki::summary::Visitor {
  arki::Emitter &emitter;
  arki::Formatter *formatter;
  arki::Summary summary;
  arki::summary::Stats statistics;
  std::map<std::string, std::set< arki::UItem<> > > fields;


  MergeSerialiser(arki::Emitter &e, arki::Formatter *f,
                  arki::Summary &summary);

  virtual bool operator()(const std::vector< arki::UItem<> >& md,
                          const arki::UItem<arki::summary::Stats>& stats);

  void serialise();
};

struct Printer {
  const arki::ConfigFile cfg;
  const arki::runtime::Restrict restr;
  arki::Emitter &emitter;
  const std::string query;

  Printer(const arki::ConfigFile &cfg,
          const arki::runtime::Restrict &restr,
          arki::Emitter &emitter,
          const std::string query);
  ~Printer();

  void print();

};

}

}

#endif        /* ARKIWEB_SUMMARY_H */
