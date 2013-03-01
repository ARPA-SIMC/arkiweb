#include <cgicc/Cgicc.h>
#include <cgicc/HTTPStatusHeader.h>
#include <cgicc/HTTPContentHeader.h>

#include <arkiweb/utils.h>
#include <arkiweb/data.h>
#include <arkiweb/authorization.h>

#include <arki/runtime.h>

int main(int argc, char **argv) {
	try {
		arki::runtime::init();

		cgicc::Cgicc cgi;

		std::string query = cgi("query");
		std::string postprocess = cgi("postprocess");

		std::vector<cgicc::FormEntry> forms;
		cgi.getElement("datasets[]", forms);
		std::set<std::string> datasets;
		for (std::vector<cgicc::FormEntry>::const_iterator i = forms.begin();
				 i != forms.end(); ++i) {
			datasets.insert((*i).getValue());
		}
		arki::ConfigFile config;
		if (datasets.size() > 0)
			arkiweb::utils::setToDefault(config, datasets);
		else
			arkiweb::utils::setToDefault(config);

		if (!postprocess.empty() && datasets.size() > 1) {
			std::cout << cgicc::HTTPStatusHeader(400,
																					 "Only one dataset[] value is allowed "
																					 "when postprocess parameter is set ");
			return 0;
		}

		if (!arkiweb::authorization::User::get().is_allowed(query, config)) {
			std::cout << cgicc::HTTPStatusHeader(403, "");
			return 0;
		}

		arkiweb::data::Printer printer(config, query, postprocess, std::cout);
		printer.print();

		std::cout.flush();

	} catch (const std::exception &e) {
		std::cerr << e.what();
		std::cout << cgicc::HTTPStatusHeader(500, "ERROR");
	}
	return 0;
}
