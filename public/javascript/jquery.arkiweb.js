// Author: Emanuele Di Giacomo <edigiacomo@arpa.emr.it>
(function($) {
	$.fn.arkiweb = function(options) {
		var settings = {};

		return this.each(function() {
			if (options) {
				$.extend(settings, options);
			}
			settings.el = $(this);
			var router = new arkiweb.routers.Router(settings);
			$(this).data('arkiweb', router);
			Backbone.history.start();
		});
	};
}(jQuery));
