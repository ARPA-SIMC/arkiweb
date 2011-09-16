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
	arkiweb.collections.Datasets = Backbone.Collection.extend({
		model: arkiweb.models.Dataset,
		url: 'datasets'
	});
	arkiweb.views.DatasetsSelection = Backbone.View.extend({
		events: {
			'click .arkiweb-datasets-selection-menu .arkiweb-datasets-selection-clear-selection': 'clearSelection',
			'click .arkiweb-datasets-selection-menu .arkiweb-datasets-selection-submit-selection': 'submitSelection'
		},
		initialize: function() {
			this.content = $(this.el).find(".arkiweb-datasets-selection-list");
			this.collection.bind('reset', this.render, this);
			this.collection.bind('error', this.renderError, this);
		},
		views: [],
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
				message: error.statusText
			});
			view.render();
			this.views.push(view);
			return this;
		},
		notifyChange: function(view) {
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
			$("#arkiweb-dataset-description-tmpl").tmpl(this.model.toJSON()).dialog({
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
	arkiweb.views.Error = Backbone.View.extend({
		initialize: function(options) {
			this.message = options.message
		},
		render: function() {
			$(this.el).append("<div class='error'>" + this.message + "</div>");
		}
	});
	arkiweb.routers.Router = Backbone.Router.extend({
		initialize: function(options) {
			this.root = options.root || 'body';
			this.tmpl_url = options.tmpl_url || 'arkiweb.html';
			this.loadTemplates();
			this.datasets_url = options.datasets_url || 'datasets';
			this.datasets = new arkiweb.collections.Datasets();
			this.datasets.url = this.datasets_url;
			this.datasets_view = new arkiweb.views.DatasetsSelection({
				collection: this.datasets,
				el: $(this.root).find(".arkiweb-datasets-selection")
			});
			this.datasets_view.bind("submit", this.showFieldsSelection, this);
			this.map_view = new arkiweb.views.Map({
				view: this.datasets_view,
				el: $(this.root).find(".arkiweb-map")
			});
		},
		tmpl: "#arkiweb-tmpl",
		loadTemplates: function() {
			var self = this;
			if ($(this.tmpl).length == 0) {
				$.ajax({
					url: self.tmpl_url,
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
			var tmpl = $(this.tmpl).tmpl();
			$(this.root).append(tmpl);
		},
		routes: {
			"":	"index"
		},
		index: function() {
			this.map_view.render();
			this.datasets.fetch();
		},
		showFieldsSelection: function() {
			alert("TODO");
		}
	});
	window.arkiweb = arkiweb;
})();
