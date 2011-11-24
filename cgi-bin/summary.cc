/*
 * summary - web service for summary
 *
 * Copyright (C) 2011  ARPA-SIM <urpsim@smr.arpa.emr.it>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Author: Emanuele Di Giacomo <edigiacomo@arpa.emr.it>
 */
#include <iostream>
#include <cgicc/Cgicc.h>
#include <cgicc/HTTPStatusHeader.h>
#include <cgicc/HTTPContentHeader.h>
#include <arkiweb/configfile.h>
#include <arkiweb/summary.h>
#include <arki/emitter/json.h>
#include <arki/runtime.h>
int main() {
  try {
    arki::runtime::init();
    cgicc::Cgicc cgi;
    
    std::vector<cgicc::FormEntry> forms;
    cgi.getElement("datasets[]", forms);
    std::vector<std::string> datasets;
    for (std::vector<cgicc::FormEntry>::const_iterator i = forms.begin();
         i != forms.end(); ++i) {
      datasets.push_back((*i).getValue());
    }
  

    std::string query = cgi("query");
    arki::ConfigFile cfg = arkiweb::configfile(datasets);
    arki::emitter::JSON emitter(std::cout);

    arkiweb::summary::Printer printer(cfg, emitter, query);

    std::cout << cgicc::HTTPContentHeader::HTTPContentHeader("application/json");

    printer.print();
  } catch (const std::exception &e) {
    std::cout << cgicc::HTTPStatusHeader::HTTPStatusHeader(500, "ERROR");
    std::cerr << e.what() << std::endl;
  }

  return 0;
}