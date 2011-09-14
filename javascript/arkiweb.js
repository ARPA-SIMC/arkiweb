(function($) {
	var arkiweb = {
		models: {},
		collections: {},
		views: {}
	};

	arkiweb.models.Dataset = Backbone.Model.extend({
		defaults: {
			selected: false
		},
		isSelected: function() {
			return this.get('selected');
		},
		toggleSelection: function() {
			return this.set({
				selected: !this.get('selected')
			});
		}
	});

	arkiweb.collections.Datasets = Backbone.Collection.extend({
		url: 'datasets',
		model: arkiweb.models.Dataset,
		getSelectedNames: function() {
			var selected = this.select(function(model) {
				return model.isSelected();
			});
			return _.map(selected, function(model) {
				return model.get('id');
			});
		}
	});

	arkiweb.views.Datasets = Backbone.View.extend({
		events: {
			'click .show-help': 'showHelp',
			'click .toggle-allowed': 'toggleAllowed',
			'click .show-fields': 'showFields',
			'click .toggle-selected': 'toggleSelected'
		},
		initialize: function(options) {
			this.collection.bind('reset', this.render, this);
		},
		render: function() {
			var el = $(this.el).find(".datasets-list");
			el.empty();
			this.views = [];
			this.collection.each(function(model) {
				var div = $("<div>");
				el.append(div);
				var view = new arkiweb.views.DatasetsItem({
					model: model,
					el: div
				});
				view.render();
				this.views.push(view);
			}, this);
		},
		toggleAllowed: function() {
			$(this.el).find(".datasets-list *[allowed='false']").toggle();
		},
		toggleSelected: function() {
			alert("TODO");
		},
		showFields: function() {
			this.trigger("showFields");
		},
		showHelp: function() {
			alert("TODO");
		}
	});

	arkiweb.views.DatasetsItem = Backbone.View.extend({
		tmpl: '#arkiweb-dataset-selection-list-item-tmpl',
		events: {
			'click input': 'toggleSelection',
			'click .name': 'showDescription'
		},
		render: function() {
			var tmpl = $(this.tmpl).tmpl(this.model.toJSON());
			$(this.el).append(tmpl);
		},
		toggleSelection: function() {
			this.model.toggleSelection();
		},
		showDescription: function() {
			$("#arkiweb-dataset-description-tmpl").tmpl(this.model.toJSON()).dialog({
				title: this.model.get('name'),
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
			var layer = new OpenLayers.Layer.WMS("OpenLayers WMS",
							     "http://vmap0.tiles.osgeo.org/wms/vmap0", {
								     layers: 'basic'
							     });
			this.map.addLayer(layer);
			this.dataset_layer = new OpenLayers.Layer.Vector("datasets boundings");
			this.map.addLayer(this.dataset_layer);
			this.collection.bind('change', this.updateFeatures, this);
		},
		render: function() {
			this.map.render($(this.el).get(0));
			this.resize();
		},
		updateFeatures: function(dataset) {
			var f = dataset.features;
			if (!f)
				return;
			if (dataset.isSelected()) {
				this.dataset_layer.addFeatures([f]);
			} else {
				this.dataset_layer.removeFeatures([f]);
			}
			this.resize();
		},
		resize: function() {
			var b = this.dataset_layer.getDataExtent();
			if (b) {
				this.map.zoomToExtent(b);
			} else {
				this.map.zoomToMaxExtent();
			}
		}
	});

	arkiweb.models.FieldValue = Backbone.Model.extend({
		defaults: {
			selected: false
		},
		initialize: function(attributes) {
			var query = null;
			try {
				query = ArkiwebParser[attributes.type].styles[attributes.value.s].decode(attributes.value);
			} catch (e) {
			}
			this.attributes.query = query;
		},
		isSelected: function() {
			return this.get('selected');
		},
		toggleSelection: function() {
			return this.set({
				selected: !this.get('selected')
			});
		}
	});

	arkiweb.collections.FieldValues = Backbone.Collection.extend({
		initialize: function(attributes, options) {
			this.type = options.type;
		},
		model: arkiweb.models.FieldValue,
		url: '/',
		fetch: function() {
		},
		query: function() {
			var queries = this.select(function(model) {
				return model.isSelected();
			});
			var query = null;
			try {
				query = ArkiwebParser[this.type].decode(_.map(queries, function(model) {
					model.get('query');
				}));
			} catch (e) {
			}
		}
	});

	arkiweb.models.Field = Backbone.Model.extend({
		initialize: function(attributes) {
			this.collection = new arkiweb.collections.FieldValues([], {
				type: attributes.type
			});
			_.each(attributes.values, function(value) {
				var val = new arkiweb.models.FieldValue({
					type: attributes.type,
					value: value
				});
				this.collection.add(val);
			}, this);
		}
	});
	arkiweb.collections.Fields = Backbone.Collection.extend({
		model: arkiweb.models.Field,
		url: 'fields',
		parse: function(resp) {
			this.stats = resp.stats;
			return resp.fields;
		}
	});
	arkiweb.views.FieldsSelection = Backbone.View.extend({
		initialize: function(options) {
			this.collection.bind("reset", this.render, this);
		},
		events: {
			'click .show-help': 'showHelp',
			'click .show-datasets': 'showDatasets',
			'click .toggle-query': 'toggleQuery'
		},
		render: function() {
			$(this.el).find(".content").empty();
			this.views = [];
			this.collection.each(function(model) {
				var view = new arkiweb.views.FieldsSelectionSection({
					model: model,
					el: $(this.el).find(".content")
				});
				view.render();
				this.views.push(view);
			}, this);
			$(this.el).find(".query").hide();
		},
		showHelp: function() {
			alert("TODO");
		},
		showDatasets: function() {
			this.trigger("showDatasets");
		},
		toggleQuery: function() {
			$(this.el).find(".field-item span").toggle();
		}
	});
	arkiweb.views.FieldsSelectionSection = Backbone.View.extend({
		tmpl: "#arkiweb-field-selection-sections-tmpl",
		render: function() {
			this.views = [];
			var tmpl  = $(this.tmpl).tmpl(this.model.toJSON());
			$(this.el).append(tmpl);
			this.model.collection.each(function(model) {
				var view = new arkiweb.views.FieldsSelectionSectionItem({
					model: model,
					el: $(tmpl).find(".field-section-values")
				});
				view.render();
				this.views.push(view);
			}, this);
		}
	});
	arkiweb.views.FieldsSelectionSectionItem = Backbone.View.extend({
		tmpl: "#arkiweb-field-selection-sections-item-tmpl",
		events: {
			'click input': 'toggleSelection'
		},
		render: function() {
			var tmpl = $(this.tmpl).tmpl(this.model.toJSON());
			if (!this.model.get('query')) {
				$(tmpl).find("input").attr('disabled', true);
				$(tmpl).find(".query").text("-");
			}
			$(this.el).append(tmpl);
		},
		toggleSelection: function() {
			this.model.toggleSelection();
		}
	});

	arkiweb.Router = Backbone.Router.extend({
		initialize: function(options) {
			this.el = options.el;
			$(this.el).addClass("arkiweb");
			$(this.el).append($("#arkiweb-tmpl").tmpl());
			$(this.el).css('height', '100%');
			var self = this;
			this.main_layout = $(this.el).layout({
				center: {
					applyDefaultStyles: true,
					paneSelector: '.map'
				},
				west: {
					size: '30%',
					applyDefaultStyles: true,
					paneSelector: '.datasets'
				},
				east: {
					size: '30%',
					applyDefaultStyles: true,
					initHidden: true,
					paneSelector: '.fields'
				},
				south: {
					applyDefaultStyles: true,
					paneSelector: '.postprocess'
				},
				north: {
					applyDefaultStyles: true,
					paneSelector: '.header'
				},
			});
			$(this.el).find(".datasets").layout({
				north: {
					paneSelector: '.header'
				},
				center: {
					applyDefaultStyles: true,
					paneSelector: '.content'
				}
			});
			$(this.el).find(".fields").layout({
				north: {
					paneSelector: '.header'
				},
				center: {
					applyDefaultStyles: true,
					paneSelector: '.content'
				}
			});
			this.el = options.el;
			this.datasets = new arkiweb.collections.Datasets();
			this.dataset_view = new arkiweb.views.Datasets({
				collection: this.datasets,
				el: $(this.el).find(".datasets")
			});
			this.map_view = new arkiweb.views.Map({
				collection: this.datasets,
				el: $(this.el).find(".map")
			});
			this.datasets.fetch();
			this.map_view.render();
			this.dataset_view.bind("showFields", this.showFields, this);
			this.fields = new arkiweb.collections.Fields();
			this.fields_view = new arkiweb.views.FieldsSelection({
				collection: this.fields,
				el: $(this.el).find(".fields")
			});
			this.fields_view.bind("showDatasets", this.showDatasets, this);
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
		},
		routes: {
			"": "index"
		},
		index: function() {
		},
		showFields: function() {
			var self = this;
			this.fields.fetch({
				data: {
					datasets: this.datasets.getSelectedNames()
				},
				beforeSend: function() {
					self.block();
				},
				success: function() {
					self.main_layout.hide("west");
					self.main_layout.show("east");
					self.unblock();
				},
				error: function() {
					self.main_layout.hide("west");
					self.main_layout.show("east");
					self.unblock();
				}
			});
		},
		showDatasets: function() {
			this.main_layout.hide("east");
			this.main_layout.show("west");
		}
	});

	arkiweb.init = function(root) {
		$.ajax({
			url: 'arkiweb.html',
			success: function(data) {
				if ($("#arkiweb-tmpl").length == 0) {
					$("body").append(data);
				}
				var router = new arkiweb.Router({
					el: $(root)
				});
				$(root).data('arkiweb-router', router);
				Backbone.history.start();
			},
			error: function() {
			}
		});
	};
	$.fn.arkiweb = function(options) {
		return this.each(function() {
			arkiweb.init(this);
		});
	}
})(jQuery);
