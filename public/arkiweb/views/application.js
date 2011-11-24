(function() {
	var Application = Backbone.View.extend({
		initialize: function(opts) {
			this.opts = opts;
			this.collections = {};
			this.collections.datasets = new arkiweb.collections.Datasets();
			this.collections.datasets.url = opts.baseUrl + "/datasets";
			this.collections.fields = new arkiweb.collections.Fields();
			this.collections.fields.url = opts.baseUrl + "/fields";
			this.collections.summary = new arkiweb.collections.Fields();
			this.collections.summary.url = opts.baseUrl + "/fields";

			this.render();
		},
		render: function() {
			var tmpl = arkiweb.templates["application"]();
			$(this.el).html(tmpl);

			var self = this;
			this.mainlayout = $(this.el).layout({
				closable: false,
				resizable: false,
				hidable: false,
				north__paneSelector: '.header',
				center__paneSelector: '.content',
				south__paneSelector: '.footer'
			});
			this.contentlayout = $(".content", $(this.el)).layout({
				closable: false,
				resizable: false,
				hidable: false,
				center__paneSelector: '.selection',
				south__paneSelector: '.map',
				south__size: "40%",
				onresize: function() {
					self.views.map.updateSize();
				}
			});

			this.datasetslayout = $(".datasets", $(this.el)).height("100%").layout({
				applyDefaultStyles: true,
				closable: false,
				resizable: false,
				hidable: false,
				north__paneSelector: '.datasets-menu',
				center__paneSelector: '.datasets-content'
			});
			this.fieldslayout = $(".fields", $(this.el)).height("100%").layout({
				applyDefaultStyles: true,
				closable: false,
				resizable: false,
				hidable: false,
				north__paneSelector: '.fields-menu',
				center__paneSelector: '.fields-content'
			});
			this.summarylayout = $(".summary", $(this.el)).height("100%").layout({
				applyDefaultStyles: true,
				closable: false,
				resizable: false,
				hidable: false,
				north__paneSelector: '.summary-menu',
				center__paneSelector: '.summary-content'
			});

			$(window).resize(function() {
				self.mainlayout.resizeAll();
				self.contentlayout.resizeAll();
				self.datasetslayout.resizeAll();
				self.fieldslayout.resizeAll();
				self.summarylayout.resizeAll();
			});

			$(".selection > div").hide();

			this.views = {};

			this.views.datasets = new arkiweb.views.DatasetsSelection({
				collection: this.collections.datasets,
				el: ".datasets-content"
			});

			this.views.datasets.bind("select", function() {
				this.collections.fields.reset();
			}, this);

			this.views.fields = new arkiweb.views.FieldsSelection({
				collection: this.collections.fields,
				el: ".fields-content"
			});

			this.views.summary = new arkiweb.views.Summary({
				collection: this.collections.summary,
				el: ".summary-content"
			});

			this.views.map = new arkiweb.views.Map({
				el: ".map",
				datasets: this.views.datasets
			});


			this.views.map.render();

			this.views.postprocessors = new arkiweb.views.Postprocessors({
				el: ".postprocessors-content",
				datasets: this.views.datasets,
				map: this.views.map.map
			});

			this.views.postprocessors.render();

			this.loadDatasets();
		},
		block: function(message) {
			$.blockUI.defaults.css = {};
			$(this.el).block({
				message: "<span class='block'>" + message + "</span>",
				css: {}
			});
		},
		block_err: function(message) {
			this.block("<span class='error'>" + message + "</span>");
		},
		unblock: function() {
			$(this.el).unblock();
		},

		events: {
			'click .datasets-menu .toggle-disallowed': 'toggleDisallowedDatasets',
			'click .datasets-menu .clear-selection': 'clearDatasetsSelection',
			'click .datasets-menu .submit-selection': 'loadFields',
			'click .fields-menu .show-datasets': 'showDatasets',
			'click .fields-menu .clear-selection': 'clearFieldsSelection',
			'click .fields-menu .submit-selection': 'loadSummary',
			'click .summary-menu .show-datasets': 'showDatasets',
			'click .summary-menu .show-fields': 'showFields',
			'click .summary-menu .show-postprocessors': 'showPostprocessors',
			'click .postprocessors-menu .show-datasets': 'showDatasets',
			'click .postprocessors-menu .show-fields': 'showFields',
			'click .postprocessors-menu .download-selection': 'downloadSelection'
		},
		toggleDisallowedDatasets: function() {
			this.views.datasets.toggleDisallowed();
		},
		clearDatasetsSelection: function() {
			this.views.datasets.clearSelection();
		},
		loadDatasets: function() {
			this.block("loading datasets");
			var self = this;
			this.collections.datasets.fetch({
				success: function() {
					self.unblock();
				},
				error: function(collection, error) {
					self.unblock();
					self.block_err("Error while fetching datasets from " + collection.url + ": " + error.statusText + " (" + error.status + ")");
				}
			});

			this.showDatasets();
		},
		showDatasets: function() {
			$(".selection > div", $(this.el)).hide();
			$(".selection > .datasets", $(this.el)).show("slide", "slow");
		},
		loadFields: function() {
			this.block("loading fields");

			var datasets = _.map(this.views.datasets.getSelected(), function(ds) { return ds.get("name") });
			var self = this;
			this.collections.fields.fetch({
				data: {
					datasets: datasets
				},
				success: function() {
					self.unblock();
				},
				error: function(collection, error) {
					self.unblock();
					self.block_err("Error while fetching fields from " + collection.url + ": " + error.statusText + " (" + error.status + ")");
				},
			});

			this.showFields();
		},
		showFields: function() {
			$(".selection > div", $(this.el)).hide();
			$(".selection > .fields", $(this.el)).show("slide", "slow");
		},
		clearFieldsSelection: function() {
			this.views.fields.clearSelection();
		},
		showSummary: function() {
			$(".selection > div", $(this.el)).hide();
			$(".selection > .summary", $(this.el)).show("slide", "slow");
		},
		loadSummary: function() {
			this.block("loading summary");

			var datasets = _.map(this.views.datasets.getSelected(), function(ds) { return ds.get("name") });
			var query = this.views.fields.getQuery();

			var self = this;
			this.collections.summary.fetch({
				data: {
					datasets: datasets,
					query: query
				},
				success: function() {
					self.unblock();
				},
				error: function(collection, error) {
					self.unblock();
					self.block_err("Error while fetching summary from " + collection.url + ": " + error.statusText + " (" + error.status + ")");
				},
			});

			this.showSummary();
		},
		showPostprocessors: function() {
			$(".selection > div").hide();
			$(".selection > .postprocessors", $(this.el)).show("slide", "slow");
		},
		downloadSelection: function() {
			var data = {
				datasets: _.map(this.views.datasets.getSelected(), function(ds) { return ds.get("name") }),
				query: this.views.fields.getQuery()
			};
			var postprocess = this.views.postprocessors.getCommand();
			if (postprocess)
				data.postprocess = postprocess;

			var url = this.opts.baseUrl + "/data?" + $.param(data);
			window.open(url);
		}
	});

	this.arkiweb.views.Application = Application;
}());
