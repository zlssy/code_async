/* why's public Class;
                   _ooOoo_
                  o8888888o
                  88" . "88
                  (| -_- |)
                  O\  =  /O
               ____/`---'\____
             .'  \\|     |//  `.
            /  \\|||  :  |||//  \
           /  _||||| -:- |||||-  \
           |   | \\\  -  /// |   |
           | \_|  ''\---/''  |   |
           \  .-\__  `-`  ___/-. /
         ___`. .'  /--.--\  `. . __
      ."" '<  `.___\_<|>_/___.'  >'"".
     | | :  `- \`.;`\ _ /`;.`/ - ` : | |
     \  \ `-.   \_ __\ /__ _/   .-` /  /
======`-.____`-.___\_____/___.-`____.-'======
                   `=---='
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
            佛祖保佑         永无BUG
*/
/*依赖jquery*/
define(function(require, exports, module) {

    //jQuery ui datepicker 默认中文
    if($.datepicker){
        $.datepicker.regional['zh-CN'] = {
          closeText: '关闭',
          prevText: '&#x3c;上月',
          nextText: '下月&#x3e;',
          currentText: '今天',
          monthNames: ['一月','二月','三月','四月','五月','六月',
          '七月','八月','九月','十月','十一月','十二月'],
          monthNamesShort: ['一','二','三','四','五','六',
          '七','八','九','十','十一','十二'],
          dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
          dayNamesShort: ['周日','周一','周二','周三','周四','周五','周六'],
          dayNamesMin: ['日','一','二','三','四','五','六'],
          weekHeader: '周',
          dateFormat: 'yy-mm-dd 00:00',
          firstDay: 1,
          isRTL: false,
          showMonthAfterYear: true,
          yearSuffix: '年'
        }
        $.datepicker.setDefaults($.datepicker.regional['zh-CN'])
    }
    
    //jquery ajax 默认数组传递方式修改
    $.ajaxSetup({traditional:true});

    //暴露到window中
    var why = window.why = exports;

    var typeOf = exports.typeOf = function(obj){
        var test = typeof(obj);
        var types = { 'array' : Array,'date' : Date,'error' : Error,'regexp' : RegExp}
        if(obj !== obj) return 'nan'
        if (typeof(HTMLElement) != 'undefinde' && (typeof(HTMLElement) == 'function' && typeof(HTMLElement) == 'object')) types['element'] = HTMLElement
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

    //从json对像及接点描述获取值
    var getMapdata = exports.getMapdata = function(json,map){
        var attrs = map.split('.');
        var obj = json;
        try{
            for(var i = 0; i < attrs.length; i++){
                obj = obj[attrs[i]]
            }
        }catch(e){
            return undefined;
        }
        return obj;
    }

    var guid = exports.guid = function(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){
            var r = Math.random()*16|0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        })
    }

    exports.HTML = {
        Encode : function(html,nbsp){
            if(html === undefined || html == null) return ''
            var str = html.toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;').replace(/"/g,'&#34;')
            str = nbsp ? str.replace(/ /g,'&nbsp;') : str;
            return str;
        }
        ,Decode : function(text){
            var temp = document.createElement('p');
            temp.innerHTML = text;
            var output = temp.innerText || temp.textContent;
            temp = null;
            return output;
        }
    };

    exports.str = {//字符串处理
        getBlength : function(str){
            str = str ? str.toString() : '';
            for(var i=str.length,n=0;i--;){
                n += str.charCodeAt(i) > 255 ? 2 : 1;
            }
            return n;
        }
        ,cutforByte : function(str,len,endstr){
            var len = +len
                ,endstr = typeof(endstr) == 'undefined' ? "..." : endstr.toString();
            function n2(a){ var n = a / 2 | 0; return (n > 0 ? n : 1)} //用于二分法查找
            if(!(str+"").length || !len || len<=0){return "";}
            if(this.getBlength(str) <= len){return str}
            var lenS = len - this.getBlength(endstr)
                ,_lenS = 0  , _strl = 0
            while (_strl <= lenS){
                var _lenS1 = n2(lenS -_strl)
                _strl += this.getBlength(str.substr(_lenS,_lenS1))
                _lenS += _lenS1
            }
            return str.substr(0,_lenS-1) + endstr
        }
    }

    //url sertch 及 hash 参数获取
    exports.urlComm = (function(){
        function getURL(kdy,url){//JS获取URL参数
            var url = url || window.location.href;
            var paraString = url.substring(url.indexOf(this.m)+1,url.length).replace(/\#.*/,'').split('&');
            var paraObj = {}
            for (i=0; j=paraString[i]; i++){
                paraObj[j.substring(0,j.indexOf(this.v)).toLowerCase()] = j.substring(j.indexOf (this.v)+1,j.length);
            }
            var returnValue = paraObj[kdy.toLowerCase()];
            if(typeof(returnValue)=='undefined'){
                return '';
            }else{
                return decodeURIComponent(returnValue);
            }
        }
        function setURL(){//修改、添加,删除URL参数
            var set = function(key,val,url_){
                var url = url_ || window.location.href
                if(url.indexOf(this.m)<=-1){ url += this.m;}
                var paraString = url.substring(url.indexOf(this.m)+1,url.length)
                    ,key = key || ''
                    ,val = (typeof(val) === 'undefined' || val === null)  ? '' : val
                if(key=='') {return url.replace(/\?*\s*$/,'')}
                var reg = new RegExp('\\b' + key + '=[^&]*','')
                if(reg.test(paraString) && val !=='' ){//值不为空，则替换
                    paraString = paraString.replace(reg,key + this.v + val)
                }else if(reg.test(paraString) && val ==''){//值为空，则删除
                    paraString = paraString.replace(reg,'')
                }else if(val!==''){//没有则添加
                    paraString += '&' + key + this.v + val
                }
                paraString = paraString.replace(/(^&*|&*$|&*(?=&))/g,'')
                return url.split(this.m)[0] + (paraString == '' && this.m !== '#' ? '' : this.m + paraString)
            }
            if(typeof(arguments[0]) == 'string'){
                return set.apply(this,[arguments[0],arguments[1],arguments[2]]);
            }else if(typeof(arguments[0])=='object'){
                var arg = arguments[0],url = arguments[1] || location.href
                for(aaa in arg){
                    url = set.apply(this,[aaa,arg[aaa],url])
                }
                return url;
            }else{return location.href}
        }
        var data = {data_hash:{m:'#',v:'='},data_search:{m:'?',v:'='}}
            ,o = {
                getSearch:function(){
                    return getURL.apply(data.data_search,arguments)
                }
                ,setSearch:function(){
                    return setURL.apply(data.data_search,arguments)
                }
                ,getHash:function(){
                    return getURL.apply(data.data_hash,arguments)
                }
                ,setHash:function(){
                    return setURL.apply(data.data_hash,arguments)
                }
                ,getmy:function(a,b){
                    var o = {m:a,v:b};
                    o.getURL = getURL;
                    return o.getURL
                }
                ,setmy:function(a,b){
                    var o = {m:a,v:b};
                    o.setURL = setURL;
                    return o.setURL
                }
            }
        return o
    })()

    //序列化,反学序列化 query
    exports.QueryString = (function(){
        var ms = {a:'&',b:'='};
        var Stringify = function(obj){
            var str = '';
            var qsArr = [];
            for(var k in obj){
                var v = obj[k],
                    type = typeOf(v);
                if(type == 'array'){
                    for(var i = 0; i<v.length; i++){
                        qsArr.push({name:k,value:v[i].toString()}) 
                    }
                }else{
                    qsArr.push({name:k,value:v.toString()}) 
                }
            }
            for(var i = 0; i < qsArr.length; i++){
                qsArr[i] = [qsArr[i].name,encodeURIComponent(qsArr[i].value)].join(this.b)
            }
            return qsArr.join(this.a)
        }
        var Parse = function(str){
            var qsArr = str.replace(/\+/g," ").split(this.a),obj = {}
            for(var i=0; i< qsArr.length; i++){
                var _arr = qsArr[i].split(this.b)
                if(_arr.length == 2){
                    //qsArr[i] = {name:_arr[0],value:decodeURIComponent(_arr[1])}
                    var _type = typeOf(obj[_arr[0]]);
                    switch(_type){
                        case 'undefined':
                        case 'null':
                            obj[_arr[0]] = decodeURIComponent(_arr[1]);
                            break;
                        case 'array':
                            obj[_arr[0]].push(decodeURIComponent(_arr[1]));
                            break;
                        default:
                            obj[_arr[0]] = [obj[_arr[0]]];
                            obj[_arr[0]].push(decodeURIComponent(_arr[1]));
                    }
                }
            }
            return obj;
        }
        return {
            stringify : function(a){
                return Stringify.call(ms,a)
            },
            parse: function(a){return Parse.call(ms,a)},
        }
    })()

    exports.cookie = function(key,value,expiredays){
        if(arguments.length <= 1){
            return getCookie(key)
        }else if(typeOf(value) == 'null' || typeOf(value) == 'undefined'){
            return deleteCookie(key)
        }else{
            setCookie.call(null,Array.prototype.slice.call(arguments,0));
        }
    }
    function setCookie(c_name,value,expiredays){//设置Cookie值 键名,值,保存时长(天)
        var exdate=new Date();
        exdate.setDate(exdate.getDate()+expiredays);
        document.cookie=c_name+ "=" +escape(value)+ ((expiredays==0) ? "" : ";expires="+exdate.toGMTString()) + ";path=/";
    };
    function getCookie(c_name){//获取Cookie值
        if (document.cookie.length>0){
            c_start=document.cookie.indexOf(c_name + "=");
            if (c_start!=-1)
            {
                c_start=c_start + c_name.length+1 ;
                c_end=document.cookie.indexOf(";",c_start);
                if (c_end==-1) c_end=document.cookie.length;
                return unescape(document.cookie.substring(c_start,c_end));
            };
        };
        return null;
    };
    function deleteCookie(name) {
        var expdate = new Date();
        expdate.setTime(expdate.getTime() - (86400 * 1000 * 1));
        setCookie(name, "", -1);
    };

    //获取textarea选中的字符
    exports.getSelectedText = function(textObj) {
        if (!window.getSelection) { 
            return document.selection.createRange().text;
        } else {
            return textObj.value.substr(textObj.selectionStart, textObj.selectionEnd - textObj.selectionStart);
        }
    }

    //textarea中插入字符
    exports.insertText = function (textObj,str) {
        textObj.focus();
        if (document.selection) {
            var sel = document.selection.createRange();
            sel.text = str;
        } else if (typeof textObj.selectionStart == 'number' && typeof textObj.selectionEnd == 'number') {
            var startPos = textObj.selectionStart,
            endPos = textObj.selectionEnd,
            cursorPos = startPos,
            tmpStr = textObj.value;
            textObj.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);
            cursorPos += str.length;
            textObj.selectionStart = textObj.selectionEnd = cursorPos;
        } else {
            textObj.value += str;
        }
    }

    //选中指定位置文字
    exports.selectText = function(textObj,index,leng){
        var value = textObj.value
        if (textObj.createTextRange) {
            var range = textObj.createTextRange();
            range.moveEnd("character", -1 * value.length)           
            range.moveEnd("character", index + leng);
            range.moveStart("character", index);
            range.select();    
        } else {
            textObj.setSelectionRange(index , index + leng);
            textObj.focus();
        }
    }

    //简单翻页模版
    exports.pageNav=function(a){var c,d,f,h,i,j,k,l,m,n,o,p,q,r,s,t,u,z,v,w,x,y,A,E,B,D,F,G,b={};if(b=a.values&&a.values.totalCount?{itemTotal:a.values.totalCount,itemPerPage:a.values.pageSize,page:a.values.pageNo}:a,c={itemPerPage:b.itemPerPage||10,sizeArr:b.sizeArr||[10,20,50],maxLinkShow:b.maxLinkShow||5,itemTotal:b.itemTotal,page:b.page||1,lang:b.lang||{allcount:"共<em>%Total%</em>条数据",textmode:"当前 <em>%page%</em>/%maxpage% 页 ",Prev:'<i class="icon-angle-left"></i>上一页',Next:'下一页<i class="icon-angle-right"></i>',more:"..."},totalPage:b.totalPage||Math.ceil(b.itemTotal/b.itemPerPage)},f="",h=[],i=c.itemPerPage-0,j=c.page-0,k=c.itemTotal,l=c.maxLinkShow-0,m=c.totalPage,j>m&&(j=m),m>0){if(n=[],c.sizeArr&&c.sizeArr.length){for(o=new RegExp("(\\s|^)"+i+"(\\s|$)"),o.test(c.sizeArr.join(" "))||c.sizeArr.push(i),c.sizeArr.sort(),n.push(' 每页<select name="pagesize">'),p=0;p<c.sizeArr.length;p++)q=c.sizeArr[p],n.push('<option value="'+q+'"'+(i==q?' selected="selected"':"")+">"+c.sizeArr[p]+"</option>");n.push("</select>条 ")}if(f='<span class="pagenav-wrapper'+(1===m?"only-one-page":"")+'"><span class="pagenav-desc">'+("undefined"!=typeof k?c.lang.allcount.replace("%Total%",k):"")+c.lang.textmode.replace("%page%",j).replace("%maxpage%",m)+n.join("")+'</span><span class="pagenav-units">',l>=m)for(d=1;m>=d;d++)j==d?(r="pagenav-current-link pagenav-link",s=!0):(r="pagenav-link",s=!1),t={text:d,index:d,isCurrent:s,cls:r},h.push(t);else if(m>l){for(u=l-3,(j>=m-1||2>=j)&&u++,v=Math.floor(u/2),w=u-v,x=j-1,y=m-j,j-1>v&&h.push({text:c.lang.Prev,index:j-1,isCurrent:!1,cls:"pagenav-link pagenav-link-prev"}),w>=y?(z=u-y,h.push({text:1,index:1,isCurrent:!1,cls:"pagenav-link"})):x>v?(z=v,h.push({text:1,index:1,isCurrent:!1,cls:"pagenav-link"})):z=x,A=u-z,d=0;z>d;d++)t={text:j-z+d,index:j-z+d,isCurrent:!1,cls:"pagenav-link"},h.push(t);for(h.push({text:j,index:j,isCurrent:!0,cls:"pagenav-link pagenav-current-link"}),d=1;A>=d;d++)t={text:j+d,index:j+d,isCurrent:!1,cls:"pagenav-link"},h.push(t);y>A&&h.push({text:m,index:m,isCurrent:j==m?!0:!1,cls:j==m?"pagenav-link pagenav-current-link":"pagenav-link"}),y>w&&h.push({text:c.lang.Next,index:j+1,isCurrent:!1,cls:"pagenav-link pagenav-link-next"})}}else f="";for(B=h.length,D=0,F="",G=!1;B>D;D++)E=h[D],D>0&&(G=h[D-1]),F=(E.isCurrent?"<span ":'<a href="javascript:;" ')+'data-page="'+E.index+'" class="page-'+E.index+" "+E.cls+'">'+E.text+"</"+(E.isCurrent?"span>":"a>"),G&&G.index<E.index-1&&(f+='<span class="pagenav-more">'+c.lang.more+"</span>"),f+=F;return f+="</span></span>"};

    //自动定位导航
    exports.autonav = function(arr,classname,defaultnumb){
        var alist = $(arr)
            ,classname = classname || 'hover'
            ,href = window.location.href
            ,sa,su=0
        alist.removeClass(classname);
        for(var i = alist.length;i--;){
            var li = alist.eq(i);
            lihref = li.attr('href') || li.find('a').attr('href')
            if(href.indexOf(lihref) != -1){
                var su_ = href.indexOf(lihref) + lihref.length
                if(su_ > su){
                    su = su_
                    sa = i
                }
            }
        }
        (typeof(defaultnumb) !== 'undefined') && (typeof(sa) == 'undefined') && (sa = defaultnumb)
        return alist.eq(sa).addClass(classname)
    }

    exports.dateFormat = function (date,fmt) {
        var _date = date || (this.getMilliseconds ? this : new Date());
        fmt = fmt || "yyyy-MM-dd hh:mm:ss"
        var o = {
            "M+": _date.getMonth() + 1, //月份 
            "d+": _date.getDate(), //日 
            "h+": _date.getHours(), //小时 
            "m+": _date.getMinutes(), //分 
            "s+": _date.getSeconds(), //秒 
            "q+": Math.floor((_date.getMonth() + 3) / 3), //季度 
            "S": _date.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (_date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

})