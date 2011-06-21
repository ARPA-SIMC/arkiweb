var ArkiwebParser = {
	area: {
		decode: function(a) {
			return "area:" + a.join(" or ");
		},
		styles: {
			GRIB: {
				decode: function(i) {
					var vals = [];
					for (var k in i.va) {
						vals.push(k+"="+i.va[k]);
					}
					return "GRIB:" + vals.join(",");
				}
			}
		}
	},
	level: {
		decode: function(a) {
			return "level:" + a.join(" or ");
		},
		styles: {
			GRIB1: {
				decode: function(i) {
					var l = { lt: '', l1: '', l2: '' };
					$.extend(l, i);
					return $.sprintf("GRIB1,%(lt)s,%(l1)s,%(l2)s",l);
				}
			}
		}
	},
	origin: {
		decode: function(a) {
			return "origin:" + a.join(" or ");
		},
		styles: {
			GRIB1: {
				decode: function(i) {
					var o = { ce: '', sc: '', pr: '' };
					$.extend(o, i);
					return $.sprintf("GRIB1,%d,%d,%d",i.ce,i.sc,i.pr)
				}
			}
		}
	},
	proddef: {
		decode: function(a) {
			return "proddef:" + a.join(" or ");
		},
		styles: {
			GRIB: {
				decode: function(i) {
					var vals = [];
					for (var k in i.va) {
						vals.push(k+"="+i.va[k]);
					}
					return "GRIB1:" + vals.join(",");
				}
			}
		}
	},
	product: {
		decode: function(a) {
			return "product:" + a.join(" or ");
		},
		styles: {
			GRIB1: {
				decode: function(i) {
					var p = { or: '', ta: '', pr: '' };
					$.extend(p, i);
					return $.sprintf("GRIB1,%(or)s,%(ta)s,%(pr)s", p);
				}
			}
		}
	},
	run: {
		decode: function(a) {
			return "run:" + a.join(" or ");
		},
		styles: {
			MINUTE: {
				decode: function(i) {
					var h = Math.floor(i.va / 60);
					var m = i.va % 60;
					return $.sprintf("MINUTE,%d:%d",h,m);
				}
			}
		}
	},
	timerange: {
		decode: function(a) {
			return "timerange:" + a.join(" or ");
		},
		styles: {
			GRIB1: {
				decode: function(i) {
					var un = [ 'm', 'h', 'd', 'mo', 'y' ];
					var t = { ty: '', p1: '', p2: '', un: null };
					$.extend(t, i);
					if (t.p1 != "" && t.un != null)
						t.p1 = $.sprintf("%s%s", t.p1, un[t.un]);
					if (t.p2 != "" && t.un != null) {
						t.p2 = $.sprintf("%s%s", t.p2, un[t.un]);
					}
					return $.sprintf("GRIB1,%(ty)s,%(p1)s,%(p2)s", t);
				}
			}
		}
	}
};
