var arkiweb = {};
arkiweb.config = {};
arkiweb.config.ajax = {};
arkiweb.config.ajax.datasets = { 
	url: 'datasets'
};

arkiweb.models = {};
arkiweb.models.Dataset = function(data) {
	this.id = data.id;
	this.name = data.name;
	this.description = data.description;
	this.allowed = data.allowed;
	this.bounding = data.bounding;
	this.features = arkiweb.models.Dataset.wtkParser.read(data.bounding);
};
arkiweb.models.Dataset.wtkParser = new OpenLayers.Format.WKT();
arkiweb.models.Dataset.url = function() {
	return arkiweb.config.ajax.datasets.url;
};
arkiweb.models.Dataset.findAll = function(options) {
	$.ajax({
		url: arkiweb.models.Dataset.url(),
		dataType: 'json',
		success: function(resp) {
			var datasets = [];
			for (var idx in resp) {
				datasets.push(new arkiweb.models.Dataset(resp[idx]));
			}
			if (options && options.success) {
				options.success(datasets);
			}
		},
		error: function(xhr, text, status) {
			if (options && options.error) {
				options.error(text, status);
			}
		}
	});
};
arkiweb.collections = {};
arkiweb.collections.Datasets = function(selector) {
	this.selector = $(selector);
};

(function() {
	$.fn.arkiweb = function() {
	}
})(jQuery);
