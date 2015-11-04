define(function(require, exports, module) {
	var Utils = require('utils'),
        form2json = require('form2json'),
        template = require('template'),
		content = $('#content'),
        Table = require('whygrid'),
        tool = require("why"),
        rooturl = global_config.serverRoot.replace(/\/+$/,''),
        apis = {
            list : rooturl + '/queryWrongRecord',
            down : rooturl + '/downloadWrongRecord'
        },
		_grid;

	function init() {
		loadData();
	}

	function loadData() {
        T = Table('#grid_list',apis.list,{
            checkRow: false,
            seachForm: '#dataForm',
            oldApi:true,
            pagenav:true,
            cols: [{
                    name: '交易流水号',
                    index: 'payOrderId'
                }, {
                    name: '支付渠道',
                    index: 'payTool'
                }, {
                    name: '商户订单编号',
                    index: 'merchantOrderId'
                }, {
                    name: '商户编号',
                    index: 'tradeAmount'
                }, {
                    name: '商户名称',
                    index: 'tradeTrans'
                }, {
                    name: '订单日期',
                    index: 'orderTime'
                }, {
                    name: '对账日期',
                    index: 'checkTime'
                }, {
                    name: '交易类型',
                    index: 'transaction'
                }, {
                    name: '货币类型',
                    index: 'currency'
                }, {
                    name: '订单金额（元）',
                    index: 'orderAmount'
                }, {
                    name: '处理状态',
                    index: 'orderStatus'
                }, {
                    name: '差异类型',
                    index: 'differencesType'
                }, {
                    name: '操作',
                    index: 'tradeTrans'
            }],
            getBaseSearch: function(){
                var s = tool.QueryString.parse(location.hash.replace(/^\#/g,''));
                if(typeof s.startDate  == 'undefined' && typeof s.endDate == "undefined"){
                    s.startDate = tool.dateFormat(new Date(new Date() - (1000*60*60*24*30)),"yyyy-MM-dd")
                    s.endDate = tool.dateFormat(new Date(),"yyyy-MM-dd");
                    if($("#startDate").val() == "" && $("#endDate").val() == ""){
                        $("#startDate").val(s.startDate);
                        $("#endDate").val(s.endDate);
                    }
                }
                return s;
            }
        });
        T.load();
		registerEvents();
	}

	function registerEvents() {
		var evtListener = function(e) {
			var $el = $(e.target || e.srcElement);
            //新增
            if ($el.closest('#add-btn').length) {
                showPop();
            }
            //导出
            if ($el.closest('#export-btn').length) {
                exportExcel();
            }
		};

		$(document.body).on('click', evtListener);
        $(".datepicker").attr('title','双击清除').on("dblclick",function(){$(this).val('')});
        $('.datepicker').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            todayHighlight: true,
            minView:2
        });
	}

    function exportExcel() {
        var search = T.getSearch();
        if(typeof search !== "object"){
            search = tool.QueryString.parse(search);
        }
        delete search.pageNumber;
        delete search.PerPageItemsCount;
        var url = apis.down + "?" + tool.QueryString.stringify(search);
        window.open(url)
    }

    function showPop(data) {
        data = data || {};
        var content = template('tpleditItem')(data);
        var pop = dialog.edit({
            title:"新增汇率",
            content:content,
            skin:'ui-dialog-edit-2',
            ok:function(){

                var $form =  $("#dialog_form");
                if(!formValid($form)){
                    return false;
                }
                var val = $form.form2json();
                doCreateItem(val, function(){
                    _grid.loadData();
                    pop.remove();
                });
                return false;
            },
            cancel:function(){
            }
        });
        pop.show();
    }

    function doCreateItem(data, callback){
        $.post(global_config.serverRoot + "/exchangeRate/addOrUpdate", data, function(res){
            if(res.code == 0){
                callback(res);
            }
        }, 'json');
    }

	return {
		init: init
	};
});