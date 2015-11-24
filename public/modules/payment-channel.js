define(function(require, exports, module) {
	var Utils = require('utils'),
		Grid = require('gridBootstrap'),
		Xss = require('xss'),
		accountCheck = require('checkAccount'),		
		Box = require('boxBootstrap'),
		content = $('#content'),
		listContainer = $('#grid_list'),
		userParam = {},
		dictionaryCollection = {'payType':{'0':'运营商','1':'第三方支付','2':'支付渠道'},'status':{'0':'开启','1':'关闭'}},
		doms = {			
			payChannelName: $('input[name="payChannelName"]'),
			payChannelNumber: $('input[name="payChannelNumber"]'),
			payType: $('#payType')
		},

		_grid;

	function init() {
		loadData();
	}

	function loadData() {
		_grid = Grid.create({
			key: 'payChannelNumber',
			checkbox: false,
			cols: [{
				name: '支付渠道名称',
				index: 'payChannelName'
			}, {
				name: '支付渠道编码',
				index: 'payChannelNumber'
			}, {
				name: '支付类型',
				index: 'payType',
				format: function(v){					
				         return dictionaryCollection['payType'][v];
				    }
			}, {
				name: '支付币种',
				index: 'supportCurrency'
			}, {
				name: '接口状态',
				index: 'status',
				format: function(v){					
				         return dictionaryCollection['status'][v];
				    }
			}, {
				name: '操作',
				index: 'status',
				closeXss: true,
				format: function(v) {					
					return '<div class="ui-pg-div align-center"><input type="checkbox" '+((v==0)?'checked':'')+' name="my-checkbox" data-size="mini"/></div>';
				}
			}],
			url: getUrl(),
			pagesize: 15,
			pageName:'index',
			jsonReader: {
				root: 'payChannelVos',
				page: 'page.index',//'data.index',
				records: 'page.total'//data.total'
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
			  var status=0;
			  status = (state)?0:1;
			  setStatus($(this).parents('tr').data('id'),status,$(this));			 
			});
		})
		registerEvents();
	}
	
	//on off 操作，传递给后台
	function setStatus(id,status,obj){		
		$.ajax({
			url: global_config.serverRoot + '/handlePayChannel',
			type:'post',
			data:{'paychannelNumber':id,'status':status},
			success: function(res) {		
				if(res.response==0)
				{					
					$("tr[data-id="+id+"]").find("td:eq(4)").html(dictionaryCollection['status'][status]);
				}
				else
				{
					
				}
			},
			error: function(json) {
			}
		})
	}
	function registerEvents() {
		$(document.body).on('click', function(e) {
			var $el = $(e.target || e.srcElement),
				cls = $el.attr('class'),
				tag = $el.get(0).tagName.toLowerCase(),
				id = $el.attr('id'),
				name = $el.attr('name');
			
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
			      doms.payChannelName.val('');
					doms.payChannelNumber.val('');
					doms.payType.val(-1);
			}
			window.onbeforeunload = function(){
			   _s="fresh";
			}
		});
	}

	function getParams() {
		var newParam = {},
			newchange = false,
			payChannelName = doms.payChannelName.val(),
			payChannelNumber = doms.payChannelNumber.val(),
			payType = doms.payType.val();

		if (payChannelName) {
			newParam.payChannelName = payChannelName;
		}
		if (payChannelNumber) {
			newParam.payChannelNumber = payChannelNumber;
		}
		if (payType!=='-1') {
			newParam.payType = payType;
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
		return global_config.serverRoot + '/queryPayChannel?size=15&index=1&'+ Utils.object2param(userParam)+ '&t=' + Math.random();
	}

	return {
		init: init
	};
});