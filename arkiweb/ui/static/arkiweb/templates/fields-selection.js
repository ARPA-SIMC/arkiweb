(function() {
  this.arkiweb.templates || (this.arkiweb.templates = {});
  this.arkiweb.templates["fields-selection"] = function(__obj) {
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
        __out.push('<div class="fields-selection-summary">\n\t<p>\n\t');
      
        if (this.stats.c === 0) {
          __out.push('\n\t\tempty selection\n\t');
        } else {
          __out.push('\n\t\t<b>count: </b>');
          __out.push(__sanitize(this.stats.c));
          __out.push('\n\t\t<b>size: </b>');
          __out.push(__sanitize(this.stats.s));
          __out.push('\n\t\t<b>from: </b>');
          __out.push(__sanitize(this.stats.b.strftime("%Y-%m-%d %H:%M:%S")));
          __out.push('\n\t\t<b>until: </b>');
          __out.push(__sanitize(this.stats.e.strftime("%Y-%m-%d %H:%M:%S")));
          __out.push('\n\t');
        }
      
        __out.push('\n\t</p>\n\t<p><b>query: </b><span class="query"></span></p>\n</div>\n<div class="fields-selection-items">\n</div>\n');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  };
}).call(this);
