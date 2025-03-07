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
