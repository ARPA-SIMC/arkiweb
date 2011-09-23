arkiweb.views.SummarySectionItem = Backbone.View.extend({
	//tmpl: '#arkiweb-summary-section-item-tmpl',
	render: function() {
		//var tmpl = $(this.tmpl).tmpl({
		var tmpl = arkiweb.templates["summary-section-item"]({
			description: this.model.get('value').desc,
			query: this.model.query
		});
		$(this.el).append(tmpl);
		$(this.el).find(".arkiweb-summary-query").addClass("hidden");
	}
});
