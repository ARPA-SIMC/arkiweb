arkiweb.views.FieldsSelectionSection = Backbone.View.extend({
	//tmpl: '#arkiweb-fields-selection-section-tmpl',
	events: {
		'click h3': 'toggleSection'
	},
	views: [],
	render: function() {
		//var tmpl = $(this.tmpl).tmpl(this.model.toJSON());
		var tmpl = arkiweb.templates["fields-selection-section"](this.model.toJSON());
		$(this.el).append(tmpl);
		$(this.el).find(".arkiweb-fields-selection-section-list").addClass("hidden");
		this.views = [];
		this.model.collection.each(function(model) {
			var div = $("<div>");
			$(this.el).find(".arkiweb-fields-selection-section-list").append(div);
			var view = new arkiweb.views.FieldsSelectionSectionItem({
				model: model,
				el: div
			});
			view.render();
			this.views.push(view);
		}, this);
	},
	toggleQuery: function() {
		_.each(this.views, function(view) {
			view.toggleQuery();
		}, this);
	},
	toggleSection: function() {
		$(this.el).find(".arkiweb-fields-selection-section-list").toggleClass("hidden");
	},
	getSelected: function() {
		return _.select(this.views, function(view) {
			return view.isSelected();
		});
	},
	query: function() {
		var selected = this.getSelected();
		if (selected.length == 0)
			return null;
		var queries = _.map(selected, function(view) {
			return view.model.query
		});
		var query;
		try {
			query = ArkiwebParser[this.model.get('type')].decode(queries);
		} catch (e) {
			query = null;
		}
		return query;
	},
	clearSelection: function() {
		_.each(this.views, function(view) {
			view.setSelection(false);
		});
	}
});

