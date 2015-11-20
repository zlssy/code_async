define(function(require, exports, module) {
	var Utils = require('utils'),
		Grid = require('gridBootstrap'),
		Xss = require('xss'),
		accountCheck = require('checkAccount'),

		
		Box = require('boxBootstrap'),
		content = $('#content'),
		listContainer = $('#grid_list'),
		userParam = {},
		dictionaryCollection = {'status':{'0':'审核通过','1':'审核拒绝','2':'待审核'},'action':{'0':'注册事件','1':'支付接入','2':'修改信息','3':'代扣申请','4':'删除信息'}},
		infoCheckTpl = $('#infoCheckTpl').html(),
		otherCheckTpl = $('#otherCheckTpl').html(),
		doms = {			
			startTime: $('input[name="startTime"]'),
			endTime: $('input[name="endTime"]'),
			action: $('#action'),
			status: $('#status')
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
				name: '账户名',
				index: 'accountName'
			}, {
				name: '商户名称',
				index: 'merchantName'
			}, {
				name: '事件',
				index: 'action',
				format: function(v){
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
				format: function(v){
				         return dictionaryCollection['status'][v];
				    }
			}, {
				name: '说明',
				index: 'explanation'
			}, {
				name: '操作',
				index: 'status',
				closeXss: true,
				format: function(v) {
					if(v==2)
					{
						return '<div class="ui-pg-div align-center"><span class="ui-icon ace-icon fa fa-edit blue" title="审核"></span></div>';
					}
					//return '<div class="ui-pg-div align-center"><span class="ui-icon ace-icon fa fa-edit blue" title="审核"></span></div>';
				}
			}],
			url: getUrl(),
			pagesize: 15,
			pageName:'index',
			jsonReader: {
				root: 'merchantCheckVos',
				page: 'page.index',
				records: 'page.total'
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
			id = '',
			tpl = infoCheckTpl;
		if(data[0].action=='1'||data[0].action=='3')
		{
			tpl = otherCheckTpl;
		}
		opt.message = '<h4><b>商户审核</b></h4><hr class="no-margin">' + tpl;
		opt.buttons = {			
			"save": {
				label: '通过',
				className: 'btn-sm btn-success',
				callback: function() {
					checkSubmit(data,0);
				}
			},
			"cancel": {
				label: '驳回',
				className: 'btn-sm btn-success',
				callback: function(){
					checkSubmit(data,1);
				}
			}
		};
		showDialog(opt);		
		data && fillData(data);
	}
	
	function showDialog(opt) {
		Box.dialog(opt);
	}
	
	function fillData(d)
	{
		var data = d[0] || {};
		if(data.merchantName)
		{
			$("[vfor=merchantName]").html(data.merchantName);
		}
		//data.action:0/2/4;1\3
		if(data.action==0||data.action==2||data.action==4)
		{
			
			if(data.merchantVO)
			{
				if(data.merchantVO['linkmail'])
				{
					$("[vfor=linkmail]").html(data.merchantVO['linkmail']);
				}
				if(data.merchantVO['businessAddr'])
				{
					$("[vfor=businessAddr]").html(data.merchantVO['businessAddr']);
				}
				if(data.merchantVO['postalCode'])
				{
					$("[vfor=postalCode]").html(data.merchantVO['postalCode']);
				}
				if(data.merchantVO['businessCertAddr'])
				{
					$("[vfor=businessCertAddr]").html(data.merchantVO['businessCertAddr']);
				}
				if(data.merchantVO['businessCertCode'])
				{
					$("[vfor=businessCertCode]").html(data.merchantVO['businessCertCode']);
				}
				if(data.merchantVO['linkman'])
				{
					$("[vfor=linkman]").html(data.merchantVO['linkman']);
				}
				if(data.merchantVO['linkphone'])
				{
					$("[vfor=linkphone]").html(data.merchantVO['linkphone']);
				}
				if(data.merchantVO['merchantUrl'])
				{
					$("[vfor=merchantUrl]").html(data.merchantVO['merchantUrl']);
				}
			}
			
			if(data.merchantSettlementVO)
			{
				if(data.merchantSettlementVO['settlementBillTitle'])
				{
					$("[vfor=settlementBillTitle]").html(data.merchantSettlementVO['settlementBillTitle']);
				}
				if(data.merchantSettlementVO['depositBank'])
				{
					$("[vfor=depositBank]").html(data.merchantSettlementVO['depositBank']);
				}
				if(data.merchantSettlementVO['depositBankBranch'])
				{
					$("[vfor=depositBankBranch]").html(data.merchantSettlementVO['depositBankBranch']);
				}
				if(data.merchantSettlementVO['bankAccountName'])
				{
					$("[vfor=bankAccountName]").html(data.merchantSettlementVO['bankAccountName']);
				}
				if(data.merchantSettlementVO['bankAccount'])
				{
					$("[vfor=bankAccount]").html(data.merchantSettlementVO['bankAccount']);
				}
			}
		}
		else if(data.action==1||data.action==3)
		{
			if(data.tools)
			{
				var strTool = '';
				for(var i=0;i<data.tools.length;i++)
				{
					strTool += '<div class="col-xs-12 col-sm-2"><input type="checkbox" '+(data.tools[i]['tool']?'checked':'')+' disabled/>'+data.tools[i]['tool']+'</div>';
				}
				$("[vfor=tools]").html(strTool);
			}
		}
		
	}
	/*
	 * 审核：驳回/通过
	 * status:0 通过 1 驳回
	 */
	function checkSubmit(data,status){
		//console.log(data);
		var id = data[0].id;
		$.ajax({
			url: global_config.serverRoot + '/updateMerchantCheck',
			type:'post',
			data:{'id':data[0].id,'status':status,'explanation':$("#explanation").val()},
			success: function(res) {
				console.log(res);
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
		if (action!=='') {
			newParam.action = action;
		}
		if (status!=='') {
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
		if (!newchange) {
			Box.alert('您的查询条件并没有做任何修改.');
			return false;
		}
		userParam = newParam;
		return true;
	}

	function getUrl() {
		return global_config.serverRoot + '/queryMerchantCheck?' + Utils.object2param(userParam);
		//return global_config.serverRoot + '/queryPayChannel?payType=0';// + Utils.object2param(userParam);
	}

	return {
		init: init
	};
});