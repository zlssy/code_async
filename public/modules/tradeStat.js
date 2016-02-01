define(function(require, exports, module) {
	var Table = require('whygrid'),
		Box = require('boxBootstrap'),
		Utils = require('utils'),
		EnumOrderStatus = require('enum-order-status'),

		apis = {
			list: global_config.serverRoot + 'tradeStatistics/findtradeDataList'
		},
		dataTypes = {},
		dataMap = {},
		actionLock = {},
		lockInterval = 3000,
		userParam = {},
		_grid;

	function init() {
		$('#payStatus').append(EnumOrderStatus.getOptions());
		_grid = Table('#grid_list', apis.list, {
			checkRow: false,
			seachForm: '#sform',
			pagenav: true,
			cols: [{
				name: '交易日期',
				index: 'startPayTime'
			}, {
				name: '支付状态',
				index: 'payStatus',
				format: function(row, x, y) {
					return EnumOrderStatus.get(row[this.index]);
				}
			}, {
				name: '支付渠道',
				index: 'payChannel'
			}, {
				name: '币种',
				index: 'currencyType'
			}, {
				name: '交易笔数',
				index: 'tradeCount'
			}, {
				name: '交易金额',
				index: 'tradeAmount',
				format: function(v){
					return ((v[this.index] - 0)/100).toFixed(2);
				}
			}],
			jsonReader: {
				root: 'tradeOrders',
				records: 'totalCount',
				page: 'pageNo'
			}
		});
		var stypes = $("#sform").find('select[data-typename]');
		var ajaxArr = []
		for (var i = 0; i < stypes.length; i++) {
			+ function() {
				var s = $(stypes[i]);
				var typename = s.data('typename');
				ajaxArr.push($.get(global_config.serverRootQF + 'dataDictionary/dropdownlist', {
					type: s.data('typename')
				}, function(data) {
					if (data.code != 0) {
						return $.Deferred().reject(data.message || data.msg || "未知错误!")
					}
					if (data.data && data.data.dataArray) {
						var html = '',
							arr = data.data.dataArray,
							val;
						dataTypes[typename] = arr;
						for (var i = 0; i < arr.length; i++) {
							var item = arr[i];
							if ('currencyCode' == typename) {
								val = item.label;
							} else {
								val = item.innerValue;
							}
							html += '<option value=' + val + '>' + item.label + '</option>'
						}
					}
					s.append(html);
				}))
			}()
		}
		$.when.apply($, ajaxArr).then(function() {
			_grid.load(); //加载列表数据;
		}).then(null, function(e) {
			Box.alert('加载数据失败，请稍后刷新重试~');
		});
		registerEvents();
	}

	function exportExcel() {
		getParams();
		var a = document.createElement('a');
		var url = global_config.serverRoot + 'tradeStatistics/downloadtradeDataList?' + Utils.object2param(userParam);
		a.href = url;
		a.target = '_blank';
		a.height = 0;
		a.width = 0;
		document.body.appendChild(a);
		var e = document.createEvent('MouseEvents');
		e.initEvent('click', true, false);
		a.dispatchEvent(e);
		a.remove();
	}

	function getParams() {
		var merchantName = $('#merchantName').val(),
			merchantId = $('#merchantId').val(),
			currencyType = $('#currencyCode').val(),
			payStatus = $('#payStatus').val(),
			payChannel = $('#payChannel').val(),
			startPayBeginTime = $('#startPayBeginTime').val(),
			startPayEndTime = $('#startPayEndTime').val(),
			payOverBeginTime = $('#payOverBeginTime').val(),
			payOverEndTime = $('#payOverEndTime').val();
		userParam = {};
		if (merchantName) {
			userParam.merchantName = merchantName;
		}
		if (merchantId) {
			userParam.merchantId = merchantId;
		}
		if (currencyType) {
			userParam.currencyCode = currencyType;
		}
		if (payStatus) {
			userParam.payStatus = payStatus;
		}
		if (payChannel) {
			userParam.payChannel = payChannel;
		}
		if (startPayBeginTime) {
			userParam.startPayBeginTime = startPayBeginTime;
		}
		if (startPayEndTime) {
			userParam.startPayEndTime = startPayEndTime;
		}
		if (payOverBeginTime) {
			userParam.payOverBeginTime = payOverBeginTime;
		}
		if (payOverEndTime) {
			userParam.payOverEndTime = payOverEndTime;
		}
	}

	function registerEvents() {
		$('.datepicker').datetimepicker({
			autoclose: true,
			todayHighlight: true,			
			minuteStep: 10
		});
		$(document.body).on('click', function(e) {
			var $el = $(e.target || e.srcElement),
				id = $el.attr('id'),
				cls = $el.attr('class');
			if (cls && cls.indexOf('fa-file-excel-o') > -1 || (id && 'export' == id)) {
				exportExcel();
			}
		});
	}

	exports.init = init;
});