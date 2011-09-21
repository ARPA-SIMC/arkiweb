// Author: Emanuele Di Giacomo <edigiacomo@arpa.emr.it>
(function() {
	var arkiweb = {
		models : {},
		collections: {},
		views: {},
		routers: {}
	};
	arkiweb.models.Dataset = Backbone.Model.extend({
		initialize: function(attributes) {
			this.id = attributes.id;
			this.name = attributes.name;
			this.description = attributes.description;
			this.postprocess = attributes.postprocess;
			this.bounding = attributes.bounding;
			try {
				this.features = new OpenLayers.Format.WKT().read(this.bounding);
			} catch (e) {
				this.features = null;
			}
		}
	});
	arkiweb.models.FieldValue = Backbone.Model.extend({
		initialize: function(attributes) {
			try {
				this.query = ArkiwebParser[attributes.type].styles[attributes.value.s].decode(attributes.value);
			} catch (e) {
				this.query = undefined;
			}
		}
	});
	arkiweb.models.Field = Backbone.Model.extend({
		initialize: function(attributes) {
			this.collection = new arkiweb.collections.FieldValues();
			_.each(attributes.values, function(value) {
				var value = {
					type: this.get('type'),
					value: value
				};
				var model = new arkiweb.models.FieldValue(value);
				this.collection.add(model);
			}, this);
		}
	});
	arkiweb.collections.Datasets = Backbone.Collection.extend({
		model: arkiweb.models.Dataset,
		url: 'datasets'
	});
	arkiweb.collections.FieldValues = Backbone.Collection.extend({
		model: arkiweb.models.FieldValue,
		url: ""
	});
	arkiweb.collections.Fields = Backbone.Collection.extend({
		model: arkiweb.models.Field,
		url: 'fields',
		parse: function(response) {
			if (!response.stats.b || !response.stats.e) {
				this.stats = null
			} else {
				response.stats.b[1] -= 1;
				response.stats.e[1] -= 1;
				this.stats = {
					begin: eval("new Date(" + response.stats.b.join(",") + ")"),
					end: eval("new Date(" + response.stats.e.join(",") + ")"),
					count: response.stats.c,
					size: response.stats.s
				};
			}
			return response.fields;
		}
	});
	arkiweb.views.DatasetsSelection = Backbone.View.extend({
		events: {
			'click .arkiweb-datasets-selection-menu .arkiweb-datasets-selection-clear-selection': 'clearSelection',
			'click .arkiweb-datasets-selection-menu .arkiweb-datasets-selection-submit-selection': 'submitSelection',
			'click .arkiweb-datasets-selection-menu .arkiweb-datasets-seclection-toggle-allowed': 'toggleAllowed'
		},
		initialize: function() {
			this.content = $(this.el).find(".arkiweb-datasets-selection-list");
			this.buttons.submit = $(this.el).find(".arkiweb-datasets-selection-menu .arkiweb-datasets-selection-submit-selection");
			this.buttons.clear = $(this.el).find(".arkiweb-datasets-selection-menu .arkiweb-datasets-selection-clear-selection");
			this.buttons.toggle = $(this.el).find(".arkiweb-datasets-selection-menu .arkiweb-datasets-seclection-toggle-allowed");

			this.buttons.submit.attr('disabled', true);
			this.buttons.clear.attr('disabled', true);

			this.collection.bind('reset', this.render, this);
			this.collection.bind('error', this.renderError, this);
		},
		views: [],
		buttons: {
			submit: null,
			clear: null,
			toggle: null
		},
		empty: function() {
			return this.content.empty();
		},
		render: function() {
			this.empty();
			this.views = [];
			this.collection.each(function(model) {
				var el = $("<div>");
				this.content.append(el);
				var view = new arkiweb.views.DatasetsSelectionItem({
					model: model,
					el: el
				});
				view.render();
				this.views.push(view);
				view.bind("change", this.notifyChange, this);
			}, this);
			return this;
		},
		renderError: function(model, error) {
			var view = new arkiweb.views.Error({ 
				el: $(this.content),
				message: "Error while loading datasets: " + error.statusText
			});
			view.render();
			this.views.push(view);
			return this;
		},
		notifyChange: function(view) {
			this.buttons.submit.attr('disabled', this.getSelected().length == 0);
			this.buttons.clear.attr('disabled', this.getSelected().length == 0);
			this.trigger("change", view);
		},
		submitSelection: function() {
			this.trigger('submit');
		},
		clearSelection: function() {
			_.each(this.views, function(view) {
				view.setSelection(false);
			});
		},
		toggleAllowed: function() {
			$(this.content).find('*[allowed=false]').toggleClass("hidden");
		},
		getSelected: function() {
			return _.select(this.views, function(view) {
				return view.isSelected();
			}, this);
		}
	});
	arkiweb.views.DatasetsSelectionItem = Backbone.View.extend({
		events: {
			'click .arkiweb-dataset-name': 'showDataset',
			'click input:checkbox': 'notifyChange'
		},
		tmpl: "#arkiweb-datasets-selection-item-tmpl",
		render: function() {
			var tmpl = $(this.tmpl).tmpl(this.model.toJSON());
			$(this.el).append(tmpl);
			this.checkbox = $(this.el).find("input:checkbox").get(0);
			return this;
		},
		notifyChange: function() {
			this.trigger("change", this);
		},
		isSelected: function() {
			return $(this.checkbox).is(':checked');
		},
		setSelection: function(value) {
			if ((value && !this.isSelected()) || (!value && this.isSelected())) {
				this.checkbox.click();
			}
			return this;
		},
		showDataset: function() {
			var div = $("<div>");
			var tmpl = $("#arkiweb-dataset-description-tmpl").tmpl(this.model.toJSON());
			div.append(tmpl);
			div.dialog({
				title: this.model.name,
				autoOpen: true,
				modal: true,
				close: function() {
					$(this).remove();
				}
			});
		}
	});
	arkiweb.views.Map = Backbone.View.extend({
		initialize: function(options) {
			this.map = new OpenLayers.Map();
			this.map.addControl(new OpenLayers.Control.LayerSwitcher());
			this.map.addControl(new OpenLayers.Control.MousePosition());
			var layer = new OpenLayers.Layer.WMS("OpenLayers WMS",
							     "http://vmap0.tiles.osgeo.org/wms/vmap0", {
								     layers: 'basic'
							     });
			this.map.addLayer(layer);
			this.blayer = new OpenLayers.Layer.Vector("datasets bounding box");
			this.map.addLayer(this.blayer);
			this.view = options.view;
			this.view.bind("change", this.updateDatasetsFeatures, this);
		},
		render: function() {
			this.map.render($(this.el).get(0));
			this.map.zoomToMaxExtent();
		},
		updateDatasetsFeatures: function(view) {		
			var features = view.model.features;
			if (features) {
				if (view.isSelected()) {
					this.blayer.addFeatures([features]);
				} else {
					this.blayer.removeFeatures([features]);
				}
			}
			this.resizeMap();
		},
		resizeMap: function() {
			var extent = this.blayer.getDataExtent();
			if (extent) {
				this.map.zoomToExtent(extent);
			} else {
				this.map.zoomToMaxExtent();
			}
		}
	});
	arkiweb.views.FieldsSelection = Backbone.View.extend({
		events: {
			'click .arkiweb-fields-selection-menu .arkiweb-fields-selection-toggle-query': 'toggleQuery',
			'click .arkiweb-fields-selection-menu .arkiweb-fields-selection-show-query': 'showQuery',
			'click .arkiweb-fields-selection-menu .arkiweb-fields-selection-clear-selection': 'clearSelection',
			'click .arkiweb-fields-selection-menu .arkiweb-fields-selection-submit-selection': 'submitSelection',
			'click .arkiweb-fields-selection-menu .arkiweb-fields-selection-download-selection': 'downloadSelection'
		},
		initialize: function() {
			this.collection.bind('reset', this.render, this);
			this.collection.bind('error', this.renderError, this);
			this.content = $(this.el).find('.arkiweb-fields-selection-content');
			this.buttons.toggleQuery = $(this.el).find(".arkiweb-fields-selection-menu .arkiweb-fields-selection-toggle-query");
			this.buttons.showQuery = $(this.el).find(".arkiweb-fields-selection-menu .arkiweb-fields-selection-show-query");
			this.buttons.clear = $(this.el).find(".arkiweb-fields-selection-menu .arkiweb-fields-selection-clear-selection");
			this.buttons.submit = $(this.el).find(".arkiweb-fields-selection-menu .arkiweb-fields-selection-submit-selection");
			this.buttons.download = $(this.el).find(".arkiweb-fields-selection-menu .arkiweb-fields-selection-download-selection");

			_.each(this.buttons, function(button) {
				button.attr('disabled', true);
			});

		},
		buttons: {},
		views: [],
		render: function() {
			_.each(this.buttons, function(button) {
				button.attr('disabled', this.collection.length == 0);
			}, this);

			this.content.empty();
			this.views = [];

			var div = $("<div>");
			this.content.append(div);
			if (this.collection.stats) {
				var view = new arkiweb.views.FieldsSelectionStatsSection({
					model: this.collection,
					el: div
				});
				view.render();
				this.views.push(view);
			}

			this.collection.each(function(model) {
				var div = $("<div>");
				this.content.append(div);
				var view = new arkiweb.views.FieldsSelectionSection({
					model: model,
					el: div
				});
				view.render();
				this.views.push(view);
			}, this);

			return this;
		},
		renderError: function(model, error) {
			this.content.empty();
			var view = new arkiweb.views.Error({ 
				el: $(this.content),
				message: "Error while loading fields: " + error.statusText
			});
			view.render();
			this.views.push(view);
			return this;
		},
		toggleQuery: function() {
			_.each(this.views, function(view) {
				view.toggleQuery();
			}, this);
		},
		showQuery: function() {
			alert(this.query());
		},
		clearSelection: function() {
			_.each(this.views, function(view) {
				view.clearSelection();
			});
		},
		query: function() {
			var queries = _.select(_.map(this.views, function(view) {
				return view.query();
			}, this), function(query) {
				return query;
			}, this);
			return queries.join(";");
		},
		submitSelection: function() {
			this.trigger('submit');
		},
		downloadSelection: function() {
			this.trigger('download');
		}
	});
	arkiweb.views.FieldsSelectionStatsSection = Backbone.View.extend({
		tmpl: '#arkiweb-fields-selection-stats-section-tmpl',
		render: function() {
			var tmpl = $(this.tmpl).tmpl(this.model.stats);
			$(this.el).append(tmpl);
			$(this.el).find("input").datetimepicker({
				minDate: this.model.stats.begin,
				maxDate: this.model.stats.end,
				timeFormat: 'hh:mm:ss',
				dateFormat: 'yy-mm-dd'
			});
			$(this.el).find("input[name=from]").datetimepicker('setDate', this.model.stats.begin);
			$(this.el).find("input[name=until]").datetimepicker('setDate', this.model.stats.end);
		},
		clearSelection: function() {
			$(this.el).find("input[name=from]").datetimepicker('setDate', this.model.stats.begin);
			$(this.el).find("input[name=until]").datetimepicker('setDate', this.model.stats.end);
		},
		query: function() {
			var begin = $(this.el).find("input[name=from]").val();
			var end = $(this.el).find("input[name=until]").val();
			return 'reftime: >= ' + begin + ", <= " + end;
		},
		toggleQuery: function() {}
	});
	arkiweb.views.FieldsSelectionSection = Backbone.View.extend({
		tmpl: '#arkiweb-fields-selection-section-tmpl',
		events: {
			'click h3': 'toggleSection'
		},
		views: [],
		render: function() {
			var tmpl = $(this.tmpl).tmpl(this.model.toJSON());
			$(this.el).append(tmpl);
			$(this.el).find(".arkiweb-fields-selection-section-list").addClass("hidden");
			this.views = [];
			this.model.collection.each(function(model) {
				var div = $("<div>");
				$(this.el).find(".arkiweb-fields-selection-section-list").append(div);
				var view = new arkiweb.views.FieldsSelectionSectionItem({
					model: model,
					el: div
				});
				view.render();
				this.views.push(view);
			}, this);
		},
		toggleQuery: function() {
			_.each(this.views, function(view) {
				view.toggleQuery();
			}, this);
		},
		toggleSection: function() {
			$(this.el).find(".arkiweb-fields-selection-section-list").toggleClass("hidden");
		},
		getSelected: function() {
			return _.select(this.views, function(view) {
				return view.isSelected();
			});
		},
		query: function() {
			var selected = this.getSelected();
			if (selected.length == 0)
				return null;
			var queries = _.map(selected, function(view) {
				return view.model.query
			});
			var query;
			try {
				query = ArkiwebParser[this.model.get('type')].decode(queries);
			} catch (e) {
				query = null;
			}
			return query;
		},
		clearSelection: function() {
			_.each(this.views, function(view) {
				view.setSelection(false);
			});
		}
	});
	arkiweb.views.FieldsSelectionSectionItem = Backbone.View.extend({
		tmpl: '#arkiweb-fields-selection-section-item-tmpl',
		render: function() {
			var description = this.model.get('value').desc;
			var query = this.model.query;
			var tmpl = $(this.tmpl).tmpl({
				description: this.model.get('value').desc,
				query: this.model.query
			});
			$(this.el).append(tmpl);

			if (!this.model.query) {
				tmpl.find("input").attr('disabled', true);
			}

			tmpl.find('.arkiweb-field-query').addClass("hidden");
		},
		isSelected: function() {
			return $(this.el).find("input").is(":checked");
		},
		toggleQuery: function() {
			$(this.el).find(".arkiweb-field-description, .arkiweb-field-query").toggleClass("hidden");
		},
		setSelection: function(value) {
			var checkbox = $(this.el).find("input");
			if ((value && !this.isSelected()) || (!value && this.isSelected())) {
				checkbox.click();
			}
		}
	});

	arkiweb.views.Summary = Backbone.View.extend({
		tmpl: '#arkiweb-summary-tmpl',
		events: {
			'click button': 'toggleQuery'
		},
		initialize: function(options) {
			this.collection.bind("reset", this.render, this);
		},
		render: function() {
			this.el.empty();
			this.views = [];

			var tmpl = $(this.tmpl).tmpl();
			this.el.append(tmpl);

			var div = $(this.el).find(".arkiweb-summary-stats");
			var view = new arkiweb.views.SummaryStats({
				model: this.collection,
				el: div
			});
			view.render();
			this.views.push(view);

			this.collection.each(function(model) {
				var div = $("<div>");
				tmpl.find(".arkiweb-summary-content").append(div);
				var view = new arkiweb.views.SummarySection({
					model: model,
					el: div
				});
				view.render();
				this.views.push(view);
			}, this);

			$(this.el).dialog({
				title: 'summary',
				autoOpen: true,
				modal: true,
				close: function() {
					$(this).remove()
				},
				height: $(document).height() / 2,
				width: $(document).width() / 2,
			});
			$(this.el).layout({
				center__applyDefaultStyles: true,
				center__paneSelector: '.arkiweb-summary'
			});
			$(this.el).find(".arkiweb-summary").layout({
				center__applyDefaultStyles: true,
				north__paneSelector: '.arkiweb-summary-menu',
				center__paneSelector: '.arkiweb-summary-content'
			});
		},
		toggleQuery: function() {
			$(this.el).find(".arkiweb-summary-query, .arkiweb-summary-description").toggleClass("hidden");
		}
	});
	arkiweb.views.SummaryStats = Backbone.View.extend({
		tmpl: '#arkiweb-summary-stats-tmpl',
		render: function() {
			var tmpl = $(this.tmpl).tmpl(this.model.stats);
			$(this.el).append(tmpl);
		}
	});
	arkiweb.views.SummarySection = Backbone.View.extend({
		tmpl: '#arkiweb-summary-section-tmpl',
		render: function() {
			var tmpl = $(this.tmpl).tmpl(this.model.toJSON());
			$(this.el).append(tmpl);
			this.views = [];
			this.model.collection.each(function(model) {
				var div = $("<div>");
				$(this.el).find('.arkiweb-summary-section-list').append(div);
				var view = new arkiweb.views.SummarySectionItem({
					model: model,
					el: div
				});
				view.render();
				this.views.push(view);
			}, this);
		}
	});
	arkiweb.views.SummarySectionItem = Backbone.View.extend({
		tmpl: '#arkiweb-summary-section-item-tmpl',
		render: function() {
			var tmpl = $(this.tmpl).tmpl({
				description: this.model.get('value').desc,
				query: this.model.query
			});
			$(this.el).append(tmpl);
			tmpl.find(".arkiweb-summary-query").addClass("hidden");
		}
	});
	arkiweb.views.Error = Backbone.View.extend({
		initialize: function(options) {
			this.message = options.message
		},
		render: function() {
			$(this.el).append("<div class='error'>" + this.message + "</div>");
		}
	});
	arkiweb.views.Postprocessor = Backbone.View.extend({
		tmpl: '#arkiweb-postprocessor-tmpl',
		events: {
			'click input[name=arkiweb-postprocess-checkbox]': 'triggerSelection',
			'click .arkiweb-postprocessor-name': 'showHelp'
		},
		initialize: function(options) {
			var div = $("<div>");
			$(this.el).append(div);
			this.postprocessor = new options.postprocessor({
				map: options.map,
				datasets: options.datasets
			});
			this.name = this.postprocessor.name;
		},
		render: function() {
			var tmpl = $(this.tmpl).tmpl({
				name: this.postprocessor.name
			});
			$(this.el).append(tmpl);
			this.postprocessor.el = $(this.el).find(".arkiweb-postprocessor-item-content");
			this.checkbox = $(this.el).find(" input[name=arkiweb-postprocess-checkbox]").get(0);
			this.disable();
			this.postprocessor.render();
			$(this.el).css('color', this.postprocessor.color);
			return this;
		},
		disable: function() {
			$(this.checkbox).attr('checked', false);
			$(this.checkbox).attr('disabled', true);
			this.postprocessor.deactivate();
		},
		enable: function() {
			$(this.checkbox).attr('disabled', false);
		},
		triggerSelection: function() {
			this.trigger('change', this);
			if (this.isSelected()) {
				this.postprocessor.activate();
			} else {
				this.postprocessor.deactivate();
			}
		},
		isSelected: function() {
			return $(this.checkbox).is(":checked");
		},
		setSelection: function(value) {
			if ((value && !this.isSelected()) || (!value && this.isSelected())) {
				this.checkbox.click();
			}
		},
		getValue: function() {
			return this.postprocessor.getValue();
		},
		showHelp: function() {
			alert(this.postprocessor.help);
		}
	});
	arkiweb.views.postprocessors = {};
	arkiweb.views.AbstractPostprocessor = Backbone.View.extend({
		name: null,
		color: 'green',
		help: "-",
		activate: function() {
		},
		deactivate: function() {
		},
		render: function() {
		},
		getValue: function() {
			return null;
		}
	});
	arkiweb.views.postprocessors.Singlepoint = arkiweb.views.AbstractPostprocessor.extend({
		initialize: function(options) {
			var self = this;
			this.map = options.map.map;
			this.layer = new OpenLayers.Layer.Vector("singlepoint", {
				style: {
					strokeColor: this.color,
					strokeOpacity: "0.5",
					strokeWidth: 2,
					fillColor: this.color,
					fillOpacity: "0.5",
					pointRadius: 3
				}
			});
			this.control = new OpenLayers.Control();
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
			this.map.addControl(this.control);
			this.map.addLayer(this.layer);
		},
		activate: function() {
			this.layer.setVisibility(true);
			this.control.activate();
		},
		deactivate: function() {
			this.layer.setVisibility(false);
			this.control.deactivate();
		},
		name: "singlepoint",
		help: "This postprocessor extract a single point of the selection.\nYou can select the point clicking on the map and/or filling the input fields\n",
		render: function() {
			$(this.el).append("lat <input type='text' name='lat'> lon <input type='text' name='lon'/>");
			var self = this;
			$(this.el).find("input[type=text]").bind("change", function() {
				self.onChangeInputCoords();
			});
		},
		updateInput: function(coords) {
			$(this.el).find("input[name=lon]").val(coords.x);
			$(this.el).find("input[name=lat]").val(coords.y).trigger('change');
		},
		updateMap: function(coords) {
			var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(coords.x, coords.y));
			this.layer.removeAllFeatures();
			this.layer.addFeatures([feature]);
		},
		onChangeInputCoords: function() {
			this.updateMap({ 
				x: $(this.el).find("input[name=lon]").val(),
				y: $(this.el).find("input[name=lat]").val()
			});
		},
		getValue: function() {
			return "singlepoint " + $(this.el).find("input[name=lon]").val() + " " + $(this.el).find("input[name=lat]").val();
		}
	});
	arkiweb.views.postprocessors.Subarea = arkiweb.views.AbstractPostprocessor.extend({
		initialize: function(options) {
			var self = this;
			this.map = options.map.map;
			this.layer = new OpenLayers.Layer.Vector("subarea", {
				style: {
					strokeColor: this.color,
					strokeOpacity: "0.5",
					strokeWidth: 2,
					fillColor: this.color,
					fillOpacity: "0.5",
					pointRadius: 3
				}
			});
			this.control = new OpenLayers.Control();
			OpenLayers.Util.extend(this.control, {
				draw: function() {
					this.point = new OpenLayers.Handler.Box(self.control, {
						"done": this.notice
					});
				},
				activate: function() {
					this.point.activate();
				},
				deactivate: function() {
					this.point.deactivate();
				},
				notice: function(bounds) {
					var ll = this.map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.left, bounds.bottom));
					var ur = this.map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.right, bounds.top));
					self.updateInput({
						x: ll.lon,
						X: ur.lon,
						y: ll.lat,
						Y: ur.lat
					});
				}
			});
			this.map.addLayer(this.layer);
			this.map.addControl(this.control);
		},
		color: "blue",
		activate: function() {
			this.layer.setVisibility(true);
			this.control.activate();
		},
		deactivate: function() {
			this.layer.setVisibility(false);
			this.control.deactivate();
		},
		name: "subarea",
		render: function() {
			var self = this;
			$(this.el).append("lat1 <input type='text' name='lat1'> lon1 <input type='text' name='lon1'/> lat2 <input type='text' name='lat2'/> lon2 <input type='text' name='lon2'/>");
			$(this.el).find("input[type=text]").bind("change", function() {
				self.updateMap();
			});
		},
		updateInput: function(coords) {
			$(this.el).find("input[name=lon1]").val(coords.x);
			$(this.el).find("input[name=lon2]").val(coords.X);
			$(this.el).find("input[name=lat1]").val(coords.y);
			$(this.el).find("input[name=lat2]").val(coords.Y).trigger("change");
		},
		updateMap: function() {
			var x = $(this.el).find("input[name=lon1]").val();
			var y = $(this.el).find("input[name=lat1]").val();
			var X = $(this.el).find("input[name=lon2]").val();
			var Y = $(this.el).find("input[name=lat2]").val();
			var points = [
				new OpenLayers.Geometry.Point(x,y),
				new OpenLayers.Geometry.Point(X, y),
				new OpenLayers.Geometry.Point(X, Y),
				new OpenLayers.Geometry.Point(x, Y),
				new OpenLayers.Geometry.Point(x,y)
			];
			var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LinearRing(points));
			this.layer.removeAllFeatures();
			this.layer.addFeatures([feature]);
		},
		getValue: function() {
			var lons = [ $(this.el).find("input[name=lon1]").val(), $(this.el).find("input[name=lon2]").val() ];
			var lats = [ $(this.el).find("input[name=lat1]").val(), $(this.el).find("input[name=lat2]").val() ];
			return "subarea " + _.min(lons) + " " + _.min(lats) + " " + _.max(lons) + " " + _.max(lats);
		}
	});
	arkiweb.views.Postprocessors = Backbone.View.extend({
		initialize: function(options) {
			this.map = options.map;
			this.datasets = options.datasets;
			this.postprocessors = {};
			_.each(options.postprocessors, function(postprocessor) {
				var div = $("<div>");
				$(this.el).find(".arkiweb-postprocess-content").append(div);
				var p = new arkiweb.views.Postprocessor({
					postprocessor: postprocessor,
					map: this.map,
					datasets: this.datasets,
					el: div
				});
				this.postprocessors[p.name] = p;
				p.bind('change', this.onChangedSelection, this);
			}, this);

			this.datasets.bind('change', this.onDatasetsSelectionChanged, this);
		},
		render: function() {
			_.each(this.postprocessors, function(postprocessor) {
				postprocessor.render();
			});
		},
		onDatasetsSelectionChanged: function() {
			var selected = this.datasets.getSelected();
			var postprocessors = [];
			_.each(selected, function(s) {
				postprocessors.push(s.model.get('postprocess'));
			}, this);
			postprocessors = _.intersection.apply(null, postprocessors);
			_.each(this.postprocessors, function(p) {
				if (_.include(postprocessors, p.name)) {
					p.enable();
				} else {
					p.disable();
				}
			});
		},
		onChangedSelection: function(view) {
			if (view.isSelected()) {
				_.each(this.postprocessors, function(p) {
					p.unbind('change', this.onChangedSelection);
					if (p != view) {
						p.setSelection(false);
					}
					p.bind('change', this.onChangedSelection, this);
				}, this);
			}
		},
		getValue: function() {
			var value = null;
			_.each(this.postprocessors, function(postprocessor) {
				if (postprocessor.isSelected()) {
					value = postprocessor.getValue();
				}
			}, this);
			return value;
		}
	});
	arkiweb.views.Main = Backbone.View.extend({
		tmpl: "#arkiweb-tmpl",
		initialize: function(options) {
			this.options = options;
			this.collections = {};
				
			this.collections.datasets = new arkiweb.collections.Datasets()
			this.collections.datasets.url = options.urls.datasets || this.collections.datasets.url;

			this.collections.fields = new arkiweb.collections.Fields();
			this.collections.fields.url = options.urls.fields || this.collections.fields.url;

			this.collections.summary = new arkiweb.collections.Fields();
			this.collections.summary.url = options.urls.summary || this.collections.summary.url;

			this.views = {};

			this.options.urls.data = this.options.urls.data || 'data';

			this.options.postprocessors = this.options.postprocessors || [ arkiweb.views.postprocessors.Subarea, arkiweb.views.postprocessors.Singlepoint ];

		},
		render: function() {
			var tmpl = $(this.tmpl).tmpl();
			$(this.el).append(tmpl);
			$(this.el).addClass("arkiweb");
			$(this.el).css('height', this.options.height);

			this.views.datasets = new arkiweb.views.DatasetsSelection({
				collection: this.collections.datasets,
				el: $(this.el).find('.arkiweb-datasets-selection')
			});

			this.views.datasets.bind('submit', this.loadFields, this);

			this.views.map = new arkiweb.views.Map({
				view: this.views.datasets,
				el: $(this.el).find('.arkiweb-map')
			});

			this.views.fields = new arkiweb.views.FieldsSelection({
				collection: this.collections.fields,
				el: $(this.el).find('.arkiweb-fields-selection')
			});
			
			this.views.fields.bind("submit", this.loadSummary, this);
			this.views.fields.bind("download", this.downloadData, this);

			this.views.summary = new arkiweb.views.Summary({
				collection: this.collections.summary,
				el: $("<div>")
			});

			this.views.postprocessors = new arkiweb.views.Postprocessors({
				map: this.views.map,
				datasets: this.views.datasets,
				el: $(this.el).find(".arkiweb-postprocess"),
				postprocessors: [
					arkiweb.views.postprocessors.Singlepoint,
					arkiweb.views.postprocessors.Subarea
				]
			});
			this.views.postprocessors.render();

			this.layouts = {};
			this.layouts.main = $(this.el).layout({
				applyDefaultStyles: true,
				west__paneSelector: '.arkiweb-datasets-selection',
				east__paneSelector: '.arkiweb-fields-selection',
				center__paneSelector: '.arkiweb-map',
				south__paneSelector: '.arkiweb-postprocess',
				south__size: '40%',
				west__size: '33%',
				east__size: '33%'
			});
			this.layouts.datasets = $(this.views.datasets.el).layout({
				center__applyDefaultStyles: true,
				north__paneSelector: '.arkiweb-datasets-selection-header',
				center__paneSelector: '.arkiweb-datasets-selection-content'
			});
			this.layouts.fields = $(this.views.fields.el).layout({
				center__applyDefaultStyles: true,
				north__paneSelector: '.arkiweb-fields-selection-header',
				center__paneSelector: '.arkiweb-fields-selection-content'
			});

			this.views.map.render();

			this.loadDatasets();
		},
		getDatasetsParam: function() {
			var datasets = _.map(this.views.datasets.getSelected(), function(view) {
				return view.model.get('id');
			});
			return datasets;
		},
		getPostprocessParam: function() {
			var postprocess = this.views.postprocessors.getValue();
			return postprocess;
		},
		getQueryParam: function() {
			var query = this.views.fields.query();
			return query;
		},
		loadDatasets: function() {
			var self = this;
			this.collections.datasets.fetch({
				beforeSend: function() {
					self.block();
				},
				complete: function() {
					self.unblock();
				}
			});
		},
		loadFields: function() {
			var self = this;
			var data = {};
			
			var datasets = this.getDatasetsParam();
			if (datasets)
				data.datasets = datasets;

			this.collections.fields.fetch({
				beforeSend: function() {
					self.block();
				},
				complete: function() {
					self.unblock();
				},
				data: data
			});
		},
		loadSummary: function() {
			var self = this;
			var data = {};
			var datasets = this.getDatasetsParam();
			if (datasets)
				data.datasets = datasets;
			var query = this.getQueryParam();
			if (query)
				data.query = query;

			this.collections.summary.fetch({
				beforeSend: function() {
					self.block();
				},
				complete: function() {
					self.unblock();
				},
				data: data
			});
		},
		downloadData: function() {
			var data = {};
			var datasets = this.getDatasetsParam();
			if (datasets)
				data.datasets = datasets;
			var query = this.getQueryParam();
			if (query)
				data.query = query;
			var postprocess = this.getPostprocessParam();
			if (postprocess)
				data.postprocess = postprocess;

			var url = this.options.urls.data + "?" + $.param(data);
			window.open(url);
		},
		block: function() {
			var img = "<div><img src='ajax-loader.gif' alt='loading'/></div>";
			$.blockUI.defaults.css = {};
			$(this.el).block({
				message: img
			});
		},
		unblock: function() {
			$(this.el).unblock();
		}
	});
	arkiweb.routers.Router = Backbone.Router.extend({
		tmpl: '#arkiweb-tmpl',
		settings: {
			el: 'body',
			urls: {
				tmpl: 'arkiweb.html',
				datasets: 'datasets',
				fields: 'fields',
				summary: 'summary',
				download: 'download'
			},
			height: '100%'
		},
		initialize: function(options) {
			if (options)
				$.extend(true, this.settings, options);
			this.loadTemplates();
			this.mainview = new arkiweb.views.Main(this.settings);
		},	
		loadTemplates: function() {
			var self = this;
			if ($(this.tmpl).length == 0) {
				$.ajax({
					url: self.settings.urls.tmpl,
					async: false,
					dataType: 'html',
					success: function(data) {
						$("body").append(data);
					},
					error: function() {
						alert("error");
					}
				});
			}
		},
		routes: {
			"":	"index"
		},
		index: function() {
			this.mainview.render();
		}
	});
	window.arkiweb = arkiweb;
})();
