# Arkiweb

## API

| Name                                  | Description               |
| ------------------------------------- | ------------------------- |
| [datasets](#get-the-list-of-datasets) | Retrieve list of datasets |
| [summary](#get-the-summary)           | Retrieve the summary      |
| [fields](#get-the-list-of-fields)     | Retrieve list of fields   |
| [data](#get-the-data)                 | Retrieve the data         |

:warning: please note:
 - **all the webservices works with GET parameters**
 - **all the parameters need to be encoded** (e.g. `--data-urlencode` curl
 option), due to the frequent use of reserved characters as ";" in queries

### Get the list of datasets

The `/datasets` service returns the list of datasets in `JSON` format.

The parameters are:

- `datasets[]=NAME`: run the service over the dataset with name `NAME`. Can be
  specified multiple times. If not set, run the service over all the datasets.
- `query=QUERY`: filter datasets by query. *NOTE*: when `query` is specified,
  the service could be very slow.


The output is a `JSON` object:

```
{
  "datasets": [
    {
      "id": "lmsmr4x52",
      "name": "lmsmr4x52",
      "description": "COSMOI7, Operational suite, v4.21, CI and BC from IFS",
      "bounding": "POLYGON ((20.6613559288928954 31.7145084340445464, 0.9181226563627547 ... ))",
      "allowed": true,
      "postprocess": [
        "singlepoint",
        "subarea",
        "seriet"
      ]
    },
    {
      ...
    },
    ...
  ]
}
```

- `id`: id of the dataset
- `name`: name of the dataset
- `description`: description of the dataset
- `bounding`: bounding box in `WKT` format
- `allowed`: `true` if the user can download data from this dataset
- `postprocess`: array with a list of allowed postprocessors

#### Examples
```
# List all datasets
$ curl -G 'http://USER:PASSWORD@HOST/services/arkiweb/datasets'
# List all datasets with data for today
$ curl -G 'http://USER:PASSWORD@HOST/services/arkiweb/datasets' --data-urlencode 'query=reftime:=today'
```

### Get the list of fields

The `/fields` service returns the list of the available fields (metadata) for
the given datasets and for the (optionally) given query.

The parameters are:

- `datasets[]=NAME`: run the service over the dataset with name `NAME`. It can be
  specified multiple times. If not set, the result is empty.
- `query=QUERY`: filter datasets by query.

The output is a `JSON` object:

```
{
  "fields": [
    {
      "type": "area",
      "values": [{...}, {...}]
    },
    {
      "type": "product",
      "values": [{...}, {...}]
    }
  ],
  "stats": {
    "b": [
      2012,
      6,
      5,
      12,
      0,
      0
    ],
    "e": [
      2013,
      9,
      4,
      0,
      0,
      0
    ],
    "c": 5178696,
    "s": 964376769120
  }
}
```

- `fields`: array with an object for each metadata type
  - `type`: the metadata type
  - `values`: array containing the metadata of the given type
- `stats`:
  `b`: begin reftime
  `e`: end reftime
  `c`: item count
  `s`: size in bytes

#### Examples

```
# List today's metadata for datasets cosmo_5M_ita and cosmo_2I
$ curl -G --anyauth 'http://USER:PASSWORD@HOST/services/arkiweb/fields' --data-urlencode 'datasets[]=cosmo_5M_ita' --data-urlencode 'datasets[]=lmsmr6x54' --data-urlencoede 'query=reftime:=today'
```

### Get the summary

The `/summary` service returns metadata of every single file archived. It uses
the same parameters of the `/fields` service.

#### Examples

```
# List the number of t2m grib for today's run of cosmo_5M_ita:
$ curl -G --anyauth 'http://USER:PASSWORD@HOST/services/arkiweb/fields' --data-urlencode 'datasets[]=cosmo_5M_ita' --data-urlencode 'query=reftime:=today 00:00; product: GRIB1,80,2,11; level: GRIB1,105,2'
```

### Get the data

The `/data` service returs the data.

The parameters are:

- `datasets[]=NAME`: run the service over the dataset with name `NAME`. It can
  be specified multiple times.
- `query=QUERY`: filter datasets by query. If not specified it means "all 
  available data" and it's generally a bad idea.
- `postprocess=NAME ARGS`: postprocessor. If this parameter is set, only one
  dataset can be specified. If multiple datasets are selected the webservice
  will return a HTTP status 400 (Bad Request).

The return data format depends on the data requested and/or on the postprocessor
selected.
For additional information on postprocessor parameters please see:
https://github.com/ARPA-SIMC/arkimet-postprocessor-suite


#### Examples

```
# Extract today's cosmo_5M_ita analysis
$ curl -G --anyauth 'http://USER:PASSWORD@HOST/services/arkiweb/data' --data-urlencode 'datasets[]=cosmo_5M_ita' --data-urlencode 'query=reftime:=today;timerange:GRIB1,0,0'
# Extract a single point with given lat/lon coordinates from today's cosmo_5M_ita analysis using `singlepoint` postprocessor requesting json format in output
$ curl -G --anyauth 'http://USER:PASSWORD@HOST/services/arkiweb/data' --data-urlencode 'datasets[]=cosmo_5M_ita' --data-urlencode 'query=reftime:=today;timerange:GRIB1,0,0' --data-urlencode 'postprocess=singlepoint -f JSON 12 44'
```

## License

Arkiweb is licensed under GPLv2+.

* [jquery](http://jquery.com/) licensed under MIT license.
* [jquery-ui](http://jqueryui.com/) dual licensed under MIT and GPLv2 license.
* [jquery.layout](http://layout.jquery-dev.net/) dual licensed under the MIT and GPL licenses.
* [jquery.blockUI](http://jquery.malsup.com/block/) dual licensed under the MIT and GPL licenses.
* [jquery-ui-timepicker-addon](https://github.com/trentrichardson/jQuery-Timepicker-Addon) dual licensed under the MIT and GPL licenses.
* [underscore](http://documentcloud.github.com/underscore/) licensed under MIT license.
* [backbone](http://documentcloud.github.com/backbone/) licensed under MIT license.
* [openlayers](http://openlayers.org/) licensed under the 2-clause BSD license.
* [strftime](http://tech.bluesmoon.info/2008/04/strftime-in-javascript.html) licensed under BSD license.
