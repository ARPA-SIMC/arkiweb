#include <arkiweb/configfile.h>
#include <arkiweb/restrict.h>
#include <arkiweb/datasets.h>

#include <arki/emitter/json.h>

#include <cgicc/Cgicc.h>
#include <cgicc/HTTPContentHeader.h>
#include <cgicc/HTTPStatusHeader.h>

int main(int argc, char **argv) {
  std::ostream &out = std::cout;

  try {
    cgicc::Cgicc cgi;


    arki::emitter::JSON emitter(out);


    arkiweb::datasets::Printer printer(arkiweb::configfile(), 
                                       arkiweb::restriction(),
                                       emitter);

    out << cgicc::HTTPContentHeader("application/json; charset=UTF-8");
    printer.print();
  } catch (...) {
    out << cgicc::HTTPStatusHeader(500, "internal error");
  }
  return 0;
}
