arkiweb.views.postprocessors.Singlepoint = arkiweb.views.AbstractPostprocessor.extend({
	initialize: function(options) {
		var self = this;
		this.map = options.map.map;
		this.layer = new OpenLayers.Layer.Vector("singlepoint", {
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
		this.map.addControl(this.control);
		this.map.addLayer(this.layer);
	},
	activate: function() {
		this.layer.setVisibility(true);
		this.control.activate();
	},
	deactivate: function() {
		this.layer.setVisibility(false);
		this.control.deactivate();
	},
	name: "singlepoint",
	help: "This postprocessor extract a single point of the selection.\nYou can select the point clicking on the map and/or filling the input fields\n",
	render: function() {
		$(this.el).append("lat <input type='text' name='lat'> lon <input type='text' name='lon'/>");
		var self = this;
		$(this.el).find("input[type=text]").bind("change", function() {
			self.onChangeInputCoords();
		});
	},
	updateInput: function(coords) {
		$(this.el).find("input[name=lon]").val(coords.x);
		$(this.el).find("input[name=lat]").val(coords.y).trigger('change');
	},
	updateMap: function(coords) {
		var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(coords.x, coords.y));
		this.layer.removeAllFeatures();
		this.layer.addFeatures([feature]);
	},
	onChangeInputCoords: function() {
		this.updateMap({ 
			x: $(this.el).find("input[name=lon]").val(),
			y: $(this.el).find("input[name=lat]").val()
		});
	},
	getValue: function() {
		return "singlepoint " + $(this.el).find("input[name=lon]").val() + " " + $(this.el).find("input[name=lat]").val();
	}
});

