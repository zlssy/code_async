define(function(require, exports, module) {
	var Utils = require('utils'),
		Grid = require('gridBootstrap'),
		Xss = require('xss'),
		accountCheck = require('checkAccount'),


		Box = require('boxBootstrap'),
		content = $('#content'),
		listContainer = $('#grid_list'),
		userParam = {},
		dictionaryCollection = {},
		doms = {
			payOrderId: $('#payOrderId'),
			outOrderId: $('input[name="outOrderId"]'), //这里获取元素还有点问题记得修复
			merchantId: $('input[name="merchantId"]'),
			payChannel: $('#payChannel'),
			currencyType: $('#currencyType'),
			payStatus: $('#payStatus'),
			startPayBeginTime: $('input[name="startPayBeginTime"]'),
			startPayEndTime: $('input[name="startPayEndTime"]'),
			payOverBeginTime: $('input[name="payOverBeginTime"]'),
			payOverEndTime: $('input[name="payOverEndTime"]'),
			merchantName: $('#merchantName')
		},

		_grid,
		idle = true, // 当前空闲，可操作
		PAY_STATUS = {
			'0': '待付款',
			'1': '全款已支付',
			'2': '部分已支付',
			'3': '付款失败',
			'4': '付款中',
			'5': '退款中',
			'6': '退款失败',
			'7': '退款成功',
			'8': '订单关闭'
		};

	function init() {
		loadData();
	}

	function loadData() {
		_grid = Grid.create({
			key: 'payOrderId',
			checkbox: false,
			ajaxCompleteKey: 'response',
			pageName: 'index',
			cols: [{
				name: '交易订单号',
				index: 'payOrderId'
			}, {
				name: '交易流水号',
				index: 'tradeId'
			}, {
				name: '商户订单号',
				index: 'outOrderId'
			}, {
				name: '商户名称',
				index: 'merchantName'
			}, {
				name: '用户编号',
				index: 'payer'
			}, {
				name: '订单金额',
				index: 'orderAmount'
			}, {
				name: '货币类型',
				index: 'currencyType'
			}, {
				name: '支付渠道',
				index: 'payChannel'
			}, {
				name: '订单状态',
				index: 'payStatus',
				format: function(v) {
					return PAY_STATUS[v] || '';
				}
			}, {
				name: '支付开始时间',
				index: 'startPayTime'
			}, {
				name: '支付完成时间',
				index: 'payOverTime'
			}, {
				name: '北京时间',
				index: 'startPayTimeBJ'
			}, {
				name: '失败原因',
				index: 'message',
				format: function(v) {
					return v || '';
				}
			}, {
				name: '操作',
				index: '',
				format: function(v, i, row) {
					var html = '<div class="align-right">';
					if ('1' == row.payStatus && ('CYBS' == row.payChannel || 'PAYPAL' == row.payChannel)) {
						html += '<a href="javascript:void(0)" class="refund">退款</a>&nbsp;';
					}
					html += '<a href="javascript:void(0)" class="history">操作历史</a>';
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
						row.length && $.ajax({
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
									_grid.loadData();
								} else if('32101' == json.code){
									Box.alert('订单无效~');
								}else if('32102' == json.code){
									Box.alert('重复退款~');
								}else if('32103' == json.code){
									Box.alert('网络问题，请稍后再试~');
								}
								else {
									Box.alert('退款失败~');
								}
							},
							error: function(e) {
								Box.alert('退款失败~');
							}
						});
					}
				}));
				setTimeout(function() {
					idle = true;
				}, 1000);
			}).on('click', '.history', function(e) {
				setTimeout(function() {
					viewHistory(_grid.getSelectedRow());
				}, 0);
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
		html.push('<thead><tr><th>操作人</th><th>操作日期</th><th>操作类型</th></tr></thead>');
		html.push('<tbody>');
		for (var i = 0; i < data.length; i++) {
			d = data[i];
			html.push('<tr>');
			html.push('<td>' + (d.operator) + '</td>');
			html.push('<td>' + d.createDateStr + '</td>');
			html.push('<td>' + getOperationTypeStr(d.type) + '</td>');
			html.push('</tr>');
		}
		html.push('</tbody></table>');

		Box.alert(html.join(''));
	}

	function getOperationTypeStr(v) {
		if ('1' == v) {
			return '补单';
		} else if ('0' == v) {
			return '退款';
		}
		return '';
	}


	function registerEvents() {
		$('.datepicker').datetimepicker({
			autoclose: true,
			todayHighlight: true,
			minView: 2
		});
		$(document.body).on('click', function(e) {
			var $el = $(e.target || e.srcElement),
				cls = $el.attr('class'),
				tag = $el.get(0).tagName.toLowerCase(),
				id = $el.attr('id'),
				name = $el.attr('name');
			if (cls && cls.indexOf('fa-calendar') > -1) {
				$el.parent().siblings('input').focus();
			}
			if (cls && cls.indexOf('fa-check') > -1 || (id && 'query-btn' == id)) {
				if (getParams()) {
					_grid.setUrl(getUrl());
					_grid.loadData();
				}
			}
			if ('input' == tag && 'fchargeSystemPropertyInt' == name) {
				var val = $el.val();
				if (val == dictionaryCollection.chargeSystemPropertyArr[1].innerValue) {
					$('#fownerId').attr('placeholder', '通道ID');
				} else if (val == dictionaryCollection.chargeSystemPropertyArr[0].innerValue) {
					$('#fownerId').attr('placeholder', '商户ID');
				}
			}
		});
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
		if (payStatus) {
			newParam.payStatus = payStatus;
		}
		if (startPayBeginTime) {
			newParam.startPayBeginTime = startPayBeginTime;
		}
		if (startPayEndTime) {
			newParam.startPayEndTime = startPayEndTime;
		}
		if (payOverBeginTime) {
			newParam.payOverBeginTime = payOverBeginTime;
		}
		if (payOverEndTime) {
			newParam.payOverEndTime = payOverEndTime;
		}
		if (merchantName) {
			newParam.merchantName = merchantName;
		}

		/*if (payChannel != '') {
			newParam.payChannel = payChannel;
		}*/

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

	function getUrl() {
		return global_config.serverRoot + 'payOrderSearch?size=15&index=1&' + Utils.object2param(userParam) + '&t=' + Math.random();
	}

	return {
		init: init
	};
});