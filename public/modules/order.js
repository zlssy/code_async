define(function(require, exports, module) {
	var Utils = require('utils'),
		Grid = require('gridBootstrap'),
		Xss = require('xss'),
		accountCheck = require('checkAccount'),
		Tips = require('tips'),
		EnumOrderStatus = require('enum-order-status'),

		Box = require('boxBootstrap'),
		content = $('#content'),
		listContainer = $('#grid_list'),
		userParam = {},
		dictionaryCollection = {},
		doms = {
			payOrderId: $('input[name="payOrderId"]'),
			outOrderId: $('input[name="outOrderId"]'), //这里获取元素还有点问题记得修复
			merchantId: $('input[name="merchantId"]'),
			payChannel: $('select[name="payChannel"]'),
			currencyType: $('select[name="currencyType"]'),
			payStatus: $('select[name="payStatus"]'),
			startPayBeginTime: $('input[name="startPayBeginTime"]'),
			startPayEndTime: $('input[name="startPayEndTime"]'),
			payOverBeginTime: $('input[name="payOverBeginTime"]'),
			payOverEndTime: $('input[name="payOverEndTime"]'),
			merchantName: $('input[name="merchantName"]')
		},
		viewTpl = $('#viewTpl').html(),

		_grid,
		idle = true, // 当前空闲，可操作
		wait = 1000, // 控制用户操作频率，2个操作间需要等待的时间		
		dataTypes = {},
		_tips = new Tips.Tips();

	function init() {
		initControl();
		loadData();
	}

	function initControl() {
		$('#payStatus').append(EnumOrderStatus.getOptions());
		$('select[data-typename]').each(function(i, v) {
			var $this = $(v),
				typename = $this.data('typename');
			$.get(global_config.serverRootQF + 'dataDictionary/dropdownlist', {
				type: typename
			}, function(data) {
				if (data.code != 0) {
					// return $.Deferred().reject(data.message || data.msg || "未知错误!")
				}
				if (data.data && data.data.dataArray) {
					var html = '',
						arr = data.data.dataArray,
						val;
					dataTypes[typename] = arr;
					for (var i = 0; i < arr.length; i++) {
						var item = arr[i];
						if ('payChannel' == typename || 'currencyCode' == typename) {
							val = item.label;
						} else {
							val = item.innerValue;
						}
						html += '<option value=' + val + '>' + item.label + '</option>'

					}
				}
				$this.append(html);
			});
		});
	}

	function loadData() {
		_grid = Grid.create({
			key: 'payOrderId',
			checkbox: false,
			ajaxCompleteKey: 'response',
			pageName: 'index',
			cols: [{
				name: '交易订单号',
				index: 'payOrderId',
				width: 100
			}, {
				name: '交易流水号',
				index: 'tradeId',
				width: 100
			}, {
				name: '商户订单号',
				index: 'outOrderId',
				width: 120,

			}, {
				name: '源交易订单',
				index: 'sourcePayOrderId',
				width: 100
			}, {
				name: '商户名称',
				index: 'merchantName',
				width: 150
			}, {
				name: '用户编号',
				index: 'payer'
			}, {
				name: '订单金额',
				index: 'orderAmount',
				format: function(v) {
					return changeCurrency(v);
				}
			}, {
				name: '货币类型',
				index: 'currencyType'
			}, {
				name: '支付渠道',
				index: 'payChannel'
			}, {
				name: '订单状态',
				index: 'payStatus',
				width: 90,
				format: function(v) {
					return EnumOrderStatus.get(v);
				}
			}, {
				name: '支付开始时间',
				index: 'startPayTime',
				width: 85
			}, {
				name: '支付完成时间',
				index: 'payOverTime',
				width: 85
			}, {
				name: '北京时间',
				index: 'startPayTimeBJ',
				width: 85
			}, {
				name: '失败原因',
				index: 'message',
				width: 90,
				format: function(v) {
					return v || '';
				}
			}, {
				name: '操作',
				index: '',
				width: 150,
				format: function(v, i, row) {
					var html = '<div class="">';
					html += '<a href="javascript:void(0)" class="detail">详情</a>&nbsp;';
					if ('1' == row.payStatus && ('CYBS' == row.payChannel || 'PAYPAL' == row.payChannel) && ('5' != row.refundStatus && '7' != row.refundStatus)) {
						html += '<a href="javascript:void(0)" class="refund">退款</a>&nbsp;';
					}
					if ('1' == row.payStatus) {
						html += '<a href="javascript:void(0)" class="history">操作历史</a>&nbsp;';
					}
					html += '</div>';
					return html;
				}
			}],
			url: getUrl(),
			pagesize: 15,
			jsonReader: {
				root: 'payOrderList',
				page: 'page.index',
				records: 'page.total'
			}
		});
		listContainer.html(_grid.getHtml());
		_grid.listen('renderCallback', function() {
			$('.ui-jqgrid-bdiv').off('click').on('click', '.refund', function(e) {
				idle && (idle = false, Box.confirm('确认退款', function(v) {
					if (v) {
						var row = _grid.getSelectedRow();

						if (row.length) {
							_grid.showLayer();
							_tips.show('正在退款...');
							$.ajax({
								url: global_config.serverRoot + 'refund',
								data: {
									payOrderId: row[0].payOrderId,
									amount: row[0].orderAmount,
									operator: global_info.username || '',
									type: 0
								},
								success: function(json) {
									if ('32000' == json.code) {
										Box.alert('退款成功~');
									} else if ('32101' == json.code) {
										Box.alert('无效订单，退款失败~');
									} else if ('32102' == json.code) {
										Box.alert('您已经申请过退款了，我们正在审核，请耐心等候~');
									} else if ('32103' == json.code) {
										Box.alert('网络好像不给力~');
									} else {
										Box.alert('退款失败~');
									}
									_grid.loadData(); // 无论成功失败，都进行重新加载
									_grid.hideLayer();
									_tips.hide();
								},
								error: function(e) {
									_grid.hideLayer();
									_tips.hide()
									Box.alert('退款失败~');
								}
							});
						}
					}
				}));
				setTimeout(function() {
					idle = true;
				}, wait);
			}).on('click', '.history', function(e) {
				idle && (idle = false, setTimeout(function() {
					setTimeout(function() {
						idle = true;
					}, wait);
					viewHistory(_grid.getSelectedRow());
				}, 0));
			}).on('click', '.detail', function(e) {
				idle && (idle = false, setTimeout(function() {
					setTimeout(function() {
						idle = true;
					}, wait);
					view(_grid.getSelectedRow());
				}, 0));
			});
		});
		_grid.load();
		registerEvents();
	}

	/**
	 * [viewHistory 查看历史记录]
	 * @param  {[Array]} row [选中行的数组]
	 * @return {[type]}     [description]
	 */
	function viewHistory(row) {
		var id = row[0].payOrderId;
		$.ajax({
			url: global_config.serverRoot + 'queryRefundHistory?payOrderId=' + id,
			success: function(json) {
				if ('0' == json.code) {
					showHistory(json.refundHistory);
				} else if (-100 == json.code) {
					location.reload();
				}
			},
			error: function(json) {
				// some report
			}
		})
	}

	/**
	 * [showHistory 展示历史操作信息]
	 * @param  {[Array]} data [要展示的数据]
	 * @return {[type]}      [description]
	 */
	function showHistory(data) {
		var html = ['<h4><b>操作历史</b></h4><hr class="no-margin">'],
			d;
		html.push('<table class="table table-striped table-bordered table-hover">');
		html.push('<thead><tr><th>操作人</th><th>操作日期</th><th>操作类型</th><th>操作结果</th><th>退款金额</th></tr></thead>');
		html.push('<tbody>');
		for (var i = 0; i < data.length; i++) {
			d = data[i];
			html.push('<tr>');
			html.push('<td>' + (d.operator) + '</td>');
			html.push('<td>' + formatDate(d.createDateStr, 1) + '</td>');
			html.push('<td>' + getOperationTypeStr(d.type) + '</td>');
			html.push('<td>' + getResult(d.result) + '</td>');
			html.push('<td>' + changeCurrency(d.amount) + '</td>');
			html.push('</tr>');
		}
		html.push('</tbody></table>');

		Box.alert(html.join(''));
	}

	function view(row) {
		var id = row && row[0] && row[0].payOrderId;
		$.ajax({
			url: global_config.serverRoot + 'getPayOrderDetail?payOrderId=' + id,
			success: function(json) {
				var data = json.payOrderDetail;
				if (data) {
					data.hasOwnProperty('tradeType') && (data.tradeType = '0' == data.tradeType ? '支付' : '代扣');
					if (data.hasOwnProperty('payStatus')) {
						data.payStatus = EnumOrderStatus.get(data.payStatus);
					}
					if (data.hasOwnProperty('orderAmount')) {
						data.orderAmount = ((data.orderAmount - 0) / 100).toFixed(2);
					}
					Box.alert(Utils.formatJson(viewTpl, {
						data: data
					}));
				}
			},
			error: function(json) {

			}
		});
	}

	function changeCurrency(v) {
		if (/\d+(\.\d+)?/.test(v)) {
			return new Number(v / 100).toFixed(2);
		}
		return v;
	}

	function getOperationTypeStr(v) {
		if ('1' == v) {
			return '补单';
		} else if ('0' == v) {
			return '退款';
		}
		return '';
	}

	function getResult(v) {
		if ('32000' == v) {
			return '退款成功';
		} else if ('32101' == v) {
			return '订单无效';
		} else if ('32102' == v) {
			return '重复退款';
		} else if ('32103' == v) {
			return '网络问题';
		} else {
			return '退款失败';
		}
	}


	function registerEvents() {
		$('.datepicker').datetimepicker({
			autoclose: true,
			todayHighlight: true,
			minView: 1
		});
		$(document.body).on('click', function(e) {
			var $el = $(e.target || e.srcElement),
				cls = $el.attr('class'),
				tag = $el.get(0).tagName.toLowerCase(),
				id = $el.attr('id'),
				name = $el.attr('name');
			//			if (cls && cls.indexOf('fa-calendar') > -1) {
			//				$el.parent().siblings('input').focus();
			//			}
			if (cls && cls.indexOf('fa-check') > -1 || (id && 'query-btn' == id)) {
				if (getParams()) {
					_grid.setUrl(getUrl());
					_grid.loadData();
				}
			}
			if (cls && cls.indexOf('fa-undo') > -1 || (id && 'reset-btn' == id)) {
				doms.payOrderId.val('');
				doms.outOrderId.val('');
				doms.merchantId.val('');
				doms.payChannel.val('');
				doms.currencyType.val('');
				doms.payStatus.val('');
				doms.startPayBeginTime.val('');
				doms.startPayEndTime.val('');
				doms.payOverBeginTime.val('');
				doms.payOverEndTime.val('');
				doms.merchantName.val('');
			}
			if (cls && cls.indexOf('fa-file-excel-o') > -1 || (id && 'export-btn' == id)) {
				exportExcel();
			}
		});
	}

	function exportExcel() {
		var a = document.createElement('a');
		var url = global_config.serverRoot + '/downloadTradeOrders?' + Utils.object2param(userParam);
		a.href = url; //global_config.serverRootQF + '/settleStatement/export?userId=&' + Utils.object2param(userParam);
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
		var newParam = {},
			newchange = false,
			payOrderId = doms.payOrderId.val(),
			outOrderId = doms.outOrderId.val(),
			merchantId = doms.merchantId.val(),
			payChannel = doms.payChannel.val(),
			currencyType = doms.currencyType.val(),
			payStatus = doms.payStatus.val(),
			startPayBeginTime = doms.startPayBeginTime.val(),
			startPayEndTime = doms.startPayEndTime.val(),
			payOverBeginTime = doms.payOverBeginTime.val(),
			payOverEndTime = doms.payOverEndTime.val(),
			merchantName = doms.merchantName.val();

		if (payOrderId) {
			newParam.payOrderId = payOrderId;
		}
		if (outOrderId) {
			newParam.outOrderId = outOrderId;
		}
		if (merchantId) {
			newParam.merchantId = merchantId;
		}
		if (payChannel) {
			newParam.payChannel = payChannel;
		}
		if (currencyType) {
			newParam.currencyType = currencyType;
		}
		if (payStatus != '') {
			newParam.payStatus = payStatus;
		}
		if (startPayBeginTime) {
			newParam.startPayBeginTime = formatDate(startPayBeginTime);
		}
		if (startPayEndTime) {
			newParam.startPayEndTime = formatDate(startPayEndTime);
		}
		if (payOverBeginTime) {
			newParam.payOverBeginTime = formatDate(payOverBeginTime);
		}
		if (payOverEndTime) {
			newParam.payOverEndTime = formatDate(payOverEndTime);
		}
		if (merchantName) {
			newParam.merchantName = merchantName;
		}


		for (var k in newParam) {
			if (newParam[k] !== userParam[k]) {
				newchange = true;
				break;
			} else {
				delete userParam[k];
			}
		}
		for (var k in userParam) {
			if (userParam.hasOwnProperty(k)) {
				newchange = true;
				break;
			}
		}
		userParam = newParam;
		return true;
	}

	function formatDate(d) {
		var resver = arguments[1] || 0;
		try {
			var dd = new Date(d.replace(/-/g, '/'));
			dd = new Date(Utils.date[resver ? 'utc2local' : 'local2utc'](dd.getTime()));
			return dd.getFullYear() + '-' + fix(dd.getMonth() + 1) + '-' + fix(dd.getDate()) + ' ' + fix(dd.getHours()) + ':' + fix(dd.getMinutes()) + ':' + fix(dd.getSeconds());
		} catch (e) {
			window.console && console.log(e);
		}
		return d;
	}

	function fix(str) {
		var s = '0' + str;
		return s.substr(s.length - 2);
	}

	function getUrl() {
		return global_config.serverRoot + 'payOrderSearch?size=15&index=1&' + Utils.object2param(userParam) + '&t=' + Math.random();
	}

	return {
		init: init
	};
});