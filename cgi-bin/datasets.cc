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
#include <cgicc/Cgicc.h>
#include <cgicc/HTTPStatusHeader.h>
#include <cgicc/HTTPContentHeader.h>
#include <arkiweb/configfile.h>
#include <arkiweb/processor.h>

int main() {
	try {
    cgicc::Cgicc cgi;

		std::vector<cgicc::FormEntry> forms;
		cgi.getElement("datasets[]", forms);
		std::set<std::string> datasets;
		for (std::vector<cgicc::FormEntry>::const_iterator i = forms.begin();
				 i != forms.end(); ++i) {
			datasets.insert((*i).getValue());
		}

		arkiweb::ProcessorFactory f;
		f.target = "configfile";
		f.format = "json";
		f.outfile = "";
		std::auto_ptr<arkiweb::Processor> p(f.create());

		std::cout << cgicc::HTTPContentHeader("application/json");
		if (datasets.size() > 0)
			p->process(arkiweb::configfile(datasets));
		else
			p->process(arkiweb::configfile());

  } catch (const std::exception &e) {
    std::cout << cgicc::HTTPStatusHeader(500, "ERROR");
    std::cerr << e.what() << std::endl;
  }

  return 0;
}
