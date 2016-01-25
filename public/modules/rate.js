define(function(require, exports, module) {
	var Utils = require('utils'),
		Grid = require('gridBootstrap'),
		Xss = require('xss'),
		Table = require('whygrid'),

		addEditTpl = $('#viewTpl-baseInfo').html(),
		viewTpl = $('#viewTpl').html(),
		baseTpl = $('#addEditTpl-baseInfo').html(),
		flTpl = $('#flTpl').html(),
		gdTpl = $('#addEditTpl-gd').html(),
		jtTpl = Utils.formatJson($('#addEditTpl-jt').html(), {
			template: flTpl.replace('glyphicon-minus', 'glyphicon-plus')
		}),

		Box = require('boxBootstrap'),
		content = $('#content'),
		listContainer = $('#grid_list'),
		userParam = {},
		dictionaryCollection = {},
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
		submitLock = false,
		submitInterval = 2000, // 点击按钮点击后锁定2秒钟
		validatePass = false,
		_grid,
		dataTypes = {},
		dataMap = {};

	function init() {
		//loadData();
		_grid = Table('#grid_list', getUrl(), {
			checkRow: false,
			seachForm: '#sform',
			pagenav: true,
			cols: [{
				name: '计费编号',
				index: 'id'
			}, {
				name: '所有者编号',
				index: 'ownerId'
			}, {
				name: '所有者名称',
				index: 'ownerName'
			}, {
				name: '所属系统',
				index: 'chargeSystemProperty'
			}, {
				name: '计费状态',
				index: 'chargeStatus'
			}, {
				name: '计费类型',
				index: 'chargeType'
			}, {
				name: '创建时间',
				index: 'creationDate'
			}, {
				name: '操作',
				index: '',
				width: 150,
				format: function(v) {
					//return '<div class="ui-pg-div align-center"><span class="ui-icon ace-icon fa fa-pencil blue" title="编辑"></span><span class="ui-icon ace-icon fa fa-search-plus blue" title="查看"></span><span class="ui-icon ace-icon fa fa-clock-o blue" title="历史记录"></span></div>';
					dataMap[v.id] = v;
					return '<a href="javascript:void(0)" data-id="' + v.id + '" class="edit">编辑</a>&nbsp;<a href="javascript:void(0)" data-id="' + v.id + '" class="view">查看</a>&nbsp;<a href="javascript:void(0)" data-id="' + v.id + '" class="history">历史记录</a>';
				}
			}]
		});
		var stypes = $("#sform").find('select[data-typename]');
		var ajaxArr = []
		for (var i = 0; i < stypes.length; i++) {
			+ function() {
				var s = $(stypes[i]);
				var typename = s.data('typename');
				ajaxArr.push($.get(global_config.serverRoot + 'dataDictionary/dropdownlist', {
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
						dictionaryCollection[typename] = arr;
						for (var i = 0; i < arr.length; i++) {
							var item = arr[i];
							val = item.innerValue;
							html += '<option value=' + val + '>' + item.label + '</option>'
						}
					}
					s.append(html);
				}))
			}()
		}
		$.when.apply($, ajaxArr).then(function() {
			_grid.load(); //加载列表数据;
		}).then(null, function(e) {
			Box.alert('加载数据失败，请稍后刷新重试~');
		});
		registerEvents();
	}

	function loadData() {
		_grid = Grid.create({
			key: 'id',
			checkbox: false,
			cols: [{
				name: '计费编号',
				index: 'id'
			}, {
				name: '所有者编号',
				index: 'ownerId'
			}, {
				name: '所有者名称',
				index: 'ownerName'
			}, {
				name: '所属系统',
				index: 'chargeSystemProperty'
			}, {
				name: '计费状态',
				index: 'chargeStatus'
			}, {
				name: '计费类型',
				index: 'chargeType'
			}, {
				name: '创建时间',
				index: 'creationDate'
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
		listContainer.html(_grid.getHtml());

		_grid.listen('addCallback', function() {
			if (dictionaryCollection.chargeTypeArr) {
				addAndUpdate();
			}
		});
		_grid.listen('editCallback', function(row) {
			if (dictionaryCollection.chargeTypeArr) {
				addAndUpdate(row);
				$('#fownerId').prop('disabled', true);
			}
		});
		_grid.listen('viewCallback', function(row) {
			view(row);
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
		_grid.load();
		getDictionaryFromServer('chargeType', function(json) {
			if ('0' == json.code) {
				dictionaryCollection.chargeTypeArr = json.data && json.data.dataArray || [];
				setSelect('chargeTypeArr', doms.chargeTypeInt);
			}
		}, function(e) {
			// report
		});
		getDictionaryFromServer('chargeServiceType', function(json) {
			if ('0' == json.code) {
				dictionaryCollection.chargeServiceTypeArr = json.data && json.data.dataArray || [];
				setSelect('chargeServiceTypeArr', doms.chargeServiceTypeInt);
			}
		}, function(e) {
			// report
		});
		getDictionaryFromServer('chargeSystemProperty', function(json) {
			if ('0' == json.code) {
				dictionaryCollection.chargeSystemPropertyArr = json.data && json.data.dataArray || [];
				setSelect('chargeSystemPropertyArr', doms.chargeSystemPropertyInt);
			}
		}, function(e) {
			// report
		});
		getDictionaryFromServer('chargeStatus', function(json) {
			if ('0' == json.code) {
				dictionaryCollection.chargeStatusArr = json.data && json.data.dataArray || [];
				setSelect('chargeStatusArr', doms.chargeStatusInt);
			}
		}, function(e) {
			// report
		});
		registerEvents();
	}

	//新增编辑
	function addAndUpdate(data, cb) {
		var opt = {},
			id = '',
			theDialog;
		addEditTpl = baseTpl + gdTpl + jtTpl;
		opt.message = '<h4><b>' + (data ? ('function' == typeof cb ? '查看费率' : '修改费率') : '添加费率') + '</b></h4><hr class="no-margin">' + addEditTpl;
		opt.buttons = {
			"save": {
				label: '<i class="ace-icon fa fa-check"></i> 保存',
				className: 'btn-sm btn-success',
				callback: function(a, b) {
					if (!validate()) {
						return false;
					} else {
						if (!submitLock) {
							submitLock = true;
							submitData(data, theDialog);
							setTimeout(function() {
								submitLock = false;
							}, submitInterval);
						}
						return false;
					}
				}
			},
			"cancel": {
				label: '取消',
				className: 'btn-sm'
			}
		};
		if ('function' == typeof cb) {
			delete opt.buttons.save;
		}
		theDialog = showDialog(opt);
		if (dictionaryCollection.chargeStatus) {
			$('input[name="fchargeStatusInt"]:first').attr('value', dictionaryCollection.chargeStatus[0].innerValue).trigger('click');
			$('input[name="fchargeStatusInt"]:last').attr('value', dictionaryCollection.chargeStatus[1].innerValue);
		}
		if (dictionaryCollection.chargeType) {
			$('input[name="fchargeTypeInt"]:first').attr('value', dictionaryCollection.chargeType[0].innerValue);
			$('input[name="fchargeTypeInt"]:last').attr('value', dictionaryCollection.chargeType[1].innerValue);
		}
		if (dictionaryCollection.chargeSystemProperty) {
			$('input[name="fchargeSystemPropertyInt"]:first').attr('value', dictionaryCollection.chargeSystemProperty[0].innerValue).trigger('click');
			$('input[name="fchargeSystemPropertyInt"]:last').attr('value', dictionaryCollection.chargeSystemProperty[1].innerValue);
		}
		if (dictionaryCollection.chargeServiceType) {
			setSelect('chargeServiceType', $('#fchargeServiceTypeInt'));
		}
		data && (validatePass = true, getRowDetail(data[0].id, cb));
		var tomorrow = new Date(new Date().getTime() + 86400000);
		$('.bootbox input[name="feffectiveDate"]').datetimepicker({
			autoclose: true,
			todayHighlight: true,
			minView: 2
		}).on('changeDate', function(d) {
			var dd;
			if (d.date.getTime() > tomorrow.getTime()) {
				dd = d.date;
			} else {
				dd = tomorrow;
			}
			$('.bootbox input[name="fexpirationDate"]').val('').datetimepicker('setStartDate', dd);
		});
		$('.bootbox input[name="fexpirationDate"]').datetimepicker({
			autoclose: true,
			todayHighlight: false,
			minView: 2,
			startDate: tomorrow
		});
		$("#fownerId").off().on('blur', function(e) {
			var $el = $(this),
				v = $el.val(),
				errInfo = $el.parent().find('.error-info'),
				ep = $el.parents('.form-group');
			ep.removeClass('has-error');
			if ('' == v.trim()) {
				if (errInfo.size()) {
					errInfo.html('请输入所有者编号。');
				} else {
					$el.parent().append('<div class="error-info">请输入所有者编号。</div>');
				}
				ep.addClass('has-error');
				validatePass = false;
			} else {
				$.ajax({
					url: global_config.serverRoot + '/clearingCharge/add/isValid?ownerId=' + v,
					success: function(json) {
						var msg = '';
						if ('0' == json.code) {
							validatePass = json.data.isValid;
						} else if ('111' == json.code) {
							msg = '该所有者的费率规则已存在，请直接修改。';
							validatePass = false;
						} else {
							msg = '该所有者编号不存在。';
							validatePass = false;
						}
						if (!validatePass) {
							ep.addClass('has-error');
							if (errInfo.size()) {
								errInfo.html(msg);
							} else {
								$el.parent().append('<div class="error-info">' + msg + '</div>');
							}
						}
					},
					error: function(e) {
						// report and retry
					}
				});
			}
		});
		$('.bootbox input, .bootbox select').on('change', function(e) {
			validate($(this));
		});
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
			} else if (el.data('empty')) {
				if ('' != el.val().trim()) {
					elp.removeClass('has-error');
				} else {
					pass = false;
					elp.addClass('has-error');
				}

			} else if (el.attr('id') == 'fownerId') {
				if (el.val().trim()) {
					elp.removeClass('has-error');
				} else {
					pass = false;
					elp.addClass('has-error');
				}
			}

		} else {
			var obj = $('.bootbox').find("#gdPanel").find("input"); //里面有很多input名字重名的在不同费率下
			if ($("input[name=fchargeTypeInt]:checked").val() == '2') {
				obj = $('.bootbox').find("#jtPanel").find("input");
			}
			var pass1 = validBase($('.bootbox').find("#baseInfoPanel").find("input")); //基本信息的valid判断
			var pass2 = validBase(obj); //各费率模块valid判断
			pass = pass1 && pass2;
		}
		/** 特殊校验 */
		// var d1 = $('input[name="feffectiveDate"]'),
		// 	dv1 = d1.val(),
		// 	d2 = $('input[name="fexpirationDate"]'),
		// 	dv2 = d2.val();
		// d1.parents('.input-group:first').removeClass('has-error');
		// d2.parents('.input-group:first').removeClass('has-error');
		// if (dv1 && dv2) {
		// 	dv1 = new Date(dv1).getTime();
		// 	dv2 = new Date(dv2).getTime();
		// 	if (dv1 > dv2) {
		// 		pass = false;
		// 		d1.parents('.input-group:first').addClass('has-error');
		// 	}
		// }
		return validatePass && pass;
	}

	//判断有效的根基func
	function validBase(boxObj) {
		var pass = true;
		boxObj.each(function(i, v) {
			var $el = $(this),
				$p = $el.parents('.form-group:first'),
				isInt = $el.data('int'),
				isEmpty = $el.data('empty'),
				isDate = $el.hasClass('datepicker');
			if ('fownerId' == $el.attr('id')) {
				if ($el.val() != '') {
					return;
				} else {
					if ($el.parent().find('.error-info').size()) {
						$el.parent().find('.error-info').html('请输入所有者编号。');
					} else {
						$el.parent().append('<div class="error-info">请输入所有者编号。</div>');
					}
				}
			}
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
			if ('fexpirationDate' == $el.attr('name')) {
				val = $el.val();
				errorInfo = $p.find('.error-info');
				if (val) {
					try {
						if (new Date(val).getTime() < new Date(Utils.date.getTodayStr() + ' 00:00:00').getTime()) {
							if (errorInfo.size()) {
								errorInfo.html('请选择正确的日期。');
							} else {
								$el.parent().parent().append('<div class="error-info len">请选择正确的日期。</div>');
							}
							$p.addClass('has-error');
							pass = false;
						} else {
							errorInfo.hide();
							$p.removeClass('has-error');
						}
					} catch (e) {
						pass = false;
					}
				}
			}
		});
		return pass;
	}

	function getRowDetail(id, cb) {
		$.ajax({
			url: global_config.serverRoot + 'clearingCharge/detail?userId=' + '&id=' + id,
			success: function(json) {
				if ('0' == json.code) {
					fillData(json.data);
					'function' == typeof cb && cb.call();
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
		var list = data.clearingChargeRules || [],
			start = 0;
		if (data.ids) {
			$("#fids").val(data.ids)
		}
		if (data.ownerId) {
			$("#fownerId").val(data.ownerId)
		}
		if (data.chargeTypeInt) {
			$('input[name="fchargeTypeInt"][value="' + data.chargeTypeInt + '"]').prop('checked', true);
		}
		if (data.chargeSystemPropertyInt) {
			$('input[name="fchargeSystemPropertyInt"][value="' + data.chargeSystemPropertyInt + '"]').prop('checked', true);
		}
		if (data.chargeStatusInt) {
			$('input[name="fchargeStatusInt"][value="' + data.chargeStatusInt + '"]').prop('checked', true);
		}
		if (data.chargeServiceTypeInt) {
			$("#fchargeServiceTypeInt").val(data.chargeServiceTypeInt);
		}
		if (data.effectiveDate) {
			$("input[name='feffectiveDate']").val(data.effectiveDate);
		}
		if (data.expirationDate) {
			$("input[name='fexpirationDate']").val(data.expirationDate);
		}
		if (data.chargeTypeInt == dictionaryCollection.chargeType[1].innerValue) {
			var atpl = [];
			start = 1;
			$('#gdPanel').addClass('hide');
			$('#jtPanel').removeClass('hide');
			for (var i = 0; i < list.length - 1; i++) {
				atpl.push(flTpl);
			}
			$('#jtPanel .row:last').after(atpl.join(''));
		}
		for (var i = 0; i < list.length; i++) {
			$("input[name='fruleId']").eq(i + start).val(list[i].ruleId);
			$("input[name='ffixedCharge']").eq(i + start).val(list[i].fixedCharge);
			$("select[name='fexcludeChanelCharge']").eq(i + start).val(list[i].excludeChannelCharge);
			$("input[name='fvariableRate']").eq(i + start).val(list[i].variableRate);
			$("input[name='fchargeFloor']").eq(i + start).val(list[i].chargeFloor);
			$("input[name='fchargeCeiling']").eq(i + start).val(list[i].chargeCeiling);
			$("input[name='ftransactionFloor']").eq(i).val(list[i].transactionFloor);
			$("input[name='ftransactionCeiling']").eq(i).val(list[i].transactionCeiling);
		}
	}

	function submitData(row, dialog) {
		var data = {},
			start = 0,
			fownerId = $("#fownerId").val(),
			fchargeTypeInt = $('input[name="fchargeTypeInt"]:checked').val(),
			fchargeStatusInt = $('input[name="fchargeStatusInt"]:checked').val(),
			fchargeSystemPropertyInt = $('input[name="fchargeSystemPropertyInt"]:checked').val(),
			feffectiveDate = $("input[name='feffectiveDate']").val(),
			fexpirationDate = $("input[name='fexpirationDate']").val(),
			fchargeServiceTypeInt = $("#fchargeServiceTypeInt").val(),
			fruleId = $("input[name='fruleId']").map(function() {
				return $(this).val()
			}).get(),
			ffixedCharge = $("input[name='ffixedCharge']").map(function() {
				return $(this).val()
			}).get(),
			fexcludeChanelCharge = $("select[name='fexcludeChanelCharge']").map(function() {
				return $(this).val()
			}).get(),
			fvariableRate = $("input[name='fvariableRate']").map(function() {
				return $(this).val()
			}).get(),
			fchargeFloor = $("input[name='fchargeFloor']").map(function() {
				return $(this).val()
			}).get(),
			fchargeCeiling = $("input[name='fchargeCeiling']").map(function() {
				return $(this).val()
			}).get(),
			ftransactionFloor = $("input[name='ftransactionFloor']").map(function() {
				return $(this).val()
			}).get(),
			ftransactionCeiling = $("input[name='ftransactionCeiling']").map(function() {
				return $(this).val()
			}).get(),
			arr = [];

		data.id = row && row[0] && row[0].id || '';
		if (fownerId) {
			data.ownerId = fownerId;
		}
		if (fchargeTypeInt) {
			data.chargeTypeInt = fchargeTypeInt;
		}
		if (fchargeStatusInt) {
			data.chargeStatusInt = fchargeStatusInt;
		}
		if (fchargeSystemPropertyInt) {
			data.chargeSystemPropertyInt = fchargeSystemPropertyInt;
		}
		if (fchargeServiceTypeInt) {
			data.chargeServiceTypeInt = fchargeServiceTypeInt;
		}
		if (feffectiveDate) {
			data.effectiveDate = feffectiveDate;
		}
		if (fexpirationDate) {
			data.expirationDate = fexpirationDate;
		}
		if (fchargeTypeInt == dictionaryCollection.chargeType[1].innerValue) {
			start = 1;
		}
		for (var i = 0; i < ffixedCharge.length - 1; i++) {
			arr[i] = {};
			arr[i].ruleId = fruleId[i + start];
			arr[i].fixedCharge = ffixedCharge[i + start];
			arr[i].excludeChannelCharge = fexcludeChanelCharge[i + start];
			arr[i].variableRate = fvariableRate[i + start];
			arr[i].chargeFloor = fchargeFloor[i + start];
			arr[i].chargeCeiling = fchargeCeiling[i + start];
			arr[i].transactionFloor = ftransactionFloor[i];
			arr[i].transactionCeiling = ftransactionCeiling[i];
		}
		data.dataArray = JSON.stringify(arr);
		$.ajax({
			url: global_config.serverRoot + 'clearingCharge/addOrUpdate',
			method: 'post',
			data: data,
			async: false,
			success: function(json) {
				if ('0' == json.code) {
					dialog.remove();
					_grid.load();
				} else if (-102 == json.code) {
					location.reload();
				} else {
					if (json.code == '106' || json.code == '107') {
						$("#fownerId").parents('.form-group:first').addClass('has-error');
						Box.alert('所有者编号不存在，数据保存失败！');
					} else if (json.code == '108') {
						$("input[name='feffectiveDate']").parents('.form-group:first').addClass('has-error');
						$("input[name='fexpirationDate']").parents('.form-group:first').addClass('has-error');
						Box.alert('有效期不正确，请确保结束时间大于开始时间并且结束时间大于当前时间！');
					} else if (json.code == '109') {
						$("#fownerId").parents('.form-group:first').addClass('has-error');
						Box.alert('所有者编号重复，数据保存失败！');
					} else {
						Box.alert('数据保存失败！');
					}
				}
			},
			error: function(json) {
				Box.alert('数据保存失败~');
			}
		});
	}

	//box dialog init
	function showDialog(opt) {
		return Box.dialog(opt);
	}

	/**
	 * [view 查看详情]
	 * @param  {[Array]} row [行信息]
	 * @return {[type]}     [description]
	 */
	function view(row) {
		addAndUpdate(row, function() {
			$('.bootbox input, .bootbox select').prop('disabled', true);
			$('.bootbox .glyphicon-minus, .bootbox .glyphicon-plus').hide();
		});
	}

	function viewHistory(row) {
		var id = row[0].id;
		$.ajax({
			url: global_config.serverRoot + '/clearingCharge/history?userId=' + '&id=' + id,
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
		$('#add-btn').on('click', function() {
			// _grid.trigger('addCallback');
			addAndUpdate();
		});
		$('.datepicker').datetimepicker({
			autoclose: true,
			todayHighlight: true,
			minView: 2
		});
		$(document.body).on('click', function(e) {
			var $el = $(e.target || e.srcElement),
				cls = $el.attr('class'),
				tag = $el.get(0).tagName.toLowerCase(),
				id = $el.attr('id'),
				name = $el.attr('name');
			if (cls && cls.indexOf('fa-calendar') > -1) {
				$el.parent().siblings('input').focus();
			}
			if (cls && cls.indexOf('fa-check') > -1 || (id && 'query-btn' == id)) {
				// if (getParams()) {
				// 	_grid.setUrl(getUrl());
				// 	_grid.loadData();
				// }
			}
			if (cls && cls.indexOf('fa-undo') > -1 || (id && 'reset-btn' == id)) {
				userParam = {};
				doms.effectiveDateStart.val('');
				doms.effectiveDateEnd.val('');
				doms.expirationDateStart.val('');
				doms.expirationDateEnd.val('');
				doms.creationDateStart.val('');
				doms.creationDateEnd.val('');
				doms.chargeServiceTypeInt.val(0);
				doms.chargeStatusInt.val(0);
				doms.chargeSystemPropertyInt.val(0);
				doms.chargeTypeInt.val(0);
				doms.ownerIds.val('');
				doms.ids.val('');
			}
			if ('input' == tag && 'fchargeTypeInt' == name) {
				var val = $el.val();
				if (val == dictionaryCollection.chargeType[1].innerValue) {
					$('#gdPanel').addClass('hide');
					$('#jtPanel').removeClass('hide');
				} else {
					$('#gdPanel').removeClass('hide');
					$('#jtPanel').addClass('hide');
				}
			}
			if ('input' == tag && 'fchargeSystemPropertyInt' == name) {
				var val = $el.val();
				if (val == dictionaryCollection.chargeSystemProperty[1].innerValue) {
					$('#fownerId').attr('placeholder', '通道ID');
				} else if (val == dictionaryCollection.chargeSystemProperty[0].innerValue) {
					$('#fownerId').attr('placeholder', '商户ID');
				}
			}
			if (cls && cls.indexOf('glyphicon-plus') > -1) {
				$('#jtPanel .row:last').after(flTpl);
			}
			if (cls && cls.indexOf('glyphicon-minus') > -1) {
				$el.parent().parent().remove();
			}
			if (cls && cls.indexOf('edit') > -1) {
				addAndUpdate([dataMap[$el.data('id')]]);
			}
			if (cls && cls.indexOf('view') > -1) {
				view([dataMap[$el.data('id')]]);
			}
			if (cls && cls.indexOf('history') > -1) {
				viewHistory([dataMap[$el.data('id')]]);
			}
		});
	}

	function getParams() {
		var newParam = {},
			newchange = false,
			ids = doms.ids.val(),
			ownerIds = doms.ownerIds.val(),
			chargeTypeInt = doms.chargeTypeInt.val(),
			chargeSystemPropertyInt = doms.chargeSystemPropertyInt.val(),
			chargeStatusInt = doms.chargeStatusInt.val(),
			chargeServiceTypeInt = doms.chargeServiceTypeInt.val(),
			effectiveDateStart = doms.effectiveDateStart.val(),
			effectiveDateEnd = doms.effectiveDateEnd.val(),
			expirationDateStart = doms.expirationDateStart.val(),
			expirationDateEnd = doms.expirationDateEnd.val(),
			creationDateStart = doms.creationDateStart.val(),
			creationDateEnd = doms.creationDateEnd.val();

		if (ids) {
			newParam.ids = ids;
		}
		if (ownerIds) {
			newParam.ownerIds = ownerIds;
		}
		if (effectiveDateStart) {
			newParam.effectiveDateStart = effectiveDateStart;
		}
		if (effectiveDateEnd) {
			newParam.effectiveDateEnd = effectiveDateEnd;
		}
		if (expirationDateStart) {
			newParam.expirationDateStart = expirationDateStart;
		}
		if (expirationDateEnd) {
			newParam.expirationDateEnd = expirationDateEnd;
		}
		if (creationDateStart) {
			newParam.creationDateStart = creationDateStart;
		}
		if (creationDateEnd) {
			newParam.creationDateEnd = creationDateEnd;
		}
		if (chargeTypeInt != '0') {
			newParam.chargeTypeInt = chargeTypeInt;
		}
		if (chargeSystemPropertyInt != '0') {
			newParam.chargeSystemPropertyInt = chargeSystemPropertyInt;
		}
		if (chargeStatusInt != '0') {
			newParam.chargeStatusInt = chargeStatusInt;
		}
		if (chargeServiceTypeInt != '0') {
			newParam.chargeServiceTypeInt = chargeServiceTypeInt;
		}

		for (var k in newParam) {
			if (newParam[k] !== userParam[k]) {
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

	function getUrl() {
		return global_config.serverRoot + '/clearingCharge/list?userId=&' + Utils.object2param(userParam);
	}

	return {
		init: init
	};
});