arkiweb.views.DatasetsSelectionItem = Backbone.View.extend({
	events: {
		'click .arkiweb-dataset-name': 'showDataset',
		'click input:checkbox': 'notifyChange'
	},
	tmpl: "#arkiweb-datasets-selection-item-tmpl",
	render: function() {
		var tmpl = $(this.tmpl).tmpl(this.model.toJSON());
		$(this.el).append(tmpl);
		this.checkbox = $(this.el).find("input:checkbox").get(0);
		return this;
	},
	notifyChange: function() {
		this.trigger("change", this);
	},
	isSelected: function() {
		return $(this.checkbox).is(':checked');
	},
	setSelection: function(value) {
		if ((value && !this.isSelected()) || (!value && this.isSelected())) {
			this.checkbox.click();
		}
		return this;
	},
	showDataset: function() {
		var div = $("<div>");
		var tmpl = $("#arkiweb-dataset-description-tmpl").tmpl(this.model.toJSON());
		div.append(tmpl);
		div.dialog({
			title: this.model.name,
			autoOpen: true,
			modal: true,
			close: function() {
				$(this).remove();
			}
		});
	}
});

