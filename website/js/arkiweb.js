var ArkiwebDatasetContainer = null;

function reload_dataset_container() {
	$.ajax({
		url: ArkiwebConfig.baseurl + '/arkiweb-datasets',
		dataType: 'json',
		error: function(xhr, status, error) {
			console.error(status);
		},
		success: function(data) {
			ArkiwebDatasetContainer.empty();
			for (var name in data) {
				var ds_div = $("<div>");
				ds_div.addClass('arkiweb-dataset-item');
				if (data[name].allowed) {
					ds_div.addClass('arkiweb-dataset-item-allowed');
				} else {
					ds_div.addClass('arkiweb-dataset-item-notallowed');
				}
				var ds_input = $("<input type='checkbox'>");
				ds_input.click(function() {
				});
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
				ds_div.data('bounding', data[name].bounding);
				ArkiwebDatasetContainer.append(ds_div);
			}
		}
	});
	       
}

$(document).ready(function () {
	ArkiwebDatasetContainer = $("#arkiweb-dataset-container");
	reload_dataset_container();
});
