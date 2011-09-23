arkiweb.views.SummaryStats = Backbone.View.extend({
	//tmpl: '#arkiweb-summary-stats-tmpl',
	render: function() {
		//var tmpl = $(this.tmpl).tmpl(this.model.stats);
		var tmpl = arkiweb.templates["summary-stats"](this.model.stats);
		$(this.el).append(tmpl);
	}
});
