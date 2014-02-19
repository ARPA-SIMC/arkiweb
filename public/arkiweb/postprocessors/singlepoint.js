(function() {
	var Singlepoint = arkiweb.views.PostprocessorControl.extend({
		initialize: function(opts) {
			this.layer = new OpenLayers.Layer.Vector("singlepoint", {
				style: {
					strokeColor: this.options.color,
					strokeOpacity: "0.5",
					strokeWidth: 2,
					fillColor: this.options.color,
					fillOpacity: "0.5",
					pointRadius: 3
				}
			});
			this.control = new OpenLayers.Control();

			var self = this;
			OpenLayers.Util.extend(this.control, {
				draw: function() {
					this.point = new OpenLayers.Handler.Point(self.control, {
						"done": this.notice
					});
				},
				activate: function() {
					this.point.activate();
				},
				deactivate: function() {
					this.point.deactivate();
				},
				notice: function(p) {
					self.updateInput({
						x: p.x,
						y: p.y
					});
				}
			});
			this.options.map.addControl(this.control);
			this.options.map.addLayer(this.layer);
		},
		render: function() {
			$(this.el).html("lat <input type='text' name='lat'/> \
                            lon <input type='text' name='lon'/> \
                            format <select name='format'> \
                                <option selected value='BUFR'>BUFR</option> \
                                <option value='CREX'>CREX</option> \
                                <option value='JSON'>JSON</option> \
                            </select> \
                            interpolation <select name='interpolation'> \
                                <option selected value='bilin'>bilinear</option> \
                                <option value='near'>nearest point</option> \
                            </select>");
		},
		events: {
			"change input[type=text]": "onChangeInputCoords"
		},
		activate: function() {
			this.layer.setVisibility(true);
			this.control.activate();
		},
		deactivate: function() {
			this.layer.setVisibility(false);
			this.control.deactivate();
		},
		updateInput: function(coords) {
			$(this.el).find("input[name=lon]").val(coords.x);
			$(this.el).find("input[name=lat]").val(coords.y).trigger('change');
		},
		updateMap: function(coords) {
			var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(coords.x, coords.y));
			this.layer.destroyFeatures();
			this.layer.addFeatures([feature]);
		},
		onChangeInputCoords: function() {
			this.updateMap({
				x: $(this.el).find("input[name=lon]").val(),
				y: $(this.el).find("input[name=lat]").val()
			});
		},
		getCommand: function() {
			return "singlepoint " +
                " -f " + $(this.el).find("input[name=format]").val() +
                " -z " + $(this.el).find("input[name=interpolation]").val() +
                " " + $(this.el).find("input[name=lon]").val() +
                " " + $(this.el).find("input[name=lat]").val();
		}
	});

	this.arkiweb.postprocessors.singlepoint = Singlepoint;
}());
