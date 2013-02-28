/*
 * datasets - web service for datasets
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
#include <memory>
#include <cgicc/HTTPStatusHeader.h>
#include <cgicc/HTTPContentHeader.h>
#include <arkiweb/processor.h>

int main() {
  try {
    std::cout << cgicc::HTTPContentHeader("application/json");

		arkiweb::ProcessorFactory f;
		f.target = "configfile";
		f.format = "json";
		f.outfile = "";
		std::auto_ptr<arkiweb::Processor> p(f.create());
		p->process();

  } catch (const std::exception &e) {
    std::cout << cgicc::HTTPStatusHeader(500, "ERROR");
    std::cerr << e.what() << std::endl;
  }

  return 0;
}
