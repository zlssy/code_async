/**
 * Created by xueyan.hu on 2015/9/28.
 */
define(function(require, exports, module) {
    var Xss = require("xss"),
        _cacheDataDictionary = {},
        art_dialog = require('dialog');

    /*
    * param
    * el:dom节点
    * options：{"value":"innerValue","label":"label"}
    *
    * */
    function renderSelect(el, options) {
        var l = arguments.length, dataArray, type = el.attr("dict-name"),
            def_value, value, label;
        getData(type, function (res) {
            dataArray = res.dataArray || [];
            if (dataArray.length) {
                for (var i = 0; i < dataArray.length; i++) {
                    value = ((l === 2) ? dataArray[i][options.value] : dataArray[i].innerValue);
                    label = ((l === 2) ? Xss.inHTMLData(dataArray[i][options.label]) : dataArray[i].label);
                    $.each(el, function (i, k) {
                        def_value = $(k).attr("data-def-value");
                        if (value == def_value) {
                            $(k).append('<option selected value="' + value + '">' +label + '</option>');
                        } else {
                            $(k).append('<option value="' + value + '">' +label + '</option>');
                        }
                    });
                }
            }
        });
    }

    function getData(type, callback) {
        if (_cacheDataDictionary[type]) {
            callback(_cacheDataDictionary[type]);
            return;
        }
        $.ajax({
            url: global_config.serverRoot + 'dataDictionary/dropdownlist?userId=' + '&type=' + type,
            success: function (res) {
                if (res.code == 0) {
                    _cacheDataDictionary[type] = res.data;
                    callback(res.data);
                } else {
                    art_dialog.error('错误', res.msg);
                }
            }
        });
    }

    return renderSelect;

});