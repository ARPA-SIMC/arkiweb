arkiweb.views.Postprocessor = Backbone.View.extend({
	//tmpl: '#arkiweb-postprocessor-tmpl',
	events: {
		'click input[name=arkiweb-postprocess-checkbox]': 'triggerSelection',
		'click .arkiweb-postprocessor-name': 'showHelp'
	},
	initialize: function(options) {
		var div = $("<div>");
		$(this.el).append(div);
		this.postprocessor = new options.postprocessor({
			map: options.map,
			datasets: options.datasets
		});
		this.name = this.postprocessor.name;
	},
	render: function() {
		//var tmpl = $(this.tmpl).tmpl({
		var tmpl = arkiweb.templates["postprocessor"]({
			name: this.postprocessor.name
		});
		$(this.el).append(tmpl);
		this.postprocessor.el = $(this.el).find(".arkiweb-postprocessor-item-content");
		this.checkbox = $(this.el).find(" input[name=arkiweb-postprocess-checkbox]").get(0);
		this.disable();
		this.postprocessor.render();
		$(this.el).css('color', this.postprocessor.color);
		return this;
	},
	disable: function() {
		$(this.checkbox).attr('checked', false);
		$(this.checkbox).attr('disabled', true);
		this.postprocessor.deactivate();
	},
	enable: function() {
		$(this.checkbox).attr('disabled', false);
	},
	triggerSelection: function() {
		this.trigger('change', this);
		if (this.isSelected()) {
			this.postprocessor.activate();
		} else {
			this.postprocessor.deactivate();
		}
	},
	isSelected: function() {
		return $(this.checkbox).is(":checked");
	},
	setSelection: function(value) {
		if ((value && !this.isSelected()) || (!value && this.isSelected())) {
			this.checkbox.click();
		}
	},
	getValue: function() {
		return this.postprocessor.getValue();
	},
	showHelp: function() {
		alert(this.postprocessor.help);
	}
});
