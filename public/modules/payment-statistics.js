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
			merchantId: $('#merchantId'),
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
			pagesize: 15,
			pageName:'index',
			jsonReader: {
				root: 'payCountList',
				page: 'page.index',
				records: 'page.total'
			}
		});
		listContainer.html(_grid.getHtml());		
		_grid.load();
		getDictionaryFromServer(function(json) {
			if ('0' == json.code) {
				dictionaryCollection.merchantIdArr = json.merchantInfoMap;
				setSelect('merchantIdArr', doms.merchantId);
			}
		}, function(e) {
			// report
		});
		registerEvents();
	}
	function getDictionaryFromServer(callback, errorback) {		
		var emptyFn = function() {},
			cb = callback || emptyFn,
			ecb = errorback || emptyFn;
		$.ajax({
			url: global_config.serverRoot + '/payCountSearch',
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
		for(var e in data)
		{
			dom.append('<option value="' + e + '">' + Xss.inHTMLData(data[e]) + '</option>');
		}
		
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
			//刷新页面时，清空查询条件
			var _s="close";
			window.onunload = function(){
			   if(_s=="fresh")
			    userParam = {};
				doms.createTime.val('');
				doms.merchantId.val(-1);
			}
			window.onbeforeunload = function(){
			   _s="fresh";
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