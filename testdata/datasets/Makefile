all: datasets.cfg

datasets.cfg: cosmo/config ifs/config
	arki-mergeconf cosmo ifs > $@

dispatch: datasets.cfg
	arki-scan --dispatch=datasets.cfg ../data/* > /dev/null

clean:
	rm -f datasets.cfg
	for ds in cosmo ifs; do rm -rf $$ds/2021 $$ds/.summaries; done
