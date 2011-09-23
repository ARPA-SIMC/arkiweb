arkiweb.views.SummaryStats = Backbone.View.extend({
	tmpl: '#arkiweb-summary-stats-tmpl',
	render: function() {
		var tmpl = $(this.tmpl).tmpl(this.model.stats);
		$(this.el).append(tmpl);
	}
});
