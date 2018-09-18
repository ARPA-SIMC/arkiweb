# Arkiweb

## Dependencies

Arkiweb needs the following libraries

* `arkimet`: https://github.com/ARPA-SIMC/arkimet

If you edit the Javascript or CSS files or compile from cloned git repo, you
must install the following programs:

* `node.js`: http://nodejs.org/
* `npm`: https://www.npmjs.com/
* `eco`: https://github.com/sstephenson/eco

### Install dependencies on Fedora

On Fedora, install `node` and `npm` from official repositories:

```
$ dnf install nodejs npm
```

Then, install locally `eco` package:

```
$ npm install eco
$ export PATH=$PATH:$HOME/node_modules/eco/bin
```

or in global mode:

```
$ npm install -g eco
```

## Installation

```
$ autoreconf -ifv && ./configure && make
```

### Web services installation

The web services are installed in `$libdir/arkiweb`.

To install the services under a web server, you must configure it.

The environment variable `ARKIWEB_CONFIG` is mandatory. Its value is the path
of the configuration file, created with `arki-mergeconf`.

```
include::httpd/arkiweb.conf[]
```

#### Authentication & authorization

Arkiweb comes with a very simple authorization system. When the global 
variable `ARKIWEB_RESTRICT` is set, the service looks for the global
variable `${ARKIWEB_RESTRICT}`. The value of the variable is used for
restricted access (similar to the `--restrict` option of the arkimet 
commands).

.Example with Apache basic authentication
```
AuthType Basic
AuthName "By Invitation Only"
AuthUserFile /usr/local/apache/passwd/passwords
Require valid-user
SetEnv ARKIWEB_RESTRICT REMOTE_USER
```

In addition, you can limit the maximum number or size of retrieved items:

```
# Max 1000 items
SetEnv ARKIWEB_MAXCOUNT MAXCOUNT
SetEnv MAXCOUNT 1000
# Max 1000000 bytes
SetEnv ARKIWEB_MAXSIZE MAXSIZE
SetEnv MAXSIZE 1000000
```

### Website installation

The website is installed under `$datarootdir/arkiweb/public/`.

* `arkiweb.css`: stylesheet
* `arkiweb.js`: development version
* `arkiweb.min.js`: minified version

You need the following Javascript libraries:

* `jquery`: http://jquery.com/
* `jquery-ui`: http://jqueryui.com/
* `jquery.layout` http://layout.jquery-dev.net/
* `jquery.blockUI` http://jquery.malsup.com/block/
* `jquery-ui-timepicker-addon`: https://github.com/trentrichardson/jQuery-Timepicker-Addon
* `underscore`: http://documentcloud.github.com/underscore/
* `backbone`: http://documentcloud.github.com/backbone/
* `openlayers`: http://openlayers.org/
* `strftime`: http://tech.bluesmoon.info/2008/04/strftime-in-javascript.html

Then, you must configure and run your arkiweb application. Suppose that you
have you web services under `/cgi-bin/arkiweb` and that you want embed arkiweb
inside a `<div id="arkiweb">`:

```javascript
$(document).ready(function() {
	arkiweb.run({
		baseUrl: "/cgi-bin/arkiweb",
		el: "#arkiweb"
	});
});
```

## API

| Name                                    | Description               |
| --------------------------------------- | ------------------------- |
| [datasets](#get-the-list-of-datasets) | Retrieve list of datasets |
| [summary](#get-the-summary)           | Retrieve the summary      |
| [fields](#get-the-list-of-fields)     | Retrieve list of fields   |
| [data](#get-the-data)                 | Retrieve the data         |

### Get the list of datasets

The `/datasets` returns the list of datasets in `JSON` format.

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
$ curl -g 'http://USER:PASSWORD@HOST/cgi-bin/arkiweb/data'
# List all datasets with data for today
$ curl -g 'http://USER:PASSWORD@HOST/cgi-bin/arkiweb/data?query=reftime:=today'
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

### Get the summary

*TODO*


### Get the data

The `/data` service returs the data.

The parameters are:

- `datasets[]=NAME`: run the service over the dataset with name `NAME`. It can be
  specified multiple times.
- `query=QUERY`: filter datasets by query.
- `postprocess=NAME ARGS`: postprocessor. If this parameter is set, only one dataset cna be specified.