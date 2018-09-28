# Arkiweb [![Build Status](https://badges.herokuapp.com/travis/ARPA-SIMC/arkiweb?branch=master&env=DOCKER_IMAGE=centos:7&label=centos7)](https://travis-ci.org/ARPA-SIMC/arkiweb)  [![Build Status](https://badges.herokuapp.com/travis/ARPA-SIMC/arkiweb?branch=master&env=DOCKER_IMAGE=fedora:27&label=fedora27)](https://travis-ci.org/ARPA-SIMC/arkiweb)  [![Build Status](https://badges.herokuapp.com/travis/ARPA-SIMC/arkiweb?branch=master&env=DOCKER_IMAGE=fedora:28&label=fedora28)](https://travis-ci.org/ARPA-SIMC/arkiweb)

*Read this in other languages: [English](README.md), [Italiano](README.it.md).*

## Indice

  - [Dipendenze](#dipendenze)
  - [Installazione](#installazione)
    - [Installazione dei web service](#installazione-dei-web-service)
     - [Autenticazione e autorizzazioni](#autenticazione e autorizzazioni)
    - [Installazione del sito web](#installazione del sito web)
  - [API](#api)
  - [Licenza](#licenza)



## Dipendenze

La compilazione di arkiweb richiede le seguenti librerie:

* `arkimet`: https://github.com/ARPA-SIMC/arkimet

In caso di modifica dei file Javascript o CSS o di compilazione dal repository
git clonato, occorrono i seguenti programmi:

* `node.js`: http://nodejs.org/
* `npm`: https://www.npmjs.com/
* `eco`: https://github.com/sstephenson/eco

## Installazione

```
$ autoreconf -ifv && ./configure && make
```

### Installazione dei web service

I web service sono installati in `$libdir/arkiweb`.

Per installare i servizi in un server web, bisogna configurarlo.

La variabile d'ambiente `ARKIWEB_CONFIG` è obbligatoria.
Va assegnata al path del file di configurazione creato con `arki-mergeconf`.

Un esempio di configurazione per Apache è disponibile su
`$datarootdir/arkiweb/httpd/arkiweb.conf`.

#### Authenticazione e autorizzazioni

Quando la variabile globale `ARKIWEB_RESTRICT` è assegnata, il servizio cerca
una variabile globale `${ARKIWEB_RESTRICT}` e ne utilizza il valore per limitare
l'accesso ai dataset (similment all'opzione `--restrict` dei comandi arkimet.

In altre parole, utilizzando arkiweb con un `SetEnv ARKIWEB_RESTRICT=UTENTE`,
allora arkiweb andrà a cercare il valore della variabile d'ambiente `UTENTE`
e lo userà nel restrict.

Esempio con la Apache basic authentication:

```
AuthType Basic
AuthName "By Invitation Only"
AuthUserFile /usr/local/apache/passwd/passwords
Require valid-user
SetEnv ARKIWEB_RESTRICT REMOTE_USER
```

Inoltre, è possibile limitare la dimensione o il numero massimo dei dati
estratti:

```
# Max 1000 items
SetEnv ARKIWEB_MAXCOUNT MAXCOUNT
SetEnv MAXCOUNT 1000
# Max 1000000 bytes
SetEnv ARKIWEB_MAXSIZE MAXSIZE
SetEnv MAXSIZE 1000000
```

### Installazione del sito web

Il sito web è installato in `$datarootdir/arkiweb/public/`.

* `arkiweb.css`: fogli di stile css
* `arkiweb.js`: versione di sviluppo del file javascript
* `arkiweb.min.js`: versione "minified"

Nella stessa directory si trovano le seguenti librerie di terze parti:

* [jquery](http://jquery.com/) licensed under MIT license.
* [jquery-ui](http://jqueryui.com/) dual licensed under MIT and GPLv2 license.
* [jquery.layout](http://layout.jquery-dev.net/) dual licensed under the MIT and GPL licenses.
* [jquery.blockUI](http://jquery.malsup.com/block/) dual licensed under the MIT and GPL licenses.
* [jquery-ui-timepicker-addon](https://github.com/trentrichardson/jQuery-Timepicker-Addon) dual licensed under the MIT and GPL licenses.
* [underscore](http://documentcloud.github.com/underscore/) licensed under MIT license.
* [backbone](http://documentcloud.github.com/backbone/) licensed under MIT license.
* [openlayers](http://openlayers.org/) licensed under the 2-clause BSD license.
* [strftime](http://tech.bluesmoon.info/2008/04/strftime-in-javascript.html) licensed under BSD license.

Per far partire l'applicazione arkiweb: supponendo di avere i webservice
configurati sotto `/services/arkiweb` e che si voglia includere arkiweb in
un `<div id="arkiweb">`:

```javascript
$(document).ready(function() {
	arkiweb.run({
		baseUrl: "/services/arkiweb",
		el: "#arkiweb"
	});
});
```

Vedere `$docdir/arkiweb/html/example/index.html` per un esempio simile.

## API

| Name                            | Description                   |
| ------------------------------- | ----------------------------- |
| [datasets](#elenco-dei-dataset) | Recupera la lista dei dataset |
| [summary](#elenco-dei-summary)  | Recupera i summary            |
| [fields](#elenco-dei-campi)     | Recupera la lista dei campi   |
| [data](#data)                   | Recupera i dati               |

:warning: attenzione:
 - **tutti i webservice funzionano con parametri GET**
 - **tutti i parametri necessitano di encoding web** (ad es. l'opzione
 `--data-urlencode` di curl), a causa dell'uso di caratteri riservati nelle query come ";"

### Elenco dei dataset

Il servizio `/datasets` restituisce la lista dei dataset in formato `JSON`.

I parametri sono:

- `datasets[]=NOME`: esegue il servizio sul dataset di nome `NOME`. Può
  essere assegnata più volte. Se non assegnata, il servizio viene eseguito
  su tutti i dataset disponibili.
- `query=QUERY`: filtra i dataset secondo la query specificata. *NOTA*: quando
  `query` è specificata il servizio può essere molto lento.

L'output è un oggetto `JSON`:

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

- `id`: id del dataset
- `name`: nome del dataset
- `description`: descrizione del dataset
- `bounding`: bounding box in formato `WKT`
- `allowed`: `true` se l'utente può scaricare dati da quel dataset
- `postprocess`: array con la lista dei postprocessatori disponibili

#### Esempi
```
# Lista di tutti i datasets
$ curl -G 'http://USER:PASSWORD@HOST/services/arkiweb/data'
# Lista di tutti i dataset con dati disponibili per la giornata di oggi
$ curl -G 'http://USER:PASSWORD@HOST/services/arkiweb/data' --data-urlencode 'query=reftime:=today'
```

### Elenco dei campi

Il servizio `/fields` restituisce la lista dei campi disponibili (metadati) per
il dataset specificato e per la (eventuale) query specificata.

I parametri sono:

- `datasets[]=NOME`: esegue il servizio sul dataset di nome `NOME`. Può
  essere assegnata più volte. Se non assegnata, non vengono restituiti dati.
- `query=QUERY`: filtra i dataset secondo la query specificata.


L'output è un oggetto `JSON`:

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

- `fields`: array con un oggetto per ogni tipologia di metadato
  - `type`: il tipo di metadato
  - `values`: array che contiene i metadati di quel tipo
- `stats`:
  `b`: reftime iniziale
  `e`: reftime finale
  `c`: numero degli oggetti
  `s`: dimensione in byte

#### Esempi

```
# Elenca i metadata disponibili per oggi per i dataset cosmo_5M_ita and cosmo_2I
$ curl -G --anyauth 'http://USER:PASSWORD@HOST/services/arkiweb/fields' --data-urlencode 'datasets[]=cosmo_5M_ita' --data-urlencode 'datasets[]=lmsmr6x54' --data-urlencoede 'query=reftime:=today'
```

### Elenco dei summary

Il servizio `/summary` restituisce i metadati di ogni singolo file archiviato.
Usa gli stessi parametri del servizio `/fields`.

#### Esempi

```
# Elenca il numero di grib di temperatura a 2 metri per la corsa odierna di cosmo_5M_ita:
$ curl -G --anyauth 'http://USER:PASSWORD@HOST/services/arkiweb/fields' --data-urlencode 'datasets[]=cosmo_5M_ita' --data-urlencode 'query=reftime:=today 00:00; product: GRIB1,80,2,11; level: GRIB1,105,2'
```

### Recupera i dati

Il servizio `/data` restituisce i dati.

I parametri disponibili sono:

- `datasets[]=NOME`: estrae i dati dal dataset `NOME`. Può essere assegnato più
  volte.
- `query=QUERY`: filtra i dati secondo la query. Se non assegnata implica "tutti
  i dati disponibili" e in genere non è una buona idea.
- `postprocess=NAME ARGS`: postprocessatore. Se questo parametro è assegnato,
  è necessario specificare un solo dataset: viene restituito un HTTP status 400
  (Bad Request) quando si prova a postprocessare più dataset contemporaneamente.

Il formato restituito dipende dal tipo di dati richiesti e/o dal
postprocessatore selezionato.
Per ulteriori informazioni sui parametri dei postprocessatori vedere:
https://github.com/ARPA-SIMC/arkimet-postprocessor-suite

#### Esempi

```
# Estrae le analisi di oggi di cosmo_5M_ita:
$ curl -G --anyauth 'http://USER:PASSWORD@HOST/services/arkiweb/data' --data-urlencode 'datasets[]=cosmo_5M_ita' --data-urlencode 'query=reftime:=today;timerange:GRIB1,0,0'
# Estrae un singolo punto specificando coordinate lat/lon dalle analisi odierne di cosmo_5M_ita usando il postprocessatore `singlepoint` e richiedendo `JSON` come formato
$ curl -G --anyauth 'http://USER:PASSWORD@HOST/services/arkiweb/data' --data-urlencode 'datasets[]=cosmo_5M_ita' --data-urlencode 'query=reftime:=today;timerange:GRIB1,0,0' --data-urlencode 'postprocess=singlepoint -f JSON 12 44'
```

## Licenza

Arkiweb è distribuito su licenza GPLv2+.

Le seguenti librerie di terze parti sono incluse:

* [jquery](http://jquery.com/) licensed under MIT license.
* [jquery-ui](http://jqueryui.com/) dual licensed under MIT and GPLv2 license.
* [jquery.layout](http://layout.jquery-dev.net/) dual licensed under the MIT and GPL licenses.
* [jquery.blockUI](http://jquery.malsup.com/block/) dual licensed under the MIT and GPL licenses.
* [jquery-ui-timepicker-addon](https://github.com/trentrichardson/jQuery-Timepicker-Addon) dual licensed under the MIT and GPL licenses.
* [underscore](http://documentcloud.github.com/underscore/) licensed under MIT license.
* [backbone](http://documentcloud.github.com/backbone/) licensed under MIT license.
* [openlayers](http://openlayers.org/) licensed under the 2-clause BSD license.
* [strftime](http://tech.bluesmoon.info/2008/04/strftime-in-javascript.html) licensed under BSD license.
