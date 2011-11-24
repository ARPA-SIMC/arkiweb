(function() {
	var Subarea = arkiweb.views.PostprocessorControl.extend({
		initialize: function(opts) {
			this.layer = new OpenLayers.Layer.Vector("subarea", {
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
					this.box = new OpenLayers.Handler.Box(self.control, {
						"done": this.notice
					});
				},
				activate: function() {
					this.box.activate();
				},
				deactivate: function() {
					this.box.deactivate();
				},
				notice: function(bounds) {
					var ll = this.map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.left, bounds.bottom));
					var ur = this.map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.right, bounds.top));

					self.updateInput({
						x: ll.lon,
						y: ll.lat,
						X: ur.lon,
						Y: ur.lat
					});
				}
			});
			this.options.map.addControl(this.control);
			this.options.map.addLayer(this.layer);
		},
		render: function() {
			$(this.el).html("lat1 <input type='text' name='lat1'/> lon1 <input type='text' name='lon1'/> lat2 <input type='text' name='lat2'/> lon2 <input type='text' name='lon2'/>");
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
			$(this.el).find("input[name=lon1]").val(coords.x);
			$(this.el).find("input[name=lon2]").val(coords.X);
			$(this.el).find("input[name=lat1]").val(coords.y);
			$(this.el).find("input[name=lat2]").val(coords.Y).trigger("change");
		},
		updateMap: function(coords) {
			var points = [
				new OpenLayers.Geometry.Point(coords.x, coords.y),
				new OpenLayers.Geometry.Point(coords.X, coords.y),
				new OpenLayers.Geometry.Point(coords.X, coords.Y),
				new OpenLayers.Geometry.Point(coords.x, coords.Y),
				new OpenLayers.Geometry.Point(coords.x, coords.y)
			];
			
			var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LinearRing(points));
			this.layer.destroyFeatures();
			this.layer.addFeatures([feature]);
		},
		onChangeInputCoords: function() {
			var coords = {
				x: $(this.el).find("input[name=lon1]").val(),
				y: $(this.el).find("input[name=lat1]").val(),
				X: $(this.el).find("input[name=lon2]").val(),
				Y: $(this.el).find("input[name=lat2]").val()
			};
			this.updateMap(coords);
		},
		getCommand: function() {
			var lons = [ $(this.el).find("input[name=lon1]").val(), $(this.el).find("input[name=lon2]").val() ];
			var lats = [ $(this.el).find("input[name=lat1]").val(), $(this.el).find("input[name=lat2]").val() ];
			return "subarea: " + _.min(lons) + " " + _.min(lats) + " " + _.max(lons) + " " + _.max(lats);
		}
	});

	this.arkiweb.postprocessors.subarea = Subarea;
}());
