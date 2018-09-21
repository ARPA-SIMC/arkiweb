/*
 * encoding - encoding classes
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
#include <arkiweb/encoding.h>

#include <arki/formatter.h>
#include <arki/summary.h>
#include <arki/summary/short.h>
#include <arki/summary/stats.h>
#include <arki/utils/string.h>

#include <arkiweb/authorization.h>
#include <arkiweb/wobble/string.h>

namespace arkiweb {
namespace encoding {

BaseEncoder::BaseEncoder(arki::Emitter& emitter) : emitter(emitter) {}

void BaseEncoder::encode(arki::ConfigFile::const_section_iterator& i) {
	const arki::ConfigFile& config = *i->second;
	emitter.start_mapping();
	emitter.add("id", i->first);
	emitter.add("name", config.value("name"));
	emitter.add("description", config.value("description"));
	emitter.add("bounding", config.value("bounding"));
	emitter.add("allowed", authorization::User::get().is_allowed_dataset(config));
	emitter.add("postprocess");
	emitter.start_list();
	using wobble::str::Split;
	Split splitter(config.value("postprocess"), ",");
	for (Split::const_iterator i = splitter.begin();
			 i != splitter.end(); ++i) {
		emitter.add(arkiweb::wobble::str::strip(*i));
	}
	emitter.end_list();
	emitter.end_mapping();
}

void BaseEncoder::encode(const arki::ConfigFile& config) {
    emitter.start_mapping();
    emitter.add("datasets");
	emitter.start_list();
	for (arki::ConfigFile::const_section_iterator i = config.sectionBegin();
			 i != config.sectionEnd(); ++i) {
		encode(i);
	}
	emitter.end_list();
    emitter.end_mapping();
}
void BaseEncoder::encode(const arki::Summary& sum) {
    emitter.start_mapping();
    emitter.add("summary");
	emitter.start_list();

	struct Serialiser : public arki::summary::Visitor {
		arki::Emitter& emitter;
        std::unique_ptr<arki::Formatter> formatter;
		Serialiser(arki::Emitter& emitter) : emitter(emitter), formatter(arki::Formatter::create()) {}
        bool operator()(const std::vector<const arki::types::Type*>& md, const arki::summary::Stats& stats) {
			emitter.start_mapping();

			for (std::vector<const arki::types::Type*>::const_iterator i = md.begin();
					 i != md.end(); ++i) {
				if (not *i) continue;
				emitter.add((*i)->tag());
				emitter.start_mapping();
				if (formatter) emitter.add("desc", (*formatter)(**i));
				(*i)->serialiseLocal(emitter, formatter.get());
				emitter.end_mapping();
			}
            emitter.add("summarystats");
			emitter.start_mapping();
			stats.serialiseLocal(emitter, formatter.get());
			emitter.end_mapping();
			emitter.end_mapping();
			return true;
		}
	} serialiser(emitter);
	sum.visit(serialiser);
	emitter.end_list();
    emitter.end_mapping();
}

FieldsEncoder::FieldsEncoder(arki::Emitter& emitter): BaseEncoder(emitter) {}
void FieldsEncoder::encode(const arki::Summary& sum) {
    arki::summary::Short sshort;
    sum.visit(sshort);

    std::unique_ptr<arki::Formatter> formatter = arki::Formatter::create();

	emitter.start_mapping();
	emitter.add("fields");
	emitter.start_list();
    for (const auto& i: sshort.items) {
		emitter.start_mapping();
		emitter.add("type", arki::utils::str::lower(arki::types::formatCode(i.first)));
		emitter.add("values");
		emitter.start_list();
        for (const auto& mi: i.second) {
			emitter.start_mapping();
			mi->serialiseLocal(emitter, formatter.get());
			emitter.add("desc", (*formatter)(*mi));
			emitter.end_mapping();
		}
		emitter.end_list();
		emitter.end_mapping();
	}
	emitter.end_list();

	emitter.add("stats");
	emitter.start_mapping();
	sshort.stats.serialiseLocal(emitter, formatter.get());
	emitter.end_mapping();

	emitter.end_mapping();
}

}
}
