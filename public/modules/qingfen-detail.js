define(function(require, exports, module) {
	var Table = require('whygrid');
	var tool = require("why");
	var D = window.D = require("dialog.ace");
	var rooturl = global_config.serverRoot.replace(/\/+$/, '');
	var apis = {
		list: rooturl + '/clearingDetail/list', //clearingDetail/list
		typeList: rooturl + '/dataDictionary/dropdownlist',
		down: rooturl + '/downloadTradeRecord'
	}
	var T;
	var errfun = function(e) {
		var msg = typeof e == 'object' ? e.statusText || e.msg || "未知错误!" : e;
		D.err(msg);
	}
	var dataTypes = {};
	var dictionaryCollection = {
		'clearingStatus': {
			'1': '未清分',
			'2': '已进行周期清分',
			'3': '已汇总'
		}
	};

	$(function() {
		T = Table('#grid_list', apis.list, {
			checkRow: false,
			seachForm: '#sform',
			//oldApi: true, //是否是老接口
			pagenav: true,
			cols: [{
				name: '商户名称',
				index: 'merchantName'
			}, {
				name: '用户编号',
				index: 'payer'
			},{
				name: '清分日期',
				index: 'clearingDate'
			}, {
				name: '交易日期',
				index: 'gtmModified'
			}, {
				name: '交易金额',
				index: 'amount'
			}, {
				name: '币种',
				index: 'currencyType'
			}, {
				name: '通道成本',
				index: 'cost'
			}, {
				name: '商户成本',
				index: 'serviceCharge',
				width: 80
			}, {
				name: '结算金额',
				index: 'settleAmount',
				width: 80
			}, {
				name: '毛利润',
				index: 'profit',
				width: 80
			}, {
				name: '清分状态',
				index: 'clearingStatus',
				width: 80,
				format: function(v) {
					var d;
					if(!dataTypes['clearingCollectionStatus'].dataMap){
						dataTypes['clearingCollectionStatus'].dataMap = {};
						for(var i=0;i<dataTypes['clearingCollectionStatus'].length;i++){
							d = dataTypes['clearingCollectionStatus'][i];
							dataTypes['clearingCollectionStatus'].dataMap[d.innerValue] = d.label;
						}
					}
					return dataTypes['clearingCollectionStatus'].dataMap[v[this.index]];
				}
			}]
		});
		//bin_comm();
		init();
		//$("#startDate,#endDate").attr('title','双击清除').on("dblclick",function(){$(this).val('')})
		$('#tranDateStart,#tranDateEnd,#clearingDateStart,#clearingDateEnd').datetimepicker({
			format: 'yyyy-mm-dd',
			autoclose: true,
			todayHighlight: true,
			minView: 2
		});
	})

	function init() {
		var stypes = $("#sform").find('select[data-typename]');
		var ajaxArr = []
		for (var i = 0; i < stypes.length; i++) {
			+ function() {
				var s = $(stypes[i]);
				var typename = s.data('typename');
				ajaxArr.push($.get(apis.typeList, {
					type: s.data('typename')
				}, function(data) {
					if (data.code != 0) {
						return $.Deferred().reject(data.message || data.msg || "未知错误!")
					}
					if (data.data && data.data.dataArray) {
						var html = '',
							arr = data.data.dataArray,
							val;
						dataTypes[typename] = arr;
						for (var i = 0; i < arr.length; i++) {
							var item = arr[i];
							if('payChannel' == typename){
								val = item.label;
							}
							else{
								val = item.innerValue;
							}
							html += '<option value=' + val + '>' + item.label + '</option>'
						}
					}
					s.append(html);
				}))
			}()
		}
		$.when.apply($, ajaxArr).then(function() {
			T.load(); //加载列表数据;
		}).then(null, function(e) {
			D.err("初始化失败!")
		})
	}

	//绑定功能按钮
	/*function bin_comm(){
		//添加按钮；
		$('#export-btn').on('click',function(){
			var search = T.getSearch()
			if(typeof search !== "object"){
				search = tool.QueryString.parse(search);
			}
			delete search.pageNumber;
			delete search.PerPageItemsCount;
			window.open(apis.down + "?" + tool.QueryString.stringify(search))
		})
	}*/
});