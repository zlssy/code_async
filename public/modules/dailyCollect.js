define(function(require, exports, module) {
	var Table = require('whygrid');
	var tool = require("why");
	var D = window.D = require("dialog.ace");
	var rooturl = global_config.serverRoot.replace(/\/+$/, '');
	var apis = {
		list: rooturl + '/reconciliation/list', //clearingDetail/list
		typeList: rooturl + '/dataDictionary/dropdownlist',
		down: rooturl + '/downloadTradeRecord'
	}
	var T;
	var errfun = function(e) {
		var msg = typeof e == 'object' ? e.statusText || e.msg || "未知错误!" : e;
		D.err(msg);
	}
	var dataTypes = {};
	var datamap = {};

	$(function() {
		T = Table('#grid_list', apis.list, {
			checkRow: false,
			seachForm: '#sform',
			//oldApi: true, //是否是老接口
			pagenav: true,
			cols: [{
				name: '到账日期',
				index: 'arrivalDate'
			}, {
				name: '渠道编号',
				index: 'payChannelId'
			}, {
				name: '渠道名称',
				index: 'payChannelName'
			}, {
				name: '系统交易总数量',
				index: 'sysTradeTrans'
			}, {
				name: '渠道交易总数量',
				index: 'chaTradeTrans'
			}, {
				name: '交易币种',
				index: 'currencyCode'
			}, {
				name: '系统交易总金额',
				index: 'sysTotalAmount'
			}, {
				name: '渠道交易总金额',
				index: 'chaTotalAmount',
				width: 120
			}, {
				name: '系统单边帐笔数',
				index: 'sysUniAccTrans',
				width: 120,
				format: function(tr, x, y) {
					datamap[y] = tr;
					return '<a href="javascript:void(0)" data-type="5" data-index="' + y + '">' + tr[this.index] + '</a>';
				}
			}, {
				name: '渠道单边账笔数',
				index: 'chaUniAccTrans',
				width: 120,
				format: function(tr, x, y) {
					return '<a href="javascript:void(0)" data-type="4" data-index="' + y + '">' + tr[this.index] + '</a>'
				}
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
							html += '<option value=' + item.label + '>' + item.label + '</option>'
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
					sd = getDiffDateStr(-7 - weekday);
					ed = getDiffDateStr(-weekday);
					break;
				case 5: // 本月
					day = new Date().getDate();
					sd = getDiffDateStr(-day + 1);
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

		$('#grid_list').on('click', '[data-type][data-index]', function(e) {
			var $el = $(this),
				type = $el.data('type'),
				index = $el.data('index'),
				d, url, grid;
			if (type > -1 && index > -1) {
				d = datamap[index];
				if (d) {
					url = rooturl + '/reconciliation/getDetail?arrivalDateStart=' + d.arrivalDate + '&arrivalDateEnd=' + d.arrivalDate + '&payChannelName=' + d.payChannelName + '&unilateralAccount=' + type + '&currencyCode=' + d.currencyCode + '&t=' + Math.random();
					D.dialog('<div id="detailList" style="max-height:500px;"></div>', {
						title: '明细',
						position:{
							my:'center top',
							at: 'center top'
						},
						width: 960,						
						modal: true
					});
					grid = Table('#detailList', url, {
						pagenav: false,
						cols:[{
							name: '交易时间',
							index: 'tradeEndDate'
						},{
							name: '渠道编号',
							index: 'payChannelId'
						},{
							name: '渠道名称',
							index: 'payChannelName'
						},{
							name: '交易流水号',
							index: 'payOrderId'
						},{
							name: '系统用户账号',
							index: 'payer'
						},{
							name: '渠道用户账号',
							index: 'payReceiver'
						},{
							name: '系统金额',
							index: 'amount'
						},{
							name: '渠道金额',
							index: 'channelTranAmount'
						},{
							name: '系统成本',
							index: 'cost'
						},{
							name: '渠道成本',
							index: 'channelCharge '
						},{
							name: '类型',
							index: 'reconciliationStatus',
							format: function(tr, x, y){
								var v = tr[this.index], r;
								switch(v){
									case 1:
										r = '未对账';
									break;
									case 2:
										r = '正常对账';
									break;
									case 3:
										r = '跨日交易';
									break;
									case 4:
										r = '渠道单边';
									break;
									case 5:
										r = '系统单边';
									break;
									case 6:
										r = '手续费差';
									break;
									case 7:
										r = '金额或币种错误';
									break;
									default:
										r = ' ';
								}
								return r;
							}
						}]
					});
					var func = grid.option.getSearch;
					grid.option.getSearch = function(){
						var s = func();
						s.pageSize = 10000;
						return s;
					}
					grid.load();
					// $.ajax({
					// 	url: rooturl + '/reconciliation/getDetail?arrivalDateStart=' + d.arrivalDate + '&arrivalDateEnd=' + d.arrivalDate + '&payChannelName=' + d.payChannelName + '&unilateralAccount=' + type + '&currencyCode=' + d.currencyCode + '&t=' + Math.random(),
					// 	success: function(json) {
					// 		if ('0' == json.code) {

					// 		}
					// 	},
					// 	error: function(e) {
					// 		// report and retry

					// 	}
					// });
				}
			}
		});
	}

	function getDiffDateStr(day) {
		var d = new Date();
		var date = new Date(d.getTime() + day * 24 * 3600000);
		return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
	}

	exports.init = function() {};
});