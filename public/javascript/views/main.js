arkiweb.views.Main = Backbone.View.extend({
	initialize: function(options) {
		this.options = options;
		this.collections = {};

		this.collections.datasets = new arkiweb.collections.Datasets()
		this.collections.datasets.url = options.urls.datasets || this.collections.datasets.url;

		this.collections.fields = new arkiweb.collections.Fields();
		this.collections.fields.url = options.urls.fields || this.collections.fields.url;

		this.collections.summary = new arkiweb.collections.Fields();
		this.collections.summary.url = options.urls.summary || this.collections.summary.url;

		this.views = {};

		this.options.urls.data = this.options.urls.data || 'data';

		this.options.postprocessors = this.options.postprocessors || [ arkiweb.views.postprocessors.Subarea, arkiweb.views.postprocessors.Singlepoint ];

	},
	render: function() {
		var tmpl = arkiweb.templates["main"]();
		$(this.el).append(tmpl);
		$(this.el).addClass("arkiweb");
		$(this.el).css('height', this.options.height);

		this.views.datasets = new arkiweb.views.DatasetsSelection({
			collection: this.collections.datasets,
			el: $(this.el).find('.arkiweb-datasets-selection')
		});

		this.views.datasets.bind('submit', this.loadFields, this);

		this.views.map = new arkiweb.views.Map({
			view: this.views.datasets,
			el: $(this.el).find('.arkiweb-map')
		});

		this.views.fields = new arkiweb.views.FieldsSelection({
			collection: this.collections.fields,
			el: $(this.el).find('.arkiweb-fields-selection')
		});

		this.views.fields.bind("submit", this.loadSummary, this);
		this.views.fields.bind("download", this.downloadData, this);

		this.views.summary = new arkiweb.views.Summary({
			collection: this.collections.summary,
			el: $("<div>")
		});

		this.views.postprocessors = new arkiweb.views.Postprocessors({
			map: this.views.map,
			datasets: this.views.datasets,
			el: $(this.el).find(".arkiweb-postprocess"),
			postprocessors: [
				arkiweb.views.postprocessors.Singlepoint,
				arkiweb.views.postprocessors.Subarea
			]
		});
		this.views.postprocessors.render();

		this.layouts = {};
		this.layouts.main = $(this.el).layout({
			applyDefaultStyles: true,
			west__paneSelector: '.arkiweb-datasets-selection',
			east__paneSelector: '.arkiweb-fields-selection',
			center__paneSelector: '.arkiweb-map',
			south__paneSelector: '.arkiweb-postprocess',
			south__size: '40%',
			west__size: '33%',
			east__size: '33%'
		});
		this.layouts.datasets = $(this.views.datasets.el).layout({
			center__applyDefaultStyles: true,
			north__paneSelector: '.arkiweb-datasets-selection-header',
			center__paneSelector: '.arkiweb-datasets-selection-content'
		});
		this.layouts.fields = $(this.views.fields.el).layout({
			center__applyDefaultStyles: true,
			north__paneSelector: '.arkiweb-fields-selection-header',
			center__paneSelector: '.arkiweb-fields-selection-content'
		});

		this.views.map.render();

		this.loadDatasets();
	},
	getDatasetsParam: function() {
		var datasets = _.map(this.views.datasets.getSelected(), function(view) {
			return view.model.get('id');
		});
		return datasets;
	},
	getPostprocessParam: function() {
		var postprocess = this.views.postprocessors.getValue();
		return postprocess;
	},
	getQueryParam: function() {
		var query = this.views.fields.query();
		return query;
	},
	loadDatasets: function() {
		var self = this;
		this.collections.datasets.fetch({
			beforeSend: function() {
				self.block();
			},
			complete: function() {
				self.unblock();
			}
		});
	},
	loadFields: function() {
		var self = this;
		var data = {};

		var datasets = this.getDatasetsParam();
		if (datasets)
			data.datasets = datasets;

		this.collections.fields.fetch({
			beforeSend: function() {
				self.block();
			},
			complete: function() {
				self.unblock();
			},
			data: data
		});
	},
	loadSummary: function() {
		var self = this;
		var data = {};
		var datasets = this.getDatasetsParam();
		if (datasets)
			data.datasets = datasets;
		var query = this.getQueryParam();
		if (query)
			data.query = query;

		this.collections.summary.fetch({
			beforeSend: function() {
				self.block();
			},
			complete: function() {
				self.unblock();
			},
			data: data
		});
	},
	downloadData: function() {
		var data = {};
		var datasets = this.getDatasetsParam();
		if (datasets)
			data.datasets = datasets;
		var query = this.getQueryParam();
		if (query)
			data.query = query;
		var postprocess = this.getPostprocessParam();
		if (postprocess)
			data.postprocess = postprocess;

		var url = this.options.urls.data + "?" + $.param(data);
		window.open(url);
	},
	block: function() {
		var img = "<div><img src='ajax-loader.gif' alt='loading'/></div>";
		$.blockUI.defaults.css = {};
		$(this.el).block({
			message: img
		});
	},
	unblock: function() {
		$(this.el).unblock();
	}
});

