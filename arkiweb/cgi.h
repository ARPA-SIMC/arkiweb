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
#include <vector>
#include <map>
#include <ostream>

namespace arkiweb {
namespace cgi {

class Renderable;

std::ostream &operator<<(std::ostream &out, const Renderable &r);

class Renderable {
 public:
  virtual void render(std::ostream &out) const = 0;
};

class HttpHeader : public Renderable {
};

class HttpStatusHeader : public Renderable {
 public:
  int status;
  std::string message;

  HttpStatusHeader(const int &status, const std::string &message);
  virtual void render(std::ostream &out) const;
};

class HttpResponseHeader : public Renderable {
 public:
  HttpResponseHeader();
  HttpResponseHeader(const HttpStatusHeader &status);
  ~HttpResponseHeader();

  void setStatus(const HttpStatusHeader &status);
  void addHeader(HttpHeader *header);
  virtual void render(std::ostream &out) const;

 private:
  HttpStatusHeader m_status;
  std::vector<HttpHeader *> m_headers;
};

class Cgi {
 public:
  typedef std::map<std::string, std::vector<std::string> > entries_map;
  typedef entries_map::const_iterator const_entries_iterator;

  Cgi();
  std::vector<std::string> operator[](const std::string &name) const;
  std::string operator()(const std::string &name) const;
  entries_map entries() const;

 private:
  entries_map m_entries;

  void parseQueryString();
};

}
}
