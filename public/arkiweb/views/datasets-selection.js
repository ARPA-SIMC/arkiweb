(function() {
	var DatasetsSelection = Backbone.View.extend({
		initialize: function(opts) {
			this.collection.bind("reset", this.render, this);
			this.bind("select", this.updateSelectionList, this);
		},
		views: [],
		render: function() {
			var tmpl = arkiweb.templates["datasets-selection"]();
			this.views = [];
			$(this.el).html(tmpl);

			var content = $(this.el).find(".datasets-list");

			this.collection.each(function(model) {
				var view = new DatasetsSelectionItem({
					model: model
				});
				view.render();
				this.views.push(view);
				content.append(view.el);
				view.bind("select", this.triggerSelection, this);
			}, this);

			this.layout = $(this.el).layout({
				applyDefaultStyles: true,
				north__paneSelector: ".selected-datasets",
				center__paneSelector: ".datasets-table"
			});
		},
		triggerSelection: function(view) {
			this.trigger("select", view.model, view.isSelected());
		},
		toggleDisallowed: function() {
			_.each(this.views, function(view) {
				if (view.model.get("allowed") == false) {
					$(view.el).toggle();
				}
			});
		},
		updateSelectionList: function() {
			var datasets = _.map(this.getSelected(), function(model) { 
				return model.get("name")
			});

			$(this.el).find(".selected-datasets .selected-datasets-list").html(datasets.join(", "));
		},
		getSelected: function() {
			var selected = [];
			_.each(this.views, function(view) {
				if (view.isSelected())
					selected.push(view.model);
			});
			return selected;
		},
		clearSelection: function() {
			_.each(this.views, function(view) {
				if (view.isSelected())
					view.toggleSelection();
			});
		}
	});

	var DatasetsSelectionItem = Backbone.View.extend({
		tagName: "tr",
		className: "datasets-selection-item",
		render: function() {
			var tmpl = arkiweb.templates["datasets-selection-item"](this.model.toJSON());
			$(this.el).html(tmpl);

			if (this.model.get("allowed") == false) {
				$(this.el).addClass("disallowed");
			}
		},
		events: {
			'click': 'toggleSelection'
		},
		toggleSelection: function() {
			$(this.el).toggleClass("selected");
			this.trigger("select", this);
		},
		isSelected: function() {
			return $(this.el).hasClass("selected");
		}
	});

	this.arkiweb.views.DatasetsSelection = DatasetsSelection;
}());
