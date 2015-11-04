define(function(require, exports, module) {
	var Utils = require('utils'),
		Grid = require('gridBootstrap'),
        form2json = require('form2json'),
        template = require('template'),
        art_dialog = require('dialog'),
        formValid = require("bv_valid"),
        renderSelect = require("renderSelect"),
		content = $('#content'),
		listContainer = $('#grid_list'),
        $form = $("#dataForm"),
        $grid_list = $("#grid_list"),
		userParam = {},
        urls = {
            dataUrl:global_config.serverRoot + "/exchangeRate/list",
            delUrl: global_config.serverRoot + "",
            detailUrl: global_config.serverRoot + "/exchangeRate/detail",
            addUrl: global_config.serverRoot + "/exchangeRate/addOrUpdate"
        },
		_grid;
	function init() {
		loadData();
	}

	function loadData() {
		_grid = Grid.create({
			key: 'id',
			checkbox: false,
			cols: [{
				name: '源币种',
				index: 'srcCurrencyCode',
                width:20
			}, {
				name: '目标币种',
				index: 'targetCurrencyCode'
			}, {
				name: '汇率',
				index: 'exchangeRate'
			}, {
				name: '状态',
				index: 'statusName'
			}, {
				name: '创建时间',
				index: 'creationDate'
			}, {
                name: '操作',
                index: '',
                format: function(v) {
                    var html_arr = [
                        '<div class="ui-pg-div align-center">',
                        '<span class="glyphicon icon_edit mr20 ace-icon glyphicon-pencil blue" title="编辑"></span>',
                        //'<span class="glyphicon icon_trash mr20 ace-icon glyphicon-trash blue" title="删除"></span>',
                        '<div>'
                    ];
                    return html_arr.join('')
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
		_grid.load();
        _grid.listen('renderCallback', function(v) {
            $('.ui-pg-div *[title]').tooltip({
                container: 'body'
            });
        });
        getSelect($form);
		registerEvents();
	}

	function registerEvents() {

        $form.on("click", function (e) {
            var $el = $(e.target || e.srcElement);
            //查询
            if ($el.closest('#query-btn').length) {
                userParam = $form.form2json();
                if (userParam) {
                    _grid.setUrl(getUrl());
                    _grid.loadData();
                }
            }
            //新增
            if ($el.closest('#add-btn').length) {
                showPop();
            }
        });

        //编辑
        $grid_list.on("click", ".icon_edit", function () {
            var $this = $(this),
                id = $this.closest("tr").attr('data-id');
            editItem(id);
        });
        //删除
        $grid_list.on("click", ".icon_trash", function () {
            var $this = $(this),
                id = $this.closest("tr").attr('data-id');
            delItem(id);
        });

		$('.datepicker').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            todayHighlight: true,
            minView:2
		});
	}

    function editItem(id) {
        $.get(urls.detailUrl + "?id=" + id, function (res) {
            if (res.code == 0) {
                showPop(res.data);
            } else {
                art_dialog.error('错误', res.msg);
            }
        });
    }

    function getUrl() {
        return  urls.dataUrl + '?userId=&' +  Utils.object2param(userParam);
    }

    function delItem(id) {
        $.post(urls.delUrl + "?id=" + id, function(res){
            if(res.code == 0){
                _grid.loadData();
            } else {
                art_dialog.error('错误', res.msg);
            }
        }, 'json');
    }

    function showPop(data) {
        data = data || {};
        var content = template('tpleditItem')(data),
            title = $.isEmptyObject(data) ? "新增汇率" : "编辑汇率",
            pop, $el;
        pop = art_dialog.edit({
            title: title,
            content:content,
            skin:'ui-dialog-edit-2',
            ok:function(){
                var $form =  $el.find("form");
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
        $el = $(pop.node);
        getSelect($el);
        pop.show();
    }

    function getSelect(parent) {
        renderSelect(parent.find("[dict-name=currencyCode]"), {
            "value": "code",
            "label": "label"
        });
        renderSelect(parent.find("[dict-name=exchangeStatus]"));
    }

    function doCreateItem(data, callback){
        $.post(urls.addUrl, data, function(res){
            if(res.code == 0){
                callback(res);
            } else {
                art_dialog.error('错误', res.msg);
            }
        }, 'json');
    }

	return {
		init: init
	};
});