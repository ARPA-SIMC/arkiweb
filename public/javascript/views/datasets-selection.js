arkiweb.views.DatasetsSelection = Backbone.View.extend({
	events: {
		'click .arkiweb-datasets-selection-menu .arkiweb-datasets-selection-clear-selection': 'clearSelection',
		'click .arkiweb-datasets-selection-menu .arkiweb-datasets-selection-submit-selection': 'submitSelection',
		'click .arkiweb-datasets-selection-menu .arkiweb-datasets-seclection-toggle-allowed': 'toggleAllowed'
	},
	initialize: function() {
		this.content = $(this.el).find(".arkiweb-datasets-selection-list");
		this.buttons.submit = $(this.el).find(".arkiweb-datasets-selection-menu .arkiweb-datasets-selection-submit-selection");
		this.buttons.clear = $(this.el).find(".arkiweb-datasets-selection-menu .arkiweb-datasets-selection-clear-selection");
		this.buttons.toggle = $(this.el).find(".arkiweb-datasets-selection-menu .arkiweb-datasets-seclection-toggle-allowed");

		this.buttons.submit.attr('disabled', true);
		this.buttons.clear.attr('disabled', true);

		this.collection.bind('reset', this.render, this);
		this.collection.bind('error', this.renderError, this);
	},
	views: [],
	buttons: {
		submit: null,
		clear: null,
		toggle: null
	},
	empty: function() {
		return this.content.empty();
	},
	render: function() {
		this.empty();
		this.views = [];
		this.collection.each(function(model) {
			var el = $("<div>");
			this.content.append(el);
			var view = new arkiweb.views.DatasetsSelectionItem({
				model: model,
				el: el
			});
			view.render();
			this.views.push(view);
			view.bind("change", this.notifyChange, this);
		}, this);
		return this;
	},
	renderError: function(model, error) {
		var message = "Error while loading datasets: " + error.statusText;
		var view = new arkiweb.views.Error({ 
			el: $(this.content),
			message: message
		});
		view.render();
		this.views.push(view);
		return this;
	},
	notifyChange: function(view) {
		this.buttons.submit.attr('disabled', this.getSelected().length == 0);
		this.buttons.clear.attr('disabled', this.getSelected().length == 0);
		this.trigger("change", view);
	},
	submitSelection: function() {
		this.trigger('submit');
	},
	clearSelection: function() {
		_.each(this.views, function(view) {
			view.setSelection(false);
		});
	},
	toggleAllowed: function() {
		$(this.content).find('*[allowed=false]').toggleClass("hidden");
	},
	getSelected: function() {
		return _.select(this.views, function(view) {
			return view.isSelected();
		}, this);
	}
});

