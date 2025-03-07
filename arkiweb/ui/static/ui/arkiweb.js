(function() {
	var arkiweb = {
		models: {},
		collections: {},
		views: {},
		templates: {},
		postprocessors: {},
		run: function(options) {
			$(document).ready(function() {
				var opts = $.extend({}, {
					el: "#arkiweb",
					baseUrl: "test/fixtures",
					postprocessors: {}
				}, options);

				arkiweb.App = new arkiweb.views.Application(opts);
			});
		},
		version: "0.27"
	};

	this.arkiweb = arkiweb;
}());
var ArkiwebParser = {
	area: {
		decode: function(a) {
			if (a instanceof Array)
				return "area:" + a.join(" or ");
			else
				return this.styles[a.s].decode(a);
		},
		styles: {
			GRIB: {
				decode: function(i) {
					var vals = [];
					for (var k in i.va) {
						vals.push(k+"="+i.va[k]);
					}
					return "GRIB:" + vals.join(",");
				}
			},
			ODIMH5: {
				decode: function(i) {
					var vals = [];
					for (var k in i.va) {
						vals.push(k+"="+i.va[k]);
					}
					return "ODIMH5:" + vals.join(",");
				}
			},
			VM2: {
				decode: function(i) {
                    var a = "VM2," + i.id;
                    if (i.va != undefined) {
                        var vals = [];
                        for (var k in i.va) {
                            vals.push(k+"="+i.va[k]);
                        }
                        a = a + ":" + vals.join(",");
                    }
                    return a;
				}
			}
		}
	},
	level: {
		decode: function(a) {
			if (a instanceof Array)
				return "level:" + a.join(" or ");
			else
				return this.styles[a.s].decode(a);
		},
		styles: {
			GRIB1: {
				decode: function(i) {
					var l = [i.lt];
					if (i.l1 != undefined) {
						l.push(i.l1)
						if (i.l2 != undefined) {
							l.push(i.l2);
						}
					}
					return "GRIB1," + l.join(",");
				}
			},
			GRIB2S: {
				decode: function(i) {
					var l = [i.lt, '-', '-'];
					if (i.sc != undefined)
						l[1] = i.sc
					if (i.va != undefined)
						l[2] = i.va
					return "GRIB2S," + l.join(",")
				}
			},
			GRIB2D: {
				decode: function(i) {
					return "GRIB2D," + i.l1 + "," + i.s1 + "," + i.v1 + "," + i.l2 + "," + i.s2 + "," + i.v2;
				}
			},
			ODIMH5: {
				decode: function(i) {
					return "ODIMH5,range " + i.mi + " " + i.ma;
				}
			}
		}
	},
	origin: {
		decode: function(a) {
			if (a instanceof Array)
				return "origin:" + a.join(" or ");
			else
				return this.styles[a.s].decode(a);
		},
		styles: {
			GRIB1: {
				decode: function(i) {
					return "GRIB1," + i.ce + "," + i.sc + "," + i.pr;
				}
			},
			GRIB2: {
				decode: function(i) {
					return "GRIB2," + i.ce + "," + i.sc + "," + i.pt + "," + i.bi + "," + i.pi;
				}
			},
			BUFR: {
				decode: function(i) {
					return "BUFR," + i.ce + "," + i.sc;
				}
			},
			ODIMH5: {
				decode: function(i) {
					return "ODIMH5," + i.wmo + "," + i.rad + "," + i.plc;
				}
			}
		}
	},
	proddef: {
		decode: function(a) {
			if (a instanceof Array)
				return "proddef:" + a.join(" or ");
			else
				return this.styles[a.s].decode(a);
		},
		styles: {
			GRIB: {
				decode: function(i) {
					var vals = [];
					for (var k in i.va) {
						vals.push(k+"="+i.va[k]);
					}
					return "GRIB:" + vals.join(",");
				}
			}
		}
	},
	product: {
		decode: function(a) {
			if (a instanceof Array)
				return "product:" + a.join(" or ");
			else
				return this.styles[a.s].decode(a);
		},
		styles: {
			GRIB1: {
				decode: function(i) {
					return "GRIB1," + i.or + "," + i.ta + "," + i.pr;
				}
			},
			GRIB2: {
				decode: function(i) {
					return "GRIB2," + i.ce + "," + i.di + "," + i.ca + "," + i.no;
				}
			},
			BUFR: {
				decode: function(i) {
					var s = "BUFR," + i.ty + "," + i.st + "," + i.ls;
					if (i.va != undefined) {
						var vals = [];
						for (var k in i.va) {
							vals.push(k+"="+i.va[k]);
						}
						if (vals.length > 0) {
							s += ":" + vals.join(",");
						}
					}
					return s;
				}
			},
			ODIMH5: {
				decode: function(i) {
					return "ODIMH5," + i.ob + "," + i.pr;
				}
			},
			VM2: {
				decode: function(i) {
                    var p = "VM2," + i.id;
                    if (i.va != undefined) {
                        var vals = [];
                        for (var k in i.va) {
                            vals.push(k+"="+i.va[k]);
                        }
                        p = p + ":" + vals.join(",");
                    }
                    return p;
				}
			}
		}
	},
	quantity: {
		decode: function(a) {
			if (a instanceof Array)
				return "quantity:" + a.join(" or ");
			else
				return a.va.join(",")
		}
	},
	run: {
		decode: function(a) {
			if (a instanceof Array)
				return "run:" + a.join(" or ");
			else
				return this.styles[a.s].decode(a);
		},
		styles: {
			MINUTE: {
				decode: function(i) {
					var h = Math.floor(i.va / 60);
					var m = i.va % 60;
					if (h < 10) {
						h = "0" + h;
					}
					if (m < 10) {
						m = "0" + m;
					}
					return "MINUTE," + h + ":" + m;
				}
			}
		}
	},
	task: {
		decode: function(a) {
			if (a instanceof Array)
				return "task:" + a.join(" or ");
			else
				return a.va;
		}
	},
	timerange: {
		decode: function(a) {
			if (a instanceof Array)
				return "timerange:" + a.join(" or ");
			else
				return this.styles[a.s].decode(a);
		},
		styles: {
			GRIB1: {
				decode: function(i) {
					var un = {
						0: 'm',
						1: 'h',
						2: 'd',
						3: 'mo',
						4: 'y',
						5: 'de',
						6: 'no',
						7: 'ce',
						10: 'h3',
						11: 'h6',
						12: 'h12',
						254: 's'
					};
					return "GRIB1," + i.ty + "," + i.p1 + un[i.un] + "," + i.p2 + un[i.un];
				}
			},
			GRIB2: {
				decode: function(i) {
					var un = {
						0: 'm',
						1: 'h',
						2: 'd',
						3: 'mo',
						4: 'y',
						5: 'de',
						6: 'no',
						7: 'ce',
						10: 'h3',
						11: 'h6',
						12: 'h12',
						254: 's'
					};
					return "GRIB2," + i.ty + "," + i.p1 + un[i.un] + "," + i.p2 + un[i.un];
				}
			},
			Timedef: {
				decode: function(i) {
					var un = {
						0: 'm',
						1: 'h',
						2: 'd',
						3: 'mo',
						4: 'y',
						5: 'de',
						6: 'no',
						7: 'ce',
						10: 'h3',
						11: 'h6',
						12: 'h12',
						13: 's'
					};
					var s = "Timedef";
					if (i.su == 255) {
						s += ",-"
					} else {
						s += "," + i.sl + un[i.su];
					}
					if (i.pt != undefined) {
						s += "," + i.pt
					} else {
						// If i.pt is not defined, then
						// the stat type is 255 and 
						// i.pl, i.pu are not defined
						// too (see 
						// arki/types/timerange.cc:1358).
						// If the stat type is 255, then
						// proctype = "-" (see
						// arki/types/timerange.cc:1403).
						s += ",-"
					}
					// If i.pu is not defined, then
					// the stat unit is UNIT_MISSING = 255
					// and i.pl is not defined too
					// (see arki/types/timerange.cc:1361).
					// If stat unit is 255, then 
					// proclen = "-" (see
					// arki/types/timerange.cc:1408).
					if (i.pu != undefined) {
						s += "," + i.pl + un[i.pu]
					} else {
						s += ",-"
					}
					return s;
				}
			},
			BUFR: {
				decode: function(i) {
					var un = {
						0: 'm',
						1: 'h',
						2: 'd',
						3: 'mo',
						4: 'y',
						5: 'de',
						6: 'no',
						7: 'ce',
						10: 'h3',
						11: 'h6',
						12: 'h12',
						13: 's'
					};
					return "BUFR," + i.va + un[i.un];
				}
			}
		}
	}
};
(function() {
	var Dataset = Backbone.Model.extend({
	});

	this.arkiweb.models.Dataset = Dataset;
}());
(function() {
	var Field = Backbone.Model.extend({
	});

	this.arkiweb.models.Field = Field;
}());
(function() {
	var Datasets = Backbone.Collection.extend({
		model: arkiweb.models.Dataset,
		url: '/datasets',
		parse: function(resp) {
			return resp.datasets;
		}
	});

	this.arkiweb.collections.Datasets = Datasets;
}());
(function() {
	var Fields = Backbone.Collection.extend({
		model: arkiweb.models.Field,
		initialize: function(attrs) {
		},
		stats: {
			c: 0,
			s: 0
		},
		parse: function(resp) {
			this.stats = resp.stats;
			if (this.stats.c != 0) {
				this.stats.b = this.array2date(this.stats.b);
				this.stats.e = this.array2date(this.stats.e);
			}
			return resp.fields;
		},
		array2date: function(arr) {
			return new Date(arr[0], arr[1] - 1, arr[2],
					arr[3], arr[4], arr[5], 0);
		}
	});

	this.arkiweb.collections.Fields = Fields;
}());
(function() {
	var Application = Backbone.View.extend({
		initialize: function(opts) {
			this.opts = opts;
			this.collections = {};
			this.collections.datasets = new arkiweb.collections.Datasets();
			this.collections.datasets.url = opts.baseUrl + "/datasets";
			this.collections.fields = new arkiweb.collections.Fields();
			this.collections.fields.url = opts.baseUrl + "/fields";
			this.collections.summary = new arkiweb.collections.Fields();
			this.collections.summary.url = opts.baseUrl + "/fields";

			this.render();
		},
		render: function() {
			var tmpl = arkiweb.templates["application"]();
			$(this.el).html(tmpl);

			var self = this;
			this.mainlayout = $(this.el).layout({
				closable: false,
				resizable: false,
				hidable: false,
				north__paneSelector: '.header',
				center__paneSelector: '.content',
				south__paneSelector: '.footer'
			});
			this.contentlayout = $(".content", $(this.el)).layout({
				closable: false,
				resizable: false,
				hidable: false,
				center__paneSelector: '.selection',
				south__paneSelector: '.map',
				south__size: "40%",
				onresize: function() {
					self.views.map.updateSize();
				}
			});

			this.datasetslayout = $(".datasets", $(this.el)).height("100%").layout({
				applyDefaultStyles: true,
				closable: false,
				resizable: false,
				hidable: false,
				north__paneSelector: '.datasets-menu',
				center__paneSelector: '.datasets-content'
			});
			this.fieldslayout = $(".fields", $(this.el)).height("100%").layout({
				applyDefaultStyles: true,
				closable: false,
				resizable: false,
				hidable: false,
				north__paneSelector: '.fields-menu',
				center__paneSelector: '.fields-content'
			});
			this.summarylayout = $(".summary", $(this.el)).height("100%").layout({
				applyDefaultStyles: true,
				closable: false,
				resizable: false,
				hidable: false,
				north__paneSelector: '.summary-menu',
				center__paneSelector: '.summary-content'
			});

			$(".selection > div").hide();

			this.views = {};

			this.views.datasets = new arkiweb.views.DatasetsSelection({
				collection: this.collections.datasets,
				el: ".datasets-content"
			});

			this.views.datasets.bind("select", function() {
				this.collections.fields.reset();
			}, this);

			this.views.fields = new arkiweb.views.FieldsSelection({
				collection: this.collections.fields,
				el: ".fields-content"
			});

			this.views.summary = new arkiweb.views.Summary({
				collection: this.collections.summary,
				el: ".summary-content"
			});

			this.views.map = new arkiweb.views.Map({
				el: ".map",
				datasets: this.views.datasets
			});


			this.views.map.render();

			this.views.postprocessors = new arkiweb.views.Postprocessors({
				el: ".postprocessors-content",
				datasets: this.views.datasets,
				map: this.views.map.map
			});

			this.views.postprocessors.render();

			this.loadDatasets();
		},
		block: function(message) {
			$.blockUI.defaults.css = {};
			$(this.el).block({
				message: "<span class='block'>" + message + "</span>",
				css: {}
			});
		},
		block_err: function(message) {
			this.block("<span class='error'>" + message + "</span>");
		},
		unblock: function() {
			$(this.el).unblock();
		},

		events: {
			'click .datasets-menu .toggle-disallowed': 'toggleDisallowedDatasets',
			'click .datasets-menu .clear-selection': 'clearDatasetsSelection',
			'click .datasets-menu .submit-selection': 'loadFields',
			'click .fields-menu .show-datasets': 'showDatasets',
			'click .fields-menu .clear-selection': 'clearFieldsSelection',
			'click .fields-menu .submit-selection': 'loadSummary',
			'click .summary-menu .show-datasets': 'showDatasets',
			'click .summary-menu .show-fields': 'showFields',
			'click .summary-menu .show-postprocessors': 'showPostprocessors',
			'click .postprocessors-menu .show-datasets': 'showDatasets',
			'click .postprocessors-menu .show-fields': 'showFields',
			'click .postprocessors-menu .download-selection': 'downloadSelection'
		},
		toggleDisallowedDatasets: function() {
			this.views.datasets.toggleDisallowed();
		},
		clearDatasetsSelection: function() {
			this.views.datasets.clearSelection();
		},
		loadDatasets: function() {
			this.block("loading datasets");
			var self = this;
			this.collections.datasets.fetch({
				success: function() {
					self.unblock();
				},
				error: function(collection, error) {
					self.unblock();
					self.block_err("Error while fetching datasets from " + collection.url + ": " + error.statusText + " (" + error.status + ")");
				}
			});

			this.showDatasets();
		},
		showDatasets: function() {
			$(".selection > div", $(this.el)).hide();
			$(".selection > .datasets", $(this.el)).show("slide", "slow");
			this.datasetslayout.resizeAll();
		},
		loadFields: function() {
			this.block("loading fields");

			var datasets = _.map(this.views.datasets.getSelected(), function(ds) { return ds.get("name") });
			var self = this;
			this.collections.fields.fetch({
				data: {
					datasets: datasets
				},
				success: function() {
					self.unblock();
				},
				error: function(collection, error) {
					self.unblock();
					self.block_err("Error while fetching fields from " + collection.url + ": " + error.statusText + " (" + error.status + ")");
				}
			});

			this.showFields();
		},
		showFields: function() {
			$(".selection > div", $(this.el)).hide();
			$(".selection > .fields", $(this.el)).show("slide", "slow");
			this.fieldslayout.resizeAll();
		},
		clearFieldsSelection: function() {
			this.views.fields.clearSelection();
		},
		showSummary: function() {
			$(".selection > div", $(this.el)).hide();
			$(".selection > .summary", $(this.el)).show("slide", "slow");
			this.summarylayout.resizeAll();
		},
		loadSummary: function() {
			this.block("loading summary");

			var datasets = _.map(this.views.datasets.getSelected(), function(ds) { return ds.get("name") });
			var query = this.views.fields.getQuery();

			var self = this;
			this.collections.summary.fetch({
				data: {
					datasets: datasets,
					query: query
				},
				success: function() {
					self.unblock();
				},
				error: function(collection, error) {
					self.unblock();
					self.block_err("Error while fetching summary from " + collection.url + ": " + error.statusText + " (" + error.status + ")");
				}
			});

			this.showSummary();
		},
		showPostprocessors: function() {
			$(".selection > div").hide();
			$(".selection > .postprocessors", $(this.el)).show("slide", "slow");
		},
		downloadSelection: function() {
			var data = {
				datasets: _.map(this.views.datasets.getSelected(), function(ds) { return ds.get("name") }),
				query: this.views.fields.getQuery()
			};
			var postprocess = this.views.postprocessors.getCommand();
			if (postprocess)
				data.postprocess = postprocess;

			var url = this.opts.baseUrl + "/data?" + $.param(data);
			window.open(url);
		}
	});

	this.arkiweb.views.Application = Application;
}());
(function() {
	var Map = Backbone.View.extend({
		initialize: function(opts) {
			this.map = new OpenLayers.Map();

			this.map.addLayer(new OpenLayers.Layer.WMS("OpenLayers", "https://ows.mundialis.de/services/service", { layers: "OSM-WMS-no-labels" }));
			this.map.addControl(new OpenLayers.Control.MousePosition());

			if (opts.datasets) {
				opts.datasets.bind("select", this.updateDatasetsBounds, this);
				this.dsbounds = new OpenLayers.Layer.Vector();
				this.map.addLayer(this.dsbounds);
			}
		},
		render: function() {
			this.map.render($(this.el).get(0));
			this.map.zoomToMaxExtent();
		},
		updateDatasetsBounds: function(model, selected) {
			if (!selected) {
				var feature = this.dsbounds.getFeatureBy("name", model.get("name"));
				if (feature)
					this.dsbounds.destroyFeatures([feature]);
			} else {
				var feature = new OpenLayers.Format.WKT().read(model.get("bounding"));
				if (feature) {
					feature.name = model.get("name");
					this.dsbounds.addFeatures([feature]);
				}
			}
			var bounds = this.dsbounds.getDataExtent();
			if (bounds)
				this.map.zoomToExtent(bounds);
			else
				this.map.zoomToMaxExtent();
		},
		updateSize: function() {
			this.map.updateSize();
		}
	});

	this.arkiweb.views.Map = Map;
}());
(function() {
	var DatasetsSelection = Backbone.View.extend({
		initialize: function(opts) {
			this.collection.bind("reset", this.render, this);
			this.bind("select", this.updateSelectionList, this);
		},
		views: [],
		render: function() {
			var tmpl = arkiweb.templates["datasets-selection"]();
			this.views = [];
			$(this.el).html(tmpl);

			var content = $(this.el).find(".datasets-list");

			this.collection.each(function(model) {
				var view = new DatasetsSelectionItem({
					model: model
				});
				view.render();
				this.views.push(view);
				content.append(view.el);
				view.bind("select", this.triggerSelection, this);
			}, this);

			this.layout = $(this.el).layout({
				applyDefaultStyles: true,
				closable: false,
				resizable: false,
				hidable: false,
				north__paneSelector: ".selected-datasets",
				center__paneSelector: ".datasets-table"
			});
		},
		triggerSelection: function(view) {
			this.trigger("select", view.model, view.isSelected());
		},
		toggleDisallowed: function() {
			_.each(this.views, function(view) {
				if (view.model.get("allowed") == false) {
					$(view.el).toggle();
				}
			});
		},
		updateSelectionList: function() {
			var datasets = _.map(this.getSelected(), function(model) { 
				return model.get("name")
			});

			$(this.el).find(".selected-datasets .selected-datasets-list").html(datasets.join(", "));
		},
		getSelected: function() {
			var selected = [];
			_.each(this.views, function(view) {
				if (view.isSelected())
					selected.push(view.model);
			});
			return selected;
		},
		clearSelection: function() {
			_.each(this.views, function(view) {
				if (view.isSelected())
					view.toggleSelection();
			});
		}
	});

	var DatasetsSelectionItem = Backbone.View.extend({
		tagName: "tr",
		className: "datasets-selection-item",
		render: function() {
			var tmpl = arkiweb.templates["datasets-selection-item"](this.model.toJSON());
			$(this.el).html(tmpl);

			if (this.model.get("allowed") == false) {
				$(this.el).addClass("disallowed");
			}
		},
		events: {
			'click': 'toggleSelection'
		},
		toggleSelection: function() {
			$(this.el).toggleClass("selected");
			this.trigger("select", this);
		},
		isSelected: function() {
			return $(this.el).hasClass("selected");
		}
	});

	this.arkiweb.views.DatasetsSelection = DatasetsSelection;
}());
(function() {
	var FieldsSelection = Backbone.View.extend({
		initialize: function(opts) {
			this.collection.bind("reset", this.render, this);
		},
		views: [],
		render: function() {
			if (this.content)
				this.content.accordion("destroy");
			if (this.layout)
				this.layout.destroy();

			var tmpl = arkiweb.templates["fields-selection"](this.collection);
			$(this.el).html(tmpl);
			this.views = [];

			this.content = $(this.el).find(".fields-selection-items");

			// Reftime selection
			if (this.collection.stats.c > 0) {

				var view = new FieldSelectionReftime({
					stats: this.collection.stats
				});
				this.views.push(view);
				view.render();
				this.content.append(view.el);
				view.bind("select", this.updateQuery, this);
			}

			// Field selections
			this.collection.each(function(model) {
				var view = new FieldsSelectionItem({
					model: model
				});
				this.views.push(view);
				view.render();
				this.content.append(view.el);
				view.bind("select", this.updateQuery, this);
			}, this);

			var self = this;
			this.content.accordion({
				header: 'h3',
				collapsible: true,
				autoHeight: true,
				active: false,
				change: function() {
					self.layout.resizeAll();
				}
			});

			this.layout = $(this.el).layout({
				applyDefaultStyles: true,
				hidable: false,
				closable: false,
				north__resizable: false,
				north__paneSelector: ".fields-selection-summary",
				center__paneSelector: ".fields-selection-items"
			});
		},
		updateQuery: function() {
			$(".fields-selection-summary .query", $(this.el)).html(this.getQuery());
		},
		getQuery: function() {
			var query = [];
			_.each(this.views, function(view) {
				var q = view.getQuery();
				if (q)
					query.push(view.getQuery());
			});
			return query.join("; ");
		},
		clearSelection: function() {
			_.each(this.views, function(view) {
				view.clearSelection();
			});
		}
	});

	var FieldSelectionReftime = Backbone.View.extend({
		initialize: function(opts) {
			this.stats = opts.stats;
		},
		render: function() {
			var tmpl = arkiweb.templates["fields-selection-reftime"](this.stats);
			$(this.el).html(tmpl);

			this.resetValues();

			var self = this;
			var opts = {
				dateFormat: 'yy-mm-dd',
				separator: ' ',
				timeFormat: 'hh:mm:ss',
				minDate: this.stats.b,
				maxDate: this.stats.e,
				changeMonth: true,
				changeYear: true,
				onSelect: function() {
					self.triggerSelection();
				}
			};
			
			$(this.el).find(".begin-value,.end-value").datetimepicker(opts);
		},
		resetValues: function() {
			$(this.el).find(".begin-value").val(this.stats.b.strftime("%Y-%m-%d %H:%M:%S"));
			$(this.el).find(".end-value").val(this.stats.e.strftime("%Y-%m-%d %H:%M:%S"));
		},
		events: {
			'click .begin': 'triggerSelection',
			'click .end': 'triggerSelection'
		},
		triggerSelection: function() {
			this.trigger("select", this);
		},
		clearSelection: function() {
			this.resetValues();
			$(this.el).find("*:checked").click();
			this.triggerSelection();
		},
		getQuery: function() {
			var begin = undefined;
			var end = undefined;

			if ($(this.el).find(".begin").is(":checked"))
				begin = $(this.el).find(".begin-value").val();
			if ($(this.el).find(".end").is(":checked"))
				end = $(this.el).find(".end-value").val();

			if (begin || end) {
				if (begin == end) {
					return "reftime: =" + begin;
				} else {
					var q = [];
					if (begin) 
						q.push(">= " + begin);
					if (end)   
						q.push("<= " + end);
					return "reftime: " + q.join(", ");
				}
			} else {
				return null;
			}
		}
	});

	var FieldsSelectionItem = Backbone.View.extend({
		render: function() {
			var tmpl = arkiweb.templates["fields-selection-item"](this.model.toJSON());
			$(this.el).html(tmpl);
		},
		events: {
			'click tbody tr.parsed': 'toggleSelection'
		},
		toggleSelection: function(ev) {
			var tr = $(ev.currentTarget);
			tr.toggleClass("selected");
			this.trigger("select", this);
		},
		clearSelection: function() {
			$(this.el).find("tr.parsed.selected").click();
		},
		getQuery: function() {
			var query = [];
			$(this.el).find("tr.parsed.selected").each(function() {
				query.push($(this).find(".query").text());
			});
			if (query.length == 0) {
				return null;
			}
			try {
				query = ArkiwebParser[this.model.get("type")].decode(query);
			} catch (e) {
				return null;
			}
			return query;
		}
	});

	this.arkiweb.views.FieldsSelection = FieldsSelection;
}());
(function() {
	var Summary = Backbone.View.extend({
		initialize: function(opts) {
			this.collection.bind("reset", this.render, this);
		},
		views: [],
		render: function() {
			var tmpl = arkiweb.templates["summary"](this.collection);
			$(this.el).html(tmpl);
			this.views = [];

			var content = $(this.el).find(".summary-items");

			this.collection.each(function(model) {
				var view = new SummaryItem({
					model: model
				});
				this.views.push(view);
				view.render();
				content.append(view.el);
				view.bind("select", this.updateQuery, this);
			}, this);
		}
	});

	var SummaryItem = Backbone.View.extend({
		render: function() {
			var tmpl = arkiweb.templates["summary-item"](this.model.toJSON());
			$(this.el).html(tmpl);
		}
	});

	this.arkiweb.views.Summary = Summary;
}());
(function() {
	var Postprocessors = Backbone.View.extend({
		initialize: function(opts) {
			this.datasets = opts.datasets;
			this.datasets.bind("select", this.update, this);

			this.map = opts.map;
		},
		colors: [
			"green",
			"blue",
			"red",
			"orange"
		],
		postprocessors: [],
		render: function() {
			var i = 0;
			_.each(arkiweb.postprocessors, function(klass, name) {
				var p = new PostprocessorContainer({
					name: name,
					map: this.map,
					postprocessor: klass,
					color: this.colors[i % this.colors.length]
				});
				i++;
				p.render();
				$(this.el).append(p.el);

				this.postprocessors.push(p);
			}, this);


			this.update();
		},
		update: function() {
			var datasets = this.datasets.getSelected();
			var allowed = [];

			_.each(datasets, function(model) {
				allowed.push(model.get("postprocess"));
			}, this);


			allowed = _.intersection.apply(this, allowed);

			_.each(this.postprocessors, function(pp) {
				if (_.include(allowed, pp.options.name)) {
					pp.enable();
				} else {
					pp.disable();
				}
			});
		},
		getCommand: function() {
			var cmd = null;
			_.each(this.postprocessors, function(pp) {
				if (pp.isSelected()) {
					cmd = pp.getCommand();
				}
			});
			return cmd;
		}
	});

	var PostprocessorContainer = Backbone.View.extend({
		className: "postprocessor",
		initialize: function(opts) {
			var klass = this.options.postprocessor;
			if (this.options.color) {
				this.color = this.options.color;
			}
			this.postprocessor = new klass({
				map: this.options.map,
				color: this.color
			});
		},
		color: 'black',
		render: function() {
			var tmpl = arkiweb.templates["postprocessor"];
			$(this.el).html(tmpl({
				name: this.options.name
			}));
			this.postprocessor.render();
			$(this.el).append(this.postprocessor.el);
			$(this.el).find(".title").css("color", this.color);
		},
		events: {
			'click .postprocessor-checkbox': 'toggleSelection'
		},
		toggleSelection: function(ev) {
			$(this.el).toggleClass("selected");
			var checked = $(this.el).hasClass("selected");
			if (checked) {
				// Baaaad
				$(this.el).siblings().find(".postprocessor-checkbox:checked").click();
				this.postprocessor.activate();
			} else {
				this.postprocessor.deactivate();
			}
		},
		isSelected: function() {
			return $(this.el).find(".postprocessor-checkbox").is(":checked");
		},
		enable: function() {
			$(this.el).find(".postprocessor-checkbox").removeAttr("disabled");
		},
		disable: function() {
			this.postprocessor.deactivate();
            $(this.el).removeClass("selected");
			$(this.el).find(".postprocessor-checkbox:checked").attr("checked", false);
			$(this.el).find(".postprocessor-checkbox").attr("disabled", "disabled");
		},
		getCommand: function() {
			return this.postprocessor.getCommand();
		}
	});

	var PostprocessorControl = Backbone.View.extend({
		className: "postprocessor-content",
		activate: function() {},
		deactivate: function() {},
		getCommand: function() {
			return null;
		}
	});

	this.arkiweb.views.Postprocessors = Postprocessors;
	this.arkiweb.views.PostprocessorControl = PostprocessorControl;
}());
(function() {
  this.arkiweb.templates || (this.arkiweb.templates = {});
  this.arkiweb.templates["application"] = function(__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
        __out.push('<div class="header">\n</div>\n\n<div class="content">\n\t<div class="selection">\n\t\t<div class="datasets">\n\t\t\t<div class="datasets-menu">\n\t\t\t\t<button class="toggle-disallowed">toggle disallowed datasets</button>\n\t\t\t\t<button class="clear-selection">clear selection</button>\n\t\t\t\t<button class="submit-selection">load selected datasets</button>\n\t\t\t</div>\n\t\t\t<div class="datasets-content">\n\t\t\t</div>\n\t\t</div>\n\t\t<div class="fields">\n\t\t\t<div class="fields-menu">\n\t\t\t\t<button class="show-datasets">back to datasets selection</button>\n\t\t\t\t<button class="clear-selection">clear selection</button>\n\t\t\t\t<button class="submit-selection">load summary</button>\n\t\t\t</div>\n\t\t\t<div class="fields-content">\n\t\t\t</div>\n\t\t</div>\n\t\t<div class="summary">\n\t\t\t<div class="summary-menu">\n\t\t\t\t<button class="show-datasets">back to datasets selection</button>\n\t\t\t\t<button class="show-fields">back to fields selection</button>\n\t\t\t\t<button class="show-postprocessors">choose a postprocessor</button>\n\t\t\t</div>\n\t\t\t<div class="summary-content">\n\t\t\t</div>\n\t\t</div>\n\t\t<div class="postprocessors">\n\t\t\t<div class="postprocessors-menu">\n\t\t\t\t<button class="show-datasets">back to datasets selection</button>\n\t\t\t\t<button class="show-fields">back to fields selection</button>\n\t\t\t\t<button class="download-selection">download the selected data</button>\n\t\t\t</div>\n\t\t\t<div class="postprocessors-content">\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\t<div class="map">\n\t</div>\n</div>\n\n<div class="footer">\n\t<p class="copyright">Copyright &copy; 2011 <a href="http://www.arpa.emr.it/sim/" target="_blank">ARPA-SIMC Emilia-Romagna</a> - released under <a href="http://www.gnu.org/licenses/gpl.html" target="_blank">GNU General Public License</a></p>\n\t<p class="version">version ');
      
        __out.push(__sanitize(arkiweb.version));
      
        __out.push('</p>\n</div>\n');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  };
}).call(this);
(function() {
  this.arkiweb.templates || (this.arkiweb.templates = {});
  this.arkiweb.templates["datasets-selection"] = function(__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
        __out.push('<div class="selected-datasets">\n\t<b>selected datasets: </b><span class="selected-datasets-list"></span>\n</div>\n<div class="datasets-table">\n\t<table>\n\t\t<thead>\n\t\t\t<tr>\n\t\t\t\t<td>name</td>\n\t\t\t\t<td>description</td>\n\t\t\t\t<td>postprocessors</td>\n\t\t\t</tr>\n\t\t</thead>\n\t\t<tbody class="datasets-list">\n\t\t</tbody>\n\t</table>\n</div>\n');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  };
}).call(this);
(function() {
  this.arkiweb.templates || (this.arkiweb.templates = {});
  this.arkiweb.templates["datasets-selection-item"] = function(__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
        __out.push('<td>');
      
        __out.push(__sanitize(this.name));
      
        __out.push('</td>\n<td>');
      
        __out.push(__sanitize(this.description));
      
        __out.push('</td>\n<td>');
      
        __out.push(__sanitize(this.postprocess.join(",")));
      
        __out.push('</td>\n');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  };
}).call(this);
(function() {
  this.arkiweb.templates || (this.arkiweb.templates = {});
  this.arkiweb.templates["fields-selection"] = function(__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
        __out.push('<div class="fields-selection-summary">\n\t<p>\n\t');
      
        if (this.stats.c === 0) {
          __out.push('\n\t\tempty selection\n\t');
        } else {
          __out.push('\n\t\t<b>count: </b>');
          __out.push(__sanitize(this.stats.c));
          __out.push('\n\t\t<b>size: </b>');
          __out.push(__sanitize(this.stats.s));
          __out.push('\n\t\t<b>from: </b>');
          __out.push(__sanitize(this.stats.b.strftime("%Y-%m-%d %H:%M:%S")));
          __out.push('\n\t\t<b>until: </b>');
          __out.push(__sanitize(this.stats.e.strftime("%Y-%m-%d %H:%M:%S")));
          __out.push('\n\t');
        }
      
        __out.push('\n\t</p>\n\t<p><b>query: </b><span class="query"></span></p>\n</div>\n<div class="fields-selection-items">\n</div>\n');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  };
}).call(this);
(function() {
  this.arkiweb.templates || (this.arkiweb.templates = {});
  this.arkiweb.templates["fields-selection-item"] = function(__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
        var className, e, i, len, query, ref, value;
      
        __out.push('<h3><a>');
      
        __out.push(__sanitize(this.type));
      
        __out.push('</a></h3>\n<div>\n\t<table>\n\t\t<thead>\n\t\t\t<tr>\n\t\t\t\t<td>query</td>\n\t\t\t\t<td>description</td>\n\t\t\t</tr>\n\t\t</thead>\n\t\t<tbody>\n\t\t\t');
      
        ref = this.values;
        for (i = 0, len = ref.length; i < len; i++) {
          value = ref[i];
          __out.push('\n\t\t\t\t');
          query = void 0;
          __out.push('\n\t\t\t\t');
          className = "parsed";
          __out.push('\n\t\t\t\t');
          try {
            __out.push('\n\t\t\t\t\t');
            query = ArkiwebParser[this.type].decode(value);
            __out.push('\n\t\t\t\t');
          } catch (error) {
            e = error;
            __out.push('\n\t\t\t\t\t');
            query = void 0;
            __out.push('\n\t\t\t\t\t');
            className = "unparsed";
            __out.push('\n\t\t\t\t');
          }
          __out.push('\n\t\t\t\t\n\t\t\t\t<tr class="');
          __out.push(__sanitize(className));
          __out.push('">\n\t\t\t\t\t<td class="query">');
          __out.push(__sanitize(query));
          __out.push('</td>\n\t\t\t\t\t<td class="description">');
          __out.push(__sanitize(value.desc));
          __out.push('</td>\n\t\t\t\t</tr>\n\t\t\t');
        }
      
        __out.push('\n\t\t</tbody>\n\t</table>\n</div>\n');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  };
}).call(this);
(function() {
  this.arkiweb.templates || (this.arkiweb.templates = {});
  this.arkiweb.templates["fields-selection-reftime"] = function(__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
        __out.push('<h3><a>reftime</a></h3>\n<div>\n\t<input class="begin" type="checkbox"/>\n\t<b>from: </b>\n\t<input class="begin-value" type="text" size="22"/>\n\t<input class="end" type="checkbox"/>\n\t<b>until: </b>\n\t<input class="end-value" type="text" size="22"/>\n</div>\n');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  };
}).call(this);
(function() {
  this.arkiweb.templates || (this.arkiweb.templates = {});
  this.arkiweb.templates["summary"] = function(__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
        __out.push('<div class="summary-stats">\n\t<p>\n\t');
      
        if (this.stats.c === 0) {
          __out.push('\n\t\tempty selection\n\t');
        } else {
          __out.push('\n\t\t<b>count: </b>');
          __out.push(__sanitize(this.stats.c));
          __out.push('\n\t\t<b>size: </b>');
          __out.push(__sanitize(this.stats.s));
          __out.push('\n\t\t<b>from: </b>');
          __out.push(__sanitize(this.stats.b.strftime("%Y-%m-%d %H:%M:%S")));
          __out.push('\n\t\t<b>until: </b>');
          __out.push(__sanitize(this.stats.e.strftime("%Y-%m-%d %H:%M:%S")));
          __out.push('\n\t');
        }
      
        __out.push('\n\t</p>\n</div>\n<div class="summary-items">\n</div>\n');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  };
}).call(this);
(function() {
  this.arkiweb.templates || (this.arkiweb.templates = {});
  this.arkiweb.templates["summary-item"] = function(__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
        var className, e, i, len, query, ref, value;
      
        __out.push('<h3><a>');
      
        __out.push(__sanitize(this.type));
      
        __out.push('</a></h3>\n<div>\n\t<table>\n\t\t<thead>\n\t\t\t<tr>\n\t\t\t\t<td>query</td>\n\t\t\t\t<td>description</td>\n\t\t\t</tr>\n\t\t</thead>\n\t\t<tbody>\n\t\t\t');
      
        ref = this.values;
        for (i = 0, len = ref.length; i < len; i++) {
          value = ref[i];
          __out.push('\n\t\t\t\t');
          query = void 0;
          __out.push('\n\t\t\t\t');
          className = "parsed";
          __out.push('\n\t\t\t\t');
          try {
            __out.push('\n\t\t\t\t\t');
            query = ArkiwebParser[this.type].decode(value);
            __out.push('\n\t\t\t\t');
          } catch (error) {
            e = error;
            __out.push('\n\t\t\t\t\t');
            query = void 0;
            __out.push('\n\t\t\t\t\t');
            className = "unparsed";
            __out.push('\n\t\t\t\t');
          }
          __out.push('\n\t\t\t\t\n\t\t\t\t<tr class="');
          __out.push(__sanitize(className));
          __out.push('">\n\t\t\t\t\t<td class="query">');
          __out.push(__sanitize(query));
          __out.push('</td>\n\t\t\t\t\t<td class="description">');
          __out.push(__sanitize(value.desc));
          __out.push('</td>\n\t\t\t\t</tr>\n\t\t\t');
        }
      
        __out.push('\n\t\t</tbody>\n\t</table>\n</div>\n');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  };
}).call(this);
(function() {
  this.arkiweb.templates || (this.arkiweb.templates = {});
  this.arkiweb.templates["postprocessor"] = function(__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
        __out.push('<h3><input type="checkbox" name="postprocessor" class="postprocessor-checkbox"/><span class="title">');
      
        __out.push(__sanitize(this.name));
      
        __out.push('</span></h3>\n');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  };
}).call(this);
(function() {
	var Singlepoint = arkiweb.views.PostprocessorControl.extend({
		initialize: function(opts) {
			this.layer = new OpenLayers.Layer.Vector("singlepoint", {
				style: {
					strokeColor: this.options.color,
					strokeOpacity: "0.5",
					strokeWidth: 2,
					fillColor: this.options.color,
					fillOpacity: "0.5",
					pointRadius: 3
				}
			});
			this.control = new OpenLayers.Control();

			var self = this;
			OpenLayers.Util.extend(this.control, {
				draw: function() {
					this.point = new OpenLayers.Handler.Point(self.control, {
						"done": this.notice
					});
				},
				activate: function() {
					this.point.activate();
				},
				deactivate: function() {
					this.point.deactivate();
				},
				notice: function(p) {
					self.updateInput({
						x: p.x,
						y: p.y
					});
				}
			});
			this.options.map.addControl(this.control);
			this.options.map.addLayer(this.layer);
		},
		render: function() {
			$(this.el).html("lat <input type='text' name='lat'/> \
                            lon <input type='text' name='lon'/> \
                            format <select name='format'> \
                                <option selected value='BUFR'>BUFR</option> \
                                <option value='CREX'>CREX</option> \
                                <option value='JSON'>JSON</option> \
                            </select> \
                            interpolation <select name='interpolation'> \
                                <option selected value='bilin'>bilinear</option> \
                                <option value='near'>nearest point</option> \
                            </select>");
		},
		events: {
			"change input[type=text]": "onChangeInputCoords"
		},
		activate: function() {
			this.layer.setVisibility(true);
			this.control.activate();
		},
		deactivate: function() {
			this.layer.setVisibility(false);
			this.control.deactivate();
		},
		updateInput: function(coords) {
			$(this.el).find("input[name=lon]").val(coords.x);
			$(this.el).find("input[name=lat]").val(coords.y).trigger('change');
		},
		updateMap: function(coords) {
			var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(coords.x, coords.y));
			this.layer.destroyFeatures();
			this.layer.addFeatures([feature]);
		},
		onChangeInputCoords: function() {
			this.updateMap({
				x: $(this.el).find("input[name=lon]").val(),
				y: $(this.el).find("input[name=lat]").val()
			});
		},
		getCommand: function() {
			return "singlepoint " +
                " -f " + $(this.el).find("select[name=format]").val() +
                " -z " + $(this.el).find("select[name=interpolation]").val() +
                " " + $(this.el).find("input[name=lon]").val() +
                " " + $(this.el).find("input[name=lat]").val();
		}
	});

	this.arkiweb.postprocessors.singlepoint = Singlepoint;
}());
(function() {
	var Subarea = arkiweb.views.PostprocessorControl.extend({
		initialize: function(opts) {
			this.layer = new OpenLayers.Layer.Vector("subarea", {
				style: {
					strokeColor: this.options.color,
					strokeOpacity: "0.5",
					strokeWidth: 2,
					fillColor: this.options.color,
					fillOpacity: "0.5",
					pointRadius: 3
				}
			});
			this.control = new OpenLayers.Control();

			var self = this;
			OpenLayers.Util.extend(this.control, {
				draw: function() {
					this.box = new OpenLayers.Handler.Box(self.control, {
						"done": this.notice
					});
				},
				activate: function() {
					this.box.activate();
				},
				deactivate: function() {
					this.box.deactivate();
				},
				notice: function(bounds) {
					var ll = this.map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.left, bounds.bottom));
					var ur = this.map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.right, bounds.top));

					self.updateInput({
						x: ll.lon,
						y: ll.lat,
						X: ur.lon,
						Y: ur.lat
					});
				}
			});
			this.options.map.addControl(this.control);
			this.options.map.addLayer(this.layer);
		},
		render: function() {
			$(this.el).html("lat1 <input type='text' name='lat1'/> lon1 <input type='text' name='lon1'/> lat2 <input type='text' name='lat2'/> lon2 <input type='text' name='lon2'/>");
		},
		events: {
			"change input[type=text]": "onChangeInputCoords"
		},
		activate: function() {
			this.layer.setVisibility(true);
			this.control.activate();
		},
		deactivate: function() {
			this.layer.setVisibility(false);
			this.control.deactivate();
		},
		updateInput: function(coords) {
			$(this.el).find("input[name=lon1]").val(coords.x);
			$(this.el).find("input[name=lon2]").val(coords.X);
			$(this.el).find("input[name=lat1]").val(coords.y);
			$(this.el).find("input[name=lat2]").val(coords.Y).trigger("change");
		},
		updateMap: function(coords) {
			var points = [
				new OpenLayers.Geometry.Point(coords.x, coords.y),
				new OpenLayers.Geometry.Point(coords.X, coords.y),
				new OpenLayers.Geometry.Point(coords.X, coords.Y),
				new OpenLayers.Geometry.Point(coords.x, coords.Y),
				new OpenLayers.Geometry.Point(coords.x, coords.y)
			];
			
			var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LinearRing(points));
			this.layer.destroyFeatures();
			this.layer.addFeatures([feature]);
		},
		onChangeInputCoords: function() {
			var coords = {
				x: $(this.el).find("input[name=lon1]").val(),
				y: $(this.el).find("input[name=lat1]").val(),
				X: $(this.el).find("input[name=lon2]").val(),
				Y: $(this.el).find("input[name=lat2]").val()
			};
			this.updateMap(coords);
		},
		getCommand: function() {
			var lons = [ $(this.el).find("input[name=lon1]").val(), $(this.el).find("input[name=lon2]").val() ];
			var lats = [ $(this.el).find("input[name=lat1]").val(), $(this.el).find("input[name=lat2]").val() ];
			return "subarea " + _.min(lons) + " " + _.min(lats) + " " + _.max(lons) + " " + _.max(lats);
		}
	});

	this.arkiweb.postprocessors.subarea = Subarea;
}());
(function() {
	var Seriet = arkiweb.views.PostprocessorControl.extend({
		initialize: function(opts) {
			this.layer = new OpenLayers.Layer.Vector("seriet", {
				style: {
					strokeColor: this.options.color,
					strokeOpacity: "0.5",
					strokeWidth: 2,
					fillColor: this.options.color,
					fillOpacity: "0.5",
					pointRadius: 3
				}
			});
			this.control = new OpenLayers.Control();

			var self = this;
			OpenLayers.Util.extend(this.control, {
				draw: function() {
					this.point = new OpenLayers.Handler.Point(self.control, {
						"done": this.notice
					});
				},
				activate: function() {
					this.point.activate();
				},
				deactivate: function() {
					this.point.deactivate();
				},
				notice: function(p) {
					self.updateInput({
						x: p.x,
						y: p.y
					});
				}
			});
			this.options.map.addControl(this.control);
			this.options.map.addLayer(this.layer);
		},
		render: function() {
			$(this.el).html("lat <input type='text' name='lat'/> lon <input type='text' name='lon'/>");
		},
		events: {
			"change input[type=text]": "onChangeInputCoords"
		},
		activate: function() {
			this.layer.setVisibility(true);
			this.control.activate();
		},
		deactivate: function() {
			this.layer.setVisibility(false);
			this.control.deactivate();
		},
		updateInput: function(coords) {
			$(this.el).find("input[name=lon]").val(coords.x);
			$(this.el).find("input[name=lat]").val(coords.y).trigger('change');
		},
		updateMap: function(coords) {
			var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(coords.x, coords.y));
			this.layer.destroyFeatures();
			this.layer.addFeatures([feature]);
		},
		onChangeInputCoords: function() {
			this.updateMap({
				x: $(this.el).find("input[name=lon]").val(),
				y: $(this.el).find("input[name=lat]").val()
			});
		},
		getCommand: function() {
			return "seriet " + $(this.el).find("input[name=lon]").val() + " " + $(this.el).find("input[name=lat]").val();
		}
	});

	this.arkiweb.postprocessors.seriet = Seriet;
}());
(function() {
	var JsonPostproc = arkiweb.views.PostprocessorControl.extend({
		initialize: function(opts) {
		},
		render: function() {
            $(this.el).html("format <select name='format'>" +
                "<option selected='selected' value='dbajson'>Dballe JSON</option>" +
                "<option value='geojson'>GeoJSON</option>" +
                "</select>");
        },
		events: {
		},
		activate: function() {
		},
		deactivate: function() {
		},
		getCommand: function() {
			return "json " + "-f " + $(this.el).find("select[name=format]").val();
		}
	});

	this.arkiweb.postprocessors.json = JsonPostproc;
}());
