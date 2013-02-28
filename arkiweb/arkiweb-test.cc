#include <wibble/tests.h>

namespace tut {
  test_runner_singleton runner;
}

int main(int argc, const char** argv)
{
  tut::reporter visi;
  tut::runner.get().set_callback(&visi);
  tut::runner.get().run_tests();

  return 0;
}
