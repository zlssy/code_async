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
			key: 'id',
			checkbox: false,
			cols: [{
				name: '支付渠道名称',
				index: 'id'
			}, {
				name: '支付渠道编码',
				index: 'ownerId'
			}, {
				name: '支付类型',
				index: 'ownerName'
			}, {
				name: '支付币种',
				index: 'chargeSystemProperty'
			}, {
				name: '接口状态',
				index: 'chargeStatus'
			}, {
				name: '操作',
				index: 'chargeType'
			}, {
				name: '创建时间',
				index: 'creationDate'
			}, {
				name: '操作',
				index: '',
				format: function(v) {
					return '<div class="ui-pg-div align-center"><input type="checkbox" checked name="my-checkbox" data-size="mini"/></div>';
				}
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
		_grid.listen('renderCallback', function(){
			$("input[name=my-checkbox]").bootstrapSwitch();
			$('input[name="my-checkbox"]').on('switchChange.bootstrapSwitch', function(event, state) {
			  //console.log(this); // DOM element
			  //console.log(event); // jQuery event
			  //console.log(state); // true | false
			  console.log($(this).parents('tr').data('id'));
			  setStatus();
			  
			});
		})
		registerEvents();
	}
	
	//on off 操作，传递给后台
	function setStatus(id){
		//console.log(row);
		/*var id = row[0].id;
		$.ajax({
			url: global_config.serverRoot + '/clearingCharge/history?userId=' + '&id=' + id,
			success: function(json) {
				console.log('a');
			},
			error: function(json) {
				// some report
			}
		})*/
	}
	function registerEvents() {
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
	}

	return {
		init: init
	};
});