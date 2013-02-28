/*
 * emitter - serialization utilities
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
#ifndef ARKIWEB_EMITTER_H
#define ARKIWEB_EMITTER_H

#include <iostream>
#include <arki/emitter.h>
#include <arki/emitter/json.h>

namespace arkiweb {
namespace emitter {

/**
 * JSONP emitter, works only when the object starts with mapping or list.
 */
class JSONP : public arki::emitter::JSON {
 private:
	std::string jsonp;
	bool m_started;
 protected:
	void start() {
		if (!m_started) {
			out << jsonp << "(";
			m_started = true;
		}
	}
	void end() {
		start();
		out << ")";
	}
 public:
	JSONP(std::ostream& out, const std::string& jsonp="jsonp")
			: arki::emitter::JSON(out), jsonp(jsonp), m_started(false) {}
	virtual ~JSONP() {
		end();
	}
	virtual void start_list() {
		start();
		JSON::start_list();
	}
	virtual void start_mapping() {
		start();
		JSON::start_mapping();
	}
};

}
}
#endif
