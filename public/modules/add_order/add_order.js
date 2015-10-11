/**
 * Created by Administrator on 2015/9/22.
 */
/**
 * Created by man on 15-5-8.
 */
define(['router','touchEvent'],function(router){
    var AddOrder = function(){
        this.init();
    };
    AddOrder.prototype = {
        init:function(){
            this.do();
            this.addListener();
        },
        do:function(){

        },
        addListener:function(){

        }
    };

    globalVar.modules['add_order'] = new AddOrder();
});