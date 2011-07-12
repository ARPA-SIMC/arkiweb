var arkiweb = {};
/**
 * Configuration
 */
arkiweb.config = {};
arkiweb.config.services = {};
arkiweb.config.services.baseUrl = '/arkiweb/services/';
arkiweb.config.services.datasets = {
	url: arkiweb.config.services.baseUrl + "arkiweb-dataset-list"
};
arkiweb.config.services.summary = {
	url: arkiweb.config.services.baseUrl + "arkiweb-summary"
};
arkiweb.config.services.extendedSummary = {
	url: arkiweb.config.services.baseUrl + "arkiweb-extended-summary"
};
arkiweb.config.services.download = {
	url: arkiweb.config.services.baseUrl + "arkiweb-download"
};
/**
 * Dom functions
 */
arkiweb.dom = {};
arkiweb.dom.menu = {};
arkiweb.dom.menu.create = function(options) {
	var settings = {
		options: {},
		choices: []
	};
	$.extend(settings, options);
	var menu = $("<div>", settings.options).addClass("arkiweb-menu");
	for (var i in settings.choices) {
		var choiceOpts = settings.choices[i];
		var choice = $("<span>", choiceOpts.options).addClass("arkiweb-menu-choice");
		for (var name in choiceOpts.events) {
			choice.bind(name, choiceOpts.events[name]);
		}
		menu.append(choice);
	}
	return menu;
};
arkiweb.dom.content = {};
arkiweb.dom.content.create = function(options) {
	var settings = {
		options: {},
		events: []
	};
	$.extend(settings, options);
	var content = $("<div>", settings.options).addClass("arkiweb-content");
	for (var name in settings.events) {
		content.bind(name, settings.events[name]);
	}
	return content;
};
arkiweb.dom.title = {};
arkiweb.dom.title.create = function(options) {
	var settings = {
		options: {}
	};
	$.extend(settings, options);
	var title = $("<h2>", settings.options).addClass("arkiweb-title");
	return title;
};
arkiweb.dom.section = {};
arkiweb.dom.section.create = function(options) {
	var settings = {
		options: {},
		title: null,
		menu: null,
		content: null
	};
	$.extend(settings, options);
	var section = $("<div>", settings.options).addClass("arkiweb-section");

	if (settings.title) {
		arkiweb.dom.title.create(settings.title).appendTo(section);
	}
	if (settings.menu) {
		arkiweb.dom.menu.create(settings.menu).appendTo(section);
	}
	if (settings.content) {
		arkiweb.dom.content.create(settings.content).appendTo(section);
	}
	return section;
};
arkiweb.dom.dataset = {};
arkiweb.dom.dataset.create = function() {
	var settings = {
		options: {
			id: 'arkiweb-datasets'
		},
		title: {
			options: {
				text: 'datasets'
			}
		},
		menu: {
			options: {
				id: 'arkiweb-datasets-menu'
			},
			choices: [{
				options: {
					text: 'reload list'
				},
				events: {
					click: function() {
						$.event.trigger('updateDatasets');
					}
				},
			}, {
				options: {
					text: 'clear selection'
				},
				events: {
					click: function() {
						$(".arkiweb-datasets-item input:checked").click();
					}
				}
			}, {
				options: {
					text: 'show allowed datasets only',
					id: 'toggle-not-allowed-datasets'
				},
				events: {
					click: function() {
						$(this).toggleClass('active');
						$(".arkiweb-datasets-item.not-allowed").toggle();
					}
				}
			}, {
				options: {
					text: 'load fields'
				},
				events: {
					click: function() {
						if ($(".arkiweb-datasets-item input:checked").length == 0) {
							alert("please select at least one dataset");
							return;
						}
						$.event.trigger('showFields');
					}
				}
			}]
		},
		content: {
			options: {
				id: 'arkiweb-datasets-content'
			},
			events: {
				updateDatasets: arkiweb.dom.dataset.content.load
			}
		}
	};
	var section = arkiweb.dom.section.create(settings);
	section.bind('showFields', function() {
		$(this).hide();
	});
	section.bind('showDatasets', function() {
		$(this).show();
	});
	return section;
};
arkiweb.dom.dataset.content = {};
arkiweb.dom.dataset.content.load = function() {
	$.ajax({
		url: arkiweb.config.services.datasets.url,
		dataType: 'json',
		beforeSend: function() {
			$("#arkiweb-datasets").addClass("loading");
			$("#arkiweb-datasets-content").empty();
		},
		complete: function() {
			$("#arkiweb-datasets").removeClass("loading");
		},
		success: arkiweb.dom.dataset.content.ajax.success,
		error: arkiweb.dom.dataset.content.ajax.error
	});
};
arkiweb.dom.dataset.content.ajax = {};
arkiweb.dom.dataset.content.ajax.error = function(xhr, text, status) {
	$("#arkiweb-datasets-content").append($("<div>", {
		class: 'error',
		text: 'error while loading datasets: ' + status
	}));
};
arkiweb.dom.dataset.content.ajax.success = function(data) {
	arkiweb.dom.dataset.content.list.update(data);
};
arkiweb.dom.dataset.content.selected = function(wantsNameOnly) {
	var ds = [];
	$("#arkiweb-datasets-content .arkiweb-datasets-item:has(input:checked)").each(function() {
		if (wantsNameOnly) {
			ds.push($(this).data('dataset').name);
		} else {
			ds.push($(this).data('dataset'));
		}
	});
	return ds;
};
arkiweb.dom.dataset.content.list = {};
arkiweb.dom.dataset.content.list.update = function(data) {
	var content = $("#arkiweb-datasets-content");
	for (var name in data) {
		var ds = data[name];
		var div = $("<div>", {
			class: 'arkiweb-datasets-item',
			data: {
				dataset: ds
			}
		});
		if (ds.allowed) {
			div.addClass('allowed');
		} else {
			div.addClass('not-allowed');
		}
		var input = $("<input type='checkbox'>").change(function() {
			$.event.trigger('datasetsSelectionChanged');
		});
		var title = $("<span>", {
			class: 'arkiweb-datasets-item-title',
			text: name,
		});
		var info = $("<span>", {
			text: 'more info',
			class: 'more-info',
			click: function() {
				var div = $("<div>");
				var ds = $(this).parent().data('dataset');
				if (ds.name) {
					div.append("<p><b>name</b>: " + ds.name + "</p>");
				}
				if (ds.description) {
					div.append("<p><b>description</b>: " + ds.description + "</p>");
				}
				if (ds.postprocess && ds.postprocess.length > 0) {
					div.append("<p><b>postprocess</b>: " + ds.postprocess.join(", ") + "</p>");
				}
				if (ds.bounding) {
					div.append("<p><b>bounding</b>: <code>" + ds.bounding + "</code></p>");
				}
				div.dialog({ 
					zIndex: 5000,
					title: 'dataset ' + ds.name,
					modal: true, 
					position: [ 'left', 'top' ],
					height: $(document).height() * 2 / 3,
					width: $(document).width() * 2 / 3,
					close: function() {$(this).remove()}
				});
			}
		});
		var descr = $("<span>", {
			class: 'arkiweb-datasets-item-description',
			text: ds.description
		});
		div.append(input, title, descr, info).appendTo(content);
	}	
};
arkiweb.dom.map = {};
arkiweb.dom.map.create = function() {
	var settings = {
		options: {
			id: 'arkiweb-map'
		},
		content: {
			options: {
				id: 'arkiweb-map-content',
			}
		}
	};
	var section = arkiweb.dom.section.create(settings);
	section.data('map', arkiweb.dom.map.openlayers.map.create());
	section.bind('datasetsSelectionChanged updateDatasets', function() {
		var map = $(this).data('map');
		var blayer = map.getLayer('datasetBoundingBoxesLayer');
		blayer.removeAllFeatures();
		var datasets = arkiweb.dom.dataset.content.selected(false)
		var parser = new OpenLayers.Format.WKT();
		for (var i in datasets) {
			var ds = datasets[i];
			if (!ds.bounding) {
				continue;
			}
			var b = parser.read(ds.bounding);
			if (b) {
				blayer.addFeatures([b]);
			}
		}
		var b = blayer.getDataExtent();
		if (b) {
			map.zoomToExtent(b);
		} else {
			map.zoomToMaxExtent();
		}
	});
	return section;
};
arkiweb.dom.map.openlayers = {};
arkiweb.dom.map.openlayers.map = {};
arkiweb.dom.map.openlayers.map.create = function() {
	var map = new OpenLayers.Map({
		controls: [
			new OpenLayers.Control.LayerSwitcher(),
			new OpenLayers.Control.MousePosition(),
			new OpenLayers.Control.OverviewMap(),
			new OpenLayers.Control.PanZoom()
		]
	});
	var blayer = new OpenLayers.Layer.Vector("dataset bounding boxes");
	blayer.id = 'datasetBoundingBoxesLayer';
	var wms = new OpenLayers.Layer.WMS("OpenLayers WMS", "http://vmap0.tiles.osgeo.org/wms/vmap0", {
		isBaseLayer: true,
		layers:'basic'
	});
	map.addLayer(wms);
	map.addLayer(blayer);
	return map;
};
arkiweb.dom.map.getMap = function() {
	return $("#arkiweb-map").data('map');
};
arkiweb.dom.map.show = function() {
	arkiweb.dom.map.getMap().render("arkiweb-map-content");
	arkiweb.dom.map.getMap().zoomToMaxExtent();
};
arkiweb.dom.fields = {};
arkiweb.dom.fields.create = function() {
	var settings = {
		options: {
			id: 'arkiweb-fields'
		},
		title: {
			options: {
				text: 'fields'
			}
		},
		menu: {
			choices: [{
				options: {
					text: 'clear selection'
				}, 
				events: {
					click: function() {
						$("#arkiweb-fields-content input:checked").click();
					}
				}
			}, {
				options: {
					text: 'show summary'
				},
				events: {
					click: function() {
						$("<div>").append(arkiweb.dom.summary.create())
						.dialog({
							zIndex: 5000,
							title: 'summary',
							modal: true,
							position: [ 'left', 'top' ],
							height: $(document).height() * 2 / 3,
							width: $(document).width() * 2 / 3,
							close: function() { $(this).remove(); }
						});
						arkiweb.dom.summary.content.load();
					}
				}
			}, {
				options: {
					text: 'show extended summary'
				},
				events: {
					click: function() {
						$("<div>").append(arkiweb.dom.extendedSummary.create())
						.dialog({
							zIndex: 5000,
							title: 'extended summary',
							modal: true,
							position: [ 'left', 'top' ],
							height: $(document).height() * 2 / 3,
							width: $(document).width() * 2 / 3,
							close: function() { $(this).remove(); }
						});
						arkiweb.dom.extendedSummary.content.load();
					}
				}
			}, {
				options: {
					text: 'toggle description/code'
				},
				events: {
					click: function() {
						$("#arkiweb-fields-content .arkiweb-fields-item-value span").toggleClass("hidden");
					}
				}
			}, {
				options: {
					text: 'show query'
				},
				events: {
					click: function() {
						alert(arkiweb.dom.fields.content.query());
					}
				}
			}, {
				options: {
					text: 'back to datasets list'
				},
				events: {
					click: function() {
						$.event.trigger('showDatasets')
					}
				}
			}],
		},
		content: {
			options: {
				id: 'arkiweb-fields-content'
			}
		}
	};
	var section = arkiweb.dom.section.create(settings);
	section.bind('showFields', function() {
		$(this).show();
		arkiweb.dom.fields.load();
	});
	section.bind('showDatasets', function() {
		$(this).hide();
	});
	section.bind('fieldsSelectionChanged', function() {
		$(this).find(".arkiweb-fields-item-title").css('font-weight', 'normal');
		$(this).find(".arkiweb-fields-item:has(input:checked) .arkiweb-fields-item-title").css('font-weight', 'bold');
	});
	return section;
};
arkiweb.dom.fields.load = function() {
	$.ajax({
		url: arkiweb.config.services.summary.url,
		dataType: 'json',
		data: {
			datasets: arkiweb.dom.dataset.content.selected(true)
		},
		beforeSend: function() {
			$('#arkiweb-fields-content').empty();
			$("#arkiweb-fields").addClass("loading");
		},
		complete: function() {
			$("#arkiweb-fields").removeClass("loading");
		},
		success: arkiweb.dom.fields.content.ajax.success,
		error: arkiweb.dom.fields.content.ajax.error
	});
};
arkiweb.dom.fields.content = {};
arkiweb.dom.fields.content.ajax = {};
arkiweb.dom.fields.content.ajax.success = function(data) {
	arkiweb.dom.fields.content.list.update(data);
};
arkiweb.dom.fields.content.ajax.error = function(xhr, text, status) {
	$("#arkiweb-fields-content").append($("<div>", {
		class: 'error',
		text: 'error while loading datasets: ' + status
	}));
};
arkiweb.dom.fields.content.query = function() {
	var q = [];
	$(".arkiweb-fields-item:has(input:checked)").each(function() {
		var n = $(this).data('name')
		var v = [];
		$(this).find(".arkiweb-fields-item-value:has(input:checked)").each(function() {
			v.push($(this).data('code'));
		});
		if (v.length > 0) {
			q.push(ArkiwebParser[n].decode(v));
		}
	});
	if ($("#arkiweb-fields-reftime:has(input:checked)").length > 0) {
		q.push(arkiweb.dom.fields.content.list.reftime.query());
	}
	return q.join(";");
};
arkiweb.dom.fields.content.list = {};
arkiweb.dom.fields.content.list.reftime = {};
arkiweb.dom.fields.content.list.reftime.query = function() {
	return 'reftime: >= ' + $("#arkiweb-fields-reftime-begin").val() + ", <= " + $("#arkiweb-fields-reftime-end").val();
};
arkiweb.dom.fields.content.list.reftime.create = function(stats) {
	if (stats.c == 0)
		return "<div class='error'>empty dataset</div>";
	var div = $("<div id='arkiweb-fields-reftime'><input type='checkbox'><b>reftime</b>: <label for='arkiweb-fields-reftime-begin'>begin</label><input type='text' id='arkiweb-fields-reftime-begin'/><label for='arkiweb-fields-reftime-end'>end</label><input type='text' id='arkiweb-fields-reftime-end'/></div>");
	stats.b[1] -= 1;
	stats.e[1] -= 1;
	var min = eval("new Date("+stats.b.join(",")+")");
	var max = eval("new Date("+stats.e.join(",")+")");
	var opts = {
		minDate: min,
		maxDate: max,
		changeMonth: true,
		changeYear: true,
		dateFormat: 'yy-mm-dd',
		timeFormat: 'hh:mm:ss',
	};
	div.find(":checkbox").change(function() {
		$.event.trigger('fieldsSelectionChanged');
	});
	div.find('#arkiweb-fields-reftime-begin').datetimepicker(opts).datetimepicker('setDate', min);
	div.find('#arkiweb-fields-reftime-end').datetimepicker(opts).datetimepicker('setDate', max);
	return div;
};
arkiweb.dom.fields.content.list.update = function(data) {
	var container = $("#arkiweb-fields-content");
	container.append(arkiweb.dom.fields.content.list.reftime.create(data.stats));
	for (var name in data.fields) {
		var field = data.fields[name];
		var div = $("<div>", {
			class: 'arkiweb-fields-item',
			data: {
				name: name
			}
		});
		div.append($('<span>', {
			class: 'ui-icon ui-icon-carat-1-e',
			css: {
				display: 'inline-block',
				//'vertical-align': 'middle'
			}
		}));
		var title = $("<h3>", {
			class: 'arkiweb-fields-item-title',
			text: name
		});
		title.toggle(function() {
			$(this).prev().removeClass('ui-icon-carat-1-e').addClass('ui-icon-carat-1-s');
			$(this).parent().find('.arkiweb-fields-item-value').show();
		}, function() {
			$(this).prev().removeClass('ui-icon-carat-1-s').addClass('ui-icon-carat-1-e');
			$(this).parent().find('.arkiweb-fields-item-value').hide();
		});
		div.append(title);
		var valueContainer = $("<div>", {
			class: 'arkiweb-fields-item-values'
		});
		div.append(valueContainer);
		for (var idx in field) {
			var value = field[idx];
			var item = $("<div>", {
				class: 'arkiweb-fields-item-value',
				data: {
					value: value
				}
			});
			var input = $("<input type='checkbox'/>").change(function() {
				$.event.trigger('fieldsSelectionChanged');
			});
			var code = $("<span>", {
				class: 'hidden arkiweb-fields-item-value-code',
				text: value.desc
			});
			try {
				var q = ArkiwebParser[name]['styles'][value.s].decode(value);
				code.text(q);
				item.data('code', q);
			} catch (e) {
				input.prop('disabled', true);
				item.addClass('disabled');
			}
			var descr = $("<span>", {
				class: 'arkiweb-fields-item-value-description',
				text: value.desc
			});
			item.append(input, code, descr).hide();
			valueContainer.append(item);
		}
		div.appendTo(container);
	}
};
arkiweb.dom.summary = {};
arkiweb.dom.summary.create = function() {
	var section = arkiweb.dom.section.create({
		options: {
			id: 'arkiweb-summary'
		},
		title: {
			options: {
				text: 'summary'
			}
		},
		menu: {
			options: {},
			choices: [{
				options: {
					text: 'toggle description/code'
				},
				events: {
					click: function() {
						$("#arkiweb-summary-content span").toggleClass('hidden');
					}
				}
			}, {
				options: {
					text: 'download'
				},
				events: {
					click: function() {
						var q = {
							datasets: arkiweb.dom.dataset.content.selected(true),
							query: arkiweb.dom.fields.content.query()
						};
						var url = arkiweb.config.services.download.url + "?" + $.param(q);
						alert(url);
						window.open(url);
					}
				}
			}]
		},
		content: {
			options: {
				id: 'arkiweb-summary-content'
			}
		}
	});
	return section;
};
arkiweb.dom.summary.content = {};
arkiweb.dom.summary.content.load = function() {
	$.ajax({
		url: arkiweb.config.services.summary.url,
		dataType: 'json',
		data: {
			datasets: arkiweb.dom.dataset.content.selected(true),
			query: arkiweb.dom.fields.content.query()
		},
		beforeSend: function() {
			$("#arkiweb-summary").addClass("loading");
		},
		complete: function() {
			$("#arkiweb-summary").removeClass("loading");
		},
		success: arkiweb.dom.summary.content.ajax.success,
		error: arkiweb.dom.summary.content.ajax.error
	});
};
arkiweb.dom.summary.content.ajax = {};
arkiweb.dom.summary.content.ajax.success = function(data) {
	if (data.stats.c == 0) {
		$("#arkiweb-summary-content").append("<div class='error'>empty summary</div>");
		return;
	}
	var dl = $("<dl>");
	dl.append("<dt>query</dt><dd>"+arkiweb.dom.fields.content.query()+"</dd>");
	dl.append("<dt>begin time</dt><dd>"+data.stats.b.join(",")+"</dd>");
	dl.append("<dt>end time</dt><dd>"+data.stats.e.join(",")+"</dd>");
	dl.append("<dt>count</dt><dd>"+data.stats.c+"</dd>");
	dl.append("<dt>size</dt><dd>"+data.stats.s+"</dd>");
	for (var name in data.fields) {
		var dt = $("<dt>", {
			text: name
		});
		var dd = $("<dd/>");
		for (var idx in data.fields[name]) {
			var value = data.fields[name][idx];
			var item = $("<div>");
			var descr = $("<span>", {
			       	class: 'arkiweb-summary-item-value-description',
				text: value.desc
			});
			var code = $("<span>", {
			       	class: 'arkiweb-summary-item-value-code hidden',
				text: value.desc
			});
			try {
				var q = ArkiwebParser[name]['styles'][value.s].decode(value);
				code.text(q);
			} catch (e) {
				item.addClass('disabled');
			}
			item.append(code, descr);
			dd.append(item);
		}
		dl.append(dt, dd);
	}
	$("#arkiweb-summary-content").append(dl);
};
arkiweb.dom.summary.content.ajax.error = function(xhr, text, status) {
	$("#arkiweb-summary-content").append("<div>", {
		class: error,
		text: 'error while loading summary: ' + status
	});
};
arkiweb.dom.extendedSummary = {};
arkiweb.dom.extendedSummary.create = function() {
	var settings = {
		options: {
			id: 'arkiweb-extendedSummary'
		},
		title: {
			options: {
				text: 'extended summary'
			}
		},
		menu: {
			choices: [{
				options: {
					text: 'toggle description/code'
				},
				events: {
					click: function() {
						$("#arkiweb-extendedSummary-content tbody span").toggleClass("hidden");
					}
				},
			}, {
				options: {
					text: 'download'
				},
				events: {
					click: function() {
						var q = {
							datasets: arkiweb.dom.dataset.content.selected(true),
							query: arkiweb.dom.fields.content.query()
						};
						var url = arkiweb.config.services.download.url + "?" + $.param(q);
						window.open(url);
					}
				}
			}]
		},
		content: {
			options: {
				id: 'arkiweb-extendedSummary-content'
			}
		}
	};
	var section = arkiweb.dom.section.create(settings);
	return section;
};
arkiweb.dom.extendedSummary.content = {};
arkiweb.dom.extendedSummary.content.load = function(data) {
	$.ajax({
		url: arkiweb.config.services.extendedSummary.url,
		dataType: 'json',
		data: {
			datasets: arkiweb.dom.dataset.content.selected(true),
			query: arkiweb.dom.fields.content.query()
		},
		beforeSend: function() {
			$("#arkiweb-extendedSummary").addClass('loading');
		},
		complete: function() {
			$("#arkiweb-extendedSummary").removeClass('loading');
		},
		success: arkiweb.dom.extendedSummary.content.ajax.success,
		error: arkiweb.dom.extendedSummary.content.ajax.error
	});
};
arkiweb.dom.extendedSummary.content.ajax = {};
arkiweb.dom.extendedSummary.content.ajax.success = function(data) {
	var table = $("<table>");
	table.append("<thead><tr/></thead><tbody/>");
	var names = [];
	$(".arkiweb-fields-item").each(function() {
		var name = $(this).data('name');
		table.find('thead tr').append('<th>'+name+'</th>');
		names.push(name);
	});
	table.find('thead tr').append('<th>begin</th><th>end</th><th>count</th><th>size</th>');
	$("#arkiweb-extendedSummary-content").append(table);
	for (var i in data.items) {
		var tr = $("<tr>");
		var value = data.items[i];
		for (var j in names) {
			var name = names[j];
			var td = $("<td>");
			var descr = $("<span>", {
				text: value[name].desc,
				class: 'arkiweb-summary-item-value-description'
			});
			var code = $("<span>", {
				text: value[name].desc,
				class: 'arkiweb-summary-item-value-code hidden'
			});
			try {
				var q = ArkiwebParser[name]['styles'][value[name].s].decode(value[name]);
				code.text(q);
			} catch (e) {
				td.addClass('disabled');
			}
			td.append(descr, code);
			tr.append(td);
		}
		var stats = value.summarystats;
		tr.append('<td>'+stats.b+'</td><td>'+stats.e+'</td><td>'+stats.c+'</td><td>'+stats.s+'</td>');
		table.find('tbody').append(tr);
	}
};
arkiweb.dom.extendedSummary.content.ajax.error = function(xhr, text, status) {
	$("#arkiweb-extendedSummary-content").append($("<div>", {
		class: 'error',
		text: 'error while loading summary: ' + status
	}));
};
arkiweb.dom.postprocess = {};
arkiweb.dom.postprocess.create = function() {
	var settings = {
		options: {
			id: 'arkiweb-postprocess'
		},
		title: {
			options: {
				text: 'postprocessors'
			}
		},
		menu: {
			choices: []
		},
		content: {
			options: {
				id: 'arkiweb-postprocess-content'
			}
		}
	};
	return arkiweb.dom.section.create(settings);
};

$(document).ready(function() {
	$("#content").append(arkiweb.dom.dataset.create());
	$("#content").append(arkiweb.dom.map.create());
	$("#content").append(arkiweb.dom.fields.create());
	$("#content").append(arkiweb.dom.postprocess.create());
	arkiweb.dom.map.show();
	$.event.trigger('showDatasets');
	$.event.trigger('updateDatasets');
});
