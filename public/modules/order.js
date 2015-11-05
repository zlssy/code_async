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
			payOrderId:$('input[name="payOrderId"'),
			outOrderId:$('input[name="outOrderId"'),
			merchantId:$('input[name="merchantId"'),
			payChannel: $('#payChannel'),
			currencyType: $('#currencyType'),
			payStatus: $('#payStatus'),
			startPayBeginTime: $('input[name="startPayBeginTime"]'),
			startPayEndTime: $('input[name="startPayEndTime"]'),
			payOverBeginTime: $('input[name="payOverBeginTime"]'),
			payOverEndTime: $('input[name="payOverEndTime"]')
		},

		_grid;

	function init() {
		loadData();
	}

	function loadData() {
		_grid = Grid.create({
			key: 'payOrderId',
			checkbox: false,
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
				index: 'payStatus'
			}, {
				name: '支付开始时间',
				index: 'startPayTime'
			}, {
				name: '支付完成时间',
				index: 'payOverTime'
			}],
			url: getUrl(),
			pagesize: 10,
			jsonReader: {
				root: 'data.pageData',
				page: 'data.pageNo',
				records: 'data.totalCnt'
			}
		});
		listContainer.html(_grid.getHtml());		
		_grid.load();
		registerEvents();
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
			payOverEndTime = doms.payOverEndTime.val();
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
		if (!newchange) {
			Box.alert('您的查询条件并没有做任何修改.');
			return false;
		}
		userParam = newParam;
		return true;
	}

	function getUrl() {
		//return global_config.serverRoot + '/clearingCharge/list?userId=&' + Utils.object2param(userParam);
	}

	return {
		init: init
	};
});