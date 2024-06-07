(function() {
	var FieldsSelection = Backbone.View.extend({
		initialize: function(opts) {
			this.collection.bind("reset", this.render, this);
		},
		views: [],
		render: function() {
			if (this.content)
				this.content.accordion("destroy");
			if (this.layout)
				this.layout.destroy();

			var tmpl = arkiweb.templates["fields-selection"](this.collection);
			$(this.el).html(tmpl);
			this.views = [];

			this.content = $(this.el).find(".fields-selection-items");

			// Reftime selection
			if (this.collection.stats.c > 0) {

				var view = new FieldSelectionReftime({
					stats: this.collection.stats
				});
				this.views.push(view);
				view.render();
				this.content.append(view.el);
				view.bind("select", this.updateQuery, this);
			}

			// Field selections
			this.collection.each(function(model) {
				var view = new FieldsSelectionItem({
					model: model
				});
				this.views.push(view);
				view.render();
				this.content.append(view.el);
				view.bind("select", this.updateQuery, this);
			}, this);

			var self = this;
			this.content.accordion({
				header: 'h3',
				collapsible: true,
				autoHeight: true,
				active: false,
				change: function() {
					self.layout.resizeAll();
				}
			});

			this.layout = $(this.el).layout({
				applyDefaultStyles: true,
				hidable: false,
				closable: false,
				north__resizable: false,
				north__paneSelector: ".fields-selection-summary",
				center__paneSelector: ".fields-selection-items"
			});
		},
		updateQuery: function() {
			$(".fields-selection-summary .query", $(this.el)).html(this.getQuery());
		},
		getQuery: function() {
			var query = [];
			_.each(this.views, function(view) {
				var q = view.getQuery();
				if (q)
					query.push(view.getQuery());
			});
			return query.join("; ");
		},
		clearSelection: function() {
			_.each(this.views, function(view) {
				view.clearSelection();
			});
		}
	});

	var FieldSelectionReftime = Backbone.View.extend({
		initialize: function(opts) {
			this.stats = opts.stats;
		},
		render: function() {
			var tmpl = arkiweb.templates["fields-selection-reftime"](this.stats);
			$(this.el).html(tmpl);

			this.resetValues();

			var self = this;
			var opts = {
				dateFormat: 'yy-mm-dd',
				separator: ' ',
				timeFormat: 'hh:mm:ss',
				minDate: this.stats.b,
				maxDate: this.stats.e,
				changeMonth: true,
				changeYear: true,
				onSelect: function() {
					self.triggerSelection();
				}
			};
			
			$(this.el).find(".begin-value,.end-value").datetimepicker(opts);
		},
		resetValues: function() {
			$(this.el).find(".begin-value").val(this.stats.b.strftime("%Y-%m-%d %H:%M:%S"));
			$(this.el).find(".end-value").val(this.stats.e.strftime("%Y-%m-%d %H:%M:%S"));
		},
		events: {
			'click .begin': 'triggerSelection',
			'click .end': 'triggerSelection'
		},
		triggerSelection: function() {
			this.trigger("select", this);
		},
		clearSelection: function() {
			this.resetValues();
			$(this.el).find("*:checked").click();
			this.triggerSelection();
		},
		getQuery: function() {
			var begin = undefined;
			var end = undefined;

			if ($(this.el).find(".begin").is(":checked"))
				begin = $(this.el).find(".begin-value").val();
			if ($(this.el).find(".end").is(":checked"))
				end = $(this.el).find(".end-value").val();

			if (begin || end) {
				if (begin == end) {
					return "reftime: =" + begin;
				} else {
					var q = [];
					if (begin) 
						q.push(">= " + begin);
					if (end)   
						q.push("<= " + end);
					return "reftime: " + q.join(", ");
				}
			} else {
				return null;
			}
		}
	});

	var FieldsSelectionItem = Backbone.View.extend({
		render: function() {
			var tmpl = arkiweb.templates["fields-selection-item"](this.model.toJSON());
			$(this.el).html(tmpl);
		},
		events: {
			'click tbody tr.parsed': 'toggleSelection'
		},
		toggleSelection: function(ev) {
			var tr = $(ev.currentTarget);
			tr.toggleClass("selected");
			this.trigger("select", this);
		},
		clearSelection: function() {
			$(this.el).find("tr.parsed.selected").click();
		},
		getQuery: function() {
			var query = [];
			$(this.el).find("tr.parsed.selected").each(function() {
				query.push($(this).find(".query").text());
			});
			if (query.length == 0) {
				return null;
			}
			try {
				query = ArkiwebParser[this.model.get("type")].decode(query);
			} catch (e) {
				return null;
			}
			return query;
		}
	});

	this.arkiweb.views.FieldsSelection = FieldsSelection;
}());
