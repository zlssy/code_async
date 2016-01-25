define(function(require, exports, module) {
	var Utils = require('utils'),
		Box = require('boxBootstrap'),
		Grid = require('gridBootstrap'),
		Xss = require('xss'),
		art_dialog = require('dialog'),
		accountCheck = require('checkAccount'),
		Table = require('whygrid'),

		listContainer = $('#grid_list'),
		addEditTpl = $('#addEditTpl').html(),
		importTpl = $('#importTpl').html(),
		_grid, doms = {},
		dictionaryCollection = {},
		actionLock = {}, // 行为频率控制
		userParam = {},
		lockInterval = 3000,
		dataTypes = {},
		dataMap = {};

	function init() {
		_grid = Table('#grid_list', getUrl(), {
			checkRow: false,
			seachForm: '#sform',
			//oldApi: true, //是否是老接口
			pagenav: true,
			cols: [{
				name: '商户编号',
				index: 'merchantId'
			}, {
				name: '状态',
				index: 'settleCardStatus'
			}, {
				name: '结算类型',
				index: 'settleCardType'
			}, {
				name: '开户行',
				index: 'issuer'
			}, {
				name: '银行账号',
				index: 'cardNumber'
			}, {
				name: '开户名',
				index: 'userName'
			}, {
				name: '优先级',
				index: 'priority'
			}, {
				name: '生效日期',
				index: 'effectiveDate'
			}, {
				name: '失效日期',
				index: 'expirationDate'
			}, {
				name: '操作',
				index: '',
				width: 120,
				format: function(v) {
					dataMap[v.id] = v;
					//return '<div class="ui-pg-div align-center"><span class="ui-icon ace-icon fa fa-pencil blue" title="编辑"></span><span class="ui-icon ace-icon fa fa-clock-o blue" title="历史记录"></span></div>';
					return '<a href="javascript:void(0)" class="edit" data-id="' + v.id + '">编辑</a>&nbsp;<a href="javascript:void(0)" class="view" data-id="' + v.id + '">历史记录</a>'
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

	function initData() {
		_grid = Grid.create({
			key: 'id',
			checkbox: false,
			cols: [{
				name: '商户编号',
				index: 'merchantId'
			}, {
				name: '状态',
				index: 'settleCardStatus'
			}, {
				name: '结算类型',
				index: 'settleCardType'
			}, {
				name: '开户行',
				index: 'issuer'
			}, {
				name: '银行账号',
				index: 'cardNumber'
			}, {
				name: '开户名',
				index: 'userName'
			}, {
				name: '优先级',
				index: 'priority'
			}, {
				name: '生效日期',
				index: 'effectiveDate'
			}, {
				name: '失效日期',
				index: 'expirationDate'
			}, {
				name: '操作',
				index: '',
				format: function(v) {
					return '<div class="ui-pg-div align-center"><span class="ui-icon ace-icon fa fa-pencil blue" title="编辑"></span><span class="ui-icon ace-icon fa fa-clock-o blue" title="历史记录"></span></div>';
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
		listContainer.html(_grid.getHtml());
		_grid.load();
		getDictionaryFromServer('settleCardType', function(json) {
			if ('0' == json.code) {
				dictionaryCollection.typeArr = json.data && json.data.dataArray || [];
				setSelect('typeArr', doms.cardType);
			}
		}, function(e) {
			// report
		});
		getDictionaryFromServer('settleCardStatus', function(json) {
			if ('0' == json.code) {
				dictionaryCollection.statusArr = json.data && json.data.dataArray || [];
				setSelect('statusArr', doms.status);
			}
		}, function(e) {
			// report and retry
		});
		registerEvents();
	}

	/**
	 * [addAndUpdate 添加、编辑功能]
	 * @param {[type]} data [description]
	 */
	function addAndUpdate(data) {
		if (actionLock.addAndUpdate) {
			return;
		}
		actionLock.addAndUpdate = true;
		setTimeout(function() {
			actionLock.addAndUpdate = false;
		}, lockInterval);

		var opt = {},
			id = '';

		opt.message = '<h4><b>' + (data ? '修改结算卡' : '新增结算卡') + '</b></h4><hr class="no-margin">' + addEditTpl;
		opt.buttons = {
			"save": {
				label: '<i class="ace-icon fa fa-check"></i> 保存',
				className: 'btn-sm btn-success',
				callback: function() {
					if (!validate()) {
						return false;
					} else {
						if (!actionLock.submitData) {
							submitData(data);
							actionLock.submitData = true;
							setTimeout(function() {
								actionLock.submitData = false;
							}, lockInterval);
						}
					}
				}
			},
			"cancel": {
				label: '取消',
				className: 'btn-sm'
			}
		};
		showDialog(opt);
		setSelect('settleCardType', $('#lx'));
		setSelect('settleCardStatus', $('#zt'));
		data && fillData(data);
		var tomorrow = new Date(new Date().getTime() + 86400000);
		$('.bootbox #sxsj').datetimepicker({
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
			$('.bootbox #xxsj').val('').datetimepicker('setStartDate', dd);
		});
		$('.bootbox #xxsj').datetimepicker({
			autoclose: true,
			todayHighlight: false,
			minView: 2,
			startDate: tomorrow
		});
		$('.bootbox input, .bootbox select').on('blur', function(e) {
			validate($(this));
		});
		var shbh = $('#shbh'),
			elp = shbh.parents('.form-group:first');
		accountCheck.check({
			el: shbh,
			elp: elp,
			ajaxComplete: function(ajaxReturn, pass) {
				var $shbh = $('#shbh');
				var accountInfo = $shbh.parent().find('.error-info.account');
				var emptyInfo = $shbh.parent().find('.error-info.empty');

				if ($shbh.val() == '') {
					if (!emptyInfo.size()) {
						$shbh.parent().append('<div class="error-info empty">' + $shbh.data('emptyinfo') + '</div>');
					} else {
						emptyInfo.show();
					}
				} else {
					emptyInfo.hide();
					if (!accountCheck.isPass()) {
						$shbh.parents('.form-group:first').addClass('has-error');
						if (!accountInfo.size()) {
							$shbh.parent().append('<div class="error-info account">该账号不存在，请重新输入！</div>');
						} else {
							accountInfo.show();
						}
					} else {
						accountInfo.hide();
					}
				}
			}
		});
	}

	/**
	 * [validate 检验函数]
	 * @param  {[HTML Element]} el [要校验的元素，不传递则全部检查]
	 * @return {[Boolean]}    [description]
	 */
	function validate(el) {
		var pass = true,
			errorInfo, msg, val, len, min, max;

		if (el) {
			var elp = el.parents('.form-group:first');
			if (el.data('date-format')) {
				// if (!isDate(el.val())) {
				// 	pass = false;
				// 	elp.addClass('has-error');
				// 	if (el.parent().parent().find('.error-info').size()) {
				// 		el.parent().parent().find('.error-info').show();
				// 	} else {
				// 		el.parent().parent().append('<div class="error-info">请填写正确的日期。</div>');
				// 	}
				// } else {
				// 	elp.removeClass('has-error');
				// 	elp.find('.error-info').hide();
				// }
			} else if (el.data('empty')) {
				errorInfo = elp.find('.error-info.empty');
				if ('' == el.val().trim()) {
					msg = el.data('emptyinfo');
					elp.addClass('has-error');
					if (!errorInfo.size()) {
						el.parent().append('<div class="error-info empty">' + msg + '</div>');
					} else {
						errorInfo.show();
					}
				} else {
					elp.removeClass('has-error');
					errorInfo.hide();
				}
			} else if (el.data('len')) {
				len = el.data('len').split(','),
					min = len[0],
					max = len[1],
					val = el.val().trim();
				errorInfo = elp.find('.error-info.len');
				if (null != min && null != max) {
					if (min - 0 <= val.length && val.length <= max - 0) {
						elp.removeClass('has-error');
						errorInfo.hide();
					} else {
						msg = el.data('leninfo');
						elp.addClass('has-error');
						if (errorInfo.size()) {
							errorInfo.show();
						} else {
							el.parent().append('<div class="error-info len">' + msg + '</div>')
						}
					}
				}
			}
		} else {
			$('.bootbox input').each(function(i, v) {
				var $el = $(this),
					$p = $el.parents('.form-group:first'),
					isInt = $el.data('int'),
					isEmpty = $el.data('empty'),
					isDate = $el.hasClass('datepicker'),
					isLen = $el.data('len'),
					emptyInfo = $el.parent().find('.error-info.empty'),
					lenMsg = $el.data('leninfo');
				if (isDate) {
					if (Utils.isDate($el.val())) {
						$p.removeClass('has-error');
						$el.parent().parent().find('.error-info').remove();
					} else {
						pass = false;
						$p.addClass('has-error');
						if ($el.parent().parent().find('.error-info').size()) {
							$el.parent().parent().find('.error-info').show();
						} else {
							$el.parent().parent().append('<div class="error-info">请填写正确的日期。</div>');
						}
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
						if (emptyInfo.size()) {
							emptyInfo.hide()
						}
					} else {
						pass = false;
						$p.addClass('has-error');
						if (emptyInfo.size()) {
							emptyInfo.show();
						} else {
							$el.parent().append('<div class="error-info empty">' + $el.data('emptyinfo') + '</div>');
						}
					}
				}
				if (isLen) {
					val = $el.val().trim();
					len = $el.data('len').split(',');
					min = len[0];
					max = len[1];
					errorInfo = $p.find('.error-info.len');

					if (null != min && null != max) {
						if (min - 0 <= val.length && val.length <= max - 0) {
							$p.removeClass('has-error');
							errorInfo.size() && errorInfo.hide();
						} else {
							pass = false;
							$p.addClass('has-error');
							if (errorInfo.size()) {
								errorInfo.show();
							} else {
								$el.parent().append('<div class="error-info len">' + lenMsg + '</div>');
							}
						}
					}
				}
				// if ('xxsj' == $el.attr('id')) {
				// 	val = $el.val();
				// 	errorInfo = $p.find('.error-info');
				// 	if (val) {
				// 		try {
				// 			if (new Date(val).getTime() < new Date(Utils.date.getTodayStr() + ' 00:00:00').getTime()) {
				// 				if (errorInfo.size()) {
				// 					errorInfo.html('请选择正确的日期。');
				// 				} else {
				// 					$el.parent().parent().append('<div class="error-info len">请选择正确的日期。</div>');
				// 				}
				// 				$p.addClass('has-error');
				// 				pass = false;
				// 			} else {
				// 				errorInfo.hide();
				// 				$p.removeClass('has-error');
				// 			}
				// 		} catch (e) {
				// 			pass = false;
				// 		}
				// 	}
				// }
			});
		}

		return accountCheck.isPass() && pass;
	}

	/**
	 * [isDate 检查数据是否是日期类型]
	 * @param  {[String]}  d [要检查的字符串]
	 * @return {Boolean}   [返回值]
	 */
	function isDate(d) {
		return Utils.isDate(d);
	}

	/**
	 * [fillData 编辑时，填充数据]
	 * @param  {[Object]} d [选中行数据]
	 * @return {[type]}   [description]
	 */
	function fillData(d) {
		var data = d[0] || {};
		if (data.merchantId) {
			$('#shbh').val(data.merchantId);
		}
		if (data.cardNumber) {
			$('#yhzh').val(data.cardNumber);
		}
		if (data.userName) {
			$('#khm').val(data.userName);
		}
		if (data.issuer) {
			$('#fissuer').val(data.issuer);
		}
		if (data.priority) {
			$('#yxj').val(data.priority);
		}
		if (data.status) {
			$('#zt').val(data.status);
		}
		if (data.cardType) {
			$('#lx').val(data.cardType);
		}
		if (data.effectiveDate) {
			$('#sxsj').val(data.effectiveDate);
		}
		if (data.expirationDate) {
			$('#xxsj').val(data.expirationDate);
		}
		$('#shbh').focus();
		setTimeout(function() {
			$('#shbh').blur();
		}, 0);
	}

	/**
	 * [submitData 最终的数据提交]
	 * @param  {[Object]} d [选中行的数据]
	 * @return {[type]}   [description]
	 */
	function submitData(d) {
		var id = d && d[0] && d[0].id || '',
			data = {
				id: id
			},
			merchantId = $('#shbh').val(),
			cardNumber = $('#yhzh').val(),
			userName = $('#khm').val(),
			priority = $('#yxj').val(),
			status = $('#zt').val(),
			cardType = $('#lx').val(),
			fissuer = $('#fissuer').val(),
			effectiveDate = $('#sxsj').val(),
			expirationDate = $('#xxsj').val();
		if (merchantId) {
			data.merchantId = merchantId;
		}
		if (cardNumber) {
			data.cardNumber = cardNumber;
		}
		if (userName) {
			data.userName = userName;
		}
		if (priority) {
			data.priority = priority;
		}
		if (status) {
			data.status = status;
		}
		if (cardType) {
			data.cardType = cardType;
		}
		if (effectiveDate) {
			data.effectiveDate = effectiveDate;
		}
		if (expirationDate) {
			data.expirationDate = expirationDate;
		}
		data.issuer = fissuer;
		$.ajax({
			url: global_config.serverRoot + 'settleCard/addOrUpdate',
			method: 'post',
			data: data,
			success: function(json) {
				if ('0' == json.code) {
					_grid.load();
					Box.alert('数据保存成功.');
				} else if (-100 == json.code) {
					location.reload();
				} else {
					Box.alert('数据保存失败！');
				}
			},
			error: function(json) {
				Box.alert('数据保存失败~');
			}
		});
	}

	/**
	 * [viewHistory 查看历史记录]
	 * @param  {[Array]} row [选中行的数组]
	 * @return {[type]}     [description]
	 */
	function viewHistory(row) {
		var id = row[0].id;
		if (!actionLock.viewHistory) {
			actionLock.viewHistory = true; // 正在访问，不可以连续访问
			$.ajax({
				url: global_config.serverRoot + '/settleCard/history?userId=' + '&id=' + id,
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
			});
			setTimeout(function() {
				actionLock.viewHistory = false;
			}, lockInterval);
		}
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
	 * [showDialog 展示对话框]
	 * @param  {[type]} opt [参数]
	 * @return {[type]}     [description]
	 */
	function showDialog(opt) {
		Box.dialog(opt);
	}

	/**
	 * [getUrl 获取查询url]
	 * @return {[type]} [description]
	 */
	function getUrl() {
		return global_config.serverRoot + 'settleCard/list?userId=&sort=merchantIds&' + Utils.object2param(userParam);
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

	function download() {
		var a = document.createElement('a');
		var url = global_config.serverRoot + '/settleCard/template?userId=';
		a.href = url;
		a.target = '_blank';
		a.height = 0;
		a.width = 0;
		document.body.appendChild(a);
		var e = document.createEvent('MouseEvents');
		e.initEvent('click', true, false);
		a.dispatchEvent(e);
		a.remove();
	}

	function importExcel() {

	}

	/**
	 * [registerEvents 注册事件]
	 * @return {[type]} [description]
	 */
	function registerEvents() {
		doms.commercialIds = $('#commercialIds');
		doms.issuer = $('#issuer');
		doms.userName = $('#userName');
		doms.cardNumber = $('#cardNumber');
		doms.cardType = $('#cardType');
		doms.status = $('#status');
		doms.effectiveDateStart = $('#effectiveDateStart');
		doms.effectiveDateEnd = $('#effectiveDateEnd');
		doms.expirationDateStart = $('#expirationDateStart');
		doms.expirationDateEnd = $('#expirationDateEnd');

		$('#add-btn').on('click', function() {
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
				id = $el.attr('id');
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
				doms.commercialIds.val('');
				doms.issuer.val('');
				doms.userName.val('');
				doms.cardNumber.val('');
				doms.cardType.val(0);
				doms.status.val(0);
				doms.effectiveDateStart.val('');
				doms.effectiveDateEnd.val('');
				doms.expirationDateStart.val('');
				doms.expirationDateEnd.val('');
			}
			if (cls && cls.indexOf('edit') > -1) {
				addAndUpdate([dataMap[$el.data('id')]]);
			}
			if (cls && cls.indexOf('view') > -1) {
				viewHistory([{
					id: $el.data('id')
				}]);
			}
		});
		$('#downtemplate-btn').on('click', function() {
			download();
		});
		$('#import-btn').fileupload({
			url: "",
			beforeSend: function(e, data) {
				data.url = global_config.serverRoot + "/settleCard/importReturnJson?userId=" + "&t=" + Math.random();
			},
			start: function() {
				art_dialog.loading.start("uploading");
			},
			always: function(e, data) {
				art_dialog.loading.end();
				if (data.result) {
					(typeof data.result === "string") && (data.result = JSON.parse(data.result));
					if (data.result.code == 0) {
						if (data.result.data.Failed == 0 && data.result.data.Updated == 0) {
							art_dialog.error('导入成功', data.result.msg);
							console.log('reload data grid.');
						} else {
							var html = [],
								d;
							html.push('<div class="col-xs-12 no-padding" style="height:200px; overflow-x:hidden; overflow-y:auto;">');
							html.push('<table class="table table-striped table-bordered table-hover no-padding">');
							html.push('<thead><tr><th>编号</th><th>状态</th><th>描述</th></tr></thead>');
							html.push('<tbody>');
							for (var i = 0; i < data.result.data.dataArray.length; i++) {
								d = data.result.data.dataArray[i];
								html.push('<tr>');
								html.push('<td>' + (i + 1) + '</td>');
								html.push('<td>' + d.uploadStatus + '</td>');
								html.push('<td>' + d.comment + '</td>');
								html.push('</tr>');
							}
							html.push('</tbody>');
							html.push('</table>');
							html.push('</div>');
							art_dialog.error(data.result.data.Failed == 0 ? '导入成功' : '导入失败', html.join(''));
						}
						_grid.loadData();
					} else {
						art_dialog.error('导入失败', data.result.msg);
					}
				}
			}
		});
	}

	function getParams() {
		var newchange = false,
			newParam = {},
			commercialId = doms.commercialIds.val(),
			issuer = doms.issuer.val(),
			userName = doms.userName.val(),
			cardNumber = doms.cardNumber.val(),
			cardType = doms.cardType.val(),
			status = doms.status.val(),
			effectiveDateStart = doms.effectiveDateStart.val(),
			effectiveDateEnd = doms.effectiveDateEnd.val(),
			expirationDateStart = doms.expirationDateStart.val(),
			expirationDateEnd = doms.expirationDateEnd.val();
		if (commercialId) {
			newParam.merchantIds = commercialId;
		}
		if (issuer) {
			newParam.issuer = issuer;
		}
		if (userName) {
			newParam.userName = userName;
		}
		if (cardNumber) {
			newParam.cardNumber = cardNumber;
		}
		if (cardType != '0') {
			newParam.cardType = cardType;
		}
		if (status != '0') {
			newParam.status = status;
		}
		if (isDate(effectiveDateStart)) {
			newParam.effectiveDateStart = effectiveDateStart;
		}
		if (isDate(effectiveDateEnd)) {
			newParam.effectiveDateEnd = effectiveDateEnd;
		}
		if (isDate(expirationDateStart)) {
			newParam.expirationDateStart = expirationDateStart;
		}
		if (isDate(expirationDateEnd)) {
			newParam.expirationDateEnd = expirationDateEnd;
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

	exports.init = init;
});