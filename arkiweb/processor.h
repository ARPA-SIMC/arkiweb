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
#include <iostream>

#include <arki/configfile.h>
#include <arki/matcher.h>
#include <arkiweb/encoding.h>

namespace arkiweb {

struct Processor {
	virtual void process(const arki::ConfigFile& cfg, const arki::Matcher& query) = 0;
};

class ProcessorFactory {
 public:
	// "configfile", "summary", "data" (default: "configfile")
	std::string target;
	// "json"
	std::string format;
	// empty or "-" for stdout (default: "")
	std::string outfile;
	// if empty, print data (default: "")
	std::string postprocess;

	ProcessorFactory();
	~ProcessorFactory();

	Processor* create();
};

namespace processor {
/// Emit configfile
class ConfigFileEmitter : public Processor {
 private:
	arki::Emitter* emitter;
 public:
	ConfigFileEmitter(arki::Emitter* emitter);
	~ConfigFileEmitter();
	virtual void process(const arki::ConfigFile& cfg, const arki::Matcher& query);
};
/// Emit summary
class SummaryEmitter : public Processor {
 private:
	arki::Emitter* emitter;
 public:
	SummaryEmitter(arki::Emitter* emitter);
	~SummaryEmitter();

	virtual void process(const arki::ConfigFile& cfg, const arki::Matcher& query);
};
/// Emit fields (summary collapsed on metadata)
class FieldsEmitter : public Processor {
 private:
	arki::Emitter* emitter;
 public:
	FieldsEmitter(arki::Emitter* emitter);
	~FieldsEmitter();

	virtual void process(const arki::ConfigFile& cfg, const arki::Matcher& query);
};
/// Emit data
class BinaryDataEmitter : public Processor {
 private:
     arki::utils::sys::NamedFileDescriptor& out;

 public:
	std::string postprocess;

	BinaryDataEmitter(arki::utils::sys::NamedFileDescriptor& out);

	virtual void process(const arki::ConfigFile& cfg, const arki::Matcher& query);
};

}
}
