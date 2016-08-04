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
 * JSONP emitter
 */
class JSONP : public arki::emitter::JSON {
 private:
	std::string m_jsonp;
 protected:
	virtual void start_jsonp();
	virtual void end_jsonp();
 public:
	JSONP(std::ostream& out, const std::string& jsonp="jsonp");
	virtual ~JSONP();

	virtual void start_list();
	virtual void end_list();

	virtual void start_mapping();
	virtual void end_mapping();

	virtual void add_null();
	virtual void add_bool(bool val);
	virtual void add_int(long long int val);
	virtual void add_double(double val);
	virtual void add_string(const std::string& val);

	virtual void add_break();
	virtual void add_raw(const std::string& val);
};

}
}
#endif
