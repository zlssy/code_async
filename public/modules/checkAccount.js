define(function(require, exports, module) {
	var ajaxCache, pass = false;

	function create(opt) {
		var el = opt.el,
			elp = opt.elp,
			errorClass = opt.errorClass || 'has-error';

		el.off().on('change', function() {
			elp.removeClass(errorClass);
		}).on('blur', function(e) {
			var $this = $(this),
				val = $this.val();
			ajaxCache && ajaxCache.abort();
			ajaxCache = $.ajax({
				url: global_config.serverRoot + '/dataDictionary/merchantId/isValid?userId=&merchantId=' + val,
				success: function(json) {
					pass = false;
					if ('0' == json.code) {
						if ('true' == json.data.isValid) {
							elp.removeClass(errorClass);
							pass = true;
						} else {
							elp.addClass(errorClass);
						}
					} else {
						elp.addClass(errorClass);
						console.log(json);
					}
				},
				error: function(json) {
					pass = false;
					console.log('检验失败~');
					elp.addClass(errorClass);
				}
			});
		});
	}

	function isPass(){
		return pass;
	}

	exports.check = function(opt) {
		return new create(opt);
	}
	exports.isPass = isPass;
});