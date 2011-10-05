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

