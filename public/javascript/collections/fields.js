arkiweb.collections.Fields = Backbone.Collection.extend({
	model: arkiweb.models.Field,
	url: 'fields',
	initialize: function() {
		this.bind('reset', function() {
			if (this.models.length == 0)
				this.stats = null;
		}, this);
	},
	parse: function(response) {
		if (!response.stats.b || !response.stats.e) {
			this.stats = null
		} else {
			response.stats.b[1] -= 1;
			response.stats.e[1] -= 1;
			this.stats = {
				begin: eval("new Date(" + response.stats.b.join(",") + ")"),
				end: eval("new Date(" + response.stats.e.join(",") + ")"),
				count: response.stats.c,
				size: response.stats.s
			};
		}
		return response.fields;
	}
});
