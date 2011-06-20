#ifndef ARKIWEB_DATASETS_H
#define ARKIWEB_DATASETS_H

#include <arki/configfile.h>
#include <arki/emitter.h>
#include <arki/runtime.h>

namespace arkiweb {

namespace datasets {

struct Printer {
  arki::ConfigFile cfg;
  arki::runtime::Restrict restr;
  arki::Emitter &emitter;

  Printer(const arki::ConfigFile &cfg,
          const arki::runtime::Restrict &restr,
          arki::Emitter &emitter);
  ~Printer();

  void print();
};

}

}

#endif        /* ARKIWEB_DATASETS_H */
