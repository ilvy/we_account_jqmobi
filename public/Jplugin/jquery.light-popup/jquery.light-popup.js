(function (jquery) {
    var popup = null;
    jquery.fn.pop = function (options) {
        options = jquery.extend({},jquery.fn.pop.defaults, options);
        return this.each(function () {
            var jquerythis = jquery(this);
            if (!popup) {//若没有初始化，则先初始化
                popup = new Popup(jquerythis,options);
            } else {//弹出框已初始化完成，只需要显示即可
                if(options.hidden == 'true'){
                    popup.hide(options.callback);//代码隐藏弹出框时，传入回调函数
                    return;
                }
                popup.open(options);
            }
        });
    };

    jquery.fn.pop.defaults = { width: "500px", height: "400px" };//暴露pop的默认属性
    /*
    *@初始化弹出框
    **/
    function Popup(ele,options) {
        this.init(ele, options);//prototype是绑定到Popup对象上的，可用this直接调用
    };
    jquery.extend(Popup.prototype, {
        jqueryele: null,
        init: function (ele, options) {
            this.options = options;
            this.jqueryele = ele;
            this.open(options);
            var _this = this;
//            jquery(document).bind("click", hideModel);
            jquery(document).touch('click',function(event){
                hideModel(event);
                if(options.callback){
                    options.callback();//点击空白处消失时调用回调
                }
            });
            this.stopPropagation();
            function hideModel(event) {
                if (!(jquery(event.target).hasClass("light-popup"))) {
                    _this.hide();
                }
            }
        },
        hide: function (callback) {
            var _this = this;
            this.jqueryele.removeClass('light-popup-show');
            setTimeout(function(){
                _this.jqueryele.removeClass('visible');
            },1000)
            if(callback){
                callback();
            }
        },
        open: function () {
            var _this = this;
            this.jqueryele.addClass('visible');
            setTimeout(function(){
                _this.jqueryele.addClass('light-popup-show');
            },50)
        },
        addCloseBtn: function (src) {
            var _this = this;
            var closeBtn = document.createElement("image");
            closeBtn.src = src;
            closeBtn.setAttribute("class", "sclose");
            closeBtn.onclick = function (event) {
                _this.hide();
            };
            jquery(".popup-header").append(closeBtn);
        },
        stopPropagation:function(){
            jquery('#light-popup').touch("click",function(event){

            },true);
        }
    });
    jquery.pop = function () {
        alert("haha");
    };
})(jQuery);