#include <arkiweb/configfile.h>

#include <cstdlib>
#include <arki/runtime/config.h>
#include <wibble/exception.h>

namespace arkiweb {

arki::ConfigFile configfile()
{
  using wibble::exception::Consistency;

  arki::ConfigFile cfg;
  char *s = ::getenv(ARKIWEB_CONF);
  if (!s)
    throw Consistency("global variable "ARKIWEB_CONF" not set");
  std::string filename(s);
  arki::runtime::parseConfigFile(cfg, filename);
  return cfg;
}

namespace config {

arki::ConfigFile extract(const std::vector<std::string> &datasets,
                         const arki::ConfigFile &cfg) {
  using arki::ConfigFile;

  ConfigFile c;

  for (std::vector<std::string>::const_iterator i = datasets.begin();
       i != datasets.end(); ++i) {
    std::string key = (*i);
    ConfigFile *tmpc = cfg.section(key);
    if (tmpc)
      c.mergeInto(key, *tmpc);
  }
  return c;
}

}

}
