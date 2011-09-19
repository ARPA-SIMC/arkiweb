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
	});
	arkiweb.models.Field = Backbone.Model.extend({
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
		url: 'fields'
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

			this.buttons.submit.attr('disabled', true);
			this.buttons.clear.attr('disabled', true);

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
	});
	arkiweb.views.Error = Backbone.View.extend({
		initialize: function(options) {
			this.message = options.message
		},
		render: function() {
			$(this.el).append("<div class='error'>" + this.message + "</div>");
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

			this.views = {};
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

			this.layouts = {};
			this.layouts.main = $(this.el).layout({
				applyDefaultStyles: true,
				north__paneSelector: '.arkiweb-datasets-selection',
				west__paneSelector: '.arkiweb-fields-selection',
				center__paneSelector: '.arkiweb-map',
				east__paneSelector: '.arkiweb-postprocess',
				north__size: '50%'
			});
			this.layouts.north = $(this.el).find(".arkiweb-datasets-selection").layout({
				center__applyDefaultStyles: true,
				north__paneSelector: '.arkiweb-datasets-selection-header',
				center__paneSelector: '.arkiweb-datasets-selection-content'
			});

			this.views.map.render();

			this.loadDatasets();
		},
		loadDatasets: function() {
			this.collections.datasets.fetch();
		},
		loadFields: function() {
			this.collections.fields.fetch();
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
