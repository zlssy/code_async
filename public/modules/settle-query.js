define(function(require, exports, module) {
	var Utils = require('utils'),
		Grid = require('gridBootstrap'),
		Box = require('boxBootstrap'),
		Xss = require('xss'),
		Table = require('whygrid'),

		listContainer = $('#grid_list'),
		exportContainer = $('#export_panel'),
		userParam = {},
		dictionaryCollection = {},
		doms = {
			merchantIds: $("#merchantIds"),
			merchantName: $("#merchantName"),
			settleStatementIds: $("#settleStatementIds"),
			status: $("#status"),
			settleDateStart: $("#settleDateStart"),
			settleDateEnd: $("#settleDateEnd")
		},
		_grid,
		dataTypes = {},
		dataMap = {};

	function init() {
		_grid = Table('#grid_list', getUrl(),{
			checkRow: false,
			seachForm: '#sform',
			pagenav: true,
			cols: [{
				name: '结算单号',
				index: 'id'
			}, {
				name: '商户编码',
				index: 'merchantId'
			}, {
				name: '商户名称',
				index: 'merchantName'
			}, {
				name: '结算日期',
				index: 'settleDate'
			}, {
				name: '结算金额',
				index: 'settleAmount'
			}, {
				name: '起始清分日期',
				index: 'clearingDateStart'
			}, {
				name: '终止清分日期',
				index: 'clearingDateEnd'
			}, {
				name: '付款金额',
				index: 'payAmount'
			}, {
				name: '付款手续费',
				index: 'serviceCharge'
			}, {
				name: '结算币种',
				index: 'settleCurrencyCode'
			}, {
				name: '结算卡号',
				index: 'settleCardNumber'
			}, {
				name: '结算状态',
				index: 'settleStatus'
			}, {
				name: '操作',
				index: '',
				format: function(v, ov, col) {
					dataMap[v.id] = v;
					if ('1' == v.status) {
						return '<div class="ui-pg-div align-center"><a href="javascript:;" class="confirm" title="付款确认" data-id="'+v.id+'">付款确认</a></div>';
					} else {
						return ' '
					}
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
				name: '结算单号',
				index: 'id'
			}, {
				name: '商户编码',
				index: 'merchantId'
			}, {
				name: '商户名称',
				index: 'merchantName'
			}, {
				name: '结算日期',
				index: 'settleDate'
			}, {
				name: '结算金额',
				index: 'settleAmount'
			}, {
				name: '起始清分日期',
				index: 'clearingDateStart'
			}, {
				name: '终止清分日期',
				index: 'clearingDateEnd'
			}, {
				name: '付款金额',
				index: 'payAmount'
			}, {
				name: '付款手续费',
				index: 'serviceCharge'
			}, {
				name: '结算币种',
				index: 'settleCurrencyCode'
			}, {
				name: '结算卡号',
				index: 'settleCardNumber'
			}, {
				name: '结算状态',
				index: 'settleStatus'
			}, {
				name: '操作',
				index: '',
				format: function(v, ov, col) {
					if ('1' == col.status) {
						return '<div class="ui-pg-div align-center"><a href="javascript:;" class="confirm" title="付款确认">付款确认</a></div>';
					} else {
						return ' '
					}
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
			$('.ui-pg-div .confirm').on('click', function() {
				Box.confirm('是否要确认付款？', function(v) {
					if (v) {
						confirmPay(_grid.getSelectedRow());
					}
				});
			})
		});
		listContainer.html(_grid.getHtml());
		getDictionaryFromServer('settleStatus', function(json) {
			if ('0' == json.code) {
				dictionaryCollection.statusArr = json.data && json.data.dataArray || [];
				setSelect('statusArr', doms.status);
			}
		}, function(e) {

		});
		_grid.load();
		registerEvents();
	}

	function exportExcel() {
		var settleDateStart = $('#settleDateStart').val(),
			settleDateEnd = $('#settleDateEnd').val();
		if (!settleDateStart || !settleDateEnd) {
			Box.alert('请选择结算日期后下载。');
			return;
		}
		userParam.settleDateStart = settleDateStart;
		userParam.settleDateEnd = settleDateEnd;
		var a = document.createElement('a');
		var url = 'http://testtclpay.tclclouds.com/settlement/settleStatement/export?userId=&' + Utils.object2param(userParam);
		a.href = url; //global_config.serverRoot + '/settleStatement/export?userId=&' + Utils.object2param(userParam);
		a.target = '_blank';
		a.height = 0;
		a.width = 0;
		document.body.appendChild(a);
		var e = document.createEvent('MouseEvents');
		e.initEvent('click', true, false);
		a.dispatchEvent(e);
		a.remove();
	}

	function concatQuery() {
		getParams();
		$.ajax({
			url: global_config.serverRoot + 'settleStatement/total?userId=&' + Utils.object2param(userParam),
			success: function(json) {
				if ('0' == json.code) {
					exportContainer.html(Utils.formatJson($('#totalTpl').html(), json.data));
				} else {
					// report get concat fail
				}
			},
			error: function(e) {
				// report
			}
		})
	}

	function confirmPay(row) {
		var needPayRow = row[0] || {};
		var req = {
			userId: '',
			settleStatementId: needPayRow.id
		};
		$.ajax({
			url: global_config.serverRoot + '/settleStatement/paid',
			method: 'post',
			data: req,
			success: function(json) {
				if ('0' == json.code) {
					Box.alert('确认付款成功');
					// _grid.loadData();
					_grid.load();
				} else if ('110' == json.code) {
					Box.alert('改单已成功结算');
				} else if (-100 == json.code) {
					location.reload();
				} else {
					// report
					Box.alert('确认付款失败');
				}
			},
			error: function(e) {
				// report
				console.log(e);
			}
		})
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

	function registerEvents() {
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
				// 	exportContainer.html('');
				// }
			}
			if (cls && cls.indexOf('fa-coffee') > -1 || (id && 'concat-btn' == id)) {
				concatQuery();
			}
			if (cls && cls.indexOf('fa-download') > -1 || (id && 'download-btn' == id)) {
				exportExcel();
			}
			if (cls && cls.indexOf('fa-undo') > -1 || (id && 'reset-btn' == id)) {
				userParam = {};
				doms.merchantIds.val('');
				doms.merchantName.val('');
				doms.settleStatementIds.val('');
				doms.status.val(0);
				doms.settleDateStart.val('');
				doms.settleDateEnd.val('');
			}
			if(cls && cls.indexOf('confirm')>-1){
				confirmPay([dataMap[$el.data('id')]]);
			}
		});
	}

	function getUrl() {
		return global_config.serverRoot + 'settleStatement/list?userId=&' + Utils.object2param(userParam);
	}

	function getParams() {
		var newchange = false,
			newParam = {},
			merchantIds = $("#merchantIds").val(),
			merchantName = $("#merchantName").val(),
			settleStatementIds = $("#settleStatementIds").val(),
			status = $("#status").val(),
			settleDateStart = $("#settleDateStart").val(),
			settleDateEnd = $("#settleDateEnd").val();

		if (merchantIds) {
			newParam.merchantIds = merchantIds;
		}
		if (merchantName) {
			newParam.merchantName = merchantName;
		}
		if (settleStatementIds) {
			newParam.settleStatementIds = settleStatementIds;
		}
		if (status != '0') {
			newParam.settleStatus = status;
		}
		if (settleDateStart) {
			newParam.settleDateStart = settleDateStart;
		}
		if (settleDateEnd) {
			newParam.settleDateEnd = settleDateEnd;
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