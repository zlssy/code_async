//配合ace及settlements接口做的数据列表展示组件
//author why
define(function(require, exports, module) {
	var _ = require("underscore.min.js") ;
	var tool = require("why")
		,qs = tool.QueryString;
	//表头模版
	var template_hide = '<th<%=col.width ? \' style="width:\' + (col.width+"").replace(/^(\\d*)$/,"$1px") + \'"\' : \'\' %>><div<%=col.index ? \' data-index="\' + _.escape(col.index) + \'"\' : \'\' %><%=col.sortable?\' class="ui-jqgrid-sortable"\':""%>><%-col.name%><%if(col.sortable){%><span class="s-ico" style=""><span oder="asc" class="ui-grid-ico-sort ui-icon-asc ui-icon ui-icon-triangle-1-n ui-sort-ltr ui-state-disabled"></span><span oder="desc" class="ui-grid-ico-sort ui-icon-desc ui-icon ui-icon-triangle-1-s ui-sort-ltr ui-state-disabled"></span></span><%}%></div></th>';
	//表头全选模板
	var hdie_check = '<th width="30" class="ui-state-default ui-th-column ui-th-ltr"><div style="text-align:center;"><input type="checkbox" data-checkname="<%-key%>"></div></th>'
	//默认行模板
	var template_tr = '<tr role="row" data-key="<%-tr[key]%>" class="ui-widget-content jqgrow ui-row-ltr ui-priority-secondary"><%if(obj.checkRow){%><td role="gridcell" style="text-align:center;" aria-describedby="grid_cb"><input role="checkbox" type="checkbox" class="cbox" name="<%-key%>"></td><%}%><%for(var i=0;i < cols.length; i++){var col = cols[i];%><td role="gridcell" title=""><%var str = funFixtd.call(tr,i,_y,col,tr);str = typeof str == "undefined" ? _.escape(tr[col.index]) : str;print(str);%></td><%}%></tr>';
	var template_hide_fun,template_tr_fun;
	var _defObj = {
		prmNames:{page:"pageNo",rows:"pageSize",sort:"sort",order:"order"},
		jsonReader:{root:'data.pageData',page:'data.pageNo',size:'data.pageSize',records:'data.totalCnt'},// totalCnt totalCount
		prmNames_old:{page:"pageNumber",rows:"PerPageItemsCount",sort:"sort",order:"order"},
		jsonReader_old:{root:'records',page:'data.pageNo',size:'pageSize',records:'totalCnt',totalPage:'totalPage'}// totalCnt totalCount
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
		pagenav: true,
		prmNames:_defObj.prmNames,
		jsonReader:_defObj.jsonReader
	}

	function getInfoHtml(){
		var html = [];
		html.push('<div class="ui-jqgrid ui-widget ui-widget-content ui-corner-all">')
		html.push('	<div class="ui-state-default ui-jqgrid-hdiv">')
		html.push('		<table class="g-table ui-jqgrid-htable table-hover" style="width:100%;">')
		html.push('			<thead>')
		html.push('				<tr class="g-tc ui-jqgrid-labels"></tr>')
		html.push('			</thead>')
		html.push('			<tbody></tbody>')
		html.push('		</table>')
		html.push('	</div>')
		this.option.pagenav && html.push('		<div class="pagenav g-tr"></div>')
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
        this.main.on('colspanMsg','table,ul.tree',function(e,msg){
            var o = $(this)
                ,tds = o.find('tr>th').length
            if(o[0].tagName.toLowerCase() == 'ul'){
                o.html('<li class="nodata">'+msg+'</li>');
            }else{
                o.find('>tbody').html('<tr class="ui-widget-content jqgrow ui-row-ltr ui-priority-secondary"><td colspan="' + tds + '" class="nodata">' + msg + '</td></tr>')
            }
            return false;
        })
        .on('loading','table,ul.tree',function(){
                $(this).trigger('colspanMsg',['<div class="g-tc" style="text-align:center; height:410px; line-height:410px;"><i class="g-inlb g-icon-load"></i> 正在加载数据！</div>']).find(':checkbox[data-checkname]').prop('checked',false)
                return false;
            })
        .on('nodata','table,ul.tree',function(){
                $(this).trigger('colspanMsg',['<div class="g-tc" style="text-align:center;">暂无数据！</div>'])
                return false;
            })
        .on('errdata','table,ul.tree',function(e,err){
        		var errmsg="";
        		if(typeof err == "object"){
        			errmsg += err.status ? "status:" + err.status : '';
        			errmsg += err.statusText ? " statusText:" + err.statusText : '';
        			errmsg += err.responseText ? " responseText:" + err.responseText : '';
        		}else{
        			errmsg = err;
        		}
                $(this).trigger('colspanMsg',['<div class="g-tc g-red"> 出错：' + tool.HTML.Encode(errmsg) + '</div>'])
                return false;
            })
    }

    //绑定翻页
    function event_page(){
    	var o = this;
    	var prmNames = _.extend({},_defObj.prmNames,o.option.prmNames);
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
    }

    //绑定排序
    function event_oder(){
    	var o = this;
    	var prmNames = _.extend({},_defObj.prmNames,o.option.prmNames);
    	this.main.on('click','table thead div.ui-jqgrid-sortable',function(){
    		var obj = $(this);
    		var s = obj.find('.s-ico span:not(".ui-state-disabled")')
    		var sort = obj.data('index'),oder;
    		if(s.length && s.attr('oder') == 'asc'){
    			oder = "desc";
    		}else{
    			oder = "asc";
    		}
    		o.main.find('thead span.s-ico span').addClass('ui-state-disabled');

    		var changeHash = {}
    		changeHash[prmNames.page] = null;
    		changeHash[prmNames.order] = oder;
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
		var _defoption = _.extend({},defOption);
		if(option.oldApi){
			_defoption.prmNames = _defObj.prmNames_old;
			_defoption.jsonReader = _defObj.jsonReader_old;
		}
		this.option = _.extend(_defoption,option)
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
			return _.extend({},this.option.getBaseSearch(),this.option.getSearch());
		},
		eventInit:function(){
			event_checkall.call(this);
			event_page.call(this);
			event_oder.call(this);
			event_tableMsg.call(this);
			this.option.seachForm && event_searchForm.call(this,this.option.seachForm)
		},
		fix_oder:function(){ //调整排序显示
			var search = this.getSearch();
			var prmNames = _.extend({},_defObj.prmNames,this.option.prmNames);
			var oder,sort;
			if(typeof search !== "object"){
				search = qs.parse(search);
			}
			oder = search[prmNames.order]
			sort = search[prmNames.sort]
			this.main.find('thead span.s-ico span').addClass('ui-state-disabled')
			if(sort){
				this.main.find('thead th div.ui-jqgrid-sortable[data-index='+sort+'] span.s-ico span[oder='+oder+']').removeClass('ui-state-disabled')
			}
		},
		fillTabel:function(data){
			var jsonReader = _.extend({},_defObj.jsonReader,this.option.jsonReader);
			var arr = tool.getMapdata(data,jsonReader.root);
			if(arr.length > 0){
				this.main.find('table.g-table tbody').html(getBodyHtml.call(this,arr))
			}else{
				this.main.find('table.g-table').trigger('nodata');
			}
		},
		fillPage:function(data){
			var jsonReader = _.extend({},_defObj.jsonReader,this.option.jsonReader);
			var prmNames = _.extend({},_defObj.prmNames,this.option.prmNames);
			var search = this.getSearch();
			var oder,sort;
			if(typeof search !== "object"){
				search = qs.parse(search);
			}
			var pd = {
				itemTotal:tool.getMapdata(data,jsonReader.records)
			    ,itemPerPage:tool.getMapdata(data,jsonReader.size) || tool.getMapdata(search,prmNames.rows) || 20
			    ,page: tool.getMapdata(data,jsonReader.page) || tool.getMapdata(search,prmNames.page) || 1 //页码
			}
			if(jsonReader.totalPage){
				pd.totalPage = tool.getMapdata(data,jsonReader.totalPage)
			}
			this.main.find('.pagenav').html(tool.pageNav(pd))
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
				o.fix_oder();
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

	module.exports = function(a,b,c){
		return new Grid(a,b,c);
	}
})