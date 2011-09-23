arkiweb.views.SummarySectionItem = Backbone.View.extend({
	tmpl: '#arkiweb-summary-section-item-tmpl',
	render: function() {
		var tmpl = $(this.tmpl).tmpl({
			description: this.model.get('value').desc,
			query: this.model.query
		});
		$(this.el).append(tmpl);
		tmpl.find(".arkiweb-summary-query").addClass("hidden");
	}
});
