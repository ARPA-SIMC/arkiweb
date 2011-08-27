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

#include <wibble/regexp.h>

namespace arkiweb {
namespace cgi {

std::ostream &operator<<(std::ostream &out, const Renderable &r) {
  r.render(out);
  return out;
}

HttpStatusHeader::HttpStatusHeader(const int &status, const std::string &message)
  : status(status), message(message) {}

void HttpStatusHeader::render(std::ostream &out) const {
  out << "HTTP/1.1 " << status << " " << message << std::endl;
}

HttpResponseHeader::HttpResponseHeader() : m_status(200, "OK") {}
HttpResponseHeader::HttpResponseHeader(const HttpStatusHeader &status) 
  : m_status(status) {}

HttpResponseHeader::~HttpResponseHeader() {
  for (std::vector<HttpHeader *>::iterator i = m_headers.begin();
       i != m_headers.end(); ++i)
    delete *i;
  m_headers.empty();
}

void HttpResponseHeader::setStatus(const HttpStatusHeader &status) {
  m_status = status;
}

void HttpResponseHeader::addHeader(HttpHeader *header) {
  m_headers.push_back(header);
}

void HttpResponseHeader::render(std::ostream &out) const {
  m_status.render(out);
  for (std::vector<HttpHeader *>::const_iterator i = m_headers.begin();
       i != m_headers.end(); ++i) {
    (*i)->render(out);
  }
  out << std::endl;
}

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
    Splitter spl2("=", REG_EXTENDED);
    Splitter::const_iterator i2 = spl2.begin(*i1);
    std::string key = *i2;
    std::string val = *(++i2);
    m_entries[key].push_back(val);
  }
}

}
}
