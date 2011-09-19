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
			this.buttons.submit = $(this.el).find(".arkiweb-datasets-selection-menu .arkiweb-datasets-selection-submit-selection");
			this.buttons.clear = $(this.el).find(".arkiweb-datasets-selection-menu .arkiweb-datasets-selection-clear-selection");

			this.collection.bind('reset', this.render, this);
			this.collection.bind('error', this.renderError, this);
		},
		views: [],
		buttons: {
			submit: null,
			clear: null
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
			this.buttons.submit.attr('disabled', true);
			this.buttons.clear.attr('disabled', true);
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
				title: "", //this.model.name,
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
			this.root.addClass('arkiweb');
			this.tmpl_url = options.tmpl_url || 'arkiweb.html';
			this.loadTemplates();
			this.datasets_url = options.datasets_url || 'datasets';
			this.datasets = new arkiweb.collections.Datasets();
			this.datasets.url = this.datasets_url;
			this.datasets_view = new arkiweb.views.DatasetsSelection({
				collection: this.datasets,
				el: $(this.root).find(".arkiweb-datasets-selection")
			});
			this.datasets_view.bind("submit", this.loadFieldsSelection, this);
			this.map_view = new arkiweb.views.Map({
				view: this.datasets_view,
				el: $(this.root).find(".arkiweb-map-content")
			});
			this.map_view.render();
			/*
			this.height = options.height || '100%';
			$(this.root).css('height', this.height);
			this.root_layout = $(this.root).layout({
				//applyDefaultStyles: true,
				west__paneSelector: '.arkiweb-datasets-selection',
				center__paneSelector: '.arkiweb-map',
				east__paneSelector: '.arkiweb-fields-selection',
				south__paneSelector: '.arkiweb-postprocess',
				size: '30%'

			});
			this.datasets_layout = $(this.datasets_view.el).layout({
				north__paneSelector: '.arkiweb-datasets-selection-header',
				center__paneSelector: '.arkiweb-datasets-selection-content',
				center__applyDefaultStyles: true
			});
			this.fields_layout = $(this.root).find('.arkiweb-fields-selection').layout({
				north__paneSelector: '.arkiweb-fields-selection-header',
				center__paneSelector: '.arkiweb-fields-selection-content',
				center__applyDefaultStyles: true
			});
			*/
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
			this.datasets.fetch();
		},
		loadFieldsSelection: function() {
			alert("TODO");
		}
	});
	window.arkiweb = arkiweb;
})();
