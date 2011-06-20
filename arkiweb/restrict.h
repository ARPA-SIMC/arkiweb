#ifndef ARKIWEB_RESTRICT_H
#define ARKIWEB_RESTRICT_H

#include <arki/runtime.h>

#define ARKIWEB_RESTRICT_VAR "ARKIWEB_RESTRICT_VAR"

namespace arkiweb {

arki::runtime::Restrict restriction();

namespace restr {

std::string restriction();

}

}

#endif        /* ARKIWEB_RESTRICT_H */
