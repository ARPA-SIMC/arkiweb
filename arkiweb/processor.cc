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

#include <arkiweb/authorization.h>
#include <arkiweb/emitter.h>

namespace arkiweb {

ProcessorFactory::ProcessorFactory() {
		m_emitter = NULL;
}
ProcessorFactory::~ProcessorFactory() {
	delete m_emitter;
}
Processor* ProcessorFactory::create() {
	if (target == "configfile") {
		if (format == "json") {
			m_emitter = new arki::emitter::JSON(std::cout);
		}
		else if (format == "jsonp") {
			m_emitter = new arkiweb::emitter::JSONP(std::cout);
		}
		return new processor::ConfigFileEmitter(*m_emitter);
	}
	throw wibble::exception::Generic("unsupported processor target: " + target);
}

namespace processor {

ConfigFileEmitter::ConfigFileEmitter(arki::Emitter& emitter) : emitter(emitter) {}

void ConfigFileEmitter::process(const arki::ConfigFile& cfg,
																const arki::Matcher& query) {
	emitter.start_list();
	for (arki::ConfigFile::const_section_iterator i = cfg.sectionBegin();
			 i != cfg.sectionEnd(); ++i)
		if (!query.empty()) {
			std::auto_ptr<arki::ReadonlyDataset> ds(arki::ReadonlyDataset::create(*i->second));
			arki::Summary summary;
			ds->querySummary(query, summary);
			if (summary.count() > 0)
				emit(*i->second);
		} else {
			emit(*i->second);
		}
	emitter.end_list();
}
void ConfigFileEmitter::emit(const arki::ConfigFile& c) {
	using wibble::str::Split;

	emitter.start_mapping();
	emitter.add("id", c.value("id"));
	emitter.add("name", c.value("name"));
	emitter.add("description", c.value("description"));
	emitter.add("allowed", authorization::User::get().is_allowed_dataset(c));
	emitter.add("bounding", c.value("bounding"));
	emitter.add("postprocess");
	emitter.start_list();
	Split splitter(",", c.value("postprocess"));
	for (Split::const_iterator i = splitter.begin();
			 i != splitter.end(); ++i) {
		emitter.add(*i);
	}
	emitter.end_list();
	emitter.end_mapping();
}

}
}
