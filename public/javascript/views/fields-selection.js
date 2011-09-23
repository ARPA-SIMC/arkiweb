arkiweb.views.FieldsSelection = Backbone.View.extend({
	events: {
		'click .arkiweb-fields-selection-menu .arkiweb-fields-selection-toggle-query': 'toggleQuery',
		'click .arkiweb-fields-selection-menu .arkiweb-fields-selection-show-query': 'showQuery',
		'click .arkiweb-fields-selection-menu .arkiweb-fields-selection-clear-selection': 'clearSelection',
		'click .arkiweb-fields-selection-menu .arkiweb-fields-selection-submit-selection': 'submitSelection',
		'click .arkiweb-fields-selection-menu .arkiweb-fields-selection-download-selection': 'downloadSelection'
	},
	initialize: function() {
		this.collection.bind('reset', this.render, this);
		this.collection.bind('error', this.renderError, this);
		this.content = $(this.el).find('.arkiweb-fields-selection-content');
		this.buttons.toggleQuery = $(this.el).find(".arkiweb-fields-selection-menu .arkiweb-fields-selection-toggle-query");
		this.buttons.showQuery = $(this.el).find(".arkiweb-fields-selection-menu .arkiweb-fields-selection-show-query");
		this.buttons.clear = $(this.el).find(".arkiweb-fields-selection-menu .arkiweb-fields-selection-clear-selection");
		this.buttons.submit = $(this.el).find(".arkiweb-fields-selection-menu .arkiweb-fields-selection-submit-selection");
		this.buttons.download = $(this.el).find(".arkiweb-fields-selection-menu .arkiweb-fields-selection-download-selection");

		_.each(this.buttons, function(button) {
			button.attr('disabled', true);
		});

	},
	buttons: {},
	views: [],
	render: function() {
		_.each(this.buttons, function(button) {
			button.attr('disabled', this.collection.length == 0);
		}, this);

		_.each(this.views, function(view) {
			if (view.destroy)
				view.destroy();
		});
		$(this.content).empty();
		this.views = [];

		var div = $("<div>");
		this.content.append(div);
		if (this.collection.stats) {
			var view = new arkiweb.views.FieldsSelectionStatsSection({
				model: this.collection,
				el: div
			});
			view.render();
			this.views.push(view);
		}

		this.collection.each(function(model) {
			var div = $("<div>");
			this.content.append(div);
			var view = new arkiweb.views.FieldsSelectionSection({
				model: model,
				el: div
			});
			view.render();
			this.views.push(view);
		}, this);

		return this;
	},
	renderError: function(model, error) {
		this.content.empty();
		var view = new arkiweb.views.Error({ 
			el: $(this.content),
			message: "Error while loading fields: " + error.statusText
		});
	view.render();
	this.views.push(view);
	return this;
	},
	toggleQuery: function() {
		_.each(this.views, function(view) {
			view.toggleQuery();
		}, this);
	},
	showQuery: function() {
		alert(this.query());
	},
	clearSelection: function() {
		_.each(this.views, function(view) {
			view.clearSelection();
		});
	},
	query: function() {
		var queries = _.select(_.map(this.views, function(view) {
			return view.query();
		}, this), function(query) {
			return query;
		}, this);
		return queries.join(";");
	},
	submitSelection: function() {
		this.trigger('submit');
	},
	downloadSelection: function() {
		this.trigger('download');
	}
});

