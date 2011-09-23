arkiweb.views.DatasetsSelectionItem = Backbone.View.extend({
	events: {
		'click .arkiweb-dataset-name': 'showDataset',
		'click input:checkbox': 'notifyChange'
	},
	render: function() {
		var tmpl = arkiweb.templates["datasets-selection-item"](this.model.toJSON());
		//var tmpl = $(this.tmpl).tmpl(this.model.toJSON());
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
		var tmpl = arkiweb.templates["dataset-description"](this.model.toJSON());
		$("<div>").append($(tmpl)).dialog({
			title: this.model.name,
			autoOpen: true,
			modal: true,
			close: function() {
				$(this).remove();
			}
		});
	}
});

