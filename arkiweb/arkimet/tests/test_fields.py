from django.test import TestCase
from django.urls import reverse

from arkiweb.arkimet.views import FieldsView

from .utils import APITestMixin


class FieldsTests(APITestMixin[FieldsView], TestCase):
    view_class = FieldsView

    def test_get(self) -> None:
        self.add_dataset("test1")
        self.import_file("test1", "cosmo_t2m_2021_1_10_0_0_0+12.arkimet")
        response = self.client.get(reverse("arkimet:fields"))
        self.assertEqual(response.status_code, 200)
        self.maxDiff = None
        self.assertEqual(
            response.json(),
            {
                "fields": [
                    {
                        "type": "origin",
                        "values": [
                            {
                                "ce": 80,
                                "desc": "GRIB1 from 80, subcentre 255, process 22",
                                "pr": 22,
                                "s": "GRIB1",
                                "sc": 255,
                            }
                        ],
                    },
                    {
                        "type": "product",
                        "values": [{"desc": "T Temperature K", "or": 80, "pr": 11, "s": "GRIB1", "ta": 2}],
                    },
                    {
                        "type": "level",
                        "values": [
                            {
                                "desc": "sfc Fixed height above ground height in " "meters (2 octets) 2 -",
                                "l1": 2,
                                "level_type": 105,
                                "s": "GRIB1",
                            }
                        ],
                    },
                    {
                        "type": "timerange",
                        "values": [
                            {
                                "desc": "Forecast product valid at reference time + " "P1 (P1>0) - p1 12time unit 1",
                                "p1": 12,
                                "p2": 0,
                                "s": "GRIB1",
                                "trange_type": 0,
                                "un": 1,
                            }
                        ],
                    },
                    {
                        "type": "area",
                        "values": [
                            {
                                "desc": "GRIB(Ni=386, Nj=434, latfirst=-10575000, "
                                "latlast=8910000, latp=-47000000, "
                                "lonfirst=-7785000, lonlast=9540000, "
                                "lonp=10000000, rot=0, type=10)",
                                "s": "GRIB",
                                "va": {
                                    "Ni": 386,
                                    "Nj": 434,
                                    "latfirst": -10575000,
                                    "latlast": 8910000,
                                    "latp": -47000000,
                                    "lonfirst": -7785000,
                                    "lonlast": 9540000,
                                    "lonp": 10000000,
                                    "rot": 0,
                                    "type": 10,
                                },
                            }
                        ],
                    },
                    {"type": "proddef", "values": [{"desc": "GRIB(tod=1)", "s": "GRIB", "va": {"tod": 1}}]},
                    {"type": "run", "values": [{"desc": "MINUTE(00:00)", "s": "MINUTE", "va": 0}]},
                ],
                "stats": {"b": [2021, 1, 10, 0, 0, 0], "c": 1, "e": [2021, 1, 10, 0, 0, 0], "s": 120},
            },
        )

    # http://arkiweb.metarpa/services/arkiweb/fields?datasets%5B%5D=adriac&datasets%5B%5D=adroms2k
