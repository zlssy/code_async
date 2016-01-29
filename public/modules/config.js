define(function(require, exports, module) {
	var Box = require('boxBootstrap');
	var D = window.D = require("dialog.ace");
	var tool = require("why");
	var apis = {
			edit : global_config.serverRoot.replace(/\/+$/,'') + '/config/configFortumo'
		}
	var errfun = function(e){
		var msg = typeof e == 'object' ? e.statusText || e.msg || "操作失败!" : e;
		D.err(msg);
	}
	;(function($){
		function getmsg(ele){
			var o = $(ele);
			var msg = o.nextAll('.help-block')
			if(msg.length) return msg;
			else return $('<div class="help-block" style="clear: both; margin:0; margin-bottom:-10px;"></div>').insertAfter(o);
		}

		$.fn.extend({
			showErrMsg:function(msg){
				this.closest('.form-group').addClass('has-error');
				var smsg = getmsg(this);
				smsg.text(msg).show();
			}
			,hideMsg:function(){
				this.closest('.form-group').removeClass('has-error');
				if($(this).nextAll('.help-block').length) getmsg(this).hide();
			}
			,showMsg:function(msg){
				this.closest('.form-group').removeClass('has-error');
				var smsg = getmsg(this)
				smsg.text(msg).show();
			}
		})
	})(jQuery)
	$(function(){
		//菜单自动定位
		//tool.autonav('#sidebar ul.submenu>li','active').parents('ul.submenu').parent().addClass('active open');
		$('#form1').on('submit',function(){
			var form = $(this);
			var items = ['merchantId','productId','serviceId','inApplicationSecret','secret'];
			var pass = true;
			for(var i = 0; i<items.length; i++){
				var name = items[i],
					item = form.find('[name="'+name+'"]');
				if($.trim(item.val()) == ""){
					pass = false;
					item.closest('selector').addClass('has-error');
					item.focus().showErrMsg('请输入'+name);
					break;
				}else{
					item.hideMsg();
				}
			}
			if(pass){
				$.post(apis.edit,form.serialize(),null,'json').then(function(data){
					if(data.code == 0){
						D.suss('操作成功!','提示',function(){location.reload()});
					}else{
						return $.Deferred().reject(data.message || data.msg || "操作失败!")
					}
				}).then(null,errfun)
			}
			return false;
		})
	})
});
