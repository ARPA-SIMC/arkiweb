(function() {
	var Datasets = Backbone.Collection.extend({
		model: arkiweb.models.Dataset,
		url: '/datasets',
		parse: function(resp) {
			return resp.datasets;
		}
	});

	this.arkiweb.collections.Datasets = Datasets;
}());
