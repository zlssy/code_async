define(function(require, exports, module) {
	var Box = require('boxBootstrap');
	var tool = require("why");
	var rooturl = global_config.serverRoot.replace(/\/+$/,'');
	var apis = {
			update : rooturl + '/dataDictionary/addOrUpdate'
		}
	var errfun = function(e){
		var msg = typeof e == 'object' ? e.statusText || e.msg || "未知错误!" : e;
		Box.alert(msg);
	}
	$(function(){
		//菜单自动定位
		//tool.autonav('#sidebar ul.submenu>li','active').parents('ul.submenu').parent().addClass('active open');
		$('#form1').on('submit',function(){
			var form = $(this);
			if($.trim(form.find('#form-field-1').val()) == ""){
				Box.alert("原密码不能为空!")
				return false;
			}
			if($.trim(form.find('#form-field-2').val()) == ""){
				Box.alert("新密码不能为空!")
				return false;
			}
			if(form.find('#form-field-2').val() !== form.find('#form-field-3').val()){
				Box.alert("两次密码不一致!")
				return false;
			}
			$.post(apis.update,form.serialize(),null,'json').then(function(){
				if(data.code != 0){return $.Deferred().reject(data.message || data.msg || "未知错误!")}
				Box.alert('操作成功!')
			}).then(null,errfun)
			return false;
		})
	})
});















