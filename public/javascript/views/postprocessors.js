arkiweb.views.Postprocessors = Backbone.View.extend({
		initialize: function(options) {
			this.map = options.map;
			this.datasets = options.datasets;
			this.postprocessors = {};
			_.each(options.postprocessors, function(postprocessor) {
				var div = $("<div>");
				$(this.el).find(".arkiweb-postprocess-content").append(div);
				var p = new arkiweb.views.Postprocessor({
					postprocessor: postprocessor,
					map: this.map,
					datasets: this.datasets,
					el: div
				});
				this.postprocessors[p.name] = p;
				p.bind('change', this.onChangedSelection, this);
			}, this);

			this.datasets.bind('change', this.onDatasetsSelectionChanged, this);
		},
		render: function() {
			_.each(this.postprocessors, function(postprocessor) {
				postprocessor.render();
			});
		},
		onDatasetsSelectionChanged: function() {
			var selected = this.datasets.getSelected();
			var postprocessors = [];
			_.each(selected, function(s) {
				postprocessors.push(s.model.get('postprocess'));
			}, this);
			postprocessors = _.intersection.apply(null, postprocessors);
			_.each(this.postprocessors, function(p) {
				if (_.include(postprocessors, p.name)) {
					p.enable();
				} else {
					p.disable();
				}
			});
		},
		onChangedSelection: function(view) {
			if (view.isSelected()) {
				_.each(this.postprocessors, function(p) {
					p.unbind('change', this.onChangedSelection);
					if (p != view) {
						p.setSelection(false);
					}
					p.bind('change', this.onChangedSelection, this);
				}, this);
			}
		},
		getValue: function() {
			var value = null;
			_.each(this.postprocessors, function(postprocessor) {
				if (postprocessor.isSelected()) {
					value = postprocessor.getValue();
				}
			}, this);
			return value;
		}
	});
