define(function(require, exports, module) {
	var Table = require('whygrid');
	var tool = require("why");
	var D = window.D = require("dialog.ace");
	var rooturl = global_config.serverRoot.replace(/\/+$/, '');
	var apis = {
		list: rooturl + '/reconciliation/chargeDifference', //clearingDetail/list
		typeList: rooturl + '/dataDictionary/dropdownlist',
		down: rooturl + '/downloadTradeRecord'
	}
	var T;
	var errfun = function(e) {
		var msg = typeof e == 'object' ? e.statusText || e.msg || "未知错误!" : e;
		D.err(msg);
	}
	var dataTypes = {};

	$(function() {
		T = Table('#grid_list', apis.list, {
			checkRow: false,
			seachForm: '#sform',
			//oldApi: true, //是否是老接口
			pagenav: true,
			cols: [{
				name: '到账日期',
				index: 'tradeEndDate'
			}, {
				name: '渠道编号',
				index: 'payChannelId'
			}, {
				name: '渠道名称',
				index: 'payChannelName'
			}, {
				name: '商户编号',
				index: 'merchantId'
			}, {
				name: '商户名称',
				index: 'merchantName'
			}, {
				name: '交易用户账号',
				index: 'payer'
			}, {
				name: '系统金额',
				index: 'amount'
			}, {
				name: '渠道金额',
				index: 'channelTranAmount'
			}, {
				name: '系统手续费',
				index: 'cost',
				width: 100
			}, {
				name: '渠道手续费',
				index: 'channelCharge',
				width: 100
			}, {
				name: '手续费差',
				index: 'chargeSubtract'
			}]
		});
		//bin_comm();
		init();
		//$("#startDate,#endDate").attr('title','双击清除').on("dblclick",function(){$(this).val('')})
		$('#startDate,#endDate').datetimepicker({
			format: 'yyyy-mm-dd',
			autoclose: true,
			todayHighlight: true,
			minView: 2
		});
	});

	function init() {
		var stypes = $("#sform").find('select[data-typename]');
		var ajaxArr = []
		for (var i = 0; i < stypes.length; i++) {
			+ function() {
				var s = $(stypes[i]);
				var typename = s.data('typename');
				ajaxArr.push($.get(apis.typeList, {
					type: s.data('typename')
				}, function(data) {
					if (data.code != 0) {
						return $.Deferred().reject(data.message || data.msg || "未知错误!")
					}
					if (data.data && data.data.dataArray) {
						var html = '',
							arr = data.data.dataArray;
						dataTypes[typename] = arr;
						for (var i = 0; i < arr.length; i++) {
							var item = arr[i];
							html += '<option value=' + item.innerValue + '>' + item.label + '</option>'
						}
					}
					s.append(html);
				}))
			}()
		}
		$.when.apply($, ajaxArr).then(function() {
			T.load(); //加载列表数据;
		}).then(null, function(e) {
			D.err("初始化失败!")
		});

		registerEvents();
	}

	function registerEvents() {
		var startDate = $('#startDate'),
			endDate = $('#endDate');

		$('.date-list').on('click', 'li', function(e) {
			var $el = $(this),
				val = $el.data('index'),
				sd, ed, weekday, day;

			$('.date-list > li').removeClass('active');
			$el.addClass('active');

			switch (val) {
				case 1: // 今天					
					sd = getDiffDateStr(0);
					ed = getDiffDateStr(0);
					break;
				case 2: // 昨天
					sd = getDiffDateStr(-1);
					ed = getDiffDateStr(-1);
					break;
				case 3: // 本周
					weekday = new Date().getDay();
					sd = getDiffDateStr(-weekday);
					ed = getDiffDateStr(0);
					break;
				case 4: // 上周
					weekday = new Date().getDay();
					sd = getDiffDateStr(-7-weekday);
					ed = getDiffDateStr(-weekday);
					break;
				case 5: // 本月
					day = new Date().getDate();
					sd = getDiffDateStr(-day+1);
					ed = getDiffDateStr(0);
					break;
				case 6: //上月
					day = new Date().getDate();
					ed = getDiffDateStr(-day);
					sd = ed.replace(/(\-\d+$)/, '-1');
					break;
				default: // 出错情况

			}

			startDate.val(sd);
			endDate.val(ed);
		});
	}

	function getDiffDateStr(day) {
		var d = new Date();
		var date = new Date(d.getTime() + day * 24 * 3600000);
		return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
	}

	exports.init = function() {};
});