define(function(require,exports,module){
	var GUID = 1000;

	function Tips(msg){
		this.msg = msg;
		this.id = ++GUID;
		this.init.apply(this, Array.prototype.slice.call(arguments, 1));
	}

	Tips.prototype = {
		init: function() {
			$(document.body).append('<div id="tips_' + this.id + '" class="tips_msg_box" style="position:fixed; top: 50%; left:50%; width:200px; height:50px; margin-left:-100px; margin-top:-25px; line-height: 50px; text-align:center; border:solid 2px #428bca!important; font-weight:bold; display:none"><div class="tips_msg_txt"></div></div>');
			this.msgbox = $('#tips_' + this.id);
			this.msgTxt = this.msgbox.find('.tips_msg_txt');
		},
		show: function(str) {
			str && (this.msg = str);
			this.msgTxt.html(str);
			this.msgbox.show();
		},
		hide: function(){
			this.msgbox.hide();
		}
	};

	exports.Tips = function(msg){
		return new Tips(msg);
	};
});