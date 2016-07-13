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
#include <arkiweb/emitter.h>

namespace arkiweb {
namespace emitter {

JSONP::JSONP(std::ostream& out, const std::string& jsonp)
		: arki::emitter::JSON(out), m_jsonp(jsonp) {}
JSONP::~JSONP() {
}

void JSONP::start_jsonp() {
	if (stack.empty())
		out << m_jsonp << "(";
}
void JSONP::end_jsonp() {
	if (stack.empty())
		out << ")";
}

void JSONP::start_list() {
	start_jsonp();
	JSON::start_list();
}
void JSONP::end_list() {
	JSON::end_list();
	end_jsonp();
}
void JSONP::start_mapping() {
	start_jsonp();
	JSON::start_mapping();
}
void JSONP::end_mapping() {
	JSON::end_mapping();
	end_jsonp();
}
void JSONP::add_null() {
	start_jsonp();
	JSON::add_null();
	end_jsonp();
}
void JSONP::add_bool(bool val) {
	start_jsonp();
	JSON::add_bool(val);
	end_jsonp();
}
void JSONP::add_int(long long int val) {
	start_jsonp();
	JSON::add_int(val);
	end_jsonp();
}
void JSONP::add_double(double val) {
	start_jsonp();
	JSON::add_double(val);
	end_jsonp();
}
void JSONP::add_string(const std::string& val) {
	start_jsonp();
	JSON::add_string(val);
	end_jsonp();
}
void JSONP::add_break() {
	start_jsonp();
	JSON::add_break();
	end_jsonp();
}
void JSONP::add_raw(const std::string& val) {
	start_jsonp();
	JSON::add_raw(val);
	end_jsonp();
}

}
}
