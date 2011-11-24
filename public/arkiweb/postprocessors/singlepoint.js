(function() {
	var Singlepoint = arkiweb.views.PostprocessorControl.extend({
		getCommand: function() {
			return "singlepoint: ";
		}
	});

	this.arkiweb.postprocessors.singlepoint = Singlepoint;
}());
