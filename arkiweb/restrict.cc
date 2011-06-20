#include <arkiweb/restrict.h>

namespace arkiweb {

arki::runtime::Restrict restriction() {
  return arki::runtime::Restrict(restr::restriction());
}

namespace restr {

std::string restriction() {
  char *s = ::getenv(ARKIWEB_RESTRICT_VAR);
  if (!s)
    return "";
  char *v = ::getenv(s);
  if (!v)
    return "";
  return v;
}

}

}
