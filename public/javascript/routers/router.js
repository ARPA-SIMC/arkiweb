arkiweb.routers.Router = Backbone.Router.extend({
	tmpl: '#arkiweb-tmpl',
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
		this.loadTemplates();
		this.mainview = new arkiweb.views.Main(this.settings);
	},	
	loadTemplates: function() {
		var self = this;
		if ($(this.tmpl).length == 0) {
			$.ajax({
				url: self.settings.urls.tmpl,
				async: false,
				dataType: 'html',
				success: function(data) {
					$("body").append(data);
				},
				error: function() {
					alert("error");
				}
			});
		}
	},
	routes: {
		"":	"index"
	},
	index: function() {
		this.mainview.render();
	}
});

