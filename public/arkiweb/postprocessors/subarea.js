(function() {
	var Subarea = arkiweb.views.PostprocessorControl.extend({
		getCommand: function() {
			return "subarea: ";
		}
	});

	this.arkiweb.postprocessors.subarea = Subarea;
}());
