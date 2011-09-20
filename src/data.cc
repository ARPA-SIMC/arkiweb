#include <arkiweb/cgi.h>
#include <arkiweb/configfile.h>
#include <arkiweb/restrict.h>

#include <arki/runtime.h>
#include <arki/runtime/processor.h>
#include <arki/dataset/merged.h>

int main(int argc, char **argv) {
  try {
    arki::runtime::init();

    arkiweb::cgi::Cgi cgi;

    std::string query = cgi("query");
    std::string postprocess = cgi("postprocess");
    std::vector<std::string> datasets = cgi["datasets[]"];

    arki::ConfigFile cfg = arkiweb::configfile(datasets);

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

    std::cout << arkiweb::cgi::HttpStatusHeader(200, "OK");
    std::cout << arkiweb::cgi::HttpContentTypeHeader("application/binary") << std::endl;

    dsp->process(merged, "");

    std::cout.flush();

  } catch (const std::exception &e) {
    std::cerr << e.what();
    std::cout << arkiweb::cgi::HttpStatusHeader(500, "error") << std::endl;
  }
  return 0;
}
