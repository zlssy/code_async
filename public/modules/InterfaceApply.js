define(function(require, exports, module) {
	var Table = require('whygrid');
	var Box = window.Box = require('boxBootstrap');
	var tool = require("why");
	var D = window.D = require("dialog.ace");
	var rooturl = global_config.serverRootQF.replace(/\/+$/,'');
	var apis = {
			baselist : rooturl + '/operation/dict/queryInterfaceApplyIds',
			add : rooturl + '/dataDictionary/addOrUpdate',
			update : rooturl + '/dataDictionary/addOrUpdate',
			show : rooturl + '/dataDictionary/detail',
			dropdownlist : rooturl + '/dataDictionary/dropdownlist'
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
		var rows = this.dom.find('.panel-body>.row');
		rows.find('[data-comm]').removeClass('disabled')
		rows.first().find('[data-comm="goup"]').addClass('disabled')
		rows.last().find('[data-comm="godown"]').addClass('disabled')
		if(rows.length <= 1) rows.first().find('[data-comm="del"]').addClass('disabled')
	};
	Edit.getData = function(){
		// var dom = this.dom;
		// var obj = {
		// 	"id" : dom.find('input[name="id"]').val(),
		// 	"type" : dom.find('input[name="type"]').val(),
		// 	"typeLabel_en" : dom.find('input[name="typeLabel_en"]').val(),
		// 	"typeLabel_zh" : dom.find('input[name="typeLabel_zh"]').val()
		// }
		// // if(dom.find('input[name="id"]').val() !== ""){
		// // 	obj.id = dom.find('input[name="id"]').val()
		// // }
		// var dataArray = [],
		// 	rows = dom.find('.panel-body>.row');
		// for(var i=0; i<rows.length; i++){
		// 	var row = $(rows[i]);
		// 	dataArray.push({
		// 		"dataInfoId" : row.find('input[name="dataInfoId"]').val(),
		// 		"code" : row.find('input[name="code"]').val(),
		// 		"label_zh" : row.find('input[name="label_zh"]').val(),
		// 		"label_en" : row.find('input[name="label_en"]').val(),
		// 		"innerValue" : row.find('input[name="innerValue"]').val(),
		// 		"status" : row.find('[data-comm="onoff"]').hasClass('btn-danger') ? 2 : 1,
		// 		"displayOrder" : +i
		// 	})
		// }
		// obj.dataArray = JSON.stringify(dataArray);
		// return obj;
	}
	//保存
	Edit.save = function(){
		// var saveData = this.getData();
		// $.post(apis.update,saveData,null,'json').then(function(data){
		// 	if(data.code != 0){return $.Deferred().reject(data.message || data.msg || "未知错误!")}
		// 	D.suss("操作成功!");
		// 	T.load();
		// 	//Edit.Box && Edit.Box.remove();
		// 	Edit.Box && Edit.Box.dialog('close');
		// }).then(null,errfun)
	}

	var selectObj = {};
	selectObj.init = function(cb){
		var o = this;
		this.dom = {
			interfaceApplyId : $('#interfaceApplyId'),
			interfaceNum : $('#interfaceNum'),
			currencyType : $('#currencyType')
		}
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
		this.dom.fill_interfaceNum.on('change',function(){
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
		o.interfaceApplyId.html(html);
		o.fill_interfaceNum()
	}
	selectObj.fill_interfaceNum = function(){
		var o = this;
		var html = '',data=o.data,arr = [];
		for(var k = 0; k<data.length; k++){
			if(data[k].interfaceApplyId == this.dom.interfaceApplyId.val()){
				arr = data[k].interfaceList;
				o.select_interfaceList = data[k].interfaceList;
			}
		}
		for(var i=0; i<arr.length; i++){
			var item = arr[i];
			html += '<option value='+item.interfaceApplyId+'>'+item.interfaceApplyId+'</option>'
		}
		o.interfaceNum.html(html);
		o.fill_currencyType()
	}
	selectObj.fill_currencyType = function(){
		var o = this;
		var html = '',arr = o.select_interfaceList;
		for(var i=0; i<arr.length; i++){
			var item = arr[i];
			html += '<option value='+item.interfaceApplyId+'>'+item.interfaceApplyId+'</option>'
		}
		o.currencyType.html(html);
	}

	$(function(){
		selectObj.init(function(){
			Edit.init()
		})
	})
});