arkiweb.views.postprocessors.Subarea = arkiweb.views.AbstractPostprocessor.extend({
	initialize: function(options) {
		var self = this;
		this.map = options.map.map;
		this.layer = new OpenLayers.Layer.Vector("subarea", {
			style: {
				strokeColor: this.color,
				strokeOpacity: "0.5",
				strokeWidth: 2,
				fillColor: this.color,
				fillOpacity: "0.5",
				pointRadius: 3
			}
		});
		this.control = new OpenLayers.Control();
		OpenLayers.Util.extend(this.control, {
			draw: function() {
				this.point = new OpenLayers.Handler.Box(self.control, {
					"done": this.notice
				});
			},
			activate: function() {
				this.point.activate();
			},
			deactivate: function() {
				this.point.deactivate();
			},
			notice: function(bounds) {
				var ll = this.map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.left, bounds.bottom));
				var ur = this.map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.right, bounds.top));
				self.updateInput({
					x: ll.lon,
					X: ur.lon,
					y: ll.lat,
					Y: ur.lat
				});
			}
		});
		this.map.addLayer(this.layer);
		this.map.addControl(this.control);
	},
	color: "blue",
	activate: function() {
		this.layer.setVisibility(true);
		this.control.activate();
	},
	deactivate: function() {
		this.layer.setVisibility(false);
		this.control.deactivate();
	},
	name: "subarea",
	render: function() {
		var self = this;
		$(this.el).append("lat1 <input type='text' name='lat1'> lon1 <input type='text' name='lon1'/> lat2 <input type='text' name='lat2'/> lon2 <input type='text' name='lon2'/>");
		$(this.el).find("input[type=text]").bind("change", function() {
			self.updateMap();
		});
	},
	updateInput: function(coords) {
		$(this.el).find("input[name=lon1]").val(coords.x);
		$(this.el).find("input[name=lon2]").val(coords.X);
		$(this.el).find("input[name=lat1]").val(coords.y);
		$(this.el).find("input[name=lat2]").val(coords.Y).trigger("change");
	},
	updateMap: function() {
		var x = $(this.el).find("input[name=lon1]").val();
		var y = $(this.el).find("input[name=lat1]").val();
		var X = $(this.el).find("input[name=lon2]").val();
		var Y = $(this.el).find("input[name=lat2]").val();
		var points = [
			new OpenLayers.Geometry.Point(x,y),
			new OpenLayers.Geometry.Point(X, y),
			new OpenLayers.Geometry.Point(X, Y),
			new OpenLayers.Geometry.Point(x, Y),
			new OpenLayers.Geometry.Point(x,y)
		];
		var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LinearRing(points));
		this.layer.removeAllFeatures();
		this.layer.addFeatures([feature]);
	},
	getValue: function() {
		var lons = [ $(this.el).find("input[name=lon1]").val(), $(this.el).find("input[name=lon2]").val() ];
		var lats = [ $(this.el).find("input[name=lat1]").val(), $(this.el).find("input[name=lat2]").val() ];
		return "subarea " + _.min(lons) + " " + _.min(lats) + " " + _.max(lons) + " " + _.max(lats);
	}
});

