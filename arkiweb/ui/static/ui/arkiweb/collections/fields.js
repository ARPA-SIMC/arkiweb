(function() {
	var Fields = Backbone.Collection.extend({
		model: arkiweb.models.Field,
		initialize: function(attrs) {
		},
		stats: {
			c: 0,
			s: 0
		},
		parse: function(resp) {
			this.stats = resp.stats;
			if (this.stats.c != 0) {
				this.stats.b = this.array2date(this.stats.b);
				this.stats.e = this.array2date(this.stats.e);
			}
			return resp.fields;
		},
		array2date: function(arr) {
			return new Date(arr[0], arr[1] - 1, arr[2],
					arr[3], arr[4], arr[5], 0);
		}
	});

	this.arkiweb.collections.Fields = Fields;
}());
