// Author: Emanuele Di Giacomo <edigiacomo@arpa.emr.it>
//
// jQuery plugin for Arkiweb. Requires **Arkiweb.js**.
//
(function($) {
	$.fn.arkiweb = function(options) {
		var settings = {};

		return this.each(function() {
			if (options) {
				$.extend(settings, options);
			}
			settings.root = $(this);
			var router = new arkiweb.routers.Router(settings);
			Backbone.history.start();
		});
	};
}(jQuery));
