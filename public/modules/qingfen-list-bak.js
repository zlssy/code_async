define(function(require, exports, module) {
	var mybase,
		utils = require('utils'),
		content = $('#content'),
		userParam = {};

	function init(base, el) {
		mybase = base;
		var req = ['/css/jquery-ui.min.css', '/css/jquery-ui.custom.min.css', '/css/datepicker.min.css', '/css/bootstrap-datetimepicker.min.css', '/css/ui.jqgrid.css',
			'/js/jquery-ui.custom.min.js', '/js/bootstrap-datepicker.min.js', '/js/jquery.jqGrid.min.js', '/js/grid.locale-en.js'
		];
		mybase.load(req, function() {
			renderBaseStruct();
			loadData();
			mybase.load('/js/moment.min.js', function() {
				mybase.load('/js/bootstrap-datetimepicker.min.js');
			});
		});
	}

	function renderBaseStruct() {
		var html = [];
		html.push('<div class="page-content">');
		html.push('<div class="row">');
		html.push('<div class="col-xs-12">');
		html.push('<div class="widget-box">');
		html.push(' <div class="widget-header">');
		html.push('  <h4 class="widget-title">搜索：</h4>');
		html.push('  <div class="widget-toolbar">');
		html.push('   <a href="#" data-action="collapse"><i class="ace-icon fa fa-chevron-up"></i></a>');
		html.push('  </div>'); // end tool bar
		html.push(' </div>'); // end header
		html.push(' <div class="widget-body">');
		html.push('  <div class="col-xs-12 col-sm-4">');
		html.push('    <div class="row">');
		html.push('     <label class="col-sm-3 no-padding">清分日期</label>');
		html.push('     <div class="col-sm-9">');
		html.push('      <div class="col-sm-6 no-padding"><div class="input-group"><input type="text" class="input-sm form-control datepicker" name="qfstart" placeholder="from" data-date-format="dd/mm/yyyy" /><span class="input-group-addon"><i class="fa fa-calendar bigger-110"></i></span></div></div>');
		html.push('      <div class="col-sm-6 no-padding"><div class="input-group"><input type="text" class="input-sm form-control datepicker" name="qfend" placeholder="to" data-date-format="dd/mm/yyyy" /><span class="input-group-addon"><i class="fa fa-calendar bigger-110"></i></span></div></div>');
		html.push('     </div>');
		html.push('    </div>');
		html.push('  </div>'); // end col-sm-4
		html.push('  <div class="col-xs-12 col-sm-4">');
		html.push('    <div class="row">');
		html.push('     <label class="col-sm-3 no-padding">交易日期</label>');
		html.push('     <div class="col-sm-9">');
		html.push('      <div class="col-sm-6 no-padding"><div class="input-group"><input type="text" class="input-sm form-control datepicker" name="jystart" placeholder="from" data-date-format="dd/mm/yyyy" /><span class="input-group-addon"><i class="fa fa-calendar bigger-110"></i></span></div></div>');
		html.push('      <div class="col-sm-6 no-padding"><div class="input-group"><input type="text" class="input-sm form-control datepicker" name="jyend" placeholder="to" data-date-format="dd/mm/yyyy" /><span class="input-group-addon"><i class="fa fa-calendar bigger-110"></i></span></div></div>');
		html.push('     </div>');
		html.push('    </div>');
		html.push('  </div>');
		html.push('  <div class="col-xs-12 col-sm-4">');
		html.push('  </div>');
		html.push(' </div>'); // end widget body
		html.push('</div>'); // end widget box
		html.push('</div>'); // end col
		html.push('</div>'); // end the search row

		html.push('<div class="row">');
		html.push('<div class="col-xs-12">');
		html.push('<table id="grid"></table><div id="pager"></div>');
		html.push('</div></div></div>');
		content.html(html.join(''));
		html = [];
	}

	function loadData() {
		var grid_selector = "#grid";
		var pager_selector = "#pager";

		$(window).on('resize.jqGrid', function() {
			$(grid_selector).jqGrid('setGridWidth', $(".page-content").width());
		});

		$(grid_selector).jqGrid({
			url: mybase.serverRoot + 'clearing/list?userId=' + utils.object2param(userParam), // 获取数据地址
			datatype: 'json', // 获取数据的响应格式
			mtype: 'post', // 上传数据的方式
			editurl: mybase.serverRoot + 'clearing/edit', // 添加or编辑数据的地址
			// data: grid_data,
			// datatype: 'local',
			height: 400,
			colNames: ['商户ID', '流水号', '清算日期', '交易金额', '交易笔数', '退还金额', '退换笔数', '成本', '服务费', '清算量', '收益', '状态'],
			colModel: [{
				name: 'merchantId',
				index: 'merchantId',
				width: 60,
				editable: true
			}, {
				name: 'accountNumber',
				index: 'accountNumber',
				width: 60,
				editable: true
			}, {
				name: 'clearingDate',
				index: 'clearingDate',
				width: 90,
				editable: true,
				sorttype: "date",
				unformat: pickDate
			}, {
				name: 'tradeAmount',
				index: 'tradeAmount',
				width: 60,
				sort: 'int',
				editable: true
			}, {
				name: 'tradeTrans',
				index: 'tradeTrans',
				width: 60,
				sort: 'int',
				editable: true
			}, {
				name: 'refundAmount',
				index: 'refundAmount',
				width: 60,
				sort: 'int',
				editable: true
			}, {
				name: 'refundTrans',
				index: 'refundTrans',
				width: 60,
				sort: 'int',
				editable: true
			}, {
				name: 'cost',
				index: 'cost',
				width: 60,
				sort: 'int',
				editable: true
			}, {
				name: 'serviceCharge',
				index: 'serviceCharge',
				width: 60,
				sort: 'int',
				editable: true
			}, {
				name: 'settleAmount',
				index: 'settleAmount',
				width: 60,
				sort: 'int',
				editable: true
			}, {
				name: 'profit',
				index: 'profit',
				width: 60,
				sort: 'int',
				editable: true
			}, {
				name: 'status',
				index: 'status',
				width: 90,
				editable: true,
				edittype: "select",
				editoptions: {
					value: "1:待结算;2:结算中;3:已结算;4:已归档"
				}
			}],
			viewrecords: true,
			rowNum: 20,
			rowList: [20, 30, 40],
			pager: pager_selector,
			altRow: true,
			multiselect: true,
			multiboxonly: true,
			loadComplete: function() {
				var table = this;
				setTimeout(function() {
					styleCheckbox(table);

					updateActionIcons(table);
					updatePagerIcons(table);
					enableTooltips(table);
				}, 0);
				mybase.gc();
			},
			jsonReader: {
				root: 'data.pageData',
				page: 'data.pageNo',
				total: 'data.pageCnt'
			}
		});

		jQuery(grid_selector).jqGrid('navGrid', pager_selector, { //navbar options
			edit: false,
			editicon: 'ace-icon fa fa-pencil blue',
			add: false,
			addicon: 'ace-icon fa fa-plus-circle purple',
			del: false,
			delicon: 'ace-icon fa fa-trash-o red',
			search: false,
			searchicon: 'ace-icon fa fa-search orange',
			refresh: true,
			refreshicon: 'ace-icon fa fa-refresh green',
			view: true,
			viewicon: 'ace-icon fa fa-search-plus grey',
		}, {
			//edit record form
			//closeAfterEdit: true,
			//width: 700,
			recreateForm: true,
			beforeShowForm: function(e) {
				var form = $(e[0]);
				form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
				style_edit_form(form);
			}
		}, {
			//new record form
			//width: 700,
			closeAfterAdd: true,
			recreateForm: true,
			viewPagerButtons: false,
			beforeShowForm: function(e) {
				var form = $(e[0]);
				form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar')
					.wrapInner('<div class="widget-header" />')
				style_edit_form(form);
			}
		}, {
			//delete record form
			recreateForm: true,
			beforeShowForm: function(e) {
				var form = $(e[0]);
				if (form.data('styled')) return false;

				form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
				style_delete_form(form);

				form.data('styled', true);
			},
			onClick: function(e) {
				//alert(1);
			}
		}, {
			//search form
			recreateForm: true,
			afterShowSearch: function(e) {
				var form = $(e[0]);
				form.closest('.ui-jqdialog').find('.ui-jqdialog-title').wrap('<div class="widget-header" />')
				style_search_form(form);
			},
			afterRedraw: function() {
				style_search_filters($(this));
			},
			multipleSearch: true,
			/**
			multipleGroup:true,
			showQuery: true
			*/
		}, {
			//view record form
			recreateForm: true,
			beforeShowForm: function(e) {
				var form = $(e[0]);
				form.closest('.ui-jqdialog').find('.ui-jqdialog-title').wrap('<div class="widget-header" />')
			}
		});

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

	return {
		init: init
	};
});