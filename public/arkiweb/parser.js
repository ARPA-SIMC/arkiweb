var ArkiwebParser = {
	area: {
		decode: function(a) {
			if (a instanceof Array)
				return "area:" + a.join(" or ");
			else
				return this.styles[a.s].decode(a);
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
			},
			ODIMH5: {
				decode: function(i) {
					var vals = [];
					for (var k in i.va) {
						vals.push(k+"="+i.va[k]);
					}
					return "ODIMH5:" + vals.join(",");
				}
			},
			VM2: {
				decode: function(i) {
                    var a = "VM2," + i.id;
                    if (i.va != undefined) {
                        var vals = [];
                        for (var k in i.va) {
                            vals.push(k+"="+i.va[k]);
                        }
                        a = a + ":" + vals.join(",");
                    }
                    return a;
				}
			}
		}
	},
	level: {
		decode: function(a) {
			if (a instanceof Array)
				return "level:" + a.join(" or ");
			else
				return this.styles[a.s].decode(a);
		},
		styles: {
			GRIB1: {
				decode: function(i) {
					var l = [i.lt];
					if (i.l1 != undefined) {
						l.push(i.l1)
						if (i.l2 != undefined) {
							l.push(i.l2);
						}
					}
					return "GRIB1," + l.join(",");
				}
			},
			GRIB2S: {
				decode: function(i) {
					var l = [i.lt, '-', '-'];
					if (i.sc != undefined)
						l[1] = i.sc
					if (i.va != undefined)
						l[2] = i.va
					return "GRIB2S," + l.join(",")
				}
			},
			GRIB2D: {
				decode: function(i) {
					return "GRIB2D," + i.l1 + "," + i.s1 + "," + i.v1 + "," + i.l2 + "," + i.s2 + "," + i.v2;
				}
			},
			ODIMH5: {
				decode: function(i) {
					return "ODIMH5,range " + i.mi + " " + i.ma;
				}
			}
		}
	},
	origin: {
		decode: function(a) {
			if (a instanceof Array)
				return "origin:" + a.join(" or ");
			else
				return this.styles[a.s].decode(a);
		},
		styles: {
			GRIB1: {
				decode: function(i) {
					return "GRIB1," + i.ce + "," + i.sc + "," + i.pr;
				}
			},
			GRIB2: {
				decode: function(i) {
					return "GRIB2," + i.ce + "," + i.sc + "," + i.pt + "," + i.bi + "," + i.pi;
				}
			},
			BUFR: {
				decode: function(i) {
					return "BUFR," + i.ce + "," + i.sc;
				}
			},
			ODIMH5: {
				decode: function(i) {
					return "ODIMH5," + i.wmo + "," + i.rad + "," + i.plc;
				}
			}
		}
	},
	proddef: {
		decode: function(a) {
			if (a instanceof Array)
				return "proddef:" + a.join(" or ");
			else
				return this.styles[a.s].decode(a);
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
	product: {
		decode: function(a) {
			if (a instanceof Array)
				return "product:" + a.join(" or ");
			else
				return this.styles[a.s].decode(a);
		},
		styles: {
			GRIB1: {
				decode: function(i) {
					return "GRIB1," + i.or + "," + i.ta + "," + i.pr;
				}
			},
			GRIB2: {
				decode: function(i) {
					return "GRIB2," + i.ce + "," + i.di + "," + i.ca + "," + i.no;
				}
			},
			BUFR: {
				decode: function(i) {
					var s = "BUFR," + i.ty + "," + i.st + "," + i.ls;
					if (i.va != undefined) {
						var vals = [];
						for (var k in i.va) {
							vals.push(k+"="+i.va[k]);
						}
						if (vals.length > 0) {
							s += ":" + vals.join(",");
						}
					}
					return s;
				}
			},
			ODIMH5: {
				decode: function(i) {
					return "ODIMH5," + i.ob + "," + i.pr;
				}
			},
			VM2: {
				decode: function(i) {
                    var p = "VM2," + i.id;
                    if (i.va != undefined) {
                        var vals = [];
                        for (var k in i.va) {
                            vals.push(k+"="+i.va[k]);
                        }
                        p = p + ":" + vals.join(",");
                    }
                    return p;
				}
			}
		}
	},
	quantity: {
		decode: function(a) {
			if (a instanceof Array)
				return "quantity:" + a.join(" or ");
			else
				return a.va.join(",")
		}
	},
	run: {
		decode: function(a) {
			if (a instanceof Array)
				return "run:" + a.join(" or ");
			else
				return this.styles[a.s].decode(a);
		},
		styles: {
			MINUTE: {
				decode: function(i) {
					var h = Math.floor(i.va / 60);
					var m = i.va % 60;
					if (h < 10) {
						h = "0" + h;
					}
					if (m < 10) {
						m = "0" + m;
					}
					return "MINUTE," + h + ":" + m;
				}
			}
		}
	},
	task: {
		decode: function(a) {
			if (a instanceof Array)
				return "task:" + a.join(" or ");
			else
				return a.va;
		}
	},
	timerange: {
		decode: function(a) {
			if (a instanceof Array)
				return "timerange:" + a.join(" or ");
			else
				return this.styles[a.s].decode(a);
		},
		styles: {
			GRIB1: {
				decode: function(i) {
					var un = {
						0: 'm',
						1: 'h',
						2: 'd',
						3: 'mo',
						4: 'y',
						5: 'de',
						6: 'no',
						7: 'ce',
						10: 'h3',
						11: 'h6',
						12: 'h12',
						254: 's'
					};
					return "GRIB1," + i.ty + "," + i.p1 + un[i.un] + "," + i.p2 + un[i.un];
				}
			},
			GRIB2: {
				decode: function(i) {
					var un = {
						0: 'm',
						1: 'h',
						2: 'd',
						3: 'mo',
						4: 'y',
						5: 'de',
						6: 'no',
						7: 'ce',
						10: 'h3',
						11: 'h6',
						12: 'h12',
						254: 's'
					};
					return "GRIB2," + i.ty + "," + i.p1 + un[i.un] + "," + i.p2 + un[i.un];
				}
			},
			Timedef: {
				decode: function(i) {
					var un = {
						0: 'm',
						1: 'h',
						2: 'd',
						3: 'mo',
						4: 'y',
						5: 'de',
						6: 'no',
						7: 'ce',
						10: 'h3',
						11: 'h6',
						12: 'h12',
						13: 's'
					};
					var s = "Timedef";
					if (i.su == 255) {
						s += ",-"
					} else {
						s += "," + i.sl + un[i.su];
					}
					if (i.pt != undefined) {
						s += "," + i.pt
					} else {
						// If i.pt is not defined, then
						// the stat type is 255 and 
						// i.pl, i.pu are not defined
						// too (see 
						// arki/types/timerange.cc:1358).
						// If the stat type is 255, then
						// proctype = "-" (see
						// arki/types/timerange.cc:1403).
						s += ",-"
					}
					// If i.pu is not defined, then
					// the stat unit is UNIT_MISSING = 255
					// and i.pl is not defined too
					// (see arki/types/timerange.cc:1361).
					// If stat unit is 255, then 
					// proclen = "-" (see
					// arki/types/timerange.cc:1408).
					if (i.pu != undefined) {
						s += "," + i.pl + un[i.pu]
					} else {
						s += ",-"
					}
					return s;
				}
			},
			BUFR: {
				decode: function(i) {
					var un = {
						0: 'm',
						1: 'h',
						2: 'd',
						3: 'mo',
						4: 'y',
						5: 'de',
						6: 'no',
						7: 'ce',
						10: 'h3',
						11: 'h6',
						12: 'h12',
						13: 's'
					};
					return "BUFR," + i.va + un[i.un];
				}
			}
		}
	}
};
