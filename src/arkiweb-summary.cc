#include <arkiweb/configfile.h>
#include <arkiweb/restrict.h>
#include <arkiweb/summary.h>

#include <arki/emitter/json.h>

#include <iostream>

#include <cgicc/Cgicc.h>
#include <cgicc/HTTPContentHeader.h>
#include <cgicc/HTTPStatusHeader.h>

int main(int argc, char **argv) {
  std::ostream &out = std::cout;

  try {

    cgicc::Cgicc cgi;

    std::string query = cgi("query");
    std::vector<std::string> datasets;

    std::vector<cgicc::FormEntry> ds;
    cgi.getElement("datasets[]", ds);
    for (std::vector<cgicc::FormEntry>::const_iterator i = ds.begin();
         i != ds.end(); ++i) {
      datasets.push_back((*i).getValue());
    }


    arki::ConfigFile cfg = arkiweb::config::extract(datasets,
                                                    arkiweb::configfile());

    arki::emitter::JSON emitter(out);

    arkiweb::summary::Printer printer(cfg,
                                      arkiweb::restriction(),
                                      emitter,
                                      query);

    out << cgicc::HTTPContentHeader("application/json; charset=UTF-8");
    printer.print();

  } catch (...) {
    out << cgicc::HTTPStatusHeader(500, "internal error");
  }
  return 0;
}
