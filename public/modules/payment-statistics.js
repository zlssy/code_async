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
		infoCheckTpl = $('#infoCheckTpl').html(),
		otherCheckTpl = $('#otherCheckTpl').html(),
		doms = {			
			merchantId: $('input[name="merchantId"]'),
			createTime: $('input[name="createTime"]')
		},
		_grid;

	function init() {
		loadData();
	}

	function loadData() {
		_grid = Grid.create({
			key: 'id',//记得这里要换成现在接口的参数
			checkbox: false,
			cols: [{
				name: '交易日期',
				index: 'createTime'
			}, {
				name: '商户名称',
				index: 'outMerchantName'
			}, {
				name: 'onetouch收银台',
				index: 'viewChannelCount'
			}, {
				name: '支付请求',
				index: 'selectChannelCount'
			}, {
				name: '成功',
				index: 'payOkCount'
			}],
			url: getUrl(),
			pagesize: 20,
			jsonReader: {
				root: 'payCountList',
				page: 'data.index',
				records: 'data.total'
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
		});
	}

	function getParams() {
		var newParam = {},
			newchange = false,
			merchantId = doms.merchantId.val(),
			createTime = doms.createTime.val();
		if (merchantId!='-1') {
			newParam.merchantId = merchantId;
		}
		if (createTime) {
			newParam.createTime = createTime;
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
		if (!newchange) {
			Box.alert('您的查询条件并没有做任何修改.');
			return false;
		}
		userParam = newParam;
		return true;
	}

	function getUrl() {
		return global_config.serverRoot + '/payCountSearch?size=15&index=1&' + Utils.object2param(userParam)+ '&t=' + Math.random();
	}

	return {
		init: init
	};
});