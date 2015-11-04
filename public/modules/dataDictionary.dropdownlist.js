define(function(require, exports, module) {
	var utils = require('utils'),
		content = $('#content'),
		listContainer = $('#grid_list_body'),
		firstRowTemplate = $('#first_row_template').html(),
		rowTemplate = $('#row_template').html(),
		userParam = {type:'clearingStatus'};
		var apis = {
			list : global_config.serverRoot + '/dataDictionary/dropdownlist',
			add : global_config.serverRoot + '/dataDictionary/addOrUpdate',
			update : global_config.serverRoot + '/dataDictionary/addOrUpdate',
			show : global_config.serverRoot + '/dataDictionary/detail',
			dropdownlist : global_config.serverRoot + '/dataDictionary/dropdownlist'
		}

	$(function(){
		loadData();
		$('#sform').on('submit',function(){
			var args = $(this).serializeArray();
			for(var i=0; i<args.length; i++){
				var arg = args[i]
				userParam[arg.name] = arg.value;
			}
			$('#grid').setGridParam({url: apis.list + '?' + utils.object2param(userParam)}).trigger("reloadGrid")
			return false;
		})
		//loadDataA();
	})

	function loadData() {
		var grid_selector = "#grid";
		var pager_selector = "#pager";

		$(window).on('resize.jqGrid', function() {
			$(grid_selector).jqGrid('setGridWidth', $(".page-content").width());
		});

		$(grid_selector).jqGrid({
			url: apis.list + '?' + utils.object2param(userParam), // 获取数据地址
			datatype: 'json', // 获取数据的响应格式
			mtype: 'get', // 上传数据的方式
			height: 411,  //高
			altRows: true, //交替表格
			forceFit: true,  //固定最大宽度  
			rowNum: 20,
			rowList: [10,20,50],
			pager: pager_selector,
			pagerpos: 'right',
			pginput:true,
			altRow: true,
			multiselect: true, //多行选择
			multiboxonly: true, //点击行选中
			prmNames: {page:"pageNo",rows:"pageSize",sort:"sort",order:"order"}, //翻页排序字段映射
			sortname: 'id', //默认排序字段名
			sortorder: "desc", //默认 倒序
			//viewrecords: true,  //
			jsonReader: {root: 'data.dataArray', page: 'data.pageNo', total: 'data.pageCnt'}, //数据结构映射
			colNames: ['字典类型编码', '状态','中文描述','英文描述', '操作'],
			colModel: [{
				name: 'code',
				index: 'code',
				//width: 60,
				autoencode: true,
				editable: false
			}, {
				name: 'dataDictionaryStatus',
				index: 'dataDictionaryStatus',
				//width: 60,
				autoencode: true,
				editable: false
			}, {
				name: 'label',
				index: 'label',
				//width: 60,
				autoencode: true,
				editable: false
			}, {
				name: 'label_en',
				index: 'label_en',
				//width: 60,
				autoencode: true,
				editable: false
			}, {
				name: 'comm',
				index: 'comm',
				fixed: true,
				width: 170,
				resizable: true,
				title: false,
				hidedlg: true, //不在对话框中出现
				editable: false,
				sortable: false
			// }, {
			// 	name: 'status',
			// 	index: 'status',
			// 	width: 80,
			// 	sortable: false,
			// 	editable: true,
			// 	edittype: "select",
			// 	editoptions: {
			// 		value: "1:待结算;2:结算中;3:已结算;4:已归档"
			// 	}
			}],
			//此事件发生在每个服务器请求后。xhr 为XMLHttpRequest对象。
			loadComplete: function() {
				var table = this;
				setTimeout(function() {
					styleCheckbox(table);

					updateActionIcons(table);
					updatePagerIcons(table);
					enableTooltips(table);
				}, 0);
			},
			//此事件发生在表格所有数据装入和进程完成后。与datatype参数及排序分页等无关。
			gridComplete: function(){
				var ids = $(grid_selector).jqGrid('getDataIDs');
				for(var i=0;i < ids.length;i++){
					var bts = ''
					var cl = ids[i];
					bts += '<a class="btn btn-xs btn-link">' + '添加' + '</a>'; 
					bts += '<a class="btn btn-xs btn-link">' + '修改' + '</a>'; 
					bts += '<a class="btn btn-xs btn-link">' + '删除' + '</a>'; 
					$(grid_selector).jqGrid('setRowData',ids[i],{comm:bts});
				}
			},
			loadError: function(){

			},
			serializeGridData: function(postData){
				console.log(postData)
				return postData;
			}
		});
	
		//批量操作?
		if(true){
			jQuery(grid_selector).jqGrid('navGrid', pager_selector,{
				position:"left",
				add:true,
				addtitle:"添加",
				addicon: 'ace-icon fa fa-plus-circle purple',
				del:true,
				deltitle:"删除",
				edit:true,
				edittitle:"编辑",
				refresh:true,
				refreshtitle:"刷新",
				refreshicon: 'ace-icon fa fa-refresh green',
				refreshstate:"current", //firstpage ：grid重新加载第一页数据. current ：保存当前页和当前选择
				search:false
			})
		// jQuery(grid_selector).jqGrid('navGrid', pager_selector, { //navbar options
		// 	edit: true,
		// 	editicon: 'ace-icon fa fa-pencil blue',
		// 	add: true,
		// 	addicon: 'ace-icon fa fa-plus-circle purple',
		// 	del: true,
		// 	delicon: 'ace-icon fa fa-trash-o red',
		// 	search: true,
		// 	searchicon: 'ace-icon fa fa-search orange',
		// 	refresh: true,
		// 	refreshicon: 'ace-icon fa fa-refresh green',
		// 	view: true,
		// 	viewicon: 'ace-icon fa fa-search-plus grey',
		// }, {
		// 	//edit record form
		// 	//closeAfterEdit: true,
		// 	//width: 700,
		// 	recreateForm: true,
		// 	beforeShowForm: function(e) {
		// 		var form = $(e[0]);
		// 		form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
		// 		style_edit_form(form);
		// 	}
		// }, {
		// 	//new record form
		// 	//width: 700,
		// 	closeAfterAdd: true,
		// 	recreateForm: true,
		// 	viewPagerButtons: false,
		// 	beforeShowForm: function(e) {
		// 		var form = $(e[0]);
		// 		form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar')
		// 			.wrapInner('<div class="widget-header" />')
		// 		style_edit_form(form);
		// 	}
		// }, {
		// 	//delete record form
		// 	recreateForm: true,
		// 	beforeShowForm: function(e) {
		// 		var form = $(e[0]);
		// 		if (form.data('styled')) return false;

		// 		form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
		// 		style_delete_form(form);

		// 		form.data('styled', true);
		// 	},
		// 	onClick: function(e) {
		// 		//alert(1);
		// 	}
		// }, {
		// 	//search form
		// 	recreateForm: true,
		// 	afterShowSearch: function(e) {
		// 		var form = $(e[0]);
		// 		form.closest('.ui-jqdialog').find('.ui-jqdialog-title').wrap('<div class="widget-header" />')
		// 		style_search_form(form);
		// 	},
		// 	afterRedraw: function() {
		// 		style_search_filters($(this));
		// 	},
		// 	multipleSearch: true,
		// 	/**
		// 	multipleGroup:true,
		// 	showQuery: true
		// 	*/
		// }, {
		// 	//view record form
		// 	recreateForm: true,
		// 	beforeShowForm: function(e) {
		// 		var form = $(e[0]);
		// 		form.closest('.ui-jqdialog').find('.ui-jqdialog-title').wrap('<div class="widget-header" />')
		// 	}
		// });
		}

		$(window).triggerHandler('resize.jqGrid');

		function beforeDeleteCallback(e) {
			var form = $(e[0]);
			if (form.data('styled')) return false;

			form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
			style_delete_form(form);

			form.data('styled', true);
		}

		function beforeEditCallback(e) {
			var form = $(e[0]);
			form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
			style_edit_form(form);
		}

		function aceSwitch(cellvalue, options, cell) {
			setTimeout(function() {
				$(cell).find('input[type=checkbox]')
					.addClass('ace ace-switch ace-switch-5')
					.after('<span class="lbl"></span>');
			}, 0);
		}
		//enable datepicker
		function pickDate(cellvalue, options, cell) {
			setTimeout(function() {
				$(cell).find('input[type=text]')
					.datetimepicker({
						use24hours: true,
						pickDate: true,
						picTime: true
					});
			}, 0);
		}

		function style_edit_form(form) {
			//enable datepicker on "sdate" field and switches for "stock" field
			form.find('input[name=clearingDate]').datetimepicker({
				use24hours: true,
				pickDate: true,
				picTime: true
			})

			form.find('input[name=stock]').addClass('ace ace-switch ace-switch-5').after('<span class="lbl"></span>');
			//don't wrap inside a label element, the checkbox value won't be submitted (POST'ed)
			//.addClass('ace ace-switch ace-switch-5').wrap('<label class="inline" />').after('<span class="lbl"></span>');


			//update buttons classes
			var buttons = form.next().find('.EditButton .fm-button');
			buttons.addClass('btn btn-sm').find('[class*="-icon"]').hide(); //ui-icon, s-icon
			buttons.eq(0).addClass('btn-primary').prepend('<i class="ace-icon fa fa-check"></i>');
			buttons.eq(1).prepend('<i class="ace-icon fa fa-times"></i>')

			buttons = form.next().find('.navButton a');
			buttons.find('.ui-icon').hide();
			buttons.eq(0).append('<i class="ace-icon fa fa-chevron-left"></i>');
			buttons.eq(1).append('<i class="ace-icon fa fa-chevron-right"></i>');
		}

		function style_delete_form(form) {
			var buttons = form.next().find('.EditButton .fm-button');
			buttons.addClass('btn btn-sm btn-white btn-round').find('[class*="-icon"]').hide(); //ui-icon, s-icon
			buttons.eq(0).addClass('btn-danger').prepend('<i class="ace-icon fa fa-trash-o"></i>');
			buttons.eq(1).addClass('btn-default').prepend('<i class="ace-icon fa fa-times"></i>')
		}

		function style_search_filters(form) {
			form.find('.delete-rule').val('X');
			form.find('.add-rule').addClass('btn btn-xs btn-primary');
			form.find('.add-group').addClass('btn btn-xs btn-success');
			form.find('.delete-group').addClass('btn btn-xs btn-danger');
		}

		function style_search_form(form) {
			var dialog = form.closest('.ui-jqdialog');
			var buttons = dialog.find('.EditTable')
			buttons.find('.EditButton a[id*="_reset"]').addClass('btn btn-sm btn-info').find('.ui-icon').attr('class', 'ace-icon fa fa-retweet');
			buttons.find('.EditButton a[id*="_query"]').addClass('btn btn-sm btn-inverse').find('.ui-icon').attr('class', 'ace-icon fa fa-comment-o');
			buttons.find('.EditButton a[id*="_search"]').addClass('btn btn-sm btn-purple').find('.ui-icon').attr('class', 'ace-icon fa fa-search');
		}





		function styleCheckbox(table) {}

		function updateActionIcons(table) {}

		function updatePagerIcons(table) {
			var replacement = {
				'ui-icon-seek-first': 'ace-icon fa fa-angle-double-left bigger-140',
				'ui-icon-seek-prev': 'ace-icon fa fa-angle-left bigger-140',
				'ui-icon-seek-next': 'ace-icon fa fa-angle-right bigger-140',
				'ui-icon-seek-end': 'ace-icon fa fa-angle-double-right bigger-140'
			};
			$('.ui-pg-table:not(.navtable) > tbody > tr > .ui-pg-button > .ui-icon').each(function() {
				var icon = $(this);
				var $class = $.trim(icon.attr('class').replace('ui-icon', ''));

				if ($class in replacement) icon.attr('class', 'ui-icon ' + replacement[$class]);
			})
		}

		function enableTooltips(table) {
			$('.navtable .ui-pg-button').tooltip({
				container: 'body'
			});
			$(table).find('.ui-pg-div').tooltip({
				container: 'body'
			});
		}

		registerEvents();
	}

	function loadDataA() {
		$.get(apis.list,userParam,function(json) {
				if ('0' == json.code) {
					var html = utils.formatJson(rowTemplate, {
						data: json.data.pageData
					});
					listContainer.append(firstRowTemplate).append(html);
					registerEvents();
				}
			}
		);
	}

	function registerEvents() {
		var evtListener = function(e) {
			var $el = $(e.target || e.srcElement),
				cls = $el.attr('class'),
				tag = $el.get(0).tagName.toLowerCase();
			if (cls && cls.indexOf('fa-calendar') > -1) {
				$el.parent().siblings().focus();
			}
		};

		$(document.body).on('click', evtListener);
		$('.datepicker').datepicker({
			autoclose: true,
			todayHighlight: true
		});
	}

});