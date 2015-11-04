//适合ace admin样式,调用jQuery Dialog的弹框的一套语法糖 
//author why
define(function(require, exports, module) {
//var dialog = require('jqueryui.dialog.js');
$.widget("ui.dialog",$.extend({}, $.ui.dialog.prototype,{
	_title: function(title){
		var $title = this.options.title || "";
		if(("title_html" in this.options) && this.options.title_html == true) title.html($title);
		else title.test($title);
	}
}))
var typeOf = function(obj){
    var test = typeof(obj);
    var types = { 'array' : Array,'date' : Date,'error' : Error,'regexp' : RegExp}
    if(obj !== obj) return 'nan'
    if (typeof(HTMLElement) != 'undefinde' && typeof(HTMLElement) == 'function') types['element'] = HTMLElement
    if (typeof(jQuery) != 'undefinde' && typeof(jQuery) == 'function') types['jquery'] = jQuery
    if (test == 'object') {
        if (obj == null) return 'null'
        for (a in types) {
            if (obj instanceof types[a]) return a
        }
        return 'object'
    } else {
        return test;
    }
}

//jQuery UI Dialog 语法糖
var dialog = {
    defindeOp : {//弹出提示的默认配置
        title: 'dialog',
        title_html: true,
        width: '350',
        minHeight : 'none',
        closeText : '关闭',
        //dialogClass: 'qida-dialog',
        modal: false,
        resizable: false,
        external: true,
        draggable: true,
        close: function(){$(this).dialog('destroy')}
    },
    getTitleHtml: function(txt){
    	return '<div class="widget-header widget-header-small"><h4 class="smaller">{title}</h4></div>'.replace("{title}",txt)
    },
    style: {//样式的默认配置
        alert:{box:'<div class="alert" style="word-wrap:break-word;word-break:break-all"></div>',textselect:'>div'}
        ,tip:{box:'<div class="ui-dialog-alert" style="word-wrap:break-word;word-break:break-all"><table class="tablemsg"><tr><td class="msgtext"><div></div></td></tr></tr></table></div>',textselect:'td.msgtext div'}
        ,confirm:{box:'<div class="alert" style="word-wrap:break-word;word-break:break-all"></div>',textselect:'>div'}
        ,err:{
            //box:'<div class="row"><div class="col-md-4 text-center bigger-230"><i class="glyphicon glyphicon-remove"></i></div><div class="msgtext col-md-8"></div></div>'
            box:'<div class="row"><table style="width:100%"><tr><td class="col-md-4 text-center bigger-230 red"><i class="glyphicon glyphicon-remove"></i></td><td class="msgtext col-md-8"><div style="word-wrap:break-word;word-break:break-all"></div></td></tr></table></div>'
            ,textselect:"td.msgtext div"
        }
        ,suss:{
            //box:'<div class="ui-dialog-alert"><table class="tablemsg"><tr><td class="ico suss"><i class="glyphicon glyphicon-ok"></i></td><td class="msgtext"><div></div></td></tr></table></div>'
            box:'<div class="row"><table style="width:100%"><tr><td class="col-md-4 text-center bigger-230 green"><i class="glyphicon glyphicon-ok"></i></td><td class="msgtext col-md-8"><div style="word-wrap:break-word;word-break:break-all"></div></td></tr></table></div>'
            ,textselect:"td.msgtext div"
        }
    }
    
    //普通提示框
    //必须参数1，2：（提示内容，标题）
    //可选参数3,4(模态窗口，回调函数)
    //反回jQuery对像
    ,alert:function(content,title,lock,callback){
        var obj = $('<div>'+this.style.alert.box+'</div>')
        var option = {
            title : this.getTitleHtml(title || '提示')
            ,buttons:[{
        		text:'确定'
            	,'class':'btn btn-minier btn-success'
            	,'click':function(){
                	$(this).dialog('close');
            	}
            }]
        }

        if(arguments.length>2){
            if(typeof arguments[2] != "function"){
                option.modal = !!arguments[2];
            }
            if(typeof arguments[arguments.length-1] == "function"){
                var callback = arguments[arguments.length-1];
                option.buttons['确定'] = function(){
                    if(callback(this) !== false){
                        $(this).dialog('close');
                    }
                }
            }
        }
        if(typeOf(content) == 'jquery' || typeOf(content) == 'element'){
            obj = $("<div>").append($(content));
        }else{
            obj.find(this.style.confirm.textselect).html(content)
        }
        return obj.dialog($.extend({},this.defindeOp,option));
    }
    /* 选择提示框
     * 参数12（标题，提示内容）
     * 可选参数3,4(确定回调，取消回调)
    */
    ,confirm:function(content,title,yes,no,_option){
        var obj = $('<div>'+this.style.confirm.box+'</div>')
            ,option = {
                modal: true,
                title : this.getTitleHtml(title || '提示'),
                buttons: []
            }
            ,yesfun,nofun;
            
        yesfun = yes;
        nofun = no;
        var buttons = {
                'Y':{
                    text : "确定", 
                    'class' : 'btn btn-minier btn-success',
                    click : function(){
                        if(typeof(yesfun) == 'function'){
                            if(yesfun(this) !== false) $(this).dialog('close')
                        }else{
                            $(this).dialog('close')
                        }
                    }
                }
                ,'N':{
                    text : "取消", 
                    'class' : 'btn btn-minier',
                    click : function(){
                        if(typeof(nofun) == 'function'){
                            if(nofun(this) !== false) $(this).dialog('close')
                        }else{
                            $(this).dialog('close')
                        }
                    }
                }
            }
        var addbutton = function(txt,obj,e){
            var type = typeOf(obj)
            if(type == "array"){
                var butobj = {text: obj[0],'class':buttons[txt]['class']}
                    ,fun = typeOf(obj[1]) == "function" ? obj[1] : function(){$(this).dialog('close')};
                butobj.click = function(){
                        if(fun(this) !== false) $(this).dialog('close')
                    };
                option.buttons.push(butobj);
            }else if(type == 'object' && obj.text){
                option.buttons.push(obj)
            }else{
                option.buttons.push(buttons[txt]) 
            }       
        }
        addbutton('Y',yesfun,1)
        addbutton('N',nofun,0)
        if(typeOf(content) == 'jquery' || typeOf(content) == 'element'){
            obj = $("<div></div>").append($(content));
        }else{
            obj.find(this.style.confirm.textselect).html(content)
        }
        return obj.dialog($.extend({},this.defindeOp,option,_option));
    }
    ,tip: function (content,closeTime,callback){
        var obj = $('<div>'+this.style.tip.box+'</div>')
        var option = {
            modal: false,
            title : '',
            width : 200,
            open:function(){
                $(this).parents("div.ui-dialog").find("div.ui-dialog-titlebar").hide();
            }
        }
        ,xc,time = closeTime ? closeTime : 1200
        ,callback = typeof arguments[arguments.length-1] == "function" ? arguments[arguments.length-1] : null;
        option.close = function(){clearTimeout(xc); typeof(callback) == 'function' && callback(this); $(this).dialog('destroy'); }
        obj.find(this.style.tip.textselect).html(content);
        if(time > 0){
            xc = setTimeout(function(){obj.dialog('close');},time)
        }
        return obj.dialog($.extend({},this.defindeOp,option));
    }
    //错误提示框
    ,err: function(content,title,lock,callback){
        var obj = $('<div>'+this.style.err.box+'</div>')
        var option = {
            modal: true
            ,title : this.getTitleHtml(title || '提示')
            ,buttons:[{
        		text:'确定'
            	,'class':'btn btn-minier btn-success'
            	,'click':function(){
                	$(this).dialog('close');
            	}
            }]
        }
        if(arguments.length>2){
            if(typeof arguments[2] != "function"){
                option.modal = !!arguments[2];
            }
            if(typeof arguments[arguments.length-1] == "function"){
                var callback = arguments[arguments.length-1];
                option.buttons['确定'] = function(){
                    if(callback(this) !== false){
                        $(this).dialog('close');
                    }
                }
            }
        }
        obj.find(this.style.err.textselect).html(content || '无错描述！')
        return obj.dialog($.extend({},this.defindeOp,option));
    }
    //成功提示框
    ,suss: function(content,title){
        var obj = $('<div>'+this.style.suss.box+'</div>')
        var option = {
            modal: false,
            title : this.getTitleHtml(title || '提示')
        }
        ,xc,time = time ? time : 1200
        ,callback = typeof arguments[arguments.length-1] == "function" ? arguments[arguments.length-1] : null;
        if(arguments.length>2){
            if(typeof arguments[2] == "number"){
                time = arguments[2];
            }
        }
        option.close = function(){clearTimeout(xc); typeof(callback) == 'function' && callback(this); $(this).dialog('destroy'); }
        obj.find(this.style.suss.textselect).html(content);
        if(time > 0){
            xc = setTimeout(function(){obj.dialog('close');},time)
        }
        return obj.dialog($.extend({},this.defindeOp,option));
    }
    ,dialog: function(content,op){
        var obj = $('<div></div>')
            ,option = op ? op : {}
        if(typeOf(content) == 'jquery' || typeOf(content) == 'element'){
            obj.append($(content))
        }else{
            obj.html(content)
        }
        option.title = this.getTitleHtml(option.title);
        return obj.dialog($.extend({},this.defindeOp,option));
    }
}
module.exports = dialog;

})