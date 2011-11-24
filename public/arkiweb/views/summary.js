(function() {
	var Summary = Backbone.View.extend({
		initialize: function(opts) {
			this.collection.bind("reset", this.render, this);
		},
		views: [],
		render: function() {
			var tmpl = arkiweb.templates["summary"](this.collection);
			console.log(tmpl);
			$(this.el).html(tmpl);
			this.views = [];

			var content = $(this.el).find(".summary-items");

			this.collection.each(function(model) {
				var view = new SummaryItem({
					model: model
				});
				this.views.push(view);
				view.render();
				content.append(view.el);
				view.bind("select", this.updateQuery, this);
			}, this);
		}
	});

	var SummaryItem = Backbone.View.extend({
		render: function() {
			var tmpl = arkiweb.templates["summary-item"](this.model.toJSON());
			$(this.el).html(tmpl);
		}
	});

	this.arkiweb.views.Summary = Summary;
}());
