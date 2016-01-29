define(function(require, exports, module) {
	var _d_ = new Date(),
		timezoneoffset = _d_.getTimezoneOffset();

	/**
	 * [object2param 转换对象为url参数]
	 * @param  {[type]} o [要转换的对象]
	 * @param {[type]} [transVal] [值编码函数]
	 * @return {[type]}   [description]
	 */
	function object2param(o, transVal) {
		var r = [],
			transVal = transVal || function(v) {
				return encodeURIComponent(v);
			};
		for (var k in o) {
			r.push(k + '=' + transVal(o[k]));
		}
		return r.join('&');
	}

	/**
	 * [getCookie 获取cookie]
	 * @param  {[type]} name [cookie名]
	 * @return {[type]}      [description]
	 */
	function getCookie(name) {
		var reg = new RegExp("(^| )" + name + "(?:=([^;]*))?(;|$)"),
			val = document.cookie.match(reg);
		return val ? (val[2] ? decodeURIComponent(val[2]) : "") : null;
	}

	/**
	 * [setCookie 设置cookie]
	 * @param {[type]} name    [cookie名]
	 * @param {[type]} value   [值]
	 * @param {[type]} expires [过期时间，单位分钟]
	 * @param {[type]} path    [路径]
	 * @param {[type]} domain  [域]
	 * @param {[type]} secure  [是否是安全cookie]
	 */
	function setCookie(name, value, expires, path, domain, secure) {
		var exp = new Date(),
			expires = arguments[2] || null,
			path = arguments[3] || "/",
			domain = arguments[4] || null,
			secure = arguments[5] || false;
		expires ? exp.setMinutes(exp.getMinutes() + parseInt(expires)) : "";
		document.cookie = name + '=' + encodeURIComponent(value) + (expires ? ';expires=' + exp.toGMTString() : '') + (path ? ';path=' + path : '') + (domain ? ';domain=' + domain : '') + (secure ? ';secure' : '');
	}

	/**
	 * [delCookie 删除cookie]
	 * @param  {[type]} name   [cookie名]
	 * @param  {[type]} path   [路径]
	 * @param  {[type]} domain [域]
	 * @param  {[type]} secure [是否安全cookie]
	 * @return {[type]}        [description]
	 */
	function delCookie(name, path, domain, secure) {
		var value = getCookie(name);
		if (value != null) {
			var exp = new Date();
			exp.setMinutes(exp.getMinutes() - 1000);
			path = path || "/";
			document.cookie = name + '=;expires=' + exp.toGMTString() + (path ? ';path=' + path : '') + (domain ? ';domain=' + domain : '') + (secure ? ';secure' : '');
		}
	}

	/**
	 * [formatJson 模板解析]
	 * @param  {[type]} str  [模板串]
	 * @param  {[type]} data [数据]
	 * @return {[type]}      [解析后的字符串]
	 */
	function formatJson(str, data) {
		var fn = !/\W/.test(str) ? _formatJson_cache[str] = _formatJson_cache[str] || $formatJson(document.getElementById(str).innerHTML) : new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" + "with(obj){p.push('" + str.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');");
		return data ? fn(data) : fn;
	}

	/**
	 * [loadJsonp 加载jsonp数据]
	 * @param  {[type]} url [url地址]
	 * @param  {[type]} opt [配置参数]
	 * @return {[type]}     [description]
	 */
	function loadJsonp(url, opt) {
		var option = {
			onLoad: null,
			onError: null,
			onTimeout: null,
			timeout: 8000,
			charset: "utf-8"
		};
		var timer;
		if (arguments.length == 1) {
			if (typeof arguments[0] == "object") {
				opt = arguments[0];
				url = opt.url;
			} else {
				opt = {};
			}
		}
		if (typeof(opt.data) == 'object') {
			var param = [];
			for (var k in opt.data) {
				param.push(k + '=' + opt.data[k])
			}
			if (param.length > 0) {
				param = param.join('&');
				url += (url.indexOf('?') > 0 ? '&' : '?') + param;
			}
		}
		for (var i in opt) {
			if (opt.hasOwnProperty(i)) {
				option[i] = opt[i];
			}
		}
		var el = document.createElement("script");
		el.charset = option.charset || "utf-8";
		el.onload = el.onreadystatechange = function() {
			if (/loaded|complete/i.test(this.readyState) || navigator.userAgent.toLowerCase().indexOf("msie") == -1) {
				option.onLoad && option.onLoad();
				clear();
			}
		};
		el.onerror = function() {
			option.onError && option.onError();
			clear();
		};
		el.src = url;
		document.getElementsByTagName('head')[0].appendChild(el);
		if (typeof option.onTimeout == "function") {
			timer = setTimeout(function() {
				option.onTimeout();
			}, option.timeout);
		};
		var clear = function() {
			if (!el) {
				return;
			}
			timer && clearTimeout(timer);
			el.onload = el.onreadystatechange = el.onerror = null;
			el.parentNode && (el.parentNode.removeChild(el));
			el = null;
		}
	}

	/**
	 * [setHash 设置hash值]
	 * @param {[type]} val [description]
	 */
	function setHash(val) {
		setTimeout(function() {
			location.hash = val;
		}, 0);
	}

	/**
	 * [getHash 获取hash值]
	 * @param  {[type]} url [取值的url]
	 * @return {[type]}     [hash值]
	 */
	function getHash(url) {
		var u = url || location.hash;
		return u ? u.replace(/.*#/, "") : "";
	}

	/**
	 * [getHashParam 获取hash值]
	 * @param  {[type]} name [hash名]
	 * @return {[type]}      [hash值]
	 */
	function getHashParam(name) {
		var result = this.getHash().match(new RegExp("(^|&)" + name + "=([^&]*)(&|$)"));
		return result != null ? result[2] : "";
	}

	/**
	 * [getUrlParam 获取url参数值]
	 * @param  {[type]} name [url参数名]
	 * @param  {[type]} url  [url地址，默认当前host]
	 * @return {[type]}      [url参数值]
	 */
	function getUrlParam(name, url) {
		var u = arguments[1] || window.location.search,
			reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"),
			r = u.substr(u.indexOf("\?") + 1).match(reg);
		return r != null ? r[2] : "";
	}

	/**
	 * [getParams 获取所有的参数]
	 * @return {[type]} [参数数组]
	 */
	function getParams() {
		var param = [],
			hash = this.getHash();
		paramArr = hash ? hash.split("&") : [];
		for (var i = 1, l = paramArr.length; i < l; i++) {
			param.push(paramArr[i]);
		}
		return param;
	}

	/**
	 * [decodeUrl 解码url地址]
	 * @param  {[type]} url [url地址]
	 * @return {[type]}     [description]
	 */
	function decodeUrl(url) {
		url = decodeURIComponent(url);
		var urlObj = this.parseUrl(url),
			decodedParam = [];
		$.each(urlObj.params, function(key, value) {
			value = decodeURIComponent(value);
			decodedParam.push(key + "=" + value);
		});
		var urlPrefix = url.split("?")[0];
		return urlPrefix + "?" + decodedParam.join("&");
	}

	/**
	 * [parseUrl 处理url地址]
	 * @param  {[type]} url [url地址]
	 * @return {[type]}     [description]
	 */
	function parseUrl(url) {
		var a = document.createElement('a');
		a.href = url;
		return {
			source: url,
			protocol: a.protocol.replace(':', ''),
			host: a.hostname,
			port: a.port,
			query: a.search,
			params: (function() {
				var ret = {},
					seg = a.search.replace(/^\?/, '').split('&'),
					len = seg.length,
					i = 0,
					s;
				for (; i < len; i++) {
					if (!seg[i]) {
						continue;
					}
					s = seg[i].split('=');
					ret[s[0]] = s[1];
				}
				return ret;
			})(),
			file: (a.pathname.match(/([^\/?#]+)$/i) || [, ''])[1],
			hash: a.hash.replace('#', ''),
			path: a.pathname.replace(/^([^\/])/, '/$1'),
			relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
			segments: a.pathname.replace(/^\//, '').split('/')
		};
	}

	/**
	 * [replaceParam 替换url参数值]
	 * @param  {[type]} param        [参数名]
	 * @param  {[type]} value        [参数值]
	 * @param  {[type]} url          [url地址]
	 * @param  {[type]} forceReplace [强制地图换]
	 * @return {[type]}              [结果值]
	 */
	function replaceParam(param, value, url, forceReplace) {
		url = url || location.href;
		var reg = new RegExp("([\\?&]" + param + "=)[^&#]*");
		if (!url.match(reg)) {
			return (url.indexOf("?") == -1) ? (url + "?" + param + "=" + value) : (url + "&" + param + "=" + value);
		}
		if (forceReplace) {
			return url.replace(reg, "$1" + value);
		}
		return url;
	}

	/**
	 * [isDate 检查数据是否是日期类型]
	 * @param  {[String]}  d [要检查的字符串]
	 * @return {Boolean}   [返回值]
	 */
	function isDate(d) {
		var r;
		try {
			r = !!Date.parse(d.replace(/-/g, '/'));
		} catch (e) {
			r = false;
		}
		return r;
	}

	/*
	 * 检查是否是正确网址
	 */
	function isUrl(str_url) {
		var strRegex = "^((https|http|ftp|rtsp|mms)?://)" + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" // ftp的user@  
			+ "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184  
			+ "|" // 允许IP和DOMAIN（域名）  
			+ "([0-9a-z_!~*'()-]+\.)*" // 域名- www.  
			+ "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名  
			+ "[a-z]{2,6})" // first level domain- .com or .museum  
			+ "(:[0-9]{1,4})?" // 端口- :80  
			+ "((/?)|" // a slash isn't required if there is no file name  
			+ "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
		var re = new RegExp(strRegex);
		return re.test(str_url);
	}

	/**
	 * [is 校验是否是某种类型]
	 * @param  {[type]}  type [类型字符串]
	 * @param  {[type]}  v    [值]
	 * @return {Boolean}      [结果]
	 */
	function is(type, v) {
		return ('[object ' + type + ']') === Object.prototype.toString.call(v);
	}

	/**
	 * [once 执行一次的函数]
	 * @param  {Function} fn [要执行的函数]
	 * @return {[function]}      [返回无论条用多少次都执行一次的函数]
	 */
	function once(fn) {
		var run = false;
		return function() {
			!run && (run = !run, fn.call());
		}
	}

	function delay(f, t) {
		var now = Date.now,
			last = 0,
			ctx, args, exec = function() {
				last = now();
				f.apply(ctx, args)
			};
		return function() {
			cur = now();
			ctx = this, args = arguments;
			if (cur - last > t) {
				exec();
			}
		}
	}

	function local2utc(time) {
		return time + timezoneoffset * 60000;
	}

	function utc2local(time) {
		return time - timezoneoffset * 60000;
	}

	/**
	 * [getTodayStr 获取日期的今天年月日表示法]
	 * @param {Date|String} [date] [要获取的日期对象或日期对象字符串]
	 * @return {[String]} [年月日字符串]
	 */
	function getTodayStr(date) {
		var d = date || new Date();
		d = 'string' === typeof d ? new Date(d) : d;
		return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDay();
	}

	return {
		object2param: object2param,
		cookie: {
			get: getCookie,
			set: setCookie,
			del: delCookie
		},
		url: {
			setHash: setHash,
			getHash: getHash,
			getHashParam: getHashParam,
			getUrlParam: getUrlParam,
			getParams: getParams,
			decodeUrl: decodeUrl,
			parseUrl: parseUrl,
			replaceParam: replaceParam
		},
		date: {
			local2utc: local2utc,
			utc2local: utc2local,
			isDate: isDate,
			getTodayStr: getTodayStr
		},
		formatJson: formatJson,
		loadJsonp: loadJsonp,
		isDate: isDate,
		isUrl: isUrl,
		once: once,
		is: is,
		delay: delay
	};
});