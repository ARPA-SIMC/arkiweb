var ArkiwebMap = null;
var ArkiwebBoundLayer = null;

function reload_dataset_container() {
	$('#arkiweb-dataset-container-content').empty();
	$.ajax({
		url: ArkiwebConfig.baseurl + '/arkiweb-dataset-list',
		dataType: 'json',
		error: function(xhr, status, error) {
		},
		success: function(data) {
			var parser = new OpenLayers.Format.WKT();
			for (var name in data) {
				var ds_div = $("<div>");
				ds_div.addClass('arkiweb-dataset-item');
				if (data[name].allowed) {
					ds_div.addClass('arkiweb-dataset-item-allowed');
				} else {
					ds_div.addClass('arkiweb-dataset-item-notallowed');
				}
				var ds_input = $("<input type='checkbox'/>");
				ds_div.append(ds_input);
				var ds_title = $("<span>");
				ds_title.addClass('arkiweb-dataset-item-title');
				ds_title.text(name);
				ds_div.append(ds_title);
				if (data[name].description) {
					var ds_desc = $("<span>");
					ds_desc.text(data[name].description);
					ds_desc.addClass('arkiweb-dataset-item-description');
					ds_div.append(ds_desc);
				}
				var bounding = null;
				if (data[name].bounding) {
					bounding = parser.read(data[name].bounding);
				}
				ds_div.data('bounding', bounding);
				$('#arkiweb-dataset-container-content').append(ds_div);
			}
			$(".arkiweb-dataset-item > input").change(function() {
				var b = $(this).parent().data('bounding');
				if (!b) 
					return;
				if ($(this).prop('checked')) {
					ArkiwebBoundLayer.addFeatures([b]);
				} else {
					ArkiwebBoundLayer.removeFeatures([b]);
				}
				b = ArkiwebBoundLayer.getDataExtent();
				if (b)
					ArkiwebMap.zoomToExtent(b);
				else
					ArkiwebMap.zoomToMaxExtent();
			});
		}
	});
	       
}

function reload_summary_container() {
	$('#arkiweb-summary-stats').empty();
	$('#arkiweb-summary-fields').empty();
	var datasets = [];
	$('.arkiweb-dataset-item input:checked').each(function() {
		datasets.push($(this).parent().find('.arkiweb-dataset-item-title').text());
	});
	$.ajax({
		url: ArkiwebConfig.baseurl + '/arkiweb-summary',
		dataType: 'json',
		data: { datasets: datasets },
		async: true,
		beforeSend: function() {
			$('#arkiweb-summary-container-content').addClass("loading");
		},
		complete: function() {
			$('#arkiweb-summary-container-content').removeClass("loading");
		},
		error: function(xhr, status, error) {
		},
		success: function(data) {
			for (var field in data.fields) {
				var div = $("<div>");
				div.addClass("arkiweb-summary-fields-item");
				var title = $("<h1>");
				title.text(field);
				title.addClass("arkiweb-summary-fields-item-title");
				div.append(title);
				var ul = $("<div>");
				ul.addClass("arkiweb-summary-fields-item-list");
				div.append(ul);
				ul.hide();
				for (var idx in data.fields[field]) {
					var item = data.fields[field][idx];
					var li = $("<p>");
					var input = $("<input type='checkbox'/>")
					try {
						li.data('query', ArkiwebParser[field]['styles'][item.s].decode(item));
						console.debug(li.data('query'));
					} catch(e) {
						input.prop('disabled', true);
					}
					li.append(input).append(item.desc);
					ul.append(li);
				}
				$("#arkiweb-summary-fields").append(div);
			}
			$('.arkiweb-summary-fields-item-list input').change(function() {
				var selected = {};
				$('.arkiweb-summary-fields-item-list input:checked').each(function() {
					var title = $(this).parent().parent().parent().find(".arkiweb-summary-fields-item-title").text();
					var query = $(this).parent().parent().find("p").data('query');
					console.debug(title);
					if (!selected[title])
						selected[title] = [];
					selected[title].push(query);
				});
				console.debug(selected);
				try {
					var query = [];
					for (var k in selected) {
						query.push(ArkiwebParser[k].decode(selected[k]));
					}
					$("#arkiweb-summary-query").text(query.join(" ; "));
				} catch (e) {
					$("#arkiweb-summary-query").text("unable to create arki-query");
				}
			});
			$(".arkiweb-summary-fields-item .arkiweb-summary-fields-item-title").toggle(function() {
				$(this).parent().find('.arkiweb-summary-fields-item-list').show();
			}, function() {
				$(this).parent().find('.arkiweb-summary-fields-item-list').hide();
			});
			/* FIXME: date arrays are in UTC */
			var begin = new Date(data.stats.b[0], 
					     data.stats.b[1], 
					     data.stats.b[2],
					     data.stats.b[3],
					     data.stats.b[4],
					     data.stats.b[5],
					     0).toUTCString();
			var end = new Date(data.stats.e[0],
					   data.stats.e[1],
					   data.stats.e[2],
					   data.stats.e[3],
					   data.stats.e[4],
					   data.stats.e[5],
					   0).toUTCString();
			var count = data.stats.c;
			var size = data.stats.s;
			$("#arkiweb-summary-stats").append("<div>"+
							   "<p>datasets: "+datasets.join(", ")+".</p>"+
							   "<p>from</b> "+begin+" to " +end+"</p>"+
							   "<p>"+count+" items</p>"+
							   "<p>"+size+" bytes</p></div>");
		}
	});
}

$(document).ready(function() {
	ArkiwebMap = new OpenLayers.Map();
	//ArkiwebMap.addControl(new OpenLayers.Control.LayerSwitcher());
	ArkiwebMap.addControl(new OpenLayers.Control.MousePosition());
	ArkiwebMap.addLayer(new OpenLayers.Layer.WMS("OpenLayers WMS",
						     "http://labs.metacarta.com/wms/vmap0",
						     {layers: 'basic'}));
	ArkiwebBoundLayer = new OpenLayers.Layer.Vector("Dataset bounds layer");
	ArkiwebMap.addLayer(ArkiwebBoundLayer);
	ArkiwebMap.render("arkiweb-map-container");
	ArkiwebMap.zoomToMaxExtent();
});

$(document).ready(function () {
	$('#arkiweb-summary-container').hide();
	$('#arkiweb-dataset-menu-show-allowed').text('show allowed only');
	$('#arkiweb-dataset-menu-show-allowed').toggle(function() {
		$(".arkiweb-dataset-item-notallowed").hide();
		$(this).text('show all datasets');
	}, function() {
		$(".arkiweb-dataset-item-notallowed").show();
		$(this).text('show allowed only');
	});
	$('#arkiweb-dataset-menu-show-selected').click(function() {
		var ul = $('<ul>');
		$('.arkiweb-dataset-item input:checked').each(function() {
			var li = $('<li>'+$(this).parent().find('.arkiweb-dataset-item-title').text()+"</li>");
			ul.append(li);
		});
		var div = $("<div>");
		div.append(ul);
		div.dialog({
			title: 'selected datasets',
			modal: true,
			close: function() {
				$(this).remove();
			}
		});
	});
	$('#arkiweb-dataset-menu-process-selected').click(function() {
		if ($('.arkiweb-dataset-item input:checked').length == 0) {
			alert("please select at least one dataset");
			return;
		}
		$('#arkiweb-dataset-container').hide();
		reload_summary_container();
		$('#arkiweb-summary-container').show();
	});
	reload_dataset_container();
});

$(document).ready(function() {
	$("#arkiweb-summary-menu-back-to-dataset").click(function() {
		$('#arkiweb-summary-container').hide();
		$('#arkiweb-dataset-container').show();
		reload_dataset_container();
	});
});

$(document).ready(function() {
	$('#header > .arkiweb-menu > span').button();
	$('#arkiweb-help-container').dialog({
		title: 'help',
		autoOpen: false,
		modal: true
	});
	$('#arkiweb-open-help-container').click(function() {
		$('#arkiweb-help-container').dialog('open');
	});
});
