#ifndef ARKIWEB_CONFIGFILE_H
#define ARKIWEB_CONFIGFILE_H

#include <arki/configfile.h>

#define ARKIWEB_CONF "ARKIWEB_CONF"

namespace arkiweb {

arki::ConfigFile configfile();

namespace config {

arki::ConfigFile extract(const std::vector<std::string> &datasets,
             const arki::ConfigFile &cfg);

}

}

#endif        /* ARKIWEB_CONFIGFILE_H */
