/*
 * data - web service for data
 *
 * Copyright (C) 2011,13  ARPA-SIM <urpsim@smr.arpa.emr.it>
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
#include <arki/runtime.h>
#include <arkiweb/utils.h>
#include <arkiweb/authorization.h>
#include <arkiweb/processor.h>

int main() {
	try {
		arki::runtime::init();

    cgicc::Cgicc cgi;

		std::vector<cgicc::FormEntry> forms;
		cgi.getElement("datasets[]", forms);
		std::set<std::string> datasets;
		for (std::vector<cgicc::FormEntry>::const_iterator i = forms.begin();
				 i != forms.end(); ++i) {
			datasets.insert((*i).getValue());
		}
		arki::ConfigFile config;
		arkiweb::utils::setToDefault(config, datasets);
		arkiweb::authorization::User::get().remove_unallowed(config);

		arki::Matcher matcher = arki::Matcher::parse(cgi("query"));

		if (!arkiweb::authorization::User::get().is_allowed(matcher, config)) {
			std::cout << cgicc::HTTPStatusHeader(403,
																					 "Forbidden request");
			return 0;
		}

		std::string postprocess = cgi("postprocess");

		if (!postprocess.empty() && datasets.size() > 1) {
			std::cout << cgicc::HTTPStatusHeader(400,
																					 "Only one dataset[] value is allowed "
																					 "when postprocess parameter is set ");
			return 0;
		}

		arkiweb::ProcessorFactory f;
		f.target = "data";
		f.outfile = "";
		f.postprocess = postprocess;
		std::auto_ptr<arkiweb::Processor> p(f.create());

		std::cout << cgicc::HTTPContentHeader("application/binary");
		p->process(config, matcher);

  } catch (const std::exception &e) {
    std::cout << cgicc::HTTPStatusHeader(500, "ERROR");
    std::cerr << e.what() << std::endl;
  }

  return 0;
}
