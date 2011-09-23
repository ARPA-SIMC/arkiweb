arkiweb.models.FieldValue = Backbone.Model.extend({
	initialize: function(attributes) {
		try {
			this.query = ArkiwebParser[attributes.type].styles[attributes.value.s].decode(attributes.value);
		} catch (e) {
			this.query = undefined;
		}
	}
});
