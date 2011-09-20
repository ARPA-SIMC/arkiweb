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
#include <arkiweb/cgi.h>
#include <arkiweb/configfile.h>
#include <arkiweb/summary.h>
#include <arki/emitter/json.h>
#include <arki/runtime.h>
int main() {
  try {
    arki::runtime::init();
    arkiweb::cgi::Cgi cgi;
    std::vector<std::string> datasets = cgi["datasets[]"];
    std::string query = cgi("query");
    arki::ConfigFile cfg = arkiweb::configfile(datasets);
    arki::emitter::JSON emitter(std::cout);

    arkiweb::summary::Printer printer(cfg, emitter, query);

    std::cout << arkiweb::cgi::HttpStatusHeader(200, "OK");
    std::cout << arkiweb::cgi::HttpContentTypeHeader("application/json") << std::endl;

    printer.print();
  } catch (const std::exception &e) {
    std::cout << arkiweb::cgi::HttpStatusHeader(500, "error") << std::endl;
    std::cerr << e.what() << std::endl;
  }

  return 0;
}
