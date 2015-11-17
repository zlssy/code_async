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
			effectiveDateStart: $('input[name="effectiveDateStart"]'),
			effectiveDateEnd: $('input[name="effectiveDateEnd"]'),
			expirationDateStart: $('input[name="expirationDateStart"]'),
			expirationDateEnd: $('input[name="expirationDateEnd"]'),
			creationDateStart: $('input[name="creationDateStart"]'),
			creationDateEnd: $('input[name="creationDateEnd"]'),
			chargeServiceTypeInt: $('#chargeServiceTypeInt'),
			chargeStatusInt: $('#chargeStatusInt'),
			chargeSystemPropertyInt: $('#chargeSystemPropertyInt'),
			chargeTypeInt: $('#chargeTypeInt'),
			ownerIds: $('#ownerIds'),
			ids: $('#ids')
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
				index: 'accountName'
			}, {
				name: '商户名称',
				index: 'merchantName'
			}, {
				name: 'onetouch收银台',
				index: 'action',
				format: function(v){
				         return '[' + v + ']';
				    }
			}, {
				name: '支付请求',
				index: 'submitTime'
			}, {
				name: '成功',
				index: 'finishTime'
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
		_grid.listen('checkCallback', function(row) {
			checkUpdate(row);
		});
		registerEvents();
	}
	
	function checkUpdate(data)
	{
		var opt = {},
			id = '';
		/*if(data.status:注册 和修改)
		{
			infoCheckTpl
		}
		else
		{
			otherCheckTpl
		}*/
		opt.message = '<h4><b>商户审核</b></h4><hr class="no-margin">' + otherCheckTpl;
		opt.buttons = {			
			"save": {
				label: '通过',//'<i class="ace-icon fa"></i>通过',
				className: 'btn-sm btn-success',
				callback: function() {
					checkSubmit(data,status);
				}
			},
			"cancel": {
				label: '驳回',
				className: 'btn-sm btn-success',
				callback: function(){
					checkSubmit(data,status);
				}
			}
		};
		showDialog(opt);
		
		/*data && fillData(data);

		$('.bootbox input, .bootbox select').on('change', function(e) {
			validate($(this));
		});
		var shbh = $('#shbh'),
			elp = shbh.parents('.form-group:first');
		accountCheck.check({
			el: shbh,
			elp: elp
		});

		data && setTimeout(function() {
			shbh.focus();
		}, 80);*/
	}
	
	function showDialog(opt) {
		Box.dialog(opt);
	}
	
	/*
	 * 审核：驳回/通过
	 */
	function checkSubmit(data,status){
		//console.log(row);
		/*var id = row[0].id;
		$.ajax({
			url: global_config.serverRoot + '/updateMerchantCheck',
			success: function(json) {
				console.log('a');
			},
			error: function(json) {
				// some report
			}
		})*/
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
			if (cls && cls.indexOf('fa-undo') > -1 || (id && 'reset-btn' == id)) {
				userParam = {};
				doms.effectiveDateStart.val('');
				doms.effectiveDateEnd.val('');
				doms.expirationDateStart.val('');
				doms.expirationDateEnd.val('');
				doms.creationDateStart.val('');
				doms.creationDateEnd.val('');
				doms.chargeServiceTypeInt.val(0);
				doms.chargeStatusInt.val(0);
				doms.chargeSystemPropertyInt.val(0);
				doms.chargeTypeInt.val(0);
				doms.ownerIds.val('');
				doms.ids.val('');
			}
			if ('input' == tag && 'fchargeTypeInt' == name) {
				var val = $el.val();
				if (val == dictionaryCollection.chargeTypeArr[1].innerValue) {
					$('#gdPanel').addClass('hide');
					$('#jtPanel').removeClass('hide');
				} else {
					$('#gdPanel').removeClass('hide');
					$('#jtPanel').addClass('hide');
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
			if (cls && cls.indexOf('glyphicon-plus') > -1) {
				$('#jtPanel .row:last').after(flTpl);
			}
			if (cls && cls.indexOf('glyphicon-minus') > -1) {
				$el.parent().parent().remove();
			}
		});
	}

	function getParams() {
		var newParam = {},
			newchange = false,
			ids = doms.ids.val(),
			ownerIds = doms.ownerIds.val(),
			chargeTypeInt = doms.chargeTypeInt.val(),
			chargeSystemPropertyInt = doms.chargeSystemPropertyInt.val(),
			chargeStatusInt = doms.chargeStatusInt.val(),
			chargeServiceTypeInt = doms.chargeServiceTypeInt.val(),
			effectiveDateStart = doms.effectiveDateStart.val(),
			effectiveDateEnd = doms.effectiveDateEnd.val(),
			expirationDateStart = doms.expirationDateStart.val(),
			expirationDateEnd = doms.expirationDateEnd.val(),
			creationDateStart = doms.creationDateStart.val(),
			creationDateEnd = doms.creationDateEnd.val();

		if (ids) {
			newParam.ids = ids;
		}
		if (ownerIds) {
			newParam.ownerIds = ownerIds;
		}
		if (effectiveDateStart) {
			newParam.effectiveDateStart = effectiveDateStart;
		}
		if (effectiveDateEnd) {
			newParam.effectiveDateEnd = effectiveDateEnd;
		}
		if (expirationDateStart) {
			newParam.expirationDateStart = expirationDateStart;
		}
		if (expirationDateEnd) {
			newParam.expirationDateEnd = expirationDateEnd;
		}
		if (creationDateStart) {
			newParam.creationDateStart = creationDateStart;
		}
		if (creationDateEnd) {
			newParam.creationDateEnd = creationDateEnd;
		}
		if (chargeTypeInt != '0') {
			newParam.chargeTypeInt = chargeTypeInt;
		}
		if (chargeSystemPropertyInt != '0') {
			newParam.chargeSystemPropertyInt = chargeSystemPropertyInt;
		}
		if (chargeStatusInt != '0') {
			newParam.chargeStatusInt = chargeStatusInt;
		}
		if (chargeServiceTypeInt != '0') {
			newParam.chargeServiceTypeInt = chargeServiceTypeInt;
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
		return global_config.serverRoot + '/clearingCharge/list?userId=&' + Utils.object2param(userParam);
		//return global_config.serverRoot + '/queryPayChannel?payType=0';// + Utils.object2param(userParam);
	}

	return {
		init: init
	};
});