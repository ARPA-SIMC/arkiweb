/*
 * cgi - Cgi classes
 *
 * Copyright (C) 2011  ARPA-SIM <urpsim@smr.arpa.emr.it>
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
#include <string>
#include <arkiweb/cgi.h>

#include <cstdlib>

#include <wibble/string.h>
#include <wibble/regexp.h>

namespace arkiweb {
namespace cgi {

std::ostream &operator<<(std::ostream &out, const Renderable &r) {
  r.render(out);
  return out;
}

HttpHeader::HttpHeader(const std::string &name, const std::string &value)
  : m_name(name), m_value(value) {}

void HttpHeader::render(std::ostream &out) const {
  out << m_name << ": " << m_value << std::endl;
}

HttpStatusHeader::HttpStatusHeader(const int &status, const std::string &message)
  : m_status(status), 
    HttpHeader("Status", wibble::str::fmtf("%d %s", status, message.c_str()))
{}

HttpContentTypeHeader::HttpContentTypeHeader(const std::string &type)
  : HttpHeader("Content-Type", type) {}

HttpHtmlContentTypeHeader::HttpHtmlContentTypeHeader() 
  : HttpContentTypeHeader("text/html") {}

HttpPlainContentTypeHeader::HttpPlainContentTypeHeader()
  : HttpContentTypeHeader("plain/text") {}

Cgi::Cgi() {
  parseQueryString();
}

std::vector<std::string> Cgi::operator[](const std::string &name) const {
  const_entries_iterator it = m_entries.find(name);
  if (it == m_entries.end())
    return std::vector<std::string>();
  return it->second;
}

std::string Cgi::operator()(const std::string &name) const {
  std::vector<std::string> entries = (*this)[name];
  if (entries.size() == 0)
    return std::string();
  return entries.front();
}

Cgi::entries_map Cgi::entries() const {
  return m_entries;
}

void Cgi::parseQueryString() {
  char *query = ::getenv("QUERY_STRING");
  if (!query)
    return;
  using wibble::Splitter;
  Splitter spl1("&", REG_EXTENDED);
  for (Splitter::const_iterator i1 = spl1.begin(query);
       i1 != spl1.end(); ++i1) {
    using wibble::ERegexp;
    ERegexp re("([^=]+)=(.*)", 3);
    if(!re.match(*i1))
      continue;
    std::string key = re[1];
    std::string val = re[2];
    m_entries[key].push_back(val);
    std::cout << key << ": " << val << std::endl;
  }
}

}
}
