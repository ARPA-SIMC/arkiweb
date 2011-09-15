// Author: Emanuele Di Giacomo <edigiacomo@arpa.emr.it>
//
// jQuery plugin for Arkiweb. Requires **Arkiweb.js**.
//
(function($) {
	$.fn.arkiweb = function() {
		return this.each(function() {
			var router = new arkiweb.routers.Router({
				root: $(this)
			});
			Backbone.history.start();
		});
	};
}(jQuery));
