define(function(require, exports, module) {
	var Utils = require('utils'),
		Grid = require('gridBootstrap'),
		Xss = require('xss'),
		accountCheck = require('checkAccount'),		
		Box = require('boxBootstrap'),
		content = $('#content'),
		listContainer = $('#grid_list'),
		userParam = {},
		dictionaryCollection = {},
		infoCheckTpl = $('#infoCheckTpl').html(),
		otherCheckTpl = $('#otherCheckTpl').html(),
		doms = {			
			effectiveDateStart: $('input[name="effectiveDateStart"]'),
			effectiveDateEnd: $('input[name="effectiveDateEnd"]'),
			expirationDateStart: $('input[name="expirationDateStart"]'),
			expirationDateEnd: $('input[name="expirationDateEnd"]'),
			creationDateStart: $('input[name="creationDateStart"]'),
			creationDateEnd: $('input[name="creationDateEnd"]'),
			chargeServiceTypeInt: $('#chargeServiceTypeInt'),
			chargeStatusInt: $('#chargeStatusInt'),
			chargeSystemPropertyInt: $('#chargeSystemPropertyInt'),
			chargeTypeInt: $('#chargeTypeInt'),
			ownerIds: $('#ownerIds'),
			ids: $('#ids')
		},

		_grid;

	function init() {
		loadData();
	}

	function loadData() {
		_grid = Grid.create({
			key: 'id',//记得这里要换成现在接口的参数
			checkbox: false,
			cols: [{
				name: '账户编号',
				index: 'accountName'
			}, {
				name: '账户名',
				index: 'merchantName'
			}, {
				name: '商户名称',
				index: 'action',
				format: function(v){
				         return '[' + v + ']';
				    }
			}, {
				name: '商户ID',
				index: 'submitTime'
			}, {
				name: '联系电话',
				index: 'finishTime'
			}, {
				name: '操作',
				format: function(v) {
					return '<div class="ui-pg-div align-center"><a class="blue add-edit-font" href="javascript:">查看/修改</a><span class="ui-icon ace-icon fa fa-trash-o blue" title="删除"></span></div>';
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
		_grid.listen('addCallback', function() {
			//编辑的全show，展示的全hide
			addAndUpdate();
		});
		_grid.listen('editViewCallback', function(row) {
			addAndUpdate(row);
		});
		registerEvents();
	}
	
	function addAndUpdate(data)
	{
		var opt = {},
			id = '';
		
		opt.message = '<h4><b>商户信息</b></h4><hr class="no-margin">' + infoCheckTpl;
		if(!data)
		{
			opt.buttons = {			
				"save": {
					label: '保存',//'<i class="ace-icon fa"></i>通过',
					className: 'btn-sm btn-success',
					callback: function() {
						if (!validate()) {
							return false;
						} else {
							if (!submitData(data)) {
								return false;
							}
						}
					}
				}
			};
		}
				
		showDialog(opt);
		if(!data)
		{
			$("div[for=view]").addClass('hide');
			$("div[for=addEdit]").removeClass('hide');
			$("button[for=editSave]").hide();
		}
		else
		{
			$("div[for=view]").removeClass('hide');
			$("div[for=addEdit]").addClass('hide');
			$("button[for=editSave]").show();
		}
		
		$("button[for=modify]").click(function(){
			$("#edit"+$(this).attr('mod')).removeClass("hide");
			$("#view"+$(this).attr('mod')).addClass("hide");
		})
		$("button[for=editSave]").click(function(){
			$("#edit"+$(this).attr('mod')).addClass("hide");
			$("#view"+$(this).attr('mod')).removeClass("hide");
			//校验及保存,只有基本信息模块需要校验
			if($(this).attr('mod')=='BaseInfo'&&!validate())
			{
				return false;
			}
			if (!submitData(data)) {
					return false;
				}
		})
		$('div#editBaseInfo').on('change', function(e) {
			validate($(this));
		});
		
		/*data && fillData(data);

		$('.bootbox input, .bootbox select').on('change', function(e) {
			validate($(this));
		});
		var shbh = $('#shbh'),
			elp = shbh.parents('.form-group:first');
		accountCheck.check({
			el: shbh,
			elp: elp
		});

		data && setTimeout(function() {
			shbh.focus();
		}, 80);*/
	}
	
	
		/**
	 * [validate 检验函数]
	 * @param  {[HTML Element]} el [要校验的元素，不传递则全部检查]
	 * @return {[Boolean]}    [description]
	 */
	function validate(el) {
		var pass = true;
		if (el) {
			var elp = el.parents('.form-group:first'),
				elts = el.siblings('span.error-ts');
			if (el.data('int')) {
				if ($.isNumeric(el.val())) {
					elp.removeClass('has-error');
				} else {
					pass = false;
					elp.addClass('has-error');
				}
			} else if(el.data('empty')){
				if ('' != el.val().trim()) {
					elp.removeClass('has-error');
					elts.hide();
				} else {
					pass = false;
					elp.addClass('has-error');
					elts.show();
				}
				
			} else if (el.data('url')&&'' != el.val().trim()) {
				if (Utils.isUrl(el.val())) {
					elp.removeClass('has-error');
					elts.hide();
				} else {
					pass = false;
					elp.addClass('has-error');
					elts.show();
				}
			}

		} else {
			var obj = $("div#editBaseInfo").find("input");
			pass = validBase(obj);
			/*var obj=$('.bootbox').find("#gdPanel").find("input");//里面有很多input名字重名的在不同费率下
			if($("input[name=fchargeTypeInt]:checked").val()=='2')
			{
				obj = $('.bootbox').find("#jtPanel").find("input");
			}			
			var pass1= validBase($('.bootbox').find("#baseInfoPanel").find("input"));//基本信息的valid判断
			var pass2= validBase(obj);//各费率模块valid判断
			pass = pass1 && pass2;*/
		}		
		//return accountCheck.isPass() && pass;
		return pass;
	}
	
	//判断有效的根基func
	function validBase(boxObj){
		var pass = true;
		boxObj.each(function(i, v) {
				var $el = $(this),
					$p = $el.parents('.form-group:first'),
					isInt = $el.data('int'),
					isEmpty = $el.data('empty'),
					isDate = $el.hasClass('datepicker');
					isUrl = $el.data('url');
					if(isUrl&&'' != $el.val().trim())//网址不为空时进行判断
					{
						if (Utils.isUrl($el.val())) {
							$p.removeClass('has-error');
							$el.siblings('span.error-ts').hide();
						} else {
							pass = false;
							$p.addClass('has-error');
							$el.siblings('span.error-ts').show();
						}
					}
				if (isDate) {
					if (Utils.isDate($el.val())) {
						$p.removeClass('has-error');
					} else {
						pass = false;
						$p.addClass('has-error');
					}
				}
				if (isInt) {
					if ($.isNumeric($el.val())) {
						$p.removeClass('has-error');
					} else {
						pass = false;
						$p.addClass('has-error');
					}
				}				
				if (isEmpty) {
					if ('' != $el.val().trim()) {
						$p.removeClass('has-error');
						$el.siblings('span.error-ts').hide();
					} else {
						pass = false;
						$p.addClass('has-error');
						$el.siblings('span.error-ts').show();
					}
				}
			});
		return pass;	
	}

	
	//保存（新增、编辑）
	function submitData(data)
	{
		console.log('submit');
	}
	
	function showDialog(opt) {
		Box.dialog(opt);
	}
	
	
	function registerEvents() {
		$('#add-btn').on('click', function() {
			_grid.trigger('addCallback');
		});
		$(document.body).on('click', function(e) {
			var $el = $(e.target || e.srcElement),
				cls = $el.attr('class'),
				tag = $el.get(0).tagName.toLowerCase(),
				id = $el.attr('id'),
				name = $el.attr('name');
			if (cls && cls.indexOf('fa-calendar') > -1) {
				$el.parent().siblings('input').focus();
			}
			if (cls && cls.indexOf('fa-check') > -1 || (id && 'query-btn' == id)) {
				if (getParams()) {
					_grid.setUrl(getUrl());
					_grid.loadData();
				}
			}
			if (cls && cls.indexOf('fa-undo') > -1 || (id && 'reset-btn' == id)) {
				userParam = {};
				doms.effectiveDateStart.val('');
				doms.effectiveDateEnd.val('');
				doms.expirationDateStart.val('');
				doms.expirationDateEnd.val('');
				doms.creationDateStart.val('');
				doms.creationDateEnd.val('');
				doms.chargeServiceTypeInt.val(0);
				doms.chargeStatusInt.val(0);
				doms.chargeSystemPropertyInt.val(0);
				doms.chargeTypeInt.val(0);
				doms.ownerIds.val('');
				doms.ids.val('');
			}
			if ('input' == tag && 'fchargeTypeInt' == name) {
				var val = $el.val();
				if (val == dictionaryCollection.chargeTypeArr[1].innerValue) {
					$('#gdPanel').addClass('hide');
					$('#jtPanel').removeClass('hide');
				} else {
					$('#gdPanel').removeClass('hide');
					$('#jtPanel').addClass('hide');
				}
			}
			if ('input' == tag && 'fchargeSystemPropertyInt' == name) {
				var val = $el.val();
				if (val == dictionaryCollection.chargeSystemPropertyArr[1].innerValue) {
					$('#fownerId').attr('placeholder', '通道ID');
				} else if (val == dictionaryCollection.chargeSystemPropertyArr[0].innerValue) {
					$('#fownerId').attr('placeholder', '商户ID');
				}
			}
			if (cls && cls.indexOf('glyphicon-plus') > -1) {
				$('#jtPanel .row:last').after(flTpl);
			}
			if (cls && cls.indexOf('glyphicon-minus') > -1) {
				$el.parent().parent().remove();
			}
		});
	}

	function getParams() {
		var newParam = {},
			newchange = false,
			ids = doms.ids.val(),
			ownerIds = doms.ownerIds.val(),
			chargeTypeInt = doms.chargeTypeInt.val(),
			chargeSystemPropertyInt = doms.chargeSystemPropertyInt.val(),
			chargeStatusInt = doms.chargeStatusInt.val(),
			chargeServiceTypeInt = doms.chargeServiceTypeInt.val(),
			effectiveDateStart = doms.effectiveDateStart.val(),
			effectiveDateEnd = doms.effectiveDateEnd.val(),
			expirationDateStart = doms.expirationDateStart.val(),
			expirationDateEnd = doms.expirationDateEnd.val(),
			creationDateStart = doms.creationDateStart.val(),
			creationDateEnd = doms.creationDateEnd.val();

		if (ids) {
			newParam.ids = ids;
		}
		if (ownerIds) {
			newParam.ownerIds = ownerIds;
		}
		if (effectiveDateStart) {
			newParam.effectiveDateStart = effectiveDateStart;
		}
		if (effectiveDateEnd) {
			newParam.effectiveDateEnd = effectiveDateEnd;
		}
		if (expirationDateStart) {
			newParam.expirationDateStart = expirationDateStart;
		}
		if (expirationDateEnd) {
			newParam.expirationDateEnd = expirationDateEnd;
		}
		if (creationDateStart) {
			newParam.creationDateStart = creationDateStart;
		}
		if (creationDateEnd) {
			newParam.creationDateEnd = creationDateEnd;
		}
		if (chargeTypeInt != '0') {
			newParam.chargeTypeInt = chargeTypeInt;
		}
		if (chargeSystemPropertyInt != '0') {
			newParam.chargeSystemPropertyInt = chargeSystemPropertyInt;
		}
		if (chargeStatusInt != '0') {
			newParam.chargeStatusInt = chargeStatusInt;
		}
		if (chargeServiceTypeInt != '0') {
			newParam.chargeServiceTypeInt = chargeServiceTypeInt;
		}

		for (var k in newParam) {
			if (newParam[k] !== userParam[k]) {
				newchange = true;
				break;
			} else {
				delete userParam[k];
			}
		}
		for (var k in userParam) {
			if (userParam.hasOwnProperty(k)) {
				newchange = true;
				break;
			}
		}
		if (!newchange) {
			Box.alert('您的查询条件并没有做任何修改.');
			return false;
		}
		userParam = newParam;
		return true;
	}

	function getUrl() {
		return global_config.serverRoot + '/clearingCharge/list?userId=&' + Utils.object2param(userParam);
		//return global_config.serverRoot + '/queryPayChannel?payType=0';// + Utils.object2param(userParam);
	}

	return {
		init: init
	};
});