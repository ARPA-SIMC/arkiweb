// Author: Emanuele Di Giacomo <edigiacomo@arpa.emr.it>
//
// This library has the following dependencies:
//
// - [jQuery](http://jquery.com/)
// - [jQuery-ui](http://jqueryui.com/)
// - [jQuery-tmpl](https://github.com/jquery/jquery-tmpl/)
// - [Underscore.js](http://documentcloud.github.com/underscore/)
// - [Backbone.js](http://documentcloud.github.com/backbone/)
// - [OpenLayers](http://openlayers.org/)
// - arkiweb-parser.js
//
(function() {
	var arkiweb = {
		models : {},
		collections: {},
		views: {},
		routers: {}
	};
	// Dataset model
	// -------------
	arkiweb.models.Dataset = Backbone.Model.extend({
		// ### attributes
		// - *id*: model identifier
		// - *name*: model name
		// - *description*: human readable description of the dataset
		// - *postprocess*: array of postprocessors available for this dataset
		// - *bounding*: bounding box
		// - *features*: OpenLayers.Feature.Vector object created from bounding attribute
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
	// Dataset collection
	// ------------------
	arkiweb.collections.Datasets = Backbone.Collection.extend({
		model: arkiweb.models.Dataset,
		url: 'datasets'
	});
	// Datasets selection view
	// -----------------------
	// ### attributes
	// - *views*: array of arkiweb.views.DatasetsSelectionItem
	// - *tmpl*: jquery selector for the template item
	// - *content*: jquery object for content 
	//
	// This view shows the datasets loaded and allows the user to 
	// select one or more datasets.
	// 
	// When the associated collection is loaded (`reset` event), the view is rendered.
	// When a dataset is selected (or unselected), the view triggers
	// the event `change:selection`. The arguments for the callback
	// is the inner view that changed its state.
	//
	// When the submit button is clicked, this view triggers the `submit` event.
	arkiweb.views.DatasetsSelection = Backbone.View.extend({
		events: {
			'click .arkiweb-datasets-selection-menu .arkiweb-datasets-selection-clear-selection': 'clearSelection',
			'click .arkiweb-datasets-selection-menu .arkiweb-datasets-selection-submit-selection': 'submitSelection'
		},
		initialize: function() {
			this.content = $(this.el).find(".arkiweb-datasets-selection-list");
			// Bind the `reset` event of the collection to its `render` function
			this.collection.bind('reset', this.render, this);
			// Bind the `error` event of the collection to its `renderError` function
			this.collection.bind('error', this.renderError, this);
		},
		views: [],
		// Empty the container of the view
		empty: function() {
			return this.content.empty();
		},
		// Render the view. For each model in the collection, creates
		// a new `arkiweb.views.DatasetsSelectionItem` and renders it.
		// The collection of the views is stored in the *views* attribute.
		render: function() {
			this.empty();
			this.views = [];
			this.collection.each(function(model) {
				var view = new arkiweb.views.DatasetsSelectionItem({
					model: model,
					el: this.content
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
			this.trigger("change:selection", view);
		},
		submitSelection: function() {
			this.trigger('submit');
		},
		clearSelection: function() {
			alert("TODO");
		},
		// Get the selected views
		getSelected: function() {
			return _.select(this.views, function(view) {
				return view.isSelected();
			}, this);
		}
	});
	// Dataset selection item view
	// ---------------------------
	// ### attributes
	// - *model*: arkiweb.models.Dataset
	// This view renders a single dataset model.
	// 
	// When the associated model is selected, the view triggers
	// then event `change:selection`. The argument for the callback
	// is the view itself.
	arkiweb.views.DatasetsSelectionItem = Backbone.View.extend({
		events: {
			'click input:checkbox': 'notifyChange'
		},
		tmpl: "#arkiweb-datasets-selection-item-tmpl",
		// Render the view
		render: function() {
		},
		notifyChange: function() {
			this.trigger("change:selection", this);
		},
		// `true` if the dataset is selected, otherwise `false`.
		isSelected: function() {
			return $(this.el).find("input:checkbox").attr('checked');
		}
	});
	// OpenLayers map view
	// -------------------
	// ### attributes
	// - *view*: dataset selection view
	// - *map*: OpenLayers map
	// - *blayer*: OpenLayers.Layer.Vector that stores the bounding box of the datasets
	//
	// This map shows the bounding box of the selected datasets 
	// and is a control for the postprocessors.
	//
	// ### TODO:
	// - Map and layers events
	// - Multiple layers (and projection converter)
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
			// The map listens to the events of the view.
			this.view.bind("change", this.updateDatasetsFeatures, this);
		},
		render: function() {
			this.map.render($(this.el).get(0));
			this.map.zoomToMaxExtent();
		},
		// When a selection is made in the datasets view,
		// the map shows (or hide) the bounding box of the
		// selected (unselected) dataset.
		updateDatasetsFeatures: function(view) {		
			var features = view.model.features;
			if (features) {
				if (views.isSelected()) {
					this.blayer.addFeatures([features]);
				} else {
					this.blayer.removeFeatures([features]);
				}
			}
			this.resizeMap();
		},
		// Resize the map
		resizeMap: function() {
			var extent = this.blayer.getDataExtent();
			if (extent) {
				this.map.zoomToExtent(extent);
			} else {
				this.map.zoomToMaxExtent();
			}
		}
	});
	// Error view
	// ----------
	// This view is useful to show a message error
	arkiweb.views.Error = Backbone.View.extend({
		// The parameter `message` will be rendered
		initialize: function(options) {
			this.message = options.message
		},
		render: function() {
			$(this.el).append("<div class='error'>" + this.message + "</div>");
		}
	});
	// Router
	// ----------------------
	// ### attributes
	// - *root*: the jQuery selector for the root element of the application
	// - *datasets*: the datasets collection
	// - *datasets_view*: the datasets view
	// - *datasets_url*: the datasets url
	// - *map_view*: the map view
	// - *tmpl_url*: template url
	//
	// This is a *fake* router, because it has only one route (the index).
	// The router listens to the views events and does its job.
	arkiweb.routers.Router = Backbone.Router.extend({
		// ### options
		// - *root*: the jQuery selector for the root element of the application (default: `"body"`)
		// - *datasets_url*: url for the datasets collection (default: `"datasets"`)
		// - *tmpl_url*: template url (default: `"arkiweb.html"`)
		//
		// **NOTE**: the router *must* be initialized when the document is ready 
		// (`$(document).ready` function).
		initialize: function(options) {
			this.root = options.root || 'body';
			this.tmpl_url = options.tmpl_url || 'arkiweb.html';
			this.loadTemplates();
			this.datasets_url = options.datasets_url || 'datasets';
			this.datasets = new arkiweb.collections.Datasets({
				url: this.datasets_url
			});
			this.datasets_view = new arkiweb.views.DatasetsSelection({
				collection: this.datasets,
				el: $(this.root).find(".arkiweb-datasets-selection")
			});
			// Listen to `submit` event of the datasets view
			this.datasets_view.bind("submit", this.showFieldsSelection, this);
			this.map_view = new arkiweb.views.Map({
				view: this.datasets_view,
				el: $(this.root).find(".arkiweb-map")
			});
		},
		tmpl: "#arkiweb-tmpl",
		// Load the templates 
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
		// The router fetches the datasets
		index: function() {
			this.map_view.render();
			this.datasets.fetch();
		},
		// Show the fields selection of the selected datasets
		showFieldsSelection: function() {
			alert("TODO");
		}
	});
	window.arkiweb = arkiweb;
})();
