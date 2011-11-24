(function() {
	var Postprocessors = Backbone.View.extend({
		initialize: function(opts) {
			this.datasets = opts.datasets;
			this.datasets.bind("select", this.update, this);

			this.map = opts.map;

		},
		postprocessors: [],
		render: function() {
			_.each(arkiweb.postprocessors, function(klass, name) {
				var p = new PostprocessorContainer({
					name: name,
					map: this.map,
					postprocessor: klass
				});
				p.render();
				$(this.el).append(p.el);

				this.postprocessors.push(p);
			}, this);


			this.update();
		},
		update: function() {
			var datasets = this.datasets.getSelected();
			var allowed = [];

			_.each(datasets, function(model) {
				allowed.push(model.get("postprocess"));
			}, this);


			allowed = _.intersection.apply(this, allowed);

			_.each(this.postprocessors, function(pp) {
				if (_.include(allowed, pp.options.name)) {
					pp.enable();
				} else {
					pp.disable();
				}
			});
		},
		getCommand: function() {
			var cmd = null;
			_.each(this.postprocessors, function(pp) {
				if (pp.isSelected()) {
					cmd = pp.getCommand();
				}
			});
			return cmd;
		}
	});

	var PostprocessorContainer = Backbone.View.extend({
		className: "postprocessor",
		initialize: function() {
			var klass = this.options.postprocessor;
			this.postprocessor = new klass({
				map: this.options.map
			});
		},
		render: function() {
			var tmpl = arkiweb.templates["postprocessor"];
			$(this.el).html(tmpl({
				name: this.options.name
			}));
			this.postprocessor.render();
			$(this.el).append(this.postprocessor.el);
		},
		events: {
			'click .postprocessor-checkbox': 'toggleSelection'
		},
		toggleSelection: function(ev) {
			$(this.el).toggleClass("selected");
			var checked = $(this.el).hasClass("selected");
			if (checked) {
				// Baaaad
				$(this.el).siblings().find(".postprocessor-checkbox:checked").click();
				this.postprocessor.activate();
			} else {
				this.postprocessor.deactivate();
			}
		},
		isSelected: function() {
			return $(this.el).find(".postprocessor-checkbox:checked");
		},
		enable: function() {
			this.postprocessor.activate();
			$(this.el).find(".postprocessor-checkbox").removeAttr("disabled");
		},
		disable: function() {
			this.postprocessor.deactivate();
			$(this.el).find(".postprocessor-checkbox:checked").attr("checked", false);
			$(this.el).find(".postprocessor-checkbox").attr("disabled", "disabled");
		},
		getCommand: function() {
			this.postprocessor.getCommand();
		}
	});

	var PostprocessorControl = Backbone.View.extend({
		className: "postprocessor-content",
		activate: function() {},
		deactivate: function() {},
		getCommand: function() {
			return null;
		}
	});

	this.arkiweb.views.Postprocessors = Postprocessors;
	this.arkiweb.views.PostprocessorControl = PostprocessorControl;
}());
