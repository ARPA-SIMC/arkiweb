#include <arkiweb/datasets.h>

#include <set>

namespace arkiweb {

namespace datasets {

JSONPrinter::JSONPrinter(const arki::ConfigFile &cfg,
                 const arki::runtime::Restrict &restr,
                 arki::Emitter &emitter)
    : cfg(cfg), restr(restr), emitter(emitter) {}

JSONPrinter::~JSONPrinter() {}

void JSONPrinter::print() {
  using arki::ConfigFile;

  std::string k[] = { "name", "description", "bounding" };
  std::set<std::string> keys(k, k + 3);

  emitter.start_mapping();
  for (ConfigFile::section_iterator c = cfg.sectionBegin();
       c != cfg.sectionEnd(); ++c) {
    emitter.add(c->first);
    emitter.start_mapping();
    emitter.add("allowed", restr.is_allowed(*c->second));
    for (std::set<std::string>::const_iterator i = keys.begin();
         i != keys.end(); ++i) {
      std::string val = c->second->value(*i);
      if (!val.empty())
        emitter.add(*i, val);
    }
    emitter.end_mapping();
  }
  emitter.end_mapping();
}

}

}
