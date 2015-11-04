define(function(require, exports, module) {
	var Table = require('whygrid');
	var tool = require("why");
	var D = window.D = require("dialog.ace");
	var rooturl = global_config.serverRoot.replace(/\/+$/,'');
	var apis = {
			list : rooturl + '/queryTradeRecord',
			typeList: rooturl + '/dataDictionary/dropdownlist',
			down : rooturl + '/downloadTradeRecord'
		}
	var T;
	var errfun = function(e){
		var msg = typeof e == 'object' ? e.statusText || e.msg || "未知错误!" : e;
		D.err(msg);
	}
	var dataTypes = {}

	$(function(){
		T = Table('#grid_list',apis.list,{
			checkRow: false,
			seachForm: '#sform',
			oldApi: true, //是否是老接口
			pagenav:true,
			cols: [{
					name: '商户订单编号',index: 'merchantOrderId'
				},{
					name: '交易流水号',index: 'payOrderId'
				},{
				// 	name: '支付工具',index: 'payTool',width: 80, typename:'payChannel'
				// },{
					name: '订单日期',index: 'orderTime'
				},{
					name: '产品代码',index: 'productID'
				},{
					name: '产品名称',index: 'productName'
				},{
					name: '商户编号',index: 'merchantID'
				},{
					name: '商户名称',index: 'merchantName'
				},{
					name: '货币种类',index: 'currency',width:80
				},{
					name: '订单金额',index: 'orderAmount',width:80
				},{
					name: '订单状态',index: 'orderStatus',width:80
				}
			],
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
			getBaseSearch: function(){//默认查询条件
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
			}
		});
		bin_comm();
		init();
		$("#startDate,#endDate").attr('title','双击清除').on("dblclick",function(){$(this).val('')})
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
	function bin_comm(){
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
	}
});