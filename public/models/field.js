arkiweb.models.Field = Backbone.Model.extend({
	initialize: function(attributes) {
		this.collection = new arkiweb.collections.FieldValues();
		_.each(attributes.values, function(value) {
			var value = {
				type: this.get('type'),
				value: value
			};
			var model = new arkiweb.models.FieldValue(value);
			this.collection.add(model);
		}, this);
	}
});
