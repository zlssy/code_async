define(function(require, exports, module) {
    var formValid = function($form){
        var $win = $(window);
        $form.bootstrapValidator('destroy');
        var formValidation = $form.
                bootstrapValidator({
                excluded:[],
                submitButtons:false
            }).
                data('bootstrapValidator');
        formValidation.validate();
        if (!formValidation.isValid()) {
            var $firstError = $form.find('.has-error').eq(0).find('[required]').eq(0).focus();
            return false;
        }
        return true;
    };
    return formValid;
});
