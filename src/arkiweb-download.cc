#include <arkiweb/configfile.h>
#include <arkiweb/restrict.h>

#include <arki/runtime.h>
#include <arki/runtime/processor.h>
#include <arki/dataset/merged.h>

#include <cgicc/Cgicc.h>
#include <cgicc/HTTPContentHeader.h>
#include <cgicc/HTTPStatusHeader.h>

int main(int argc, char **argv) {
  std::ostream &out = std::cout;

  try {
    arki::runtime::init();

    cgicc::Cgicc cgi;

    std::string query = cgi("query");
    std::string postprocess = cgi("postprocess");
    std::vector<std::string> datasets;

    std::vector<cgicc::FormEntry> ds;
    cgi.getElement("datasets[]", ds);
    for (std::vector<cgicc::FormEntry>::const_iterator i = ds.begin();
         i != ds.end(); ++i) {
      datasets.push_back((*i).getValue());
    }

    arki::ConfigFile cfg = arkiweb::config::extract(datasets,
                                                    arkiweb::configfile());

    arki::runtime::ProcessorMaker pmaker;

    pmaker.postprocess = postprocess;

    if (postprocess.empty()) {
      pmaker.data_only = true;
    }
    arki::Matcher matcher = arki::Matcher::parse(query);

    arki::runtime::Output output;
    output.openStdout();

    std::auto_ptr<arki::runtime::DatasetProcessor> dsp = pmaker.make(matcher,
                                                                     output);

    arki::dataset::Merged merged;
    arki::runtime::Restrict restr = arkiweb::restriction();
    for (arki::ConfigFile::const_section_iterator c = cfg.sectionBegin();
         c != cfg.sectionEnd(); ++c) {
      if (restr.is_allowed(*c->second)) { 
        arki::ReadonlyDataset *ds = arki::ReadonlyDataset::create(*c->second);
        merged.addDataset(*ds);
      }
    }

    out << cgicc::HTTPContentHeader("application/binary");
    dsp->process(merged, "");
  } catch (const std::exception &e) {
    std::cerr << e.what();
    out << cgicc::HTTPStatusHeader(500, "error");
  }
  return 0;
}
