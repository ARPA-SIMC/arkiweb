arkiweb.views.FieldsSelectionSectionItem = Backbone.View.extend({
	tmpl: '#arkiweb-fields-selection-section-item-tmpl',
	render: function() {
		var description = this.model.get('value').desc;
		var query = this.model.query;
		var tmpl = $(this.tmpl).tmpl({
			description: this.model.get('value').desc,
			query: this.model.query
		});
		$(this.el).append(tmpl);

		if (!this.model.query) {
			tmpl.find("input").attr('disabled', true);
		}

		tmpl.find('.arkiweb-field-query').addClass("hidden");
	},
	isSelected: function() {
		return $(this.el).find("input").is(":checked");
	},
	toggleQuery: function() {
		$(this.el).find(".arkiweb-field-description, .arkiweb-field-query").toggleClass("hidden");
	},
	setSelection: function(value) {
		var checkbox = $(this.el).find("input");
		if ((value && !this.isSelected()) || (!value && this.isSelected())) {
			checkbox.click();
		}
	}
});

