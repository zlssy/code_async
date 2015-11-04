define(function(require, exports, module) {
	var contentContainer = $('#content'),
		mask = $('#mask'),
		head = $('head'),
		headCssDom = head.find('link:last'),
		body = $('body'),
		bodyJsDom = $('#ace_script_position'),
		cur_operation,
		operation_timeout = 5000, // 操作5s没响应即视为超时
		operation_timeout_timer,
		single = {
			events: [],
			init: function() {
				this.bindEvents();
			},
			listen: function(evt) {
				'function' === typeof evt && this.events.push(evt);
				return this;
			},
			unlisten: function(evt) {
				if ('function' === typeof evt || 'string' === typeof evt)
					for (var i = 0; i < this.events.length; i++) {
						if (evt === this.events[i] || evt === this.events[i].id) {
							this.events.splice(i--, 1);
						}
					}
				return this;
			},
			trigger: function(evt) {
				var evtList = [];
				for (var i = 0, l = this.events.length; i < l; i++) {
					if (evt == this.events[i].id) {
						evtList.push(this.events[i]);
					}
				}
				for (var i = 0; i < evtList.length; i++) {
					evtList[i].apply(this, Array.prototype.slice.call(arguments, 1));
				}
			},
			bindEvents: function() {
				var self = this;
				$('.nav-list').on('click', 'a', function(e) {
					var $el = $(this),
						id = $el.attr('id');
					if (id && id != cur_operation) {
						showLoading();
						contentContainer.html('');
						operation_timeout_timer = setTimeout(hideLoading, operation_timeout);
						self.trigger(id, $el);
						cur_operation = id;
						$('.nav-list li.active').removeClass('active').removeClass('open').find('ul').removeClass('nav-show').addClass('nav-hide').hide();
						$el.parent().addClass('active').parent('ul').parent('li').addClass('active');
						console.log(id);
					}
				});
			}
		},
		base = {
			load: function(uris, callback) {
				return new loadTask(uris, callback);
			}
		};

	function loadTask(uris, callback) {
		this.uris = 'string' === typeof uris ? [uris] : uris;
		this.callback = callback;
		this.load();
		return this;
	}
	loadTask.prototype = {
		loaded: {},
		load: function() {
			var completed = true;
			for (var i = 0; i < this.uris.length; i++) {
				if (this.uris[i] && !this.loaded[this.uris[i]]) {
					completed = false;
					this.attach(this.uris[i]);
				} else {
					console.log(this.uris[i] + ' has loaded.');
				}
			}
			if (completed) {
				'function' === typeof this.callback && this.callback.call(null, Array.prototype.slice.call(arguments, 0));
			} else {
				this.watch();
			}
		},
		attach: function(uri) {
			var self = this;
			var ext = uri.substr(uri.lastIndexOf('.') + 1).toLowerCase(),
				dom;
			if ('css' === ext) {
				dom = document.createElement('link');
				dom.rel = 'stylesheet';
				dom.href = uri;
			} else if ('js' === ext) {
				dom = document.createElement('script');
				dom.src = uri;
				dom.async = true;
				dom.defer = 'defer';
			} else {

			}

			if (dom) {
				dom.charset = 'utf-8';
				dom.onload = dom.onreadystatechange = function() {
					if (!this.readyState || 'loaded' == this.readyState || 'complete' == this.readyState) {
						self.loaded[uri] = true;
						console.log('loaded ' + uri + ' successful.');
						self.watch();
					}
					dom.onload = dom.onreadystatechange = null;
					dom = null;
				}
				if ('css' == ext) {
					headCssDom.before($(dom));
				} else {
					body.get(0).appendChild(dom);
				}
			}
		},
		watch: function() {
			var loaded = true;
			for (var i = 0; i < this.uris.length; i++) {
				if (!this.loaded[this.uris[i]]) {
					loaded = false;
					break;
				}
			}
			loaded && ('function' === typeof this.callback && this.callback.call(null, Array.prototype.slice.call(arguments, 0)));
		}
	};

	/** 注册模块 (id, module)*/
	single.listen(register('business-detail-query', 'business-detail'));
	single.listen(register('qingfen-list-query', 'qingfen-list'));
	single.listen(register('settle-card'), 'aaa');
	single.listen(register('settle-rule'), 'aaa');
	single.listen(register('settle-limit'), 'aaa');
	single.listen(register('settle-query'), 'aaa');
	single.listen(register('rate-query'), 'aaa');
	single.listen(register('exchange-query'), 'aaa');
	single.listen(register('statement-upload'), 'aaa');
	single.listen(register('statement-query'), 'aaa');
	single.listen(register('finance-stat'), 'aaa');
	single.listen(register('dictionary-manage'), 'aaa');
	single.listen(register('log-manage'), 'aaa');

	/** 设置默认值 */
	// cur_operation = 'business-detail-query';

	/** 扩展base */
	$.extend(base, {
		serverRoot: '/settlement/',
		gc: function() {
			hideLoading();
		}
	});

	/** 模块注册函数 */
	function register(id, module) {
		var mod = 'string' === typeof module ? [module] : module;

		function a(el) {
			seajs.use(mod, function(m) {
				m.init(base, el);
			});
		}
		a.id = id;
		return a;
	}

	function showLoading() {
		clearTimeout(operation_timeout_timer);
		mask.html('<i class=" ace-icon loading-icon fa fa-spinner fa-spin fa-5x white"></i>').removeClass('hide');
	}

	function hideLoading() {
		mask.html('').addClass('hide');
	}

	return single;
});