(function() {
	var JsonPostproc = arkiweb.views.PostprocessorControl.extend({
		initialize: function(opts) {
		},
		render: function() {
		},
		events: {
		},
		activate: function() {
		},
		deactivate: function() {
		},
		getCommand: function() {
			return "json";
		}
	});

	this.arkiweb.postprocessors.json = JsonPostproc;
}());
