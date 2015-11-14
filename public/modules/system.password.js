define(function(require, exports, module) {
	var Box = require('boxBootstrap');
	var D = window.D = require("dialog.ace");
	var tool = require("why");
	var apis = {
			update : global_config.serverHost.replace(/\/+$/,'') + '/upPwd'
		}
	var errfun = function(e){
		var msg = typeof e == 'object' ? e.statusText || e.msg || "未知错误!" : e;
		D.err(msg);
	}
	$(function(){
		//菜单自动定位
		//tool.autonav('#sidebar ul.submenu>li','active').parents('ul.submenu').parent().addClass('active open');
		$('#form1').on('submit',function(){
			var form = $(this);
			if($.trim(form.find('#form-field-1').val()) == ""){
				D.err("原密码不能为空!")
				return false;
			}
			if($.trim(form.find('#form-field-2').val()) == ""){
				D.err("新密码不能为空!")
				return false;
			}
			if(form.find('#form-field-2').val() !== form.find('#form-field-3').val()){
				D.err("两次密码不一致!")
				return false;
			}
			$.post(apis.update,form.serialize(),null,'json').then(function(data){
				if(data.success){
					D.suss('操作成功!');
				}else{
					return $.Deferred().reject(data.message || data.msg || "未知错误!")
				}
			}).then(null,errfun)
			return false;
		})
	})
});















