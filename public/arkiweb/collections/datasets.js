(function() {
	var Datasets = Backbone.Collection.extend({
		model: arkiweb.models.Dataset,
		url: '/datasets'
	});

	this.arkiweb.collections.Datasets = Datasets;
}());
