#include <arkiweb/datasets.h>

#include <set>

#include <wibble/regexp.h>

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
    for (std::set<std::string>::const_iterator i = keys.begin();
         i != keys.end(); ++i) {
      std::string val = c->second->value(*i);
      if (!val.empty())
        emitter.add(*i, val);
    }
    // Restrict
    emitter.add("allowed", restr.is_allowed(*c->second));
    // Postprocess
    std::string val = c->second->value("postprocess");
    using wibble::Splitter;
    Splitter splitter("[[:space:]]*,[[:space:]]*|[[:space:]]+", REG_EXTENDED);
    emitter.add("postprocess");
    emitter.start_list();
    for (Splitter::const_iterator i = splitter.begin(val);
         i != splitter.end(); ++i) {
      emitter.add(*i);
    }
    emitter.end_list();
    emitter.end_mapping();
  }
  emitter.end_mapping();
}

}

}
