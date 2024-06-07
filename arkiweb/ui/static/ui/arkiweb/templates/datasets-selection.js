(function() {
  this.arkiweb.templates || (this.arkiweb.templates = {});
  this.arkiweb.templates["datasets-selection"] = function(__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
        __out.push('<div class="selected-datasets">\n\t<b>selected datasets: </b><span class="selected-datasets-list"></span>\n</div>\n<div class="datasets-table">\n\t<table>\n\t\t<thead>\n\t\t\t<tr>\n\t\t\t\t<td>name</td>\n\t\t\t\t<td>description</td>\n\t\t\t\t<td>postprocessors</td>\n\t\t\t</tr>\n\t\t</thead>\n\t\t<tbody class="datasets-list">\n\t\t</tbody>\n\t</table>\n</div>\n');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  };
}).call(this);
