arkiweb.views.FieldsSelectionStatsSection = Backbone.View.extend({
	tmpl: '#arkiweb-fields-selection-stats-section-tmpl',
	render: function() {
		var tmpl = $(this.tmpl).tmpl(this.model.stats);
		$(this.el).append(tmpl);
		$(this.el).find("input").datetimepicker({
			minDate: this.model.stats.begin,
			maxDate: this.model.stats.end,
			timeFormat: 'hh:mm:ss',
			dateFormat: 'yy-mm-dd'
		});
		$(this.el).find("input[name=from]").datetimepicker('setDate', this.model.stats.begin);
		$(this.el).find("input[name=until]").datetimepicker('setDate', this.model.stats.end);
	},
	clearSelection: function() {
		if ($(this.el).find("input[name=arkiweb-reftime-from]").is(':checked')) {
			$(this.el).find("input[name=arkiweb-reftime-from]").click();
		}
		if ($(this.el).find("input[name=arkiweb-reftime-until]").is(':checked')) {
			$(this.el).find("input[name=arkiweb-reftime-until]").click();
		}
		$(this.el).find("input[name=from]").datetimepicker('setDate', this.model.stats.begin);
		$(this.el).find("input[name=until]").datetimepicker('setDate', this.model.stats.end);
	},
	query: function() {
		var from = null;
		var until = null;
		var query = null;
		var values = [];
		if ($(this.el).find("input[name=arkiweb-reftime-from]").is(':checked')) {
			var begin = $(this.el).find("input[name=from]").val();
		}
		if ($(this.el).find("input[name=arkiweb-reftime-until]").is(':checked')) {
			var end = $(this.el).find("input[name=until]").val();
		}
		if (begin)
			values.push(">= " + begin);
		if (end)
			values.push("<= " + end);
		if (begin && end && begin == end) {
			values = [ "= " + begin ];
		}
		if (values.length > 0)
			query = "reftime: " + values.join(",");
		return query;
	},
	toggleQuery: function() {}
});

