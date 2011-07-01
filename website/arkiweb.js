ArkiwebParser['reftime'] = {
	decode: function(a) {
		return "reftime: " + a[0];
	},
	styles: {
		standard: {
			decode: function(i) {
				var r = [];
				if (i.b) {
					r.push($.format(">= {0}-{1:02d}-{2:02d} {3:02d}:{4:02d}:{5:02d}", i.b));
				}
				if (i.e) {
					r.push($.format("<= {0}-{1:02d}-{2:02d} {3:02d}:{4:02d}:{5:02d}", i.e));
				}
				return r.join(",");
			}
		}
	}
};

function getSelectedDatasets() {
	var ds = [];
	$(".dataset-item:has(input:checked)").each(function() {
		ds.push($(this).data('dataset'));
	});
	return ds;
}

function getSelectedDatasetNames() {
	var ds = getSelectedDatasets();
	var names = [];
	for (var idx in ds) {
		names.push(ds[idx].name);
	}
	return names;
}

function createErrorMessage(msg) {
	var div = $("<div>", {
		   class: 'error'
	});
	return div.append(msg);
}


/* Map section creation */
$(document).ready(function() {
	var map = new OpenLayers.Map('arkiweb-map', {
		controls: [
			new OpenLayers.Control.LayerSwitcher(),
			new OpenLayers.Control.MousePosition(),
			new OpenLayers.Control.OverviewMap(),
			new OpenLayers.Control.PanZoom()
		]
	});
	var wms = new OpenLayers.Layer.WMS("OpenLayers WMS", "http://vmap0.tiles.osgeo.org/wms/vmap0", {
		isBaseLayer: true,
		layers:'basic'
	});
	var blayer = new OpenLayers.Layer.Vector("dataset bounding layer");
	map.addLayer(wms);
	map.addLayer(blayer);
	map.zoomToMaxExtent();
	$('#arkiweb-map').data('map', map);
	$('#arkiweb-map').data('blayer', blayer);
});
/* Map section events */
$(document).ready(function() {
	$('#arkiweb-map').bind('reload-datasets', function() {
		var blayer = $("#arkiweb-map").data('map').getLayersByName('dataset bounding layer')[0];
		blayer.removeAllFeatures();
	});
});
/* Section expansion */
$(document).ready(function() {
	$("#content .content-container:not(#map) .title").toggle(function() {
		$('#content .content-container:not(#map)').hide();
		$(this).parent().css('height', '94%');
		$(this).parent().show();
	}, function() {
		$('#content .content-container:not(#map)').css('height', '29%');
		$('#content .content-container').show();
	});
});
/* Datasets section menu */
$(document).ready(function() {
	$("#reload-datasets").click(function() {
		$.event.trigger('reload-datasets');
	});
	$("#clear-datasets-selection").click(function() {
		$("#datasets .content .dataset-item input:checked").click();
		$.event.trigger('empty-fields');
	});
	$("#filter-datasets").keyup(function() {
		var text = $(this).val();
		$("#datasets .content .dataset-item").each(function() {
			if ($(this).text().indexOf(text) >= 0)
				$(this).show();
			else
				$(this).hide();
		});
	});
	$("#submit-datasets-selection").click(function() {
		if ($("#datasets .dataset-item input:checked").length == 0) {
			alert("please select at least one dataset");
			return;
		}
		$.event.trigger('empty-fields');
		$.event.trigger('reload-fields');
	});
});
/* Datasets section events */
$(document).ready(function() {
	$("#datasets").bind("reload-datasets", function() {
		$.ajax({
			url: ArkiwebConfig.servicesbaseurl + "/arkiweb-dataset-list",
			beforeSend: function() {
				$("#datasets .content").empty();
				$("#datasets").addClass("loading");
			},
			complete: function() {
				$("#datasets").removeClass("loading");
			},
			success: function(d, s, x) {
				var parser = new OpenLayers.Format.WKT();
				var empty = true;
				for (var n in d) {
					empty = false;
					break;
				}
				if (empty) {
					$("#datasets .content").html(createErrorMessage('dataset list is empty'));
					return;
				}
				for (var n in d) {
					var sect = $("<div>", {
						class: 'dataset-item',
						data: { 
							dataset: d[n],
						}
					});
					sect.addClass( ( d[n].allowed ? "allowed" : "notallowed" ) );
					var bounding = parser.read(d[n].bounding);
					if (bounding) {
						sect.data('bounding', bounding);
					}
					var input = $("<input>", {
						type: 'checkbox',
						change: function() {
							$.event.trigger('datasets-selection-changed');
							var map = $("#arkiweb-map").data('map');
							var blayer = $('#arkiweb-map').data('blayer');
							var dataset = $(this).parent().data('dataset');
							var bounding = $(this).parent().data('bounding');
							if (!bounding)
								return;
							if ($(this).prop('checked')) {
								blayer.addFeatures([bounding]);
							} else {
								blayer.removeFeatures([bounding])
							}
						}
					});
					var name = $("<span>", {
						class: 'dataset-name',
						text: n
					});
					var desc = $("<span>", {
						class: 'dataset-description',
						text: d[n].description
					});
					sect.append(input, name, desc);
					$("#datasets .content").append(sect);
				}
			},
			error: function(x, s, e) {
				$("#datasets .content").html(createErrorMessage('unable to load dataset list'));
			}
		});
	});
});
/* Fields section menu */
$(document).ready(function() {
	$("#clear-fields-selection").click(function() {
		/*$.event.trigger("empty-fields");
		$.event.trigger("reload-fields");*/
		$('.field-item-value input:checked').click();
	});
	$("#toggle-fields-description").toggle(function() {
		$.event.trigger('show-fields-description');
	}, function() {
		$.event.trigger('show-fields-query');
	});
	$("#show-fields-selection-summary").click(function() {
		var req = {
			query: [],
			datasets: getSelectedDatasetNames()
		};

		$("#fields .content .field-item").each(function() {
			var style = $(this).find(".field-item-name").text();
			var q = [];
			$(this).find("input:checked").each(function() {
				q.push($(this).parent().data('query'));
			});
			try {
				if (q.length > 0)
					req.query.push(ArkiwebParser[style].decode(q));
			} catch (e) {
				$.error(e);
			}
		});
		req.query = req.query.join("; ");
		var summary = $("<div>", {
			data: {
				request: req
			},
			class: 'summary'
		}).dialog({
			title: 'summary',
			modal: true,
			height: $("#content").height(),
			width: $("#content").width() / 2,
			zIndex: 5000,
			close: function() {
				$(this).remove();
			}
		});
		$.ajax({
			url: ArkiwebConfig.servicesbaseurl + "/arkiweb-summary",
			dataType: 'json',
			data: req,
			beforeSend: function() {
				summary.append($("<div>", {
					class: 'loading'
				}));
			},
			complete: function() {
				summary.find("div.loading").remove();
			},
			error: function(x, s, e) {
				summary.append(createErrorMessage('error while loading summary'));
			},
			success: function(d, s, x) {
				var menu = $("<div class='menu'>");
				var toggle = $("<span>toggle description</span>").toggle(function() {
					$.event.trigger('summary-show-fields-query');
				}, function() {
					$.event.trigger('summary-show-fields-descr');
				});
				var download = $("<span>download</span>").click(function() {
					if ($(this).hasClass('disabled'))
						return;
					var u = "http://localhost/~emanuele/arkiweb/lib/cgi-bin/arkiweb-download?" + 
						$.param(req);
					window.open(u);
				});
				menu.append(toggle, download);
				summary.append(menu);

				var sect = $("<dl>", {
					class: 'summary-list'
				});
				var s = summary.data('request').datasets.join(", ");
				if (s.length == 0)
					s = "-"
				var datasets = $("<dt>datasets</dt><dd>" + s + "</dd>");
				s = summary.data('request').query
				if (s.length == 0)
					s = "-"
				var query = $("<dt>query</dt><dd>" + s + "</dd>");
				/*
				s = $(this)[0].url;
				sect.append("<dt>json url</dt><dd>" + s + "</dd>");
				*/
				sect.append(datasets, query);

				sect.append("<dt>from</dt><dd>" + $.format('{0}-{1:02d}-{2:02d} {3:02d}:{4:02d}:{5:02d}', d.stats.b) + "</dd>");
				sect.append("<dt>from</dt><dd>" + $.format('{0}-{1:02d}-{2:02d} {3:02d}:{4:02d}:{5:02d}', d.stats.e) + "</dd>");
				sect.append("<dt>count</dt><dd>" + d.stats.c + "</dd>");
				sect.append("<dt>size</dt><dd>" + d.stats.s + "</dd>");

				for (var f in d.fields) {
					sect.append("<dt>"+f+"</dt>");
					var vlist = $("<ul>");
					for (var i in d.fields[f]) {
						var v = d.fields[f][i];
						var query = null;
						try {
							query = ArkiwebParser[f]['styles'][v.s].decode(v);
						} catch (e) {
							download.addClass("disabled");
							$.error(e, v);
						}
						var li = $("<li>", {
							text: v.desc,
							data: {
								query: query,
								descr: v.desc
							}
						}).bind('summary-show-fields-query', function() {
							if ($(this).data('query'))
								$(this).text($(this).data('query'));
						}).bind('summary-show-fields-descr', function() {
							$(this).text($(this).data('descr'));
						});
						vlist.append(li);
					}
					$("<dd>").append(vlist).appendTo(sect);
				}
				summary.append(sect);
			}
		});
	});
	$("#show-fields-selection-extended-summary").click(function() {
		var req = {
			query: [],
			datasets: getSelectedDatasetNames()
		};

		$("#fields .content .field-item").each(function() {
			var style = $(this).find(".field-item-name").text();
			var q = [];
			$(this).find("input:checked").each(function() {
				q.push($(this).parent().data('query'));
			});
			try {
				if (q.length > 0)
					req.query.push(ArkiwebParser[style].decode(q));
			} catch (e) {
				$.error(e);
			}
		});
		req.query = req.query.join("; ");
		var summary = $("<div>", {
			class: 'summary'
		}).dialog({
			title: 'extended summary',
			modal: true,
			height: $("#content").height(),
			width: $("#content").width() / 2,
			zIndex: 5000,
			close: function() {
				$(this).remove();
			}
		});
		$.ajax({
			url: ArkiwebConfig.servicesbaseurl + "/arkiweb-extended-summary",
			data: req,
			beforeSend: function() {
				summary.append($("<div>", {
					class: 'loading'
				}));
			},
			complete: function() {
				summary.find("div.loading").remove();
			},
			error: function(x, s, e) {
				summary.append(createErrorMessage('error while loading summary'));
			},
			success: function(d, s, x) {
				var menu = $("<div>", {
					class: 'menu'
				});
				var toggle = $("<span>toggle description</span>").toggle(function() {
				 	summary.find("td").each(function() {
						if ($(this).data('query'))
							$(this).text($(this).data('query'));
					});
				},function() {
					summary.find("td").each(function() {
						$(this).text($(this).data('descr'));
					});
				});
				menu.append(toggle);
				summary.append(menu);
				var table = $("<table>", {
					class: 'tablesorter'
				});
				$("<div>", {
					class: 'fields-table'
				}).append(table).appendTo(summary);

				table.append("<thead><tr></tr></thead><tbody/>");
				$("#fields .field-item-name").each(function() {
					if ($(this).text() == 'reftime')
						return;
					var td = $("<th>", {
						text: $(this).text(),
						field: $(this).text()
					});
					table.find("thead tr").append(td);
				});
				for (var i in d.items) {
					var item = d.items[i];
					var tr = $("<tr>");
					table.find("thead tr th").each(function() {
						var f = $(this).attr('field');
						var val = item[f];
						var desc = ( val ? val.desc : '' );
						var td = $("<td>", {
							text: desc
						}).appendTo(tr);
						var query = null;
						try {
							query = ArkiwebParser[f]['styles'][val.s].decode(val);
						} catch (e) {
							$.error(e, val, f);
						}
						td.data('descr', desc);
						td.data('query', query);
						td.toggle(function() {
							if ($(this).data('query'))
								$(this).text($(this).data('query'));
						}, function() {
							$(this).text($(this).data('descr'));
						});
					});
					table.find("tbody").append(tr);
				}
				table.tablesorter();
			}
		});
	});
});
/* Fields section events */
$(document).ready(function() {
	$("#fields").bind('datasets-selection-changed', function() {
		$.event.trigger('empty-fields');
	});
	$("#fields").bind("reload-datasets", function(e) {
		$.event.trigger('empty-fields');
	});
	$("#fields").bind("empty-fields", function(e) {
		$(this).find(".content").empty();
	});
	$("#fields").bind("reload-fields", function(e) {
		$(this).find(".content").empty();
		var req = {
			datasets: getSelectedDatasetNames()
		};
		$.ajax({
			url: ArkiwebConfig.servicesbaseurl + "/arkiweb-summary",
			dataType: 'json',
			data: req,
			beforeSend: function() {
				$("#fields").addClass("loading");
			},
			complete: function() {
				$("#fields").removeClass("loading");
			},
			error: function(x, s, e) {
				$("#fields .content").html(createErrorMessage('error while loading fields'));
			},
			success: function(d, s, x) {		
				d.stats.b[1] -= 1
				d.stats.e[1] -= 1
				d.fields['reftime'] = [{
					s: 'standard',
					b: d.stats.b,
					e: d.stats.e,
					desc: d.stats.b.join(",") + " - " + d.stats.e.join(",")
				}];
				for (var f in d.fields) {
					var field = $("<div>", {
						class: 'field-item'
					});
					var name = $("<p>", {
						class: 'field-item-name',
						text: f
					});
					field.append(name);
					$('#fields .content').append(field);
					for (var idx in d.fields[f]) {
						var value = $("<div>", {
							class: 'field-item-value'
						});
						var input = $("<input>", {
							type: 'checkbox',
							change: function() {
								var p = $(this).parent().parent();
								var s = $(this).parent().parent().find("input:checked").length;
								if (s > 0) {
									$(this).parent().parent().addClass("selected");
								} else {
									$(this).parent().parent().removeClass("selected");
								}
							}
						});
						var item = d.fields[f][idx];
						try {
							var query = ArkiwebParser[f]['styles'][item.s].decode(item);
							value.data('query', query);
							value.data('descr', d.fields[f][idx].desc);
						} catch (e) {
							$.error(e, item, f);
							input.prop('disabled', true);
						}
 
						var desc = null;
						if (f == 'reftime') {
							var min = eval("new Date("+item.b.toString()+")");
							var max = eval("new Date("+item.e.toString()+")");
							var opts = {	
								minDate: min,
								maxDate: max,
								changeMonth: true,
								changeYear: true,
								dateFormat: 'yy-mm-dd',
								timeFormat: 'hh:mm:ss',
								showButtonPanel: false,
								onSelect: function(text, inst) {
									var b = $("#reftime-begin").datetimepicker('getDate');
									var e = $("#reftime-end").datetimepicker('getDate');
									if (e < b)
										$("#reftime-end").datetimepicker('setDate', b);
									var r = {
										b: $("#reftime-begin").val(),
										e: $("#reftime-end").val(),
										s: 'standard'
									}
									$(this).parent().parent().data('query', ">= " + r.b + ", <= " + r.e);
								}
							};
							desc = $("<span>");
							var b = $("<input id='reftime-begin' type='text'/>").datetimepicker(opts).datetimepicker('setDate', min);
							var e = $("<input id='reftime-end' type='text'/>").datetimepicker(opts).datetimepicker('setDate', max);
							desc.append($("<label for='reftime-begin'>begin</label>"), b,
								    $("<label for='reftime-end'>end</label>"), e);
						} else {	
							desc = $("<span>", {
								text: item.desc
							}).bind('show-fields-description', function() {
								$(this).text($(this).parent().data('query'));
							}).bind('show-fields-query', function() {
								$(this).text($(this).parent().data('descr'));
							});
						}
						value.append(input, desc);
						field.append(value);
						value.hide();
					}
					name.toggle(function() {
						$(this).parent().find(".field-item-value").show();
					}, function() {
						$(this).parent().find(".field-item-value").hide();
					});
				}
				if ($("#fields input[disabled]").length > 0) {
					$("<div>").append(createErrorMessage('cannot parse some fields (checkboxes are disabled)')).dialog({
						title: 'parsing error',
						modal: true,
						close: function() {
							$(this).remove();
						}
					});
				}
			}
		});
	});
});

$(document).ready(function() {
	$.event.trigger('reload-datasets');
});
