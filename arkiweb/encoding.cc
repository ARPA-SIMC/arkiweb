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

#include <wibble/string.h>
#include <arki/formatter.h>
#include <arki/summary.h>
#include <arki/summary/stats.h>

#include <arkiweb/authorization.h>

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
	using wibble::str::Split;
	Split splitter(",", config.value("postprocess"));
	for (Split::const_iterator i = splitter.begin();
			 i != splitter.end(); ++i) {
		emitter.add(wibble::str::trim(*i));
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
		arki::Formatter* formatter;
		Serialiser(arki::Emitter& emitter) : emitter(emitter), formatter(arki::Formatter::create()) {}
        bool operator()(const std::vector<const arki::types::Type*>& md, const arki::summary::Stats& stats) {
			emitter.start_mapping();

			for (std::vector<const arki::types::Type*>::const_iterator i = md.begin();
					 i != md.end(); ++i) {
				// TODO: can't find this function if (!*i->defined()) continue;
				emitter.add((*i)->tag());
				emitter.start_mapping();
				if (formatter) emitter.add("desc", (*formatter)(**i));
				(*i)->serialiseLocal(emitter, formatter);
				emitter.end_mapping();
			}
			emitter.add(stats.tag());
			emitter.start_mapping();
			stats.serialiseLocal(emitter, formatter);
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

	struct Merger : public arki::summary::Visitor {
		// std::map<std::string, std::set< arki::UItem<> > > fields;
        std::map<std::string, std::set<const arki::types::Type*> > fields;
		arki::summary::Stats statistics;

        bool operator()(const std::vector<const arki::types::Type*>& md, const arki::summary::Stats& stats) {
			for (std::vector<const arki::types::Type*>::const_iterator i = md.begin();
					 i != md.end(); ++i) {
				// if (!i->defined()) continue;
				fields[(*i)->tag()].insert(*i);
			}
			statistics.merge(stats);
			return true;
		}
	} merger;

	sum.visit(merger);

	arki::Formatter* formatter = arki::Formatter::create();

	emitter.start_mapping();
	emitter.add("fields");
	emitter.start_list();
	for (std::map<std::string, std::set<const arki::types::Type*> >::const_iterator i = merger.fields.begin();
			 i != merger.fields.end(); ++i) {
		emitter.start_mapping();
		emitter.add("type", i->first);
		emitter.add("values");
		emitter.start_list();
		for (std::set<const arki::types::Type*>::const_iterator j = i->second.begin();
				 j != i->second.end(); ++j) {
			emitter.start_mapping();
			(*j)->serialiseLocal(emitter, formatter);
			emitter.add("desc", (*formatter)(**j));
			emitter.end_mapping();
		}
		emitter.end_list();
		emitter.end_mapping();
	}
	emitter.end_list();

	emitter.add("stats");
	emitter.start_mapping();
	merger.statistics.serialiseLocal(emitter, formatter);
	emitter.end_mapping();

	emitter.end_mapping();
}

}
}
