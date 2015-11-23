define(function(require, exports, module) {
	var Utils = require('utils'),
		Grid = require('gridBootstrap'),
		Xss = require('xss'),
		accountCheck = require('checkAccount'),
		Box = require('boxBootstrap'),
		content = $('#content'),
		listContainer = $('#grid_list'),
		userParam = {},
		dictionaryCollection = {}, //对需要后台拉取数据封装的对象
		infoViewTpl = $('#infoViewTpl').html(),
		infoAddEditTpl = $('#infoAddEditTpl').html(),
		dictionaryCollection = {},
		doms = {
			accountName: $('input[name="accountName"]'), //与接口需要的参数命名相同
			merchantNum: $('input[name="merchantNum"]'),
			merchantID: $('input[name="merchantID"]'),
			merchantName: $('input[name="merchantName"]')
		},

		_grid;

	function init() {
		loadData();
	}

	function loadData() {
		_grid = Grid.create({
			key: 'id', //记得这里要换成现在接口的参数
			ajaxCompleteKey: 'response', // 表示ajax请求状态的字段
			checkbox: false,
			cols: [{
				name: '账户编号',
				index: 'merchantNum'
			}, {
				name: '账户名',
				index: 'loginId'
			}, {
				name: '商户名称',
				index: 'outMerchantName',
				format: function(v) {
					return '[' + v + ']';
				}
			}, {
				name: '商户ID',
				index: 'outMerchantId'
			}, {
				name: '联系电话',
				index: 'linkphone'
			}, {
				name: '操作',
				format: function(v) {
					return '<div class="ui-pg-div align-center"><span class="ui-icon ace-icon fa fa-pencil blue" title="编辑"></span><span class="ui-icon ace-icon fa fa-search-plus blue" title="查看"></span><span class="ui-icon ace-icon fa fa-trash-o blue" title="删除"></span></div>';
				}
			}],
			url: getUrl(),
			pagesize: 15,
			jsonReader: {
				root: 'tclMerchantInfos', //数据
				page: 'page.index', //当前页
				records: 'page.total' //总数
			}
		});
		listContainer.html(_grid.getHtml());
		_grid.load();
		_grid.listen('addCallback', function() {
			//编辑的全show，展示的全hide
			addAndUpdate();
		});
		/*_grid.listen('editViewCallback', function(row) {
			addAndUpdate(row);
		});*/
		_grid.listen('editCallback', function(row) {
			addAndUpdate(row);
		});
		_grid.listen('viewCallback', function(row) {
			view(row);
		});

		//封装下拉数据
		getDictionaryFromServer('/queryBusinessTypes?t=' + Math.random(), function(json) {
			if ('0' == json.response) {
				dictionaryCollection.businessTypesArr = json.businessTypes || [];
				!Utils.is('Array', dictionaryCollection.businessTypesArr) && (dictionaryCollection.businessTypesArr = [dictionaryCollection.businessTypesArr]);
				//setSelect('businessTypesArr', doms.chargeTypeInt);
			}
		}, function(e) {
			// report
		});
		getDictionaryFromServer('/queryAccountTypes?t=' + Math.random(), function(json) {
			if ('0' == json.response) {
				dictionaryCollection.accountTypesArr = json.accountTypes || [];
				!Utils.is('Array', dictionaryCollection.accountTypesArr) && (dictionaryCollection.accountTypesArr = [dictionaryCollection.accountTypesArr]);
			}
		}, function(e) {
			// report
		});
		getDictionaryFromServer('/queryPayTypeList?t=' + Math.random(), function(json) {
			if ('0' == json.response) {
				dictionaryCollection.payTypeArr = json.payTypes || [];
				!Utils.is('Array', dictionaryCollection.payTypeArr) && (dictionaryCollection.payTypeArr = [dictionaryCollection.payTypeArr]);
			}
		}, function(e) {

		});
		registerEvents();
	}

	//获取下拉数据
	function getDictionaryFromServer(url, callback, errorback) {
		var emptyFn = function() {},
			cb = callback || emptyFn,
			ecb = errorback || emptyFn;
		$.ajax({
			url: global_config.serverRoot + url,
			success: cb,
			async: false,
			error: ecb
		});
	}

	/*
	 * 下拉填充
	 */
	function setSelect(gArr, dom, selected) {
		var data = dictionaryCollection[gArr],
			s = '',
			context = this,
			args = Array.prototype.slice.call(arguments, 0),
			fn = arguments.callee,
			key = arguments[3] || 'innerValue',
			val = arguments[4] || 'label';

		if (!data) {
			setTimeout(function() {
				console.log('retry');
				fn.apply(context, args);

			}, 10);
			return;
		}
		for (var i = 0; i < data.length; i++) {
			if (selected == data[i].innerValue) {
				s = ' selected = "selected"';
			} else {
				s = '';
			}
			dom.append('<option value="' + data[i][key] + '"' + s + '>' + Xss.inHTMLData(data[i][val]) + '</option>');
		}
	}

	/*
	 * cb 判断是否是查看
	 * data ! 可以判断是否是新增
	 */
	function addAndUpdate(data, cb) {
		var opt = {},
			id = '',
			tpl = ('function' == typeof cb) ? infoViewTpl : infoAddEditTpl;
		opt.message = '<h4><b>' + (data ? ('function' == typeof cb ? '查看商户信息' : '修改商户信息') : '添加商户') + '</b></h4><hr class="no-margin">' + tpl;

		if (!('function' == typeof cb)) {
			opt.buttons = {
				"save": {
					label: '保存', //'<i class="ace-icon fa"></i>通过',
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
		if (!data) {
			$("div#zhInfoEdit").addClass('hide');
			$("div#zhInfoAdd").removeClass('hide');
		}

		$('div#editBaseInfo input').on('change', function(e) {
			validate($(this));
		});
		$('div#editBaseInfo input').on('blur', function(e) {
			validate($(this));
		});
		setSelect('businessTypesArr', $('#accountType'));
		setSelect('accountTypesArr', $('#bussinessType'), null, 'key', 'value');
		/** 设置支付产品选项 */
		if (dictionaryCollection.payTypeArr && dictionaryCollection.payTypeArr.length) {
			var html = [],
				di;
			for (var i = 0; i < dictionaryCollection.payTypeArr.length; i++) {
				di = dictionaryCollection.payTypeArr[i];
				html.push('<span><input type="checkbox" name="zfcp" id="zfcp' + di.id + '" value="' + di.id + '" /><label for="zfcp' + di.id + '">' + di.tool + '</label>&nbsp;&nbsp;</span>');
			}
			$('#zf').html(html.join(''));
		}
		data && fillData(data); //编辑和查看需要
	}
	/**
	 * [fillData 编辑时，填充数据]
	 * @param  {[Object]} d [选中行数据]
	 * @return {[type]}   [description]
	 */
	function fillData(d) {
		var data = d[0] || {};
		console.log(data);
		/*if(dictionaryCollection['accountTypesArr']){
			for (var i = 0; i < dictionaryCollection['accountTypesArr'].length; i++) {
				if (data.userType == dictionaryCollection['accountTypesArr'][i].innerValue) {
					$("div[vfor=accountType]").html(dictionaryCollection['accountTypesArr'][i].label);		
				}
			}			
		}
		if(dictionaryCollection['businessTypesArr']){
			for (var i = 0; i < dictionaryCollection['businessTypesArr'].length; i++) {
				if (data.userType == dictionaryCollection['businessTypesArr'][i].innerValue) {
					$("div[vfor=bussinessType]").html(dictionaryCollection['businessTypesArr'][i].label);		
				}
			}	
		}*/
		if (data.merchantNum) {
			$("[vfor=merchantNum]").html(data.merchantNum);
		}
		if (data.outMerchantId) {
			$("[vfor=outMerchantId]").html(data.outMerchantId);
		}
		if (data.loginId) {
			$("[vfor=loginId]").html(data.loginId);
		}
		if (data.outMerchantName) {
			$("div#editBaseInfo input[name=merchantName]").val(data.outMerchantName);
			$("div#viewBaseInfo [vfor=merchantName]").html(data.outMerchantName);
		}
		if (data.merchantUrl) {
			$("div#editBaseInfo input[name=merchantUrl]").val(data.merchantUrl);
			$("div#viewBaseInfo [vfor=merchantUrl]").html(data.merchantUrl);
		}
		if (data.businessAddr) {
			$("div#editBaseInfo input[name=businessCertAddr]").val(data.businessAddr);
			$("div#viewBaseInfo [vfor=businessCertAddr]").html(data.businessAddr);
		}
		if (data.postalCode) {
			$("div#editBaseInfo input[name=postalCode]").val(data.postalCode);
			$("div#viewBaseInfo [vfor=postalCode]").html(data.postalCode);
		}
		if (data.businessCertAddr) {
			$("div#editBaseInfo input[name=businessCertAddr]").val(data.businessCertAddr);
			$("div#viewBaseInfo [vfor=businessCertAddr]").html(data.businessCertAddr);
		}
		if (data.businessCertCode) {
			$("div#editBaseInfo input[name=businessCertCode]").val(data.businessCertCode);
			$("div#viewBaseInfo [vfor=businessCertCode]").html(data.businessCertCode);
		}
		if (data.postalCode) {
			$("div#editBaseInfo input[name=postalCode]").val(data.postalCode);
			$("div#viewBaseInfo [vfor=postalCode]").html(data.postalCode);
		}
		if (data.postalCode) {
			$("div#editBaseInfo input[name=postalCode]").val(data.postalCode);
			$("div#viewBaseInfo [vfor=postalCode]").html(data.postalCode);
		}
		if (data.postalCode) {
			$("div#editBaseInfo input[name=postalCode]").val(data.postalCode);
			$("div#viewBaseInfo [vfor=postalCode]").html(data.postalCode);
		}
	}

	/**
	 * [validate 检验函数]
	 * @param  {[HTML Element]} el [要校验的元素，不传递则全部检查]
	 * @return {[Boolean]}    [description]
	 */
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
			if (el.data('code')) {
				if (el.val().trim() == '') {
					elp.removeClass('has-error');
					elts.hide();
				} else {
					if ($.isNumeric(el.val())) {
						elp.removeClass('has-error');
						elts.hide();
					} else {
						pass = false;
						elp.addClass('has-error');
						elts.show();
					}
				}

			} else if (el.data('empty')) {
				if ('' != el.val().trim()) {
					elp.removeClass('has-error');
					elts.hide();
				} else {
					pass = false;
					elp.addClass('has-error');
					elts.show();
				}

			} else if (el.data('url')) {
				if (el.val().trim() == '') {
					elp.removeClass('has-error');
					elts.hide();
				} else {
					if (Utils.isUrl(el.val())) {
						elp.removeClass('has-error');
						elts.hide();
					} else {
						pass = false;
						elp.addClass('has-error');
						elts.show();
					}
				}

			} else if (el.data('regist')) {
				if (el.val().trim() == '') {
					pass = false;
					elp.addClass('has-error');
					elts.show();
					elts.html('请输入营业执照注册号！');
				} else if (!(/^[A-Za-z0-9]*$/.test(el.val().trim()))) {
					pass = false;
					elp.addClass('has-error');
					elts.show();
					elts.html('请输入数字或字母！');
				} else {
					elp.removeClass('has-error');
					elts.hide();
				}

			} else if (el.data('phone')) {
				if (el.val().trim() == '') {
					pass = false;
					elp.addClass('has-error');
					elts.show();
					elts.html('请输入联系电话！');
				} else if (!$.isNumeric(el.val())) {
					pass = false;
					elp.addClass('has-error');
					elts.show();
					elts.html('请输入数字！');
				} else {
					elp.removeClass('has-error');
					elts.hide();
				}
			} else if (el.data('email')) {
				if (el.val().trim() == '') {
					pass = false;
					elp.addClass('has-error');
					elts.show();
					elts.html('请输入联系邮箱！');
				} else if (!(/^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test(el.val().trim()))) {
					pass = false;
					elp.addClass('has-error');
					elts.show();
					elts.html('邮箱格式不正确，请重新输入！');
				} else {
					elp.removeClass('has-error');
					elts.hide();
				}
			}
		} else {
			var obj = $("div#editBaseInfo").find("input");
			pass = validBase(obj);
		}
		return pass;
	}
	//判断有效的根基func
	function validBase(boxObj) {
		var pass = true;
		boxObj.each(function(i, v) {
			var $el = $(this),
				$p = $el.parents('.form-group:first'),
				$ts = $el.siblings('span.error-ts'),
				isInt = $el.data('int'),
				isEmpty = $el.data('empty'),
				isUrl = $el.data('url'),
				isCode = $el.data('code'),
				isRegist = $el.data('regist'),
				isPhone = $el.data('phone'),
				isEmail = $el.data('email');
			if (isCode) {
				if ('' != $el.val().trim()) {
					if ($.isNumeric($el.val())) {
						$p.removeClass('has-error');
						$ts.hide();
					} else {
						pass = false;
						$p.addClass('has-error');
						$ts.show();
					}
				} else {
					$p.removeClass('has-error');
					$ts.hide();
				}
			}
			if (isEmpty) {
				if ('' != $el.val().trim()) {
					$p.removeClass('has-error');
					$ts.hide();
				} else {
					pass = false;
					$p.addClass('has-error');
					$ts.show();
				}
			}
			if (isUrl) //网址不为空时进行判断
			{
				if ('' != $el.val().trim()) {
					if (Utils.isUrl($el.val())) {
						$p.removeClass('has-error');
						$ts.hide();
					} else {
						pass = false;
						$p.addClass('has-error');
						$ts.show();
					}
				} else {
					$p.removeClass('has-error');
					$ts.hide();
				}
			}
			if (isRegist) {
				if ($el.val().trim() == '') {
					pass = false;
					$p.addClass('has-error');
					$ts.show();
					$ts.html('请输入营业执照注册号！');
				} else if (!(/^[A-Za-z0-9]*$/.test($el.val().trim()))) {
					pass = false;
					$p.addClass('has-error');
					elts.show();
					$ts.html('请输入数字或字母！');
				} else {
					$p.removeClass('has-error');
					$ts.hide();
				}

			}
			if (isPhone) {
				if ($el.val().trim() == '') {
					pass = false;
					$p.addClass('has-error');
					$ts.show();
					$ts.html('请输入联系电话！');
				} else if (!$.isNumeric($el.val())) {
					pass = false;
					$p.addClass('has-error');
					$ts.show();
					$ts.html('请输入数字！');
				} else {
					$p.removeClass('has-error');
					$ts.hide();
				}
			}
			if (isEmail) {
				if ($el.val().trim() == '') {
					pass = false;
					$p.addClass('has-error');
					$ts.show();
					$ts.html('请输入联系邮箱！');
				} else if (!(/^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test($el.val().trim()))) {
					pass = false;
					$p.addClass('has-error');
					$ts.show();
					$ts.html('邮箱格式不正确，请重新输入！');
				} else {
					$p.removeClass('has-error');
					$ts.hide();
				}
			}
		});
		return pass;
	}
	/**
	 * [view 查看详情]
	 * @param  {[Array]} row [行信息]
	 * @return {[type]}     [description]
	 */
	function view(row) {
		addAndUpdate(row, function() {});
	}

	//保存（新增、编辑）
	function submitData(data) {
		var data = {},
			accountType = $('#accountType').val(),
			businessType = $('#businessType').val(),
			merchantName = $('input[name="merchantName"]').val(),
			merchantUrl = $('input[name="merchantUrl"]').val(),
			businessAddr = $('input[name="businessAddr"]').val(),
			postalCode = $('input[name="postalCode"]').val(),
			businessCertAddr = $('input[name="businessCertAddr"]').val(),
			businessCertCode = $('input[name="businessCertCode"]').val(),
			linkman = $('input[name="linkman"]'),
			linkphone = $('input[name="linkphone"]'),
			linkmail = $('input[name="linkmail"]'),
			zfcp = $('input[name="zfcp"]:checked').map(function() {
				return $(this).val()
			}).get(),
			dkcp = $('input[name="dkcp"]:checked').map(function() {
				return $(this).val()
			}).get();
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
			if (cls && cls.indexOf('fa-check') > -1 || (id && 'query-btn' == id)) {
				if (getParams()) {
					_grid.setUrl(getUrl());
					_grid.loadData();
				}
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

			if ('input' == tag && 'zfcp' == name) {
				var $dk = $('#dk');
				if ($el.prop('checked')) {
					var node = $el.parent().clone();
					node.find('input').attr('name', 'dkcp');
					$dk.append(node);
				} else {
					var rre = $dk.find('#' + $el.attr('id'));
					if (rre) {
						rre.parent().remove();
					}
				}
			}

		});
	}

	function getParams() {
		var newParam = {},
			newchange = false,
			accountName = doms.accountName.val(),
			merchantNum = doms.merchantNum.val(),
			merchantID = doms.merchantID.val(),
			merchantName = doms.merchantName.val();
		if (accountName) {
			newParam.accountName = accountName;
		}
		if (merchantNum) {
			newParam.merchantNum = merchantNum;
		}
		if (merchantID) {
			newParam.merchantID = merchantID;
		}
		if (merchantName) {
			newParam.merchantName = merchantName;
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
		return global_config.serverRoot + 'queryMerchantInfo?size=15&' + Utils.object2param(userParam);
	}

	return {
		init: init
	};
});