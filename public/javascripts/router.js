/**
 * Created by Administrator on 2015/4/5.
 */
define(['routerConfig'],function(routerConfig){
    var key = window.location.hash || '#live_room-666666',
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
            hash = separateArgs(hParts);//根据hash分离参数,并获取当前hash
        }
        hash = hash.substring(1);
        if(hash == key_hash || !key_hash){
            changeModule(hash);
            var path = routerConfig[hash];
            if(!globalVar.modules[hash]){
                require([path],function(module){

                });
            }else{
                if(globalVar.modules[hash].do && globalVar.reload[hash]){
                    globalVar.modules[hash].do();
                }
            }

        }

    }

    /**
     * 分离参数
     */
    function separateArgs(hashParts){
        var hash = hashParts[0];
        switch (hash){
            case '#live_room':
                globalVar.room_id = hashParts[1];
                break;
            case '#product_display':
                globalVar.product_id = hashParts[1];
                break;
            default :
                break;
        }
        return hash;
    }

    return {
        changeHash:function(hash,reload){
            var objHash = hash.split('-')[0];
            if(objHash){
                globalVar.reload[objHash] = reload || 0;
                window.location.hash = '#'+hash;
            }
        }
    }

});