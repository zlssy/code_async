//配合ace及settlements接口做的数据列表展示组件
//author why
define(function(require, exports, module) {
	var _ = require("underscore.min.js") ;
	var tool = require("why")
		,qs = tool.QueryString;
	//表头模版
	var template_hide = '<th<%=col.width ? \' style="width:\' + (col.width+"").replace(/^(\\d*)$/,"$1px") + \'"\' : \'\' %>><div<%=col.index ? \' data-index="\' + _.escape(col.index) + \'"\' : \'\' %><%=col.sortable?\' class="table-sortable"\':""%>><%-col.name%><%if(col.sortable){%><span class="order-icos"><span order="asc" class="glyphicon glyphicon-chevron-up order-disabled"></span><span order="desc" class="glyphicon glyphicon-chevron-down order-disabled"></span></span><%}%></div></th>';
	//表头全选模板
	var hdie_check = '<th width="30" class="ui-state-default ui-th-column ui-th-ltr"><div style="text-align:center;"><input type="checkbox" data-checkname="<%-key%>"></div></th>'
	//默认行模板
    //var template_tr = '<tr role="row" data-key="<%-tr[key]%>"><%if(obj.checkRow){%><td role="gridcell" style="text-align:center;" aria-describedby="grid_cb"><input role="checkbox" type="checkbox" class="cbox" name="<%-key%>"></td><%}%><%for(var i=0;i < cols.length; i++){var col = cols[i];%><td role="gridcell" title=""><%var str = funFixtd.call(tr,i,_y,col,tr);str = typeof str == "undefined" ? _.escape(tr[col.index]) : str;print(str);%></td><%}%></tr>';
	var template_tr = '<tr role="row" data-key="<%-tr[key]%>">'
    template_tr += '<%if(obj.checkRow){%><td role="gridcell" style="text-align:center;" aria-describedby="grid_cb"><input role="checkbox" type="checkbox" class="cbox" name="<%-key%>"></td><%}%>'
    template_tr += '<% for(var i=0;i < cols.length; i++){ var col = cols[i]; %>'
    template_tr += '<td role="gridcell" title="">'
        template_tr += '<%'
            template_tr += 'if(col.format && typeof(col.format) == "function"){ '
                template_tr += 'print(col.format(tr,i,_y))'
            template_tr += '}else{'
                template_tr += 'var str = funFixtd.call(tr,i,_y,col);'
                template_tr += 'str = typeof str == "undefined" ? _.escape(tr[col.index]) : str;print(str);'
            template_tr += '}'
        template_tr += '%>'
    template_tr += '</td>'
    template_tr += '<%}%>'
    template_tr += '</tr>'
	var template_hide_fun,template_tr_fun;
	var _defObj = {
		prmNames:{page:"pageNo",rows:"pageSize",sort:"sort",order:"order"},
		jsonReader:{root:'data.pageData',page:'data.pageNo',size:'data.pageSize',records:'data.totalCnt'},// totalCnt totalCount
		prmNames_old:{page:"pageNumber",rows:"PerPageItemsCount",sort:"sort",order:"order"},
		jsonReader_old:{root:'records',page:'data.pageNo',size:'pageSize',records:'totalCnt',totalPage:'totalPage'}// totalCnt totalCount
	}

var Lang_config = {
	"zh" : {
		allcount : '共<em>%Total%</em>条数据',
		textmode : '当前 <em>%page%</em>/%maxpage% 页 ',
		textpagesize : '每页 %pagesize% 条',
		Prev : '上一页',
		Next : '下一页',
		more : '...',
		gotxt: '跳转',
		//提示
		loading: '正在加载数据...',
		nodata: '暂无数据!',
		error: '出错'
	},
	'en' : {
		allcount : 'Total of <em>%Total%</em> data ',
		textmode : 'current <em>%page%</em>/%maxpage% page. ',
		textpagesize : 'A page show%pagesize%item ',
		Prev : 'Previous',
		Next : 'Next',
		more : '...',
		gotxt: 'go',
		//提示
		loading: 'Loading...',
		nodata: 'No data!',
		error: 'Error'
	}
}

	var defOption = {
		id: 'grid', //容器ID
		key: 'id',
		checkRow: false, //行选择
		height: 400,
		pagesize: 20,
		page: 1,
		oldApi: false, //是否老接口
		actions: {add: false,del: false,edit: false,view: false,search: false,refresh: false},
		getBaseSearch: function(){
			return qs.parse(location.search.replace(/^\?/g,'')); //默认筛选条件
		},
		getSearch: function(){
			return qs.parse(location.hash.replace(/^\#/g,'')); //默认筛选条件
		},
		funFixtd: function(x,y,col,itemobj){},
		//funDatacheck: function(data){},
		pagenav: true,
		prmNames:_defObj.prmNames,
		jsonReader:_defObj.jsonReader,
		langCode:'zh',
		pageNavClassNames:{
			gobox:'form-group',
			goform:'input-group input-group-sm',
			goinput:'form-control',
			gobtn:'btn btn-default',
		},
		goPageForm:false
	}
	
	function getInfoHtml(){
		var html = [];
		html.push('<div class="autoMain" style="position: relative;">')
		html.push('	<div class="autoBox" style="overflow: auto;">')
		html.push('		<table class="g-table table table-bordered table-striped table-hover" style="width:100%;">')
		html.push('			<thead>')
		html.push('				<tr></tr>')
		html.push('			</thead>')
		html.push('			<tbody></tbody>')
		html.push('		</table>')
		html.push('	</div>')
		this.option.pagenav && html.push('		<div class="pagenav text-right"></div>')
		html.push('</div>')
		var dom = $(html.join(''))
		dom.find('table thead tr').append(getHeadHtml.call(this,this.option.cols))
		return dom;
	}

	function getHeadHtml(arr){
		template_hide_fun = template_hide_fun ? template_hide_fun : _.template(template_hide);
		var html = this.option.checkRow ? hdie_check.replace('<%-key%>',this.option.key) : '';
		for(var i=0; i<arr.length; i++){
			var tr = arr[i];
			html += template_hide_fun(_.extend({},this.option,{col:tr,key:this.option.key}));
		}
		return html;
	}

	function getBodyHtml(arr){
		if(!arr) return '';
		var html = '';
		template_tr_fun = template_tr_fun ? template_tr_fun : _.template(template_tr);
		for(var i=0; i<arr.length; i++){
			var tr = arr[i];
			html += template_tr_fun(_.extend({"_y":i},this.option,{tr:tr,key:this.option.key}));
		}
		return html;
	}

	//全选按钮事件绑定
	function event_checkall(){
		var tab = this.main.find('table');
		var allcheckd = this.main.find('table :checkbox[data-checkname]');
        if(allcheckd.length>0){
			allcheckd.each(function(index, element) {
				var o = $(this)
					,name = o.data('checkname');
				tab.on("change.base",':checkbox[name="' + name + '"]',function(){
					var os = tab.find(':checkbox[data-checkname="' + name + '"]')
					//console.log(os.length)
					os.prop('checked',tab.find(':checkbox[name="' + name + '"]:checked').length == tab.find(':checkbox[name="' + name + '"]').length)
				})
			}).parents('table').on('change.base',":checkbox[data-checkname]",function(){
				var o = $(this)
				o.parents('table').find(':checkbox[name="' + o.data('checkname') + '"]').prop('checked',o.prop('checked'));
			})
        }
    }

    //为列表表格配置loading及nodata事件
    function event_tableMsg(){
    	var _this = this;
        this.main.on('colspanMsg','table,ul.tree',function(e,msg){
            var o = $(this)
                ,tds = o.find('tr>th').length
            if(o[0].tagName.toLowerCase() == 'ul'){
                o.html('<li class="nodata">'+msg+'</li>');
            }else{
                o.find('>tbody').html('<tr><td colspan="' + tds + '" class="nodata">' + msg + '</td></tr>')
            }
            return false;
        })
        .on('loading','table,ul.tree',function(){
                $(this).trigger('colspanMsg',['<div class="g-tc" style="text-align:center; height:300px; line-height:300px;">' + (_this.option.lang.loading || "正在加载数据...") +  '</div>']).find(':checkbox[data-checkname]').prop('checked',false)
                return false;
            })
        .on('nodata','table,ul.tree',function(){
                $(this).trigger('colspanMsg',['<div class="g-tc" style="text-align:center;">' + (_this.option.lang.nodata || "暂无数据!") +  '</div>'])
                return false;
            })
        .on('errdata','table,ul.tree',function(e,err){
        		var errmsg="";
        		if(typeof err == "object"){
        			if('-100' == err.code){
        				location.reload();
        				return;
        			}
        			errmsg += err.status ? "status:" + err.status : '';
        			errmsg += err.statusText ? " statusText:" + err.statusText : '';
        			errmsg += err.responseText ? " responseText:" + err.responseText : '';
        		}else{
        			errmsg = err;
        		}
                $(this).trigger('colspanMsg',['<div class="g-tc g-red"> ' + (_this.option.lang.error || "出错") + '：' + tool.HTML.Encode(errmsg) + '</div>'])
                return false;
            })
    }

    //绑定翻页
    function event_page(){
    	var o = this;
    	var prmNames = o.option.prmNames;
    	this.main.on('click','.pagenav a[data-page]',function(){
    		var obj = $(this);
    		document.location.href = tool.urlComm.setHash(prmNames.page,obj.data('page'));
    		o.load();
    	}).on('change','.pagenav select[name=pagesize]',function(){
    		var pageSize = $(this).val();
            var changeHash = {};
            changeHash[prmNames.page] = null;
            changeHash[prmNames.rows] = pageSize;
            document.location.href = tool.urlComm.setHash(changeHash)
    		o.load();
    	})
    	this.main.on('submit',".pagenav .pagenav-goform",function(){
    		var pagebox = $(this).find('input[name=page]')
                ,max = $(this).data('max')
    			,page = pagebox.length ? +$.trim(pagebox.val()) : "";
            if(isNaN(page)) return false;
            page = page < 1 ? 1 : page > max ? max : page;
    		if(page){
    			document.location.href = tool.urlComm.setHash(prmNames.page,page);
    			o.load();
    		}
    		return false;
    	})
    }

    //绑定排序
    function event_order(){
    	var o = this;
    	var prmNames = o.option.prmNames;
    	this.main.on('click','table thead div.table-sortable',function(){
    		var obj = $(this);
    		var s = obj.find('.order-icos span:not(".order-disabled")')
    		var sort = obj.data('index'),order;
    		if(s.length && s.attr('order') == 'asc'){
    			order = "desc";
    		}else{
    			order = "asc";
    		}
    		o.main.find('thead span.order-icos span').addClass('order-disabled');

    		var changeHash = {}
    		changeHash[prmNames.page] = null;
    		changeHash[prmNames.order] = order;
    		changeHash[prmNames.sort] = sort;
            document.location.href = tool.urlComm.setHash(changeHash)
    		o.load();
    	})
    }

    function event_searchForm(form){
    	var o = this;
    	var obj = $(form);
    	obj.on('submit',function(){
    		location.hash = "#" + $(this).serialize();
    		o.load();
    		return false;
    	})
    }

	function Grid(box,apiurl,option){
		this.listAjax = [];
		this.box = $(box);
		this.apiUrl = apiurl;
		var _lang;
		var _defoption = tool.extend({},defOption);
		if(option.oldApi){
			_defoption.prmNames = _defObj.prmNames_old;
			_defoption.jsonReader = _defObj.jsonReader_old;
		}
		this.option = tool.extend(true,{},_defoption,option)
		
		//语言初始化
		if(Lang_config[this.option.langCode]){
			_lang = Lang_config[this.option.langCode];
		}else{
			_lang = Lang_config('zh')
		}
		this.option.lang =  tool.extend(true,{},_lang,option.lang)
		
		this.init();
	}

	Grid.prototype = {
		init:function(){
			this.main = $(getInfoHtml.call(this));
			//this.box.append(this.main);
			this.eventInit();
			this.box.append(this.main);
		},
		getSearch:function(){
			return tool.extend({},this.option.getBaseSearch(),this.option.getSearch());
		},
		eventInit:function(){
			event_checkall.call(this);
			event_page.call(this);
			event_order.call(this);
			event_tableMsg.call(this);
			this.option.seachForm && event_searchForm.call(this,this.option.seachForm)
		},
		fix_order:function(){ //调整排序显示
			var search = this.getSearch();
			var prmNames = tool.extend({},_defObj.prmNames,this.option.prmNames);
			var order,sort;
			if(typeof search !== "object"){
				search = qs.parse(search);
			}
			order = search[prmNames.order]
			sort = search[prmNames.sort]
			this.main.find('thead span.order-icos span').addClass('order-disabled')
			if(sort){
				this.main.find('thead th div.table-sortable[data-index='+sort+'] span.order-icos span[order='+order+']').removeClass('order-disabled')
			}
		},
		fillTabel:function(data){
			var jsonReader = this.option.jsonReader;
			var arr = tool.getMapJson(data,jsonReader.root);
			if(arr.length > 0){
				this.main.find('table.g-table tbody').html(getBodyHtml.call(this,arr))
			}else{
				this.main.find('table.g-table').trigger('nodata');
			}
		},
		fillPage:function(data){
			var jsonReader = this.option.jsonReader;
			var prmNames = this.option.prmNames;
			var search = this.getSearch();
			var order,sort;
			if(typeof search !== "object"){
				search = qs.parse(search);
			}
			var pd = {
				itemTotal:tool.getMapJson(data,jsonReader.records)
			    ,itemPerPage:tool.getMapJson(data,jsonReader.size) || tool.getMapJson(search,prmNames.rows) || 20
			    ,page: tool.getMapJson(data,jsonReader.page) || tool.getMapJson(search,prmNames.page) || 1 //页码
			}
			if(jsonReader.totalPage){
				pd.totalPage = tool.getMapJson(data,jsonReader.totalPage)
			}
			pd.lang = this.option.lang;
			pd.goForm = this.option.goPageForm || false;
			pd.classNames = this.option.pageNavClassNames || {};
			this.main.find('.pagenav').html(pageNav(pd))
		},
		load:function(){
			var o = this;
			var s = JSON.parse(JSON.stringify(this.getSearch()));
			o.loadingTable();
			o.addAjax($.get(this.apiUrl,s,null,'json')).then(function(data){
				if(data.code != 0){return $.Deferred().reject(data.msg || data.message || "加载出错!")}
				o.thieSearch = s; 
				o.fillTabel(data);
				o.option.pagenav && o.fillPage(data);
				o.fix_order();
			}).then(null,function(err){
				if(typeof err == 'object' && err.statusText == 'abort') return;
				o.main.find('table.g-table').trigger('errdata',[err])
			})
		},
		loadC:function(){
			var url = tool.urlComm.apply(tool.urlComm.setHash,Array.prototype.slice.call(arguments,0))
			if(url == document.location.href){
				o.load();
			}else{
				document.location.href = url;
			}
		},
		//准备异步获取列表数据
		loadingTable: function(){
			this.main.find('table.g-table').trigger('loading');
			var Ajax = this.listAjax.pop();
			if(Ajax){Ajax.abort();Ajax = null;}
		},
		addAjax: function(obj){
			this.listAjax.push(obj)
			return obj;
		} 
	}
var pageNav=function (p) {
    var ds = {}
    if(p.values && p.values.totalCount){
        ds = {
                itemTotal:p.values.totalCount
                ,itemPerPage:p.values.pageSize
                ,page: p.values.pageNo //页码
            }
    }else{
       ds = p;  
    }
    var q = {
        itemPerPage : ds.itemPerPage || 10, //每页的条数
        sizeArr : ds.sizeArr ||  [10,20,50],
        maxLinkShow : ds.maxLinkShow || 5,  //显示的页数
        itemTotal : ds.itemTotal,      //记录总数
        page : ds.page || 1,                    //当前页码
        lang : ds.lang || {
            allcount : '共<em>%Total%</em>条数据',
            textmode : '当前 <em>%page%</em>/%maxpage% 页 ', //其他信息模版
            textpagesize : '每页 %pagesize% 条',
            Prev : '<i class="icon-angle-left"></i>上一页',
            Next : '下一页<i class="icon-angle-right"></i>',
            more : "...",
            gotxt: '跳转'
        },
        totalPage: ds.totalPage || Math.ceil(ds.itemTotal/ds.itemPerPage),
        classNames: ds.classNames || {},
        goForm: ds.goForm || false
    }

    var v,  r,  html = "", k,  B = [],
        E = q.itemPerPage-0, //每页条数
        g = q.page-0,        //当前页码
        G = q.itemTotal,   //总记录数
        C = q.maxLinkShow-0, //[翻页按钮数]
        h = q.totalPage;

    if(g>h){
        g = h;
    }

    if (h > 0) {
        var pagesizeHTML = [];
        if(q.sizeArr && q.sizeArr.length){
        	var pageSizeItem = [];
            var reg = new RegExp('(\\s|^)' + E + '(\\s|$)');
            if(!reg.test(q.sizeArr.join(" "))) q.sizeArr.push(E);
            q.sizeArr.sort()
            pageSizeItem.push('<select name="pagesize">')
            for(var xs=0; xs< q.sizeArr.length; xs++) {
                var _size = q.sizeArr[xs];
                pageSizeItem.push('<option value="' + _size + '"' + (E == _size ? ' selected="selected"' : '') +  '>' + q.sizeArr[xs] + '</option>')
            }
            pageSizeItem.push('</select>');
            pagesizeHTML.push(q.lang.textpagesize.replace('%pagesize%',pageSizeItem.join('')));
        }else{
        	pagesizeHTML.push(q.lang.textpagesize.replace('%pagesize%',E));
        }

        html = '<span class="pagenav-wrapper' + (h === 1 ? "only-one-page" : "") + '"><span class="pagenav-desc">' + 
            (typeof G !== 'undefined'? q.lang.allcount.replace('%Total%',G):'') + 
            q.lang.textmode.replace('%page%',g).replace('%maxpage%',h) + pagesizeHTML.join("") +'</span><span class="pagenav-units">';
        
        if (h <= C) {
            for (v = 1; v <= h; v++) {
                var a,
                y,
                j;
                if (g == v) {
                    a = "pagenav-current-link pagenav-link";
                    y = true
                } else {
                    a = "pagenav-link";
                    y = false
                }
                j = {
                    text : v,
                    index : v,
                    isCurrent : y,
                    cls : a
                };
                B.push(j)
            }
        } else {
            if (h > C) {
                var z = C - 3;
                if (g >= h - 1 || g <= 2) {
                    z++
                }
                var x = Math.floor(z / 2),
                w = z - x,
                u = g - 1,
                t = h - g,
                m;
                if (g - 1 > x) {
                    B.push({
                        text : q.lang.Prev,
                        index : g - 1,
                        isCurrent : false,
                        cls : "pagenav-link pagenav-link-prev"
                    })
                }
                if (t <= w) {
                    m = z - t;
                    B.push({
                        text : 1,
                        index : 1,
                        isCurrent : false,
                        cls : "pagenav-link"
                    })
                } else {
                    if (u > x) {
                        m = x;
                        B.push({
                            text : 1,
                            index : 1,
                            isCurrent : false,
                            cls : "pagenav-link"
                        })
                    } else {
                        m = u
                    }
                }
                var e = z - m;
                for (v = 0; v < m; v++) {
                    var j = {
                        text : g - m + v,
                        index : g - m + v,
                        isCurrent : false,
                        cls : "pagenav-link"
                    };
                    B.push(j)
                }
                B.push({
                    text : g,
                    index : g,
                    isCurrent : true,
                    cls : "pagenav-link pagenav-current-link"
                });
                for (v = 1; v <= e; v++) {
                    var j = {
                        text : g + v,
                        index : g + v,
                        isCurrent : false,
                        cls : "pagenav-link"
                    };
                    B.push(j)
                }
                if (t > e) {
                    B.push({
                        text : h,
                        index : h,
                        isCurrent : g == h ? true : false,
                        cls : g == h ? "pagenav-link pagenav-current-link" : "pagenav-link"
                    })
                }
                if (t > w) {
                    B.push({
                        text : q.lang.Next,
                        index : g + 1,
                        isCurrent : false,
                        cls : "pagenav-link pagenav-link-next"
                    })
                }
            }
        }
    } else {
        html = ""
    }
    var l = B.length,A,s = 0,f,F = "",d = false,D = "";

    for (; s < l; s++) {
        f = B[s];
        if (s > 0) {
            d = B[s - 1]
        }
        F = (f.isCurrent ? "<span " : '<a href="javascript:;" ') + 'data-page="' + f.index + '" class="page-' + f.index + " " + f.cls + '">' + f.text + "</" + (f.isCurrent ? "span>" : "a>");
        if (d && (d.index < f.index - 1)) {
            html += '<span class="pagenav-more">' + q.lang.more + "</span>"
        }
        html += F
    }
    html += '</span>'
    if(h > 0 && q.goForm){
        html += '<form data-max="' + h + '" class="pagenav-gobox pagenav-goform ' + (q.classNames.goform || '') + '">'
            html += '<input type="number" class="pagenav-goinput ' + (q.classNames.goinput || '') + '" name="page" value="' + q.page + '" />'
            html += '<span class="input-group-btn">'
            	html += '<button type="submit" class="pagenav-gobtn ' + (q.classNames.gobtn || '') + '">' + q.lang.gotxt + '</button>'
            html += '</span>'
        html += '</form>'
    	// <form class="input-group">
	    //   <input type="text" class="form-control" placeholder="Search for...">
	    //   <span class="input-group-btn">
	    //     <button class="btn btn-default" type="button">Go!</button>
	    //   </span>
	    // </form>
    }
    html +='</span>';
    return html ;
};

	module.exports = function(a,b,c){
		return new Grid(a,b,c);
	}
})