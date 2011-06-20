#include <arkiweb/configfile.h>
#include <arkiweb/restrict.h>
#include <arkiweb/summary.h>

#include <arki/emitter/json.h>

#include <iostream>

#include <cgicc/Cgicc.h>
#include <cgicc/HTTPContentHeader.h>

int main(int argc, char **argv) {
  std::ostream &out = std::cout;

  cgicc::Cgicc cgi;

  std::string query = cgi("query");
  std::vector<std::string> datasets;

  std::vector<cgicc::FormEntry> ds;
  cgi.getElement("dataset", ds);
  for (std::vector<cgicc::FormEntry>::const_iterator i = ds.begin();
       i != ds.end(); ++i) {
    datasets.push_back((*i).getValue());
  }

  out << cgicc::HTTPContentHeader("application/json; charset=UTF-8");

  arki::ConfigFile cfg = arkiweb::config::extract(datasets,
                                                  arkiweb::configfile());
                                                  
  arki::emitter::JSON emitter(out);

  arkiweb::summary::Printer printer(cfg,
                                    arkiweb::restriction(),
                                    emitter,
                                    query);
  printer.print();

  return 0;
}
