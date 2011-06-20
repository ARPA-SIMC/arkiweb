#include <arkiweb/configfile.h>
#include <arkiweb/restrict.h>
#include <arkiweb/datasets.h>

#include <arki/emitter/json.h>

#include <cgicc/Cgicc.h>
#include <cgicc/HTTPContentHeader.h>

int main(int argc, char **argv) {
  std::ostream &out = std::cout;

  cgicc::Cgicc cgi;

  out << cgicc::HTTPContentHeader("application/json; charset=UTF-8");

  arki::emitter::JSON emitter(out);

  arkiweb::datasets::Printer printer(arkiweb::configfile(), 
                                     arkiweb::restriction(),
                                     emitter);
  printer.print();
  return 0;
}
