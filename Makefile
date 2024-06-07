PYTHON_ENVIRONMENT := PYTHONASYNCDEBUG=1 PYTHONDEBUG=1

check: mypy pyupgrade black

pyupgrade:
	pyupgrade --exit-zero-even-if-changed --py36-plus $(shell find arkiweb -name "*.py")

black:
	black arkiweb

mypy:
	mypy arkiweb

unittest:
	$(PYTHON_ENVIRONMENT) ./manage.py test

coverage:
	$(PYTHON_ENVIRONMENT) python3 -m coverage erase
	$(PYTHON_ENVIRONMENT) python3 -m coverage run -p ./manage.py test
	$(PYTHON_ENVIRONMENT) python3 -m coverage combine
	$(PYTHON_ENVIRONMENT) python3 -m coverage html
	$(PYTHON_ENVIRONMENT) python3 -m coverage report -m

# Set up a development environment
devel:
	$(MAKE) -C arkiweb/ui/static/ui/
	$(MAKE) dispatch -C testdata/datasets
	echo 'ARKIWEB_CONFIG = "testdata/datasets/datasets.cfg"' > arkiweb/project/local_settings.py

clean:
	$(MAKE) clean -C arkiweb/ui/static/ui/
	$(MAKE) clean -C testdata/datasets
	rm -f arkiweb/project/local_settings.py

.PHONY: check pyupgrade black mypy unittest coverage devel clean
