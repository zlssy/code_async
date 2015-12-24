define(function(require, exports, module) {
	var Utils = require('utils'),
		Grid = require('gridBootstrap'),
		Box = require('boxBootstrap'),
		Xss = require('xss'),

		content = $('#content'),
		listContainer = $('#grid_list'),
		userParam = {},
		doms = {
			qfstart: $('input[name="qfstart"]'),
			qfend: $('input[name="qfend"]'),
			jystart: $('input[name="jystart"]'),
			jyend: $('input[name="jyend"]'),
			qfstatus: $('#qfstatus'),
			commercialId: $('#commercialId'),
			commercialName: $('#commercialName'),
			account: $('#account')
		},
		dictionaryCollection = {},
		_grid;

	function init() {
		loadData();
	}

	function loadData() {
		_grid = Grid.create({
			key: 'merchantId',
			checkbox: false,
			cols: [{
				name: '商户编码',
				index: 'merchantId'
			}, {
				name: '商户名称',
				index: 'merchantName'
			}, {
				name: '清算日期',
				index: 'clearingDate'
			}, {
				name: '交易开始日期',
				index: 'tradeStartDate'
			}, {
				name: '交易结束日期',
				index: 'tradeEndDate'
			}, {
				name: '交易总金额',
				index: 'tradeAmount'
			}, {
				name: '交易总笔数',
				index: 'tradeTrans'
			}, {
				name: '退款总金额',
				index: 'refundAmount'
			}, {
				name: '退款总笔数',
				index: 'refundTrans'
			}, {
				name: '币种',
				index: 'currencyCode'
			}, {
				name: '交易渠道',
				index: 'payChannel'
			}, {
				name: '交易成本',
				index: 'cost'
			}, {
				name: '交易手续费',
				index: 'serviceCharge'
			}, {
				name: '结算总金额',
				index: 'settleAmount'
			}, {
				name: '毛利润',
				index: 'profit'
			}, {
				name: '状态',
				index: 'status'
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
		_grid.listen('refreshCallback', function(v) {
			console.log(v);
		});
		_grid.load();
		getDictionaryFromServer('clearingStatus', function(json) {
			if ('0' == json.code) {
				dictionaryCollection.statusArr = json.data && json.data.dataArray || [];
				setSelect('statusArr', doms.qfstatus);
			}
		}, function(e) {
			// report
		});
		registerEvents();
	}

	function registerEvents() {
		var evtListener = function(e) {
			var $el = $(e.target || e.srcElement),
				cls = $el.attr('class') || '',
				id = $el.attr('id') || '',
				tag = $el.get(0).tagName.toLowerCase();
			if (cls && cls.indexOf('fa-calendar') > -1) {
				$el.parent().siblings().focus();
			}
			if (cls && cls.indexOf('fa-check') > -1 || (id && 'query-btn' == id)) {
				if (getParams()) {
					console.log(userParam);
					_grid.setUrl(getUrl());
					_grid.loadData();
				}
			}
			if (cls && cls.indexOf('fa-undo') > -1 || (id && 'reset-btn' == id)) {
				userParam = {};
				doms.qfstart.val('');
				doms.qfend.val('');
				doms.jystart.val('');
				doms.jyend.val('');
				doms.qfstatus.val(0);
				doms.commercialId.val('');
				doms.commercialName.val('');
				doms.account.val('');
			}
			if (cls && cls.indexOf('fa-file-excel-o') > -1 || (id && 'export-btn' == id)) {
				exportExcel();
			}
		};

		$(document.body).on('click', evtListener);
		$('.datepicker').datetimepicker({
			autoclose: true,
			todayHighlight: true,
			minView: 2
		});
	}

	function exportExcel() {
		var clearingDateStart = doms.qfstart.val(), clearingDateEnd = doms.qfend.val();
		if(!clearingDateStart || !clearingDateEnd){
			Box.alert('请选择清分起始日期后导出。');
			return;
		}
		var a = document.createElement('a');
		userParam.clearingDateStart = clearingDateStart;
		userParam.clearingDateEnd = clearingDateEnd;
		a.href = global_config.serverRoot + 'clearing/export?userId=&' + Utils.object2param(userParam);
		a.target = '_blank';
		a.height = 0;
		a.width = 0;
		document.body.appendChild(a);
		var e = document.createEvent('MouseEvents');
		e.initEvent('click', true, false);
		a.dispatchEvent(e);
		a.remove();
	}

	function getDictionaryFromServer(type, callback, errorback) {
		var emptyFn = function() {},
			cb = callback || emptyFn,
			ecb = errorback || emptyFn;
		$.ajax({
			url: global_config.serverRoot + 'dataDictionary/dropdownlist?userId=' + '&type=' + type,
			success: cb,
			error: ecb
		});
	}

	function setSelect(gArr, dom, selected) {
		var data = dictionaryCollection[gArr],
			s = '',
			context = this,
			args = Array.prototype.slice.call(arguments, 0),
			fn = arguments.callee;
		if (!data) {
			setTimeout(function() {
				console.log('retry');
				fn.apply(context, args);
			}, 10);
			return;
		}
		for (var i = 0; i < data.length; i++) {
			if (selected == data[i].innerValue) {
				s = ' selected = "selected"';
			} else {
				s = '';
			}
			dom.append('<option value="' + data[i].innerValue + '"' + s + '>' + Xss.inHTMLData(data[i].label) + '</option>');
		}
	}

	function getParams() {
		var newParam = {},
			newchange = false,
			qfstart = doms.qfstart.val(),
			qfend = doms.qfend.val(),
			jystart = doms.jystart.val(),
			jyend = doms.jyend.val(),
			qfstatus = doms.qfstatus.val(),
			commercialId = doms.commercialId.val(),
			commercialName = doms.commercialName.val(),
			account = doms.account.val();

		if (qfstart) {
			newParam.clearingDateStart = qfstart;
		}
		if (qfend) {
			newParam.clearingDateEnd = qfend;
		}
		if (jystart) {
			newParam.tranDateStart = jystart;
		}
		if (jyend) {
			newParam.tranDateEnd = jyend;
		}
		if (qfstatus != '0') {
			newParam.statusInt = qfstatus;
		}
		if (commercialId) {
			newParam.merchantIds = commercialId;
		}
		if (commercialName) {
			newParam.merchantName = commercialName;//encodeURIComponent(commercialName);
		}
		if (account) {
			newParam.account = account;
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

	function getUrl() {
		return global_config.serverRoot + 'clearing/list?userId=&' + Utils.object2param(userParam);
	}

	return {
		init: init
	};
});