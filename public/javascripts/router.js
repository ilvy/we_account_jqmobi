/**
 * Created by Administrator on 2015/4/5.
 */
define(['routerConfig'],function(routerConfig){
    var key = window.location.hash || '#live_room',
        path = routerConfig[key];
    loadModule(key);
    $(window).on('hashchange',function(){
        for(var hash in routerConfig){
            loadModule(window.location.hash,hash);
        }
    });

    function changeModule(hash){
        $('.page').each(function(){
            var $module = $(this);
            if($module.hasClass(hash)){
                $module.css("display","block");
                if(hash == 'live_room'){
                    $('body,html').animate({scrollTop:globalVar.lv_scroll_top},'fast');
                }
            }else{
                $module.css("display","none");
            }
        });
    }

    /**
     *
     * @param hash
     * @param key_hash
     */
    function loadModule(hash,key_hash){
        var hParts;
        if((hParts = hash.split("-")).length > 1){
            hash = hParts[0];
            globalVar.product_id = hParts[1];//特殊处理product_display模块
        }
        hash = hash.substring(1);
        if(hash == key_hash || !key_hash){
            changeModule(hash);
            var path = routerConfig[hash];
            if(!modules[hash]){
                modules[hash] = require([path],function(module){

                });
            }else{
                if(modules[hash].do){
                    modules[hash].do();
                }

            }

        }

    }

});