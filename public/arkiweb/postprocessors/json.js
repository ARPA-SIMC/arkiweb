(function() {
	var JsonPostproc = arkiweb.views.PostprocessorControl.extend({
		initialize: function(opts) {
		},
		render: function() {
            $(this.el).html("format <select name='format'>" +
                "<option selected='selected' value='dbajson'>Dballe JSON</option>" +
                "<option value='geojson'>GeoJSON</option>" +
                "</select>");
        },
		events: {
		},
		activate: function() {
		},
		deactivate: function() {
		},
		getCommand: function() {
			return "json " + "-f " + $(this.el).find("select[name=format]").val();
		}
	});

	this.arkiweb.postprocessors.json = JsonPostproc;
}());
