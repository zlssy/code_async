define(function(require, exports, module) {
	var ORDER_STATUS = {
		'0': '待支付',
		'1': '支付完成',
		'2': '部分已支付',
		'3': '支付失败',
		'4': '支付中',
		'5': '退款中',
		'6': '退款失败',
		'7': '退款成功',
		'8': '支付关闭'
	}

	exports.get = function(key) {
		return ORDER_STATUS[key] || '';
	};

	exports.getOptions = function() {
		var html = [];
		for (var key in ORDER_STATUS) {
			html.push('<option value="' + key + '">' + ORDER_STATUS[key] + '</option>');
		}
		return html.join('');
	};
});