// Author: Emanuele Di Giacomo <edigiacomo@arpa.emr.it>

(function() {
	this.arkiweb || (this.arkiweb = {
		models: {},
		collections: {},
		views: {
			postprocessors: {}
		},
		routers: {},
		templates: {}
	});

//= require "parser"

//= require "models/dataset"
//= require "models/field-value"
//= require "models/field"

//= require "collections/datasets"
//= require "collections/field-values"
//= require "collections/fields"

//= require "views/datasets-selection"
//= require "views/datasets-selection-item"
//= require "views/map"
//= require "views/fields-selection"
//= require "views/fields-selection-stats-section"
//= require "views/fields-selection-section"
//= require "views/fields-selection-section-item"
//= require "views/summary"
//= require "views/summary-stats"
//= require "views/summary-section"
//= require "views/summary-section-item"
//= require "views/error"
//= require "views/postprocessor"
//= require "views/abstract-postprocessor"
//= require "views/postprocessors/singlepoint"
//= require "views/postprocessors/subarea"
//= require "views/postprocessors"
//= require "views/main"

//= require "templates/main"
//= require "templates/datasets-selection-item"
//= require "templates/dataset-description"
//= require "templates/fields-selection-section"
//= require "templates/fields-selection-section-item"
//= require "templates/fields-selection-stats-section"
//= require "templates/summary"
//= require "templates/summary-stats"
//= require "templates/summary-section"
//= require "templates/summary-section-item"
//= require "templates/postprocessor"

//= require "routers/router"

//window.arkiweb = arkiweb

}(this));
