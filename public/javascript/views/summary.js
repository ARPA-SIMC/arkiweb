arkiweb.views.Summary = Backbone.View.extend({
	//tmpl: '#arkiweb-summary-tmpl',
	events: {
		'click button': 'toggleQuery'
	},
	initialize: function(options) {
		this.collection.bind("reset", this.render, this);
	},
	render: function() {
		this.el.empty();
		this.views = [];

		//var tmpl = $(this.tmpl).tmpl();
		var tmpl = arkiweb.templates["summary"]();
		this.el.append(tmpl);

		if (this.collection.stats) {
			var div = $(this.el).find(".arkiweb-summary-stats");
			var view = new arkiweb.views.SummaryStats({
				model: this.collection,
				el: div
			});
			view.render();
			this.views.push(view);
		}

		this.collection.each(function(model) {
			var div = $("<div>");
			$(this.el).find(".arkiweb-summary-content").append(div);
			var view = new arkiweb.views.SummarySection({
				model: model,
				el: div
			});
			view.render();
			this.views.push(view);
		}, this);

		$(this.el).dialog({
			title: 'summary',
			autoOpen: true,
			modal: true,
			close: function() {
				$(this).remove()
			},
			height: $(document).height() / 2,
			width: $(document).width() / 2,
		});
		$(this.el).layout({
			center__applyDefaultStyles: true,
			center__paneSelector: '.arkiweb-summary'
		});
		$(this.el).find(".arkiweb-summary").layout({
			center__applyDefaultStyles: true,
			north__paneSelector: '.arkiweb-summary-menu',
			center__paneSelector: '.arkiweb-summary-content'
		});
	},
	toggleQuery: function() {
		$(this.el).find(".arkiweb-summary-query, .arkiweb-summary-description").toggleClass("hidden");
	}
});

