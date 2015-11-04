define(function(require, exports, module) {
	var Table = require('whygrid');
	var Box = window.Box = require('boxBootstrap');
	var tool = require("why");
	var D = window.D = require("dialog.ace");
	var rooturl = global_config.serverRoot.replace(/\/+$/,'');
	var apis = {
			list : rooturl + '/dataDictionary/list',
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
	$(function(){
		T = Table('#grid_list',apis.list,{
			checkRow: false,
			seachForm: '#sform',
			pagenav:true,
			cols: [{
					name: '字典类型编码',
					index: 'type',
					sortable: true,
					width: "30%"
				}, {
					name: '字典类型名称',
					index: 'label'
				}, {
					name: '操作',
					index: 'comm',
					width: 150
				}
			],
			funFixtd: function(x,y,col,data){
				if(col.index == 'comm'){
					var html = '';
					html += '<a data-comm="edit" class="btn btn-xs btn-link">' + '查看/修改' + '</a>'; 
					//html += '<a data-comm="edit" class="btn btn-xs btn-link">' + '' + '</a>'; 
					//html += '<a data-comm="del" class="btn btn-xs btn-link">' + '删除' + '</a>'; 
					return html;
				}
			}
		});
		bin_comm();
		T.load();
		//菜单自动定位
		//tool.autonav('#sidebar ul.submenu>li','active').parents('ul.submenu').parent().addClass('active open');
	})

	//数据操作
    function datacomm(comm,ids,data){
        var comms = {
            'show':{api:apis.show}
            //,'del':{api:apis.del}
        }
        var obj = comms[comm];
        if(obj){
            var ids_data = {'ids':ids};
            $.post(obj.api,$.extend({},ids_data,obj.data,data),null,'json').then(function(data){
            	if(data.code != 0){return $.Deferred().reject(data.message || data.msg || "未知错误!")}
                D.suss('操作成功!')
                T.load();
            }).then(null,errfun)
        }else D.err('未知操作!')
    }

	//绑定功能按钮
	function bin_comm(){
		//添加按钮；
		$('#but_add').on('click',function(){
			Edit.showadd();
		})

		T.main.on('click','a[data-comm]',function(){
			var o = $(this)
				,comm = o.data('comm')
			var id = o.parents('tr').data('key');
			if(comm == 'edit'){
                Edit.showedit(id)
            }else{
                datacomm(comm,id)
            }

		})
	}


	//数据字典 添加/修改 模块;
	var Edit = window.Edit = {}
	Edit.showDom = function(data){
		var o = this;
		var opt = {};
		var dom = opt.message = $($('#addEditTpl').html());
		// opt.message.find('#title b').html(data ? '修改数据字典' : '新增数据字典');
		// opt.buttons = {
		// 	"save": {
		// 		label: '<i class="ace-icon fa fa-check"></i> 保存',
		// 		className: 'btn-sm btn-success',
		// 		callback: function() {o.save(); return false;}
		// 	},
		// 	"cancel": {
		// 		label: '取消',
		// 		className: 'btn-sm'
		// 	}
		// };
		// this.Box = Box.dialog(opt);
		
		this.Box = D.dialog(dom,{
			title: data ? '修改数据字典' : '新增数据字典',
			buttons:[{
					text : "确定", 
					'class' : 'btn btn-minier btn-success',
					click : function(){
						o.save();
					}
				},{
					text : "取消", 
                    'class' : 'btn btn-minier',
                    click : function(){
						$(this).dialog('close')
                    }
				}
			],
            modal:true,
            width:700
		})

		
		data && o.fillDom(dom,data);
		this.dom = dom;
		this.events();
		this.fix();
	};
	//增加数据项
	Edit.addItem = function(){
		this.dom.find(".panel-body").append($('#itemTpl').html());
		this.fix()
	}
	Edit.events = function(){
		var o = this;
		this.dom
		.on('click','a.addItem',function(){
			o.addItem();
		})
		.on('click','[data-comm]',function(){
			var but = $(this);
			var comm = but.data("comm");
			if(but.hasClass('disabled')) return;
			if(comm == 'onoff'){
				but.attr('class', !but.hasClass('btn-danger') ? 'btn btn-danger' : 'btn btn-default') 
			}else if(comm == "goup"){
				var row = but.closest(".row");
				row.prev(".row").before(row);
			}else if(comm == "godown"){
				var row = but.closest(".row");
				row.next(".row").after(row);
			}else if(comm == "del"){
				but.closest(".row").remove();
			}
			o.fix()
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
	Edit.fillDom = function(dom,data){
		dom.find('input[name="id"]').val(data.id)
		dom.find('input[name="type"]').val(data.type)
		dom.find('input[name="typeLabel_zh"]').val(data.typeLabel_zh)
		dom.find('input[name="typeLabel_en"]').val(data.typeLabel_en)
		if(data.dataArray && data.dataArray.length>0){
			var dataArray = data.dataArray
			//dom.find(".panel-body").html('')
			for(var i = 0; i<dataArray.length; i++){
				var _dom = $($('#itemTpl').html()),
					item = dataArray[i];
				_dom.find('input[name="dataInfoId"]').val(item.dataInfoId);
				_dom.find('input[name="code"]').val(item.code);
				_dom.find('input[name="label_zh"]').val(item.label_zh);
				_dom.find('input[name="label_en"]').val(item.label_en);
				_dom.find('input[name="innerValue"]').val(item.innerValue);
				_dom.find('[data-comm=onoff]').attr('class',item.status !== 1 ? 'btn btn-danger' : 'btn btn-default')
				dom.find(".panel-body").append(_dom)
			}
		}
	}
	Edit.getData = function(){
		var dom = this.dom;
		var obj = {
			"id" : dom.find('input[name="id"]').val(),
			"type" : dom.find('input[name="type"]').val(),
			"typeLabel_en" : dom.find('input[name="typeLabel_en"]').val(),
			"typeLabel_zh" : dom.find('input[name="typeLabel_zh"]').val()
		}
		// if(dom.find('input[name="id"]').val() !== ""){
		// 	obj.id = dom.find('input[name="id"]').val()
		// }
		var dataArray = [],
			rows = dom.find('.panel-body>.row');
		for(var i=0; i<rows.length; i++){
			var row = $(rows[i]);
			dataArray.push({
				"dataInfoId" : row.find('input[name="dataInfoId"]').val(),
				"code" : row.find('input[name="code"]').val(),
				"label_zh" : row.find('input[name="label_zh"]').val(),
				"label_en" : row.find('input[name="label_en"]').val(),
				"innerValue" : row.find('input[name="innerValue"]').val(),
				"status" : row.find('[data-comm="onoff"]').hasClass('btn-danger') ? 2 : 1,
				"displayOrder" : +i
			})
		}
		obj.dataArray = JSON.stringify(dataArray);
		return obj;
	}
	Edit.fix = function(){
		var rows = this.dom.find('.panel-body>.row');
		rows.find('[data-comm]').removeClass('disabled')
		rows.first().find('[data-comm="goup"]').addClass('disabled')
		rows.last().find('[data-comm="godown"]').addClass('disabled')
		if(rows.length <= 1) rows.first().find('[data-comm="del"]').addClass('disabled')
	}
	//保存
	Edit.save = function(){
		var saveData = this.getData();
		$.post(apis.update,saveData,null,'json').then(function(data){
			if(data.code != 0){return $.Deferred().reject(data.message || data.msg || "未知错误!")}
			D.suss("操作成功!");
			T.load();
			//Edit.Box && Edit.Box.remove();
			Edit.Box && Edit.Box.dialog('close');
		}).then(null,errfun)
	}

});















