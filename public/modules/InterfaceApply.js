define(function(require, exports, module) {
	var Table = require('whygrid');
	var Box = window.Box = require('boxBootstrap');
	var tool = require("why");
	var D = window.D = require("dialog.ace");
	var rooturl = global_config.serverRoot.replace(/\/+$/,'');
	var apis = {
			baselist : rooturl + '/dict/queryInterfaceApplyIds',
			add : rooturl + '/config/configChannelArgs'
		}
	var T;
	var errfun = function(e){
		var msg = typeof e == 'object' ? (e.message || e.msg || e.statusText || "未知错误!") : e;
		D.err(msg);
	}


	//数据字典 添加/修改 模块;
	var Edit = window.Edit = {}
	Edit.init = function(){
		this.dom = $('#addtable').find('tbody');
		this.addItem();
		this.events();
	}
	Edit.reset = function(){
		this.dom.html('');
		this.addItem();
	}
	Edit.addItem = function(){
		this.dom.append($('#itemTpl').html());
		this.fix()
	}
	Edit.events = function(){
		var o = this;
		this.dom.on('click','[data-comm]',function(){
			var but = $(this);
			var comm = but.data("comm");
			if(but.hasClass('disabled')) return;
			if(comm == 'add'){
				o.addItem();
			}else if(comm == "del"){
				but.closest("tr").remove();
				o.fix()
			}
		})
	}
	//添加
	Edit.showadd = function(){
		this.showDom();
		this.addItem();
	};
	//修改
	Edit.showedit = function(id){
		var o = this;
		$.get(apis.show,{id:id},null,'json').then(function(data){
			if(data.code != 0){return $.Deferred().reject(data.message || data.msg || "未知错误!")}
			o.showDom(data.data)
		}).then(null,errfun)
	}
	Edit.fix = function(){
		var rows = this.dom.find('tr');
		rows.find('[data-comm]').removeClass('disabled')
		if(rows.length <= 1) rows.first().find('[data-comm="del"]').addClass('disabled')
	};
	Edit.getData = function(){
		var dom = this.dom;
		
		var obj = {
			interfaceNum : $("#interfaceNum").val(),
			currencyType : $("#currencyType").val()
		}
		
		// var dataArray = [],
		var dataArray = {},
			rows = dom.find('tr');
		for(var i=0; i<rows.length; i++){
			var row = $(rows[i]);
			// dataArray.push({
			// 	"key" : row.find('input[name="key"]').val(),
			// 	"value" : row.find('input[name="value"]').val()
			// })
			dataArray[row.find('input[name="key"]').val()] = row.find('input[name="value"]').val();
		}
		obj.tradeInfo = JSON.stringify(dataArray);
		// return obj;
	}
	//保存
	Edit.save = function(){
		var saveData = this.getData();
		$.post(apis.add,saveData,null,'json').then(function(data){
			if(data.code != 0){return $.Deferred().reject(data.message || data.msg || "未知错误!")}
			D.suss("操作成功!");
		}).then(null,errfun)
	}

	var selectObj = {};
	selectObj.init = function(cb){
		var o = this;
		this.dom = {
			interfaceApplyId : $('#interfaceApplyId'),
			interfaceNum : $('#interfaceNum'),
			currencyType : $('#currencyType')
		}
		// var data = {"code":"0","msg":"success","interfaceApplyIdsList":[{"interfaceApplyNum":"aaaaaaaaaaaaaaa","interfaceApplyId":"aaaaaaaaaaaaaa","interfaceList":[{"interfaceName":"jk1","interfaceNum":"接口1""currencyType":"1,2,3,4,5",},{"interfaceName":"jk2","interfaceNum":"接口2""currencyType":"1",},{"interfaceName":"jk3","interfaceNum":"接口3""currencyType":"1,2,3,4",},{"interfaceName":"jk4","interfaceNum":"接口4""currencyType":"1,5",}]},{"interfaceApplyNum":"bbbbbbbbbbbbbbbbb","interfaceApplyId":"bbbbbbbbbbbbb","interfaceList":[{"interfaceName":"jk1","interfaceNum":"接口1""currencyType":"1,2,3,4,5",},{"interfaceName":"jk2","interfaceNum":"接口2""currencyType":"1",}]},{"interfaceApplyNum":"cccccccccccccccccc","interfaceApplyId":"ccccccccccccc","interfaceList":[{"interfaceName":"jk1","interfaceNum":"接口1""currencyType":"1,2,3,4,5",},{"interfaceName":"jk2","interfaceNum":"接口2""currencyType":"1",},{"interfaceName":"jk3","interfaceNum":"接口3""currencyType":"1,2,3,4",},{"interfaceName":"jk4","interfaceNum":"接口4""currencyType":"1,5",}]},{"interfaceApplyNum":"dddddddddddddddd","interfaceApplyId":"ddddddddddddd","interfaceList":[{"interfaceName":"jk1","interfaceNum":"接口1""currencyType":"1,2,3,4,5",}]}]}
		// selectObj.data = data.interfaceApplyIdsList;
		// o.fill_interfaceApplyId();
		// o.events();
		// typeof cb == 'function' && cb();


		$.get(apis.baselist,null,null,'json').then(function(data){
			selectObj.data = data.interfaceApplyIdsList;
			o.fill_interfaceApplyId();
			o.events();
			typeof cb == 'function' && cb();
		}).then(null,function(e){
			D.err("初始化失败!")
		})
	}
	selectObj.events = function(){
		var o = this;
		this.dom.interfaceApplyId.on('change',function(){
			o.fill_interfaceNum();
		})
		this.dom.interfaceNum.on('change',function(){
			o.fill_currencyType();
		})
	}
	selectObj.fill_interfaceApplyId = function(){
		var o = this;
		var html = '',arr = selectObj.data;
		for(var i=0; i<arr.length; i++){
			var item = arr[i];
			html += '<option value='+item.interfaceApplyId+'>'+item.interfaceApplyId+'</option>'
		}
		o.dom.interfaceApplyId.html(html);
		o.fill_interfaceNum()
	}
	selectObj.fill_interfaceNum = function(){
		var o = this;
		var html = '',data=o.data,arr = [];
		for(var k = 0; k<data.length; k++){
			if(data[k].interfaceApplyId == this.dom.interfaceApplyId.val()){
				arr = data[k].interfaceList;
				o.select_interfaceList = data[k].interfaceList;
				break;
			}
		}
		for(var i=0; i<arr.length; i++){
			var item = arr[i];
			html += '<option value='+item.interfaceNum+'>'+item.interfaceName+'</option>'
		}
		o.dom.interfaceNum.html(html);
		o.fill_currencyType()
	}
	selectObj.fill_currencyType = function(){
		var o = this;
		var html = '',data=o.select_interfaceList,arr = [];
		for(var k = 0; k<data.length; k++){
			if(data[k].interfaceNum == this.dom.interfaceNum.val()){
				arr = data[k].currencyType.split(',');
				break;
			}
		}
		for(var i=0; i<arr.length; i++){
			var item = arr[i];
			html += '<option value='+item+'>'+item+'</option>'
		}
		o.dom.currencyType.html(html);
	}

	$(function(){
		selectObj.init(function(){
			Edit.init()
		})
	})
});