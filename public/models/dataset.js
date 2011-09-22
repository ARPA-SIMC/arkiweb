arkiweb.models.Dataset = Backbone.Model.extend({
	initialize: function(attributes) {
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
