(function($) {
	var arkiweb = {
		models: {},
		collections: {},
		views: {}
	};

	arkiweb.models.Dataset = Backbone.Model.extend({
		initialize: function(attributes) {
			this.features = new OpenLayers.Format.WKT().read(attributes.bounding);
		}
	});

	arkiweb.models.DatasetSelection = arkiweb.models.Dataset.extend({
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

	arkiweb.collections.DatasetSelectionList = Backbone.Collection.extend({
		url: 'datasets',
		model: arkiweb.models.DatasetSelection
	});

	arkiweb.views.DatasetSelectionList = Backbone.View.extend({
		events: {
			'click .toggle-allowed': 'toggleAllowed',
			'click .show-fields': 'showFields'
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
				var view = new arkiweb.views.DatasetSelectionListItem({
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
		showFields: function() {
			alert("TODO");
		}
	});

	arkiweb.views.DatasetSelectionListItem = Backbone.View.extend({
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

	arkiweb.init = function(root) {
		$.ajax({
			url: 'arkiweb.html',
			success: function(data) {
				if ($("#arkiweb-tmpl").length == 0) {
					$("body").append(data);
				}
				$(root).addClass("arkiweb");
				$(root).append($("#arkiweb-tmpl").tmpl());
				$(root).css('height', '80%');
				arkiweb.datasets = new arkiweb.collections.DatasetSelectionList();
				arkiweb.datasetsview = new arkiweb.views.DatasetSelectionList({
					collection: arkiweb.datasets,
					el: $(root).find(".datasets")
				});
				arkiweb.mapview = new arkiweb.views.Map({
					collection: arkiweb.datasets,
					el: $(root).find(".map")
				});
				$(root).layout({
					center: {
						applyDefaultStyles: 	true,
						paneSelector: '.map'
					},
					west: {
						applyDefaultStyles: 	true,
						paneSelector: '.datasets'
					},
					south: {
						applyDefaultStyles: 	true,
						paneSelector: '.postprocess'
					},
					north: {
						applyDefaultStyles: 	true,
						paneSelector: '.header'
					},
					onresize: function(name, element, state, options, layout) {
						arkiweb.mapview.resize();
					}
				});
				arkiweb.mapview.render();
				arkiweb.datasets.fetch();
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
