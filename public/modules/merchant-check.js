define(function(require, exports, module) {
	var Utils = require('utils'),
		Grid = require('gridBootstrap'),
		Xss = require('xss'),
		accountCheck = require('checkAccount'),


		Box = require('boxBootstrap'),
		content = $('#content'),
		listContainer = $('#grid_list'),
		userParam = {},
		dictionaryCollection = {
			'status': {
				'0': '审核通过',
				'1': '审核拒绝',
				'2': '待审核'
			},
			'action': {
				'0': '注册事件',
				'1': '支付接入',
				'2': '修改信息',
				'3': '代扣申请',
				'4': '删除信息'
			}
		},
		infoCheckTpl = $('#infoCheckTpl').html(),
		otherCheckTpl = $('#otherCheckTpl').html(),
		doms = {
			startTime: $('input[name="startTime"]'),
			endTime: $('input[name="endTime"]'),
			action: $('#action'),
			status: $('#status')
		},
		_grid,
		dataMap = {},
		guid = 1000;

	function init() {
		loadData();
	}

	function loadData() {
		_grid = Grid.create({
			key: 'merchantId', //记得这里要换成现在接口的参数
			checkbox: false,
			cols: [{
				name: '账户名',
				index: 'accountName'
			}, {
				name: '商户名称',
				index: 'merchantName'
			}, {
				name: '事件',
				index: 'action',
				format: function(v) {
					return dictionaryCollection['action'][v];
				}
			}, {
				name: '提交审核时间',
				index: 'submitTime'
			}, {
				name: '完成审核时间',
				index: 'finishTime'
			}, {
				name: '状态',
				index: 'status',
				format: function(v) {
					return dictionaryCollection['status'][v];
				}
			}, {
				name: '说明',
				index: 'explanation'
			}, {
				name: '操作',
				index: 'status',
				closeXss: true,
				format: function(v, key, row) {
					var id = ++guid;
					dataMap[id] = row;
					if (v == 2) {
						return '<div class="ui-pg-div align-center"><span class="ui-icon ace-icon fa fa-edit blue" title="审核" data-id="' + id + '"></span></div>';
					}
					//return '<div class="ui-pg-div align-center"><span class="ui-icon ace-icon fa fa-edit blue" title="审核"></span></div>';
				}
			}],
			url: getUrl(),
			pagesize: 15,
			pageName: 'index',
			jsonReader: {
				root: 'merchantCheckVos',
				page: 'page.index',
				records: 'page.total'
			}
		});
		listContainer.html(_grid.getHtml());
		_grid.load();
		registerEvents();
	}

	function checkUpdate(data) {
		var opt = {},
			id = '',
			tpl = infoCheckTpl + otherCheckTpl;
		
		opt.message = '<h4><b>商户审核</b></h4><hr class="no-margin">' + tpl;
		opt.buttons = {
			"save": {
				label: '通过',
				className: 'btn-sm btn-success',
				callback: function() {
					checkSubmit(data, 0);
				}
			},
			"cancel": {
				label: '驳回',
				className: 'btn-sm btn-success',
				callback: function() {
					checkSubmit(data, 1);
				}
			}
		};
		showDialog(opt);
		data && fillData(data);
	}

	function showDialog(opt) {
		Box.dialog(opt);
	}

	function fillData(d) {
		var data = d[0] || {},
			strTool = '';
		console.log(d);
		if (data.merchantName) {
			$("[vfor=merchantName]").html(data.accountName);
		}
		if (data.accountName) {
			$("[vfor=accountName]").html(data.accountName);
		}

		if (data.merchantVO) {
			if (data.merchantVO['linkmail']) {
				$("[vfor=linkmail]").html(data.merchantVO['linkmail']);
			}
			if (data.merchantVO['businessAddr']) {
				$("[vfor=businessAddr]").html(data.merchantVO['businessAddr']);
			}
			if (data.merchantVO['postalCode']) {
				$("[vfor=postalCode]").html(data.merchantVO['postalCode']);
			}
			if (data.merchantVO['businessCertAddr']) {
				$("[vfor=businessCertAddr]").html(data.merchantVO['businessCertAddr']);
			}
			if (data.merchantVO['businessCertCode']) {
				$("[vfor=businessCertCode]").html(data.merchantVO['businessCertCode']);
			}
			if (data.merchantVO['linkman']) {
				$("[vfor=linkman]").html(data.merchantVO['linkman']);
			}
			if (data.merchantVO['linkphone']) {
				$("[vfor=linkphone]").html(data.merchantVO['linkphone']);
			}
			if (data.merchantVO['merchantUrl']) {
				$("[vfor=merchantUrl]").html(data.merchantVO['merchantUrl']);
			}
		} else {
			$('#baseInfoBox').hide();
		}

		if (data.tools) {			
			for (var i = 0; i < data.tools.length; i++) {
				strTool += '<div class="col-xs-12 col-sm-2"><input type="checkbox" ' + (data.tools[i]['checked'] ? 'checked' : '') + ' disabled/>' + data.tools[i]['tool'] + '</div>';
			}
			$("#payInfoList").html(strTool);
		}
		else{
			$('#payInfoBox').hide();
		}

		if(data.withTools){
			strTool = '';
			for (var i = 0; i < data.withTools.length; i++) {
				strTool += '<div class="col-xs-12 col-sm-2"><input type="checkbox" ' + (data.withTools[i]['checked'] ? 'checked' : '') + ' disabled/>' + data.withTools[i]['tool'] + '</div>';
			}
			$("#holdInfoList").html(strTool);
		}
		else{
			$('#holdInfoBox').hide();
		}
	}
	/*
	 * 审核：驳回/通过
	 * status:0 通过 1 驳回
	 */
	function checkSubmit(data, status) {		
		var d = data[0], pdata = {};
		if(d.merchantId && 'null' != d.merchantId){
			pdata.merchantId = d.merchantId;
		}
		if(d.payToolId && 'null' != d.payToolId){
			pdata.payToolId = d.payToolId;
		}
		if(d.withToolId && 'null' != d.withToolId){
			pdata.withToolId = d.withToolId;
		}
		pdata.status = status;
		pdata.explanation = $('#explanation').val();
		$.ajax({
			url: global_config.serverRoot + '/updateMerchantCheck',
			type: 'post',
			data: pdata,
			success: function(res) {
				// $("tr[data-id=" + id + "]").find("td:eq(5)").html(dictionaryCollection['status'][status]);
				// $("tr[data-id=" + id + "]").find("td:eq(6)").html($("#explanation").val());
				// $("tr[data-id=" + id + "]").find("td:last").children('div').remove();
				_grid.loadData();
			},
			error: function(json) {
				// some report
			}
		})
	}

	function registerEvents() {
		$('.datepicker').datetimepicker({
			autoclose: true,
			todayHighlight: true
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
			if (cls && cls.indexOf('fa-edit') > -1) {
				var row = dataMap[$el.data('id')];
				checkUpdate([row]);
			}
			//刷新页面时，清空查询条件
			var _s = "close";
			window.onunload = function() {
				if (_s == "fresh")
					userParam = {};
				doms.startTime.val('');
				doms.endTime.val('');
				doms.action.val(-1);
				doms.status.val(-1);
			}
			window.onbeforeunload = function() {
				_s = "fresh";
			}
		});
	}

	function getParams() {
		var newParam = {},
			newchange = false,
			startTime = doms.startTime.val(),
			endTime = doms.endTime.val(),
			action = doms.action.val(),
			status = doms.status.val();
		if (startTime) {
			newParam.startTime = startTime;
		}
		if (endTime) {
			newParam.endTime = endTime;
		}
		if (action !== '-1') {
			newParam.action = action;
		}
		if (status !== '-1') {
			newParam.status = status;
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
		return global_config.serverRoot + '/queryMerchantCheck?size=15&index=1&' + Utils.object2param(userParam) + '&t=' + Math.random();
	}

	return {
		init: init
	};
});