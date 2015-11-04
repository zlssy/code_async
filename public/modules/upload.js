define(function(require, exports, module) {
	var art_dialog = require('dialog');
	var $file = $('#file');

	function init() {
		// $('#form').attr('action', 'http://testtclpay.tclclouds.com/' + global_config.serverRoot + '/settleCard/import');
		$file.ace_file_input({
			style: 'well',
			btn_choose: '点击上传文件',
			btn_change: '已选文件如下：',
			droppable: true
		});
	}

	function upload(cb, fcb) {
		$file.fileupload({
			url: "",
			beforeSend: function(e, data) {
				data.url = global_config.serverRoot + "/settleCard/import?userId=" + "&t=" + Math.random();
			},
			start: function() {
				art_dialog.loading.start("uploading");
			},
			always: function(e, data) {
				art_dialog.loading.end();
				if (data.result) {
					(typeof data.result === "string") && (data.result = JSON.parse(data.result));
					if (data.result.code == 0) {
						art_dialog.error('导入成功', data.result.msg, cb);
					} else {
						art_dialog.error('导入失败', data.result.msg, fcb);
					}
				}
			}
		})
	}

	exports.init = init;
	exports.upload = upload;
});