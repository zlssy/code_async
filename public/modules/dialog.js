define(function(require, exports, module) {
    var customOpt = {
        modal: true,
        fixed: true,
        okValue: 'Yes',
        okfocus: false
    };
    var commonContent = [
        '<div class="dialog-icon"></div>',
        '<div class="dialog-msg">',
        '{msg}',
        '</div>',
        '<div class="dialog-msg2">',
        '{msg2}',
        '</div>'
    ].join("");
    var art_dialog = {
        success: function(msg, msg2, yesFn) {
            var content = commonContent.replace('{msg}', msg).replace('{msg2}', msg2 || "");
            var opt = $.extend(true, {
                skin: "ui-dialog-custom ui-dialog-success",
                content: content,
                ok: function() {
                    yesFn && yesFn();
                }
            }, customOpt);
            dialog(opt).show();
        },
        error: function(msg, msg2, yesFn) {
            var content = commonContent.replace('{msg}', msg).replace('{msg2}', msg2 || "");
            var opt = $.extend(true, {
                skin: "ui-dialog-custom ui-dialog-warning",
                id: "dialogError",
                content: content,
                quickClose: false,
                ok: function() {
                    yesFn && yesFn();
                },
                cancel: false
            }, customOpt);
            dialog(opt).show();
        },
        warning: function(msg, msg2, yesFn, noFn) {
            var content = commonContent.replace('{msg}', msg).replace('{msg2}', msg2 || "");
            var opt = $.extend(true, {
                skin: "ui-dialog-custom ui-dialog-warning",
                content: content,
                ok: function() {
                    yesFn && yesFn();
                },
                cancel: function() {
                    noFn && noFn();
                },
                cancelValue: "No"
            }, customOpt);
            dialog(opt).show();
        },
        loading: {
            start: function(txt) {
                var con = '<img style="width:22px;height: 22px;vertical-align: middle" src="' + (global_config.staticRoot || '../') + 'css/images/loading.gif"/> ';
                con += txt || "please wait";
                this.loadingDialog = dialog({
                    id: 'loading',
                    content: con,
                    modal: true,
                    fixed: true
                }).show();
            },
            end: function() {
                if (this.loadingDialog) {
                    this.loadingDialog.remove();
                    this.loadingDialog = null;
                }

            }

        },
        custom: function(ops) {
            var opt = $.extend(true, {}, customOpt, ops);
            return dialog(opt).show();
        },
        edit: function(ops) {
            ops = ops || {};
            var tits = [
                '<div class="tit" >',
                ops.title || ""
            ];
            if (ops.transSync) {
                tits.push($('#tplTransSync').html());
            }
            tits.push('</div>');
            if (ops.close) {
                tits.push('<span class="edit-close" i="close"></span>');
            }
            tits.push('<div class="edit-content">' + ops.content + '</div>');
            var con = tits.join("");
            var existDialog = dialog.get('popupEdit');
            if (existDialog) {
                existDialog.remove();
            }
            var pop = art_dialog.custom({
                content: con,
                fixed: false,
                id: 'popupEdit',
                skin: "ui-dialog-custom ui-dialog-edit " + ops.skin,
                okValue: ops.okValue || "保存",
                ok: ops.ok || $.noop,
                cancelValue: ops.cancelValue || "取消",
                cancel: ops.cancel || $.noop,
                onremove: ops.onremove || $.noop
            });

            return pop;
        },
        editNoButton: function(ops) {
            ops = ops || {};
            var tits = [
                '<div class="tit" >',
                ops.title || "",
                '</div>'
            ];
            if (ops.close) {
                tits.push('<span class="edit-close" i="close"></span>');
            }
            tits.push('<div class="edit-content">' + ops.content + '</div>');
            var con = tits.join("");
            var pop = dialog.custom({
                content: con,
                fixed: false,
                skin: "ui-dialog-custom ui-dialog-edit ui-dialog-edit-no-button " + ops.skin
            });
            return pop;
        }
    };
    return art_dialog;
});