arkiweb.views.SummarySection = Backbone.View.extend({
	tmpl: '#arkiweb-summary-section-tmpl',
	render: function() {
		var tmpl = $(this.tmpl).tmpl(this.model.toJSON());
		$(this.el).append(tmpl);
		this.views = [];
		this.model.collection.each(function(model) {
			var div = $("<div>");
			$(this.el).find('.arkiweb-summary-section-list').append(div);
			var view = new arkiweb.views.SummarySectionItem({
				model: model,
				el: div
			});
			view.render();
			this.views.push(view);
		}, this);
	}
});
