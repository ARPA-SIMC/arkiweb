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
#include <arki/emitter.h>

namespace arkiweb {

struct Processor {
	virtual void process(const arki::ConfigFile& cfg) = 0;
};

class ProcessorFactory {
 private:
	arki::Emitter* m_emitter;

 public:
	// "configfile", "summary", "data" (default: "configfile")
	std::string target;
	// "json"
	std::string format;
	// empty or "-" for stdout (default: "")
	std::string outfile;

	ProcessorFactory();
	~ProcessorFactory();

	Processor* create();
};

namespace processor {

class ConfigFileEmitter : public Processor {
 private:
	arki::ConfigFile cfg;
	arki::Emitter& emitter;
 protected:
	void emit(const arki::ConfigFile& c);
 public:
	ConfigFileEmitter(arki::Emitter& emitter);
	virtual void process(const arki::ConfigFile& cfg);
};

}

}
