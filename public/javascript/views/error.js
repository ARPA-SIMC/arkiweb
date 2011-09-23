arkiweb.views.Error = Backbone.View.extend({
	initialize: function(options) {
		this.message = options.message
	},
	render: function() {
		$(this.el).append("<div class='error'>" + this.message + "</div>");
	}
});
