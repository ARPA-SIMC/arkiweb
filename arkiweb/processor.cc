/*
 * processor - processor for arkimet data
 *
 * Copyright (C) 2013  ARPA-SIM <urpsim@smr.arpa.emr.it>
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
#include <arkiweb/processor.h>

#include <arki/summary.h>
#include <arki/dataset.h>
#include <arki/emitter/json.h>

#include <arkiweb/emitter.h>
#include <arkiweb/encoding.h>

namespace arkiweb {

ProcessorFactory::ProcessorFactory() {}
ProcessorFactory::~ProcessorFactory() {}
Processor* ProcessorFactory::create() {
	std::auto_ptr<arki::Emitter> emitter;
	if (target == "configfile") {
		if (format == "json") {
			emitter.reset(new arki::emitter::JSON(std::cout));
		}
		else if (format == "jsonp") {
			emitter.reset(new arkiweb::emitter::JSONP(std::cout));
		}
		return new processor::ConfigFileEmitter(emitter.release());
	}
	throw wibble::exception::Generic("unsupported processor target: " + target);
}

namespace processor {

ConfigFileEmitter::ConfigFileEmitter(arki::Emitter* emitter) : emitter(emitter) {}
ConfigFileEmitter::~ConfigFileEmitter() {
	delete emitter;
}

void ConfigFileEmitter::process(const arki::ConfigFile& cfg, const arki::Matcher& query) {
	arki::ConfigFile config(cfg);
	// If the matcher is not empty, then filter datasets
	if (!query.empty()) {
		for (arki::ConfigFile::const_section_iterator i = config.sectionBegin();
				 i != config.sectionEnd(); ++i) {
			std::auto_ptr<arki::ReadonlyDataset> ds(arki::ReadonlyDataset::create(*i->second));
			arki::Summary summary;
			ds->querySummary(query, summary);
			if (summary.count() == 0)
				config.deleteSection(i->first);
		}
	}
	arkiweb::encoding::BaseEncoder(*emitter).encode(config);
}

}
}
