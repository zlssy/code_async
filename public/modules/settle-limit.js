define(function(require, exports, module) {
	var Utils = require('utils'),
		Xss = require('xss'),
		Box = require('boxBootstrap'),
		Grid = require('gridBootstrap'),
		accountCheck = require('checkAccount'),

		listContainer = $('#grid_list'),
		addEditTpl = $('#addEditTpl').html(),
		viewTpl = $('#viewTpl').html(),
		userParam = {},
		dictionaryCollection = {},
		doms = {
			merchantIds: $("#merchantIds"),
			merchantName: $("#merchantName"),
			district: $("#district"),
			businessTypeInt: $('#businessTypeInt'),
			businessLimitFloor: $("#businessLimitFloor"),
			businessLimitCeiling: $("#businessLimitCeiling"),
			businessLimit: $("#businessLimit"),
			legalPersonLimitFloor: $("#legalPersonLimitFloor"),
			legalPersonLimitCeiling: $("#legalPersonLimitCeiling"),
			legalPersonLimit: $("#legalPersonLimit")
		},
		businessTypeArr = [{
			id: 1,
			label: '游戏'
		}, {
			id: 2,
			label: 'UC'
		}, {
			id: 3,
			label: '电商'
		}],
		businessTypeDefault = '',
		submitLock = false,
		submitInterval = 2000,
		_grid;

	function init() {
		_grid = Grid.create({
			key: 'id',
			cols: [{
				name: '商户编码',
				index: 'merchantId'
			}, {
				name: '商户名称',
				index: 'merchantName'
			}, {
				name: '对公结算限额',
				index: 'businessLimit'
			}, {
				name: '对法人结算限额',
				index: 'legalPersonLimit'
			}, {
				name: '操作时间',
				index: 'modifyDate'
			}, {
				name: '操作人',
				index: 'modifyUser'
			}, {
				name: '操作',
				index: '',
				format: function(v) {
					return '<div class="ui-pg-div align-center"><span class="ui-icon ace-icon fa fa-pencil blue" title="编辑"></span><span class="ui-icon ace-icon fa fa-search-plus blue" title="查看"></span><span class="ui-icon ace-icon fa fa-clock-o blue" title="历史记录"></span></div>';
				}
			}],
			url: getUrl(),
			pagesize: 10,
			jsonReader: {
				root: 'data.pageData',
				page: 'data.pageNo',
				records: 'data.totalCnt'
			}
		});

		_grid.listen('renderCallback', function() {
			$('.ui-pg-div *[title]').tooltip({
				container: 'body'
			});
			$('.ui-pg-div .fa-clock-o').on('click', function() {
				setTimeout(function() {
					viewHistory(_grid.getSelectedRow())
				}, 0);
			})
		});
		_grid.listen('addCallback', function() {
			addAndUpdate();
		});
		_grid.listen('editCallback', function(row) {
			addAndUpdate(row);
		});
		_grid.listen('viewCallback', function(row) {
			view(row);
		})
		listContainer.html(_grid.getHtml());
		_grid.load();

		// load business type data
		if (dictionaryCollection.businessTypeArr) {
			setSelect('businessTypeArr', doms.businessTypeInt);
		} else {
			getDictionaryFromServer('businessType', getBusinessTypeSuccess, getBusinessTypeError);
		}
		registerEvents();
	}

	function getBusinessTypeSuccess(json) {
		if ('0' == json.code) {
			dictionaryCollection.businessTypeArr = json.data && json.data.dataArray || [];
			if (dictionaryCollection.businessTypeArr.length) {
				businessTypeDefault = businessTypeArr[0].id;
				setSelect('businessTypeArr', doms.businessTypeInt);
			}
		}
	}

	function getBusinessTypeError(e) {
		// report and retry
	}

	function setSelect(gArr, dom, selected) {
		var data = dictionaryCollection[gArr],
			s = '',
			context = this,
			args = Array.prototype.slice.call(arguments, 0),
			fn = arguments.callee;
		if (!data) {
			setTimeout(function() {
				console.log('retry');
				fn.apply(context, args);
			}, 10);
			return;
		}
		for (var i = 0; i < data.length; i++) {
			if (selected == data[i].innerValue) {
				s = ' selected = "selected"';
			} else {
				s = '';
			}
			dom.append('<option value="' + data[i].innerValue + '"' + s + '>' + Xss.inHTMLData(data[i].label) + '</option>');
		}
	}

	/**
	 * [addAndUpdate 添加、编辑功能]
	 * @param {[type]} data [description]
	 */
	function addAndUpdate(data) {
		var opt = {
				modal: true,
				dragable: true,
				title: '<h4><b>' + (data ? '修改结算限额' : '新增结算限额') + '</b></h4>',
				title_html: true
			},
			id = '';

		opt.message = addEditTpl;
		opt.buttons = {
			"save": {
				label: '<i class="ace-icon fa fa-check"></i> 保存',
				className: 'btn-sm btn-success',
				callback: function() {
					if (!validate()) {
						return false;
					} else {
						if (!submitLock) {
							submitData(data);
							submitLock = true;
							setTimeout(function() {
								submitLock = false;
							}, submitInterval);
						}
					}
				}
			},
			"cancel": {
				label: '取消',
				className: 'btn-sm'
			}
		};
		Box.dialog(opt);
		setSelect('businessTypeArr', $('#fbusinessTypeInt'));
		data && getRowDetail(data[0].id);
		$('.bootbox .datepicker').datepicker({
			autoclose: true
		});
		$('.bootbox input, .bootbox select').on('change', function(e) {
			validate($(this));
		});
		accountCheck.check({
			el: $('#fmerchantId'),
			elp: $('#fmerchantId').parents('.form-group:first')
		});
	}

	function submitData(row) {
		var data = {},
			fmerchantId = $("#fmerchantId").val(),
			// fmerchantName = $("#fmerchantName").val(),
			fbusinessTypeInt = $('#fbusinessTypeInt').val(),
			fbusinessLimit = $("#fbusinessLimit").val(),
			flegalPersonLimit = $("#flegalPersonLimit").val(),
			ftZeroLimit = $("#ftZeroLimit").val(),
			ftZeroHolidayLimit = $("#ftZeroHolidayLimit").val(),
			ftOneHolidayLimit = $("#ftOneHolidayLimit").val();

		data.id = row && row[0] && row[0].id || '';
		if (fmerchantId) {
			data.merchantId = fmerchantId;
		}
		// if (fmerchantName) {
		// 	data.merchantName = fmerchantName;
		// }
		if (fbusinessTypeInt) {
			data.businessTypeInt = fbusinessTypeInt;
		}
		if (fbusinessLimit) {
			data.businessLimit = fbusinessLimit;
		}
		if (flegalPersonLimit) {
			data.legalPersonLimit = flegalPersonLimit;
		}
		if (ftZeroLimit) {
			data.tranZeroLimit = ftZeroLimit;
		}
		if (ftZeroHolidayLimit) {
			data.tranZeroHolidayLimit = ftZeroHolidayLimit;
		}
		if (ftOneHolidayLimit) {
			data.tranOneHolidayLimit = ftOneHolidayLimit;
		}

		$.ajax({
			url: global_config.serverRoot + 'settleLimit/addOrUpdate',
			method: 'post',
			data: data,
			success: function(json) {
				if ('0' == json.code) {
					_grid.loadData();
				} else {
					Box.alert('数据保存失败！');
				}
			},
			error: function(json) {
				Box.alert('数据保存失败~');
			}
		})
	}

	function getRowDetail(id) {
		$.ajax({
			url: global_config.serverRoot + 'settleLimit/detail?userId=' + '&id=' + id,
			success: function(json) {
				if ('0' == json.code) {
					fillData(json.data);
				} else if (-100 == json.code) {
					location.reload();
				}
			},
			error: function(e) {
				// report
			}
		});
	}

	/**
	 * [fillData 填充数据]
	 * @param  {[Object]} data [要填充的数据]
	 * @return {[type]}      [description]
	 */
	function fillData(data) {
		data = data || {};
		if (data.merchantId) {
			$("#fmerchantId").val(data.merchantId)
		}
		// if (data.merchantName) {
		// 	$("#fmerchantName").val(data.merchantName)
		// }
		if (data.businessTypeInt) {
			$('#fbusinessTypeInt').val(data.businessTypeInt);
		}
		if (data.businessLimit) {
			$("#fbusinessLimit").val(data.businessLimit)
		}
		if (data.legalPersonLimit) {
			$("#flegalPersonLimit").val(data.legalPersonLimit)
		}
		if (data.tranZeroLimit) {
			$("#ftZeroLimit").val(data.tranZeroLimit)
		}
		if (data.tranZeroHolidayLimit) {
			$("#ftZeroHolidayLimit").val(data.tranZeroHolidayLimit)
		}
		if (data.tranOneHolidayLimit) {
			$("#ftOneHolidayLimit").val(data.tranOneHolidayLimit)
		}
		$("#fmerchantId").focus();
		setTimeout(function() {
			$("#fmerchantId").blur();
		}, 0);
	}

	/**
	 * [validate 检验函数]
	 * @param  {[HTML Element]} el [要校验的元素，不传递则全部检查]
	 * @return {[Boolean]}    [description]
	 */
	function validate(el) {
		var pass = true;
		if (el) {
			var elp = el.parents('.form-group:first');
			if (el.data('date-format')) {
				if (Utils.isDate(el.val())) {
					elp.removeClass('has-error');
				} else {
					pass = false;
					elp.addClass('has-error');
				}
			} else if (el.data('int')) {
				if ($.isNumeric(el.val())) {
					elp.removeClass('has-error');
				} else {
					pass = false;
					elp.addClass('has-error');
				}
			}
		} else {
			$('.bootbox input').each(function(i, v) {
				var $el = $(this),
					$p = $el.parents('.form-group:first'),
					isInt = $el.data('int'),
					isEmpty = $el.data('empty'),
					isDate = $el.hasClass('datepicker');
				if (isDate) {
					if (Utils.isDate($el.val())) {
						$p.removeClass('has-error');
					} else {
						pass = false;
						$p.addClass('has-error');
					}
				}
				if (isInt) {
					if ($.isNumeric($el.val())) {
						$p.removeClass('has-error');
					} else {
						pass = false;
						$p.addClass('has-error');
					}
				}
				if (isEmpty) {
					if ('' != $el.val().trim()) {
						$p.removeClass('has-error');
					} else {
						pass = false;
						$p.addClass('has-error');
					}
				}
			});
		}
		!accountCheck.isPass() && $('#fmerchantId').parents('.form-group:first').addClass('has-error');
		return accountCheck.isPass() && pass;
	}

	/**
	 * [arr2map 数组转map]
	 * @param  {[Array]} arr [要转的数组]
	 * @param  {[String]} key [作为key的字段名称]
	 * @param  {[String]} val [作为value的字段名称]
	 * @return {[Object]}     [Object]
	 */
	function arr2map(arr, key, val) {
		if (!key || !val || 0 == arr.length) {
			return {};
		}
		var r = {};
		for (var i = 0; i < arr.length; i++) {
			if (undefined != arr[i][key] && undefined != arr[i][val]) {
				r[arr[i][key]] = arr[i][val];
			}
		}
		return r;
	}

	/**
	 * [view 查看详情]
	 * @param  {[Array]} row [行信息]
	 * @return {[type]}     [description]
	 */
	function view(row) {
		var d = row[0] || {},
			opt = {
				modal: true,
				dragable: true,
				title: '<h4><b>查看结算规则</b></h4>',
				title_html: true
			};
		opt.buttons = {
			'ok': {
				label: '确定',
				className: 'btn-sm btn-success'
			}
		};
		$.ajax({
			url: global_config.serverRoot + 'settleLimit/detail?userId=' + '&id=' + d.id,
			success: function(json) {
				if ('0' == json.code) {
					opt.message = Utils.formatJson(viewTpl, {
						data: json.data,
						businessType: arr2map(dictionaryCollection['businessTypeArr'], 'innerValue', 'label')
					});
					Box.dialog(opt);
				} else if (-100 == json.code) {
					location.reload();
				} else {
					// report
				}
			},
			error: function(e) {
				// report
			}
		});
	}

	function viewHistory(row) {
		var id = row[0].id;
		$.ajax({
			url: global_config.serverRoot + '/settleLimit/history?userId=' + '&id=' + id,
			success: function(json) {
				if ('0' == json.code) {
					showHistory(json.data.pageData);
				} else if (-100 == json.code) {
					location.reload();
				}
			},
			error: function(json) {
				// some report
			}
		})
	}

	/**
	 * [showHistory 展示历史操作信息]
	 * @param  {[Array]} data [要展示的数据]
	 * @return {[type]}      [description]
	 */
	function showHistory(data) {
		var html = ['<h4><b>操作历史</b></h4><hr class="no-margin">'],
			d;
		html.push('<table class="table table-striped table-bordered table-hover">');
		html.push('<thead><tr><th>操作人</th><th>操作时间</th><th>操作类型</th></tr></thead>');
		html.push('<tbody>');
		for (var i = 0; i < data.length; i++) {
			d = data[i];
			html.push('<tr>');
			html.push('<td>' + Xss.inHTMLData(d.operater) + '</td>');
			html.push('<td>' + d.date + '</td>');
			html.push('<td>' + d.type + '</td>');
			html.push('</tr>');
		}
		html.push('</tbody></table>');

		Box.alert(html.join(''));
	}

	/**
	 * [getUrl 获取查询url]
	 * @return {[type]} [description]
	 */
	function getUrl() {
		return global_config.serverRoot + 'settleLimit/list?userId=' + '&' + Utils.object2param(userParam);
	}

	function getDictionaryFromServer(type, callback, errorback) {
		var emptyFn = function() {},
			cb = callback || emptyFn,
			ecb = errorback || emptyFn;
		$.ajax({
			url: global_config.serverRoot + 'dataDictionary/dropdownlist?userId=' + '&type=' + type,
			success: cb,
			error: ecb
		});
	}

	function registerEvents() {
		$('.datepicker').datepicker({
			autoclose: true
		});
		$('#add-btn').on('click', function() {
			_grid.trigger('addCallback');
		});
		$(document.body).on('click', function(e) {
			var $el = $(e.target || e.srcElement),
				cls = $el.attr('class'),
				tag = $el.get(0).tagName.toLowerCase(),
				id = $el.attr('id');
			if (cls && cls.indexOf('fa-calendar') > -1) {
				$el.parent().siblings('input').focus();
			}
			if (cls && cls.indexOf('fa-check') > -1 || (id && 'query-btn' == id)) {
				if (getParams()) {
					_grid.setUrl(getUrl());
					_grid.loadData();
				}
			}
			if ('businessLimit' == id) {
				if ($el.prop('checked')) {
					doms.businessLimitFloor.val('').prop('disabled', true);
					doms.businessLimitCeiling.val('').prop('disabled', true);
				} else {
					doms.businessLimitFloor.prop('disabled', false).focus();
					doms.businessLimitCeiling.prop('disabled', false);
				}
			}
			if ('legalPersonLimit' == id) {
				if ($el.prop('checked')) {
					doms.legalPersonLimitFloor.val('').prop('disabled', true);
					doms.legalPersonLimitCeiling.val('').prop('disabled', true);
				} else {
					doms.legalPersonLimitFloor.prop('disabled', false).focus();
					doms.legalPersonLimitCeiling.prop('disabled', false);
				}
			}
			if (cls && cls.indexOf('fa-undo') > -1 || (id && 'reset-btn' == id)) {
				userParam = {};
				doms.merchantIds.val('');
				doms.merchantName.val('');
				doms.district.val('');
				doms.businessLimitFloor.val('');
				doms.businessLimitCeiling.val('');
				doms.businessLimit.val('');
				doms.legalPersonLimitFloor.val('');
				doms.legalPersonLimitCeiling.val('');
				doms.legalPersonLimit.val('');
				doms.businessTypeInt.val(0);
			}
		});
	}

	function getParams() {
		var newchange = false,
			newParam = {},
			merchantIds = $("#merchantIds").val(),
			merchantName = $("#merchantName").val(),
			district = $("#district").val(),
			businessLimitFloor = $("#businessLimitFloor").val(),
			businessLimitCeiling = $("#businessLimitCeiling").val(),
			businessLimit = $("#businessLimit").val(),
			businessTypeInt = $('#businessTypeInt').val(),
			legalPersonLimitFloor = $("#legalPersonLimitFloor").val(),
			legalPersonLimitCeiling = $("#legalPersonLimitCeiling").val(),
			legalPersonLimit = $("#legalPersonLimit").val();

		if (merchantIds) {
			newParam.merchantIds = merchantIds;
		}
		if (merchantName) {
			newParam.merchantName = merchantName;
		}
		if (district) {
			newParam.district = district;
		}
		if (businessTypeInt != '0') {
			newParam.businessTypeInt = businessTypeInt;
		}
		if (businessLimitFloor) {
			newParam.businessLimitFloor = businessLimitFloor;
		}
		if (businessLimitCeiling) {
			newParam.businessLimitCeiling = businessLimitCeiling;
		}
		if (businessLimit) {
			newParam.businessLimit = businessLimit;
		}
		if (legalPersonLimitFloor) {
			newParam.legalPersonLimitFloor = legalPersonLimitFloor;
		}
		if (legalPersonLimitCeiling) {
			newParam.legalPersonLimitCeiling = legalPersonLimitCeiling;
		}
		if (legalPersonLimit) {
			newParam.legalPersonLimit = legalPersonLimit;
		}

		for (var k in newParam) {
			if (newParam[k] != userParam[k]) {
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

		userParam = newParam;
		return true;
	}

	exports.init = init;
});