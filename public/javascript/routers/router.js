arkiweb.routers.Router = Backbone.Router.extend({
	settings: {
		el: 'body',
		urls: {
			tmpl: 'arkiweb.html',
			datasets: 'datasets',
			fields: 'fields',
			summary: 'summary',
			download: 'download'
		},
		height: '100%'
	},
	initialize: function(options) {
		if (options)
			$.extend(true, this.settings, options);
		this.mainview = new arkiweb.views.Main(this.settings);
	},
	routes: {
		"":	"index"
	},
	index: function() {
		this.mainview.render();
	}
});

