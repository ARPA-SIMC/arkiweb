(function() {
  this.arkiweb.templates || (this.arkiweb.templates = {});
  this.arkiweb.templates["application"] = function(__obj) {
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
        __out.push('<div class="header">\n</div>\n\n<div class="content">\n\t<div class="selection">\n\t\t<div class="datasets">\n\t\t\t<div class="datasets-menu">\n\t\t\t\t<button class="toggle-disallowed">toggle disallowed datasets</button>\n\t\t\t\t<button class="clear-selection">clear selection</button>\n\t\t\t\t<button class="submit-selection">load selected datasets</button>\n\t\t\t</div>\n\t\t\t<div class="datasets-content">\n\t\t\t</div>\n\t\t</div>\n\t\t<div class="fields">\n\t\t\t<div class="fields-menu">\n\t\t\t\t<button class="show-datasets">back to datasets selection</button>\n\t\t\t\t<button class="clear-selection">clear selection</button>\n\t\t\t\t<button class="submit-selection">load summary</button>\n\t\t\t</div>\n\t\t\t<div class="fields-content">\n\t\t\t</div>\n\t\t</div>\n\t\t<div class="summary">\n\t\t\t<div class="summary-menu">\n\t\t\t\t<button class="show-datasets">back to datasets selection</button>\n\t\t\t\t<button class="show-fields">back to fields selection</button>\n\t\t\t\t<button class="show-postprocessors">choose a postprocessor</button>\n\t\t\t</div>\n\t\t\t<div class="summary-content">\n\t\t\t</div>\n\t\t</div>\n\t\t<div class="postprocessors">\n\t\t\t<div class="postprocessors-menu">\n\t\t\t\t<button class="show-datasets">back to datasets selection</button>\n\t\t\t\t<button class="show-fields">back to fields selection</button>\n\t\t\t\t<button class="download-selection">download the selected data</button>\n\t\t\t</div>\n\t\t\t<div class="postprocessors-content">\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\t<div class="map">\n\t</div>\n</div>\n\n<div class="footer">\n\t<p class="copyright">Copyright &copy; 2011 <a href="http://www.arpa.emr.it/sim/" target="_blank">ARPA-SIMC Emilia-Romagna</a> - released under <a href="http://www.gnu.org/licenses/gpl.html" target="_blank">GNU General Public License</a></p>\n\t<p class="version">version ');
      
        __out.push(__sanitize(arkiweb.version));
      
        __out.push('</p>\n</div>\n');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  };
}).call(this);
