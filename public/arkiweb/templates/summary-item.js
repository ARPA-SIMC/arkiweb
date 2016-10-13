(function() {
  this.arkiweb.templates || (this.arkiweb.templates = {});
  this.arkiweb.templates["summary-item"] = function(__obj) {
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
        var className, e, i, len, query, ref, value;
      
        __out.push('<h3><a>');
      
        __out.push(__sanitize(this.type));
      
        __out.push('</a></h3>\n<div>\n\t<table>\n\t\t<thead>\n\t\t\t<tr>\n\t\t\t\t<td>query</td>\n\t\t\t\t<td>description</td>\n\t\t\t</tr>\n\t\t</thead>\n\t\t<tbody>\n\t\t\t');
      
        ref = this.values;
        for (i = 0, len = ref.length; i < len; i++) {
          value = ref[i];
          __out.push('\n\t\t\t\t');
          query = void 0;
          __out.push('\n\t\t\t\t');
          className = "parsed";
          __out.push('\n\t\t\t\t');
          try {
            __out.push('\n\t\t\t\t\t');
            query = ArkiwebParser[this.type].decode(value);
            __out.push('\n\t\t\t\t');
          } catch (error) {
            e = error;
            __out.push('\n\t\t\t\t\t');
            query = void 0;
            __out.push('\n\t\t\t\t\t');
            className = "unparsed";
            __out.push('\n\t\t\t\t');
          }
          __out.push('\n\t\t\t\t\n\t\t\t\t<tr class="');
          __out.push(__sanitize(className));
          __out.push('">\n\t\t\t\t\t<td class="query">');
          __out.push(__sanitize(query));
          __out.push('</td>\n\t\t\t\t\t<td class="description">');
          __out.push(__sanitize(value.desc));
          __out.push('</td>\n\t\t\t\t</tr>\n\t\t\t');
        }
      
        __out.push('\n\t\t</tbody>\n\t</table>\n</div>\n');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  };
}).call(this);
