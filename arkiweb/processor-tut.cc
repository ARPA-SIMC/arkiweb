#include <wibble/tests.h>
#include <arki/emitter/json.h>
#include "configfile.h"
#include "processor.h"

namespace tut {

struct arkiweb_processor_shar {
};
TESTGRP(arkiweb_processor);

template<> template<>
void to::test<1>()
{
	arki::emitter::JSON e(std::cout);
	arkiweb::processor::ConfigFileEmitter ce(arkiweb::configfile(), e);
	ce.process();
}

}
