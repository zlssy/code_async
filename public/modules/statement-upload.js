define(function(require, exports, module) {
    var art_dialog = require('dialog'),
        $form = $("#dataForm"),
        payTool,
        $uploadFile = $('#uploadFile'),
        renderSelect = require("renderSelect");

    function init() {
        renderSelect($form.find("[dict-name=payChannel]"), {
            "value" : "code",
            "label" : "label_en"
        });
        $form.on("change", "[name=payTool]", function () {
            payTool = $(this).val();
        });
        $uploadFile.on("click", function () {
            if (!payTool) {
                art_dialog.error("请先选择支付工具");
                return false;
            }
        });
        $uploadFile.fileupload({
            url: "",
            beforeSend: function (e, data) {
                data.url = global_config.serverRoot + "/reconciliation?payChannel="
                    + payTool + "&date=" + new Date() + "";
            },
            start: function () {
                art_dialog.loading.start("uploading");
            },
            always:function(e, data){
                art_dialog.loading.end();
                if (data.result) {
                    (typeof data.result === "string") && (data.result = JSON.parse(data.result));
                    if(data.result.code == 0){
                        art_dialog.error('上传成功', data.result.msg);
                    } else {
                        art_dialog.error('上传失败', data.result.msg);
                    }
                }
            }
        })
    }

	return {
		init: init
	};
});