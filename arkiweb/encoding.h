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
#ifndef ARKIWEB_ENCODING_H
#define ARKIWEB_ENCODING_H

#include <arki/configfile.h>
#include <arki/summary.h>
#include <arki/emitter.h>

namespace arkiweb {

// Generic encoder
struct Encoder {
	virtual void encode(const arki::ConfigFile& config) = 0;
	virtual void encode(const arki::Summary& sum) = 0;
};

namespace encoding {

// Base encoder
class BaseEncoder : public Encoder {
 private:
	arki::Emitter& emitter;
	
 protected:
	virtual void encode(arki::ConfigFile::const_section_iterator& i);

 public:
	BaseEncoder(arki::Emitter& emitter);

	virtual void encode(const arki::ConfigFile& config);
	virtual void encode(const arki::Summary& sum);
};

}
}
#endif
