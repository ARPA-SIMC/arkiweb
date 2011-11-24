(function() {
	var arkiweb = {
		models: {},
		collections: {},
		views: {},
		templates: {},
		postprocessors: {},
		run: function(options) {
			$(document).ready(function() {
				var opts = $.extend({}, {
					el: "#arkiweb",
					baseUrl: "test/fixtures",
					postprocessors: {}
				}, options);

				arkiweb.App = new arkiweb.views.Application(opts);
			});
		}
	};

	this.arkiweb = arkiweb;
}());
