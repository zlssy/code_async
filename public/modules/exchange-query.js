define(function(require, exports, module) {
    var Utils = require('utils'),
        Grid = require('gridBootstrap'),
        Table = require('whygrid'),
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
            dataUrl: global_config.serverRoot + "/exchangeRate/list",
            delUrl: global_config.serverRoot + "/exchangeRate/delete",
            detailUrl: global_config.serverRoot + "/exchangeRate/detail",
            addUrl: global_config.serverRoot + "/exchangeRate/addOrUpdate"
        },
        _grid,
        dataTypes = {},
        dataMap = {};

    function init() {
        //loadData();
        _grid = Table('#grid_list', getUrl(), {
            checkRow: false,
            seachForm: '#dataForm',
            pagenav: true,
            cols: [{
                name: '源币种',
                index: 'srcCurrencyCode'
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
                width: 90,
                format: function(v) {
                    dataMap[v.id] = v;
                    var html_arr = [
                        '<div class="ui-pg-div align-center">',
                        '<a href="javascript:void(0)" class="icon_edit" data-id="' + v.id + '">编辑</a>&nbsp;',
                        '<a href="javascript:void(0)" class="icon_trash" data-id="' + v.id + '">删除</a>',
                        '<div>'
                    ];
                    return html_arr.join('')
                }
            }]
        });
        var stypes = $("#dataForm").find('select[data-typename]');
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
                        // dictionaryCollection[typename] = arr;
                        for (var i = 0; i < arr.length; i++) {
                            var item = arr[i];
                            if ('exchangeStatus' == typename) {
                                val = item.innerValue;
                            } else {
                                val = item.label;
                            }
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
                name: '源币种',
                index: 'srcCurrencyCode'
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
                        '<span class="glyphicon icon_trash mr20 ace-icon glyphicon-trash blue" title="删除"></span>',
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

        $form.on("click", function(e) {
            var $el = $(e.target || e.srcElement);
            //查询
            if ($el.closest('#query-btn').length) {
                // userParam = $form.form2json();
                // if (userParam) {
                //     _grid.setUrl(getUrl());
                //     _grid.loadData();
                // }
            }
            //新增
            if ($el.closest('#add-btn').length) {
                showPop();
            }
        });

        //编辑
        $grid_list.on("click", ".icon_edit", function() {
            var $this = $(this),
                id = $this.data('id');
            editItem(id);
        });
        //删除
        $grid_list.on("click", ".icon_trash", function() {
            var $this = $(this),
                id = $this.data('id');
            delItem(id);
        });

        $('.datepicker').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            todayHighlight: true,
            minView: 2
        });
    }

    function editItem(id) {
        $.get(urls.detailUrl + "?id=" + id, function(res) {
            if (res.code == 0) {
                showPop(res.data);
            } else {
                art_dialog.error('错误', res.msg);
            }
        });
    }

    function getUrl() {
        return urls.dataUrl + '?userId=&' + Utils.object2param(userParam);
    }

    function delItem(id) {
        art_dialog.edit({
            title: '删除确认',
            content: '确实要删除该规则？',
            okValue: '确定',
            ok: function(v) {
                $.get(urls.delUrl + "?id=" + id, function(res) {
                    if (res.code == 0) {
                        _grid.load();
                    } else {
                        art_dialog.error('错误', res.msg);
                    }
                }, 'json');
            },
            cancel: function(v) {}
        });
        return;
    }

    function showPop(data) {
        data = data || {};
        var content = template('tpleditItem')(data),
            title = $.isEmptyObject(data) ? "新增汇率" : "编辑汇率",
            pop, $el, flag = false,
            submitInterval = 2000;
        pop = art_dialog.edit({
            title: title,
            content: content,
            skin: 'ui-dialog-edit-2',
            ok: function() {
                var $form = $el.find("form");
                //2秒内只发一次请求
                if (!flag) {
                    flag = true;
                    if (!formValid($form)) {
                        return false;
                    }
                    var val = $form.form2json();
                    doCreateItem(val, function() {
                        _grid.load();
                        pop.remove();
                    });
                }
                setTimeout(function() {
                    flag = false;
                }, submitInterval);
                return false;
            },
            cancel: function() {}
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

    function doCreateItem(data, callback) {
        $.post(urls.addUrl, data, function(res) {
            if (res.code == 0) {
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