define(function(require, exports, module) {
	var Table = require('whygrid');
	var tool = require("why");
	var D = window.D = require("dialog.ace");
	var rooturl = global_config.serverRoot.replace(/\/+$/,'');
	var apis = {
			list : rooturl + '/queryTradeRecord',//clearingDetail/list
			typeList: rooturl + '/dataDictionary/dropdownlist',
			down : rooturl + '/downloadTradeRecord'
		}
	var T;
	var errfun = function(e){
		var msg = typeof e == 'object' ? e.statusText || e.msg || "未知错误!" : e;
		D.err(msg);
	}
	var dataTypes = {};
	var dictionaryCollection = {'clearingStatus':{'1':'未清分','2':'已进行周期清分','3':'已汇总'}};

	$(function(){
		T = Table('#grid_list',apis.list,{
			checkRow: false,
			seachForm: '#sform',
			oldApi: true, //是否是老接口
			pagenav:true,
			cols: [{
					name: '商户名称',index: 'merchantName'
				},{
					name: '用户编号',index: 'payer'
				},{
					name: '交易日期',index: 'gtm_modified'
				},{
					name: '交易金额',index: 'amount'
				},{
					name: '币种',index: 'currencyType'
				},{
					name: '通道成本',index: 'cost'
				},{
					name: '商户成本',index: 'serviceCharge',width:80
				},{
					name: '结算金额',index: 'settleAmount',width:80
				},{
					name: '毛利润',index: 'profit',width:80
				},{
					name: '清分状态',index: 'clearingStatus',width:80,
					format: function(v){
				         return dictionaryCollection['clearingStatus'][v];
				    }
				}
			]
			// funFixtd: function(x,y,col,data){
			// 	// if(col.typename){
			// 	// 	var arr = dataTypes[col.typename]
			// 	// 	if(arr){
			// 	// 		for(var i=0; i<arr.length; i++){
			// 	// 			//if(arr[i].)
			// 	// 		}
			// 	// 	}
			// 	// }
			// },
			/*getBaseSearch: function(){//默认查询条件
				var s = tool.QueryString.parse(location.hash.replace(/^\#/g,''));
				if(typeof s.startDate  == 'undefined' && typeof s.endDate == "undefined"){
					s.startDate = tool.dateFormat(new Date(new Date() - (1000*60*60*24*30)),"yyyy-MM-dd")
					s.endDate = tool.dateFormat(new Date(),"yyyy-MM-dd");
					if($("#startDate").val() == "" && $("#endDate").val() == ""){
						$("#startDate").val(s.startDate);
						$("#endDate").val(s.endDate);
					}
				}
				return s;
			}*/
		});
		//bin_comm();
		init();
		//$("#startDate,#endDate").attr('title','双击清除').on("dblclick",function(){$(this).val('')})
		$('#startDate,#endDate').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            todayHighlight: true,
            minView:2
		});
	})

	function init(){
		var stypes = $("#sform").find('select[data-typename]');
		var ajaxArr = []
		for(var i=0; i<stypes.length; i++){
			+function(){
				var s = $(stypes[i]);
				var typename = s.data('typename');
				ajaxArr.push($.get(apis.typeList,{type:s.data('typename')},function(data){
					if(data.code != 0){return $.Deferred().reject(data.message || data.msg || "未知错误!")}
					if(data.data && data.data.dataArray){
						var html = '',arr = data.data.dataArray;
						dataTypes[typename] = arr;
						for(var i=0; i<arr.length; i++){
							var item = arr[i];
							html += '<option value='+item.code+'>'+item.code+'</option>'
						}
					}
					s.append(html);
				}))
			}()
		}
		$.when.apply($,ajaxArr).then(function(){
			T.load(); //加载列表数据;
		}).then(null,function(e){
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