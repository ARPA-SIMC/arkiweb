#include <wibble/tests.h>
#include "configfile.h"

namespace tut {

struct arkiweb_configfile_shar {
};
TESTGRP(arkiweb_configfile);

template<> template<>
void to::test<1>()
{
	std::set<std::string> datasets;
	datasets.insert("boa");
	arki::ConfigFile configfile = arkiweb::configfile(datasets);
	assert_eq(configfile.sectionSize(), 1);

	assert(configfile.section("boa") != NULL);
	assert(configfile.section("agrmet") == NULL);
}

}
