define(function(require, exports, module) {
	var Utils = require('utils'),
		Grid = require('gridBootstrap'),
		Xss = require('xss'),
		accountCheck = require('checkAccount'),
		Box = require('boxBootstrap'),
		art_dialog = require('dialog'),

		content = $('#content'),
		listContainer = $('#grid_list'),
		userParam = {},
		dictionaryCollection = {},
		$uploadFile = $('#uploadFile'),
		delTpl = $('#delTpl').html(),
		doms = {
			effectiveDateStart: $('input[name="effectiveDateStart"]'),
			effectiveDateEnd: $('input[name="effectiveDateEnd"]'),
			expirationDateStart: $('input[name="expirationDateStart"]'),
			expirationDateEnd: $('input[name="expirationDateEnd"]'),
			creationDateStart: $('input[name="creationDateStart"]'),
			creationDateEnd: $('input[name="creationDateEnd"]'),
			chargeServiceTypeInt: $('#chargeServiceTypeInt'),
			chargeStatusInt: $('#chargeStatusInt'),
			chargeSystemPropertyInt: $('#chargeSystemPropertyInt'),
			chargeTypeInt: $('#chargeTypeInt'),
			ownerIds: $('#ownerIds'),
			ids: $('#ids')
		},

		_grid;

	function init() {
		loadData();
	}

	function loadData() {
		_grid = Grid.create({
			key: 'id', //记得这里要换成现在接口的参数
			checkbox: false,
			ajaxCompleteKey: 'response',
			pageName: 'index',
			cols: [{
				name: '编号',
				index: 'id'
			}, {
				name: '文件名',
				index: 'name'
			}, {
				name: '版本',
				index: 'type',
				format: function(v) {
					return '[' + (0 == v ? '中文': '英文')+ ']';
				}
			}, {
				name: '上传日期',
				index: '2015-11-03'
			}, {
				name: '地址',
				index: 'url'
			}, {
				name: '操作',
				format: function() {
					return '<div class="ui-pg-div align-center"><span class="ui-icon ace-icon fa fa-trash-o blue" title="删除"></span></div>';
				}
			}],
			url: getUrl(),
			pagesize: 10,
			jsonReader: {
				root: 'docList',
				page: 'index',
				records: 'total'
			}
		});
		listContainer.html(_grid.getHtml());
		_grid.load();
		_grid.listen('delCallback', function(row) {
			delFile(row);
		});
		registerEvents();
	}

	function showDialog(opt) {
		Box.dialog(opt);
	}

	function delFile(data) {
		var opt = {};
		opt.message = '<h4><b>您确定要删除此文件吗？</b></h4><hr class="no-margin">' + delTpl;
		opt.buttons = {
			"save": {
				label: '确定',
				className: 'btn-sm btn-success',
				callback: function() {
					var id = data[0] && data[0].id || 0;
					if (id) {
						$.ajax({
							url: global_config.serverRoot + 'deleteFile',
							method: 'post',
							data: {
								id: id
							},
							success: function(json) {
								if ('0' == json.response) {
									_grid.loadData();
								} else {
									art_dialog.error('删除失败');
								}
							},
							error: function(e) {
								art_dialog.error('删除失败');
							}
						})
					}
				}
			},
			"cancel": {
				label: '取消',
				className: 'btn-sm'
			}
		};
		showDialog(opt);
	}


	function registerEvents() {

		$(document.body).on('click', function(e) {
			var $el = $(e.target || e.srcElement),
				cls = $el.attr('class'),
				tag = $el.get(0).tagName.toLowerCase(),
				id = $el.attr('id'),
				name = $el.attr('name');
			if (cls && cls.indexOf('fa-calendar') > -1) {
				$el.parent().siblings('input').focus();
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

		$uploadFile.fileupload({
			url: "",
			beforeSend: function(e, data) {
				data.url = global_config.serverRoot + "fileUpload?t=" + Math.random();
			},
			start: function() {
				art_dialog.loading.start("uploading");
			},
			always: function(e, data) {
				if (data.result) {
					var result = 'string' == typeof data.result ? JSON.parse(data.result) : data.result;
					if ('0' == result.response) {
						var type = $('select[name="type"]').val();
						$.ajax({
							url: global_config.serverRoot + 'insertFile',
							method: 'post',
							data: {
								fileName: result.fileName,
								fileType: type,
								url: result.url
							},
							success: function(json) {
								art_dialog.loading.end();
								if ('0' == json.response) {
									art_dialog.success('上传成功', '', function() {
										_grid.loadData()
									});
								} else {
									art_dialog.error('上传失败');
								}
							},
							error: function(e) {
								art_dialog.loading.end();
								art_dialog.error('上传失败');
							}
						});
					}
				}
			}
		});
	}

	function getUrl() {
		return global_config.serverRoot + 'fileList?' + Utils.object2param(userParam) + '&t=' + Math.random();
	}

	return {
		init: init
	};
});