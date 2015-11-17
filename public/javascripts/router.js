/**
 * Created by Administrator on 2015/4/5.
 */
define(['routerConfig','util'],function(routerConfig,util){
    var key = window.location.hash,
        path = routerConfig[key];
    dealOrderFromWeb();
    loadModule(key);
    $(window).on('hashchange',function(){
        for(var hash in routerConfig){
            loadModule(window.location.hash,hash);
        }
    });

    function changeModule(hash){
        if(!globalVar.hashFrom || globalVar.hashFrom == hash){
            $('.'+hash).removeClass("slide-init").addClass("visible");
            globalVar.hashFrom = hash;
            return;
        }
        var $fromModule = $("."+globalVar.hashFrom),
            $toModule = $("."+hash);
        $fromModule.addClass('slide-out').find('#tools-box').addClass('tools-box-slide-out').removeClass('tools-box-slide-in');
        $toModule.addClass("visible").addClass("slide-init").addClass("slide-position");
        setTimeout(function(){
            $fromModule.removeClass("visible").removeClass('slide-out').addClass("slide-init");
            $toModule.addClass('slide-in').find('#tools-box').removeClass('tools-box-slide-out').addClass('tools-box-slide-in');
        },800);
        setTimeout(function(){
            $toModule.removeClass('slide-in').removeClass("slide-init").removeClass("slide-position");
        },1300);
//        $fromModule.css({
//            "position":"absolute",
//            width:"100%"
//        }).animate({
//            right:'100%'
//        },300,function(){
//            $(this).css({
//                "display":"none",
//                position:'static',
//                right:0
//            });
//        });

        globalVar.hashFrom = hash;
        if(typeof document.body.scrollTop != 'undefined'){
            document.body.scrollTop = globalVar.lv_scroll_top;
        }
        if(typeof document.documentElement.scrollTop != 'undefined'){
            document.documentElement.scrollTop = globalVar.lv_scroll_top;
        }
//        $('.page').each(function(){
//            var $module = $(this);
//            if($module.hasClass(hash)){
//                $module.removeClass("slide-out").css("display","block").addClass('slide-in');//.css("display","block");
//                setTimeout(function(){
//                    $module.removeClass('slide-in').removeClass('slide');
//                },550);
////                if(hash == 'live_room'){
////                    $('body,html').animate({scrollTop:globalVar.lv_scroll_top},'fast');
////                }
//                if(typeof document.body.scrollTop != 'undefined'){
//                    document.body.scrollTop = globalVar.lv_scroll_top;
//                }
//                if(typeof document.documentElement.scrollTop != 'undefined'){
//                    document.documentElement.scrollTop = globalVar.lv_scroll_top;
//                }
//            }else{
//                $module.removeClass("slide-in").addClass('slide-out');//.css("display","none");
//                setTimeout(function(){
//                    $module.removeClass('slide-out').addClass('slide').css("display","none");
//                },300);
//            }
//        });
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
                    console.log(module);
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
                globalVar.room_id = hashParts[1] || globalVar.room_id;
                if(globalVar.modules['live_room']){
                    globalVar.modules['live_room'].wxShare();
                }
                break;
            case '#product_display':
                globalVar.product_id = hashParts[1];
                globalVar.room_id = hashParts[2];
                break;
            default :
                break;
        }
        return hash;
    }

    function dealOrderFromWeb(){//处理直接
        var orderStatus = $("#forTakeOrder").data("orderstatus");
        if(orderStatus && orderStatus == 1){
            alert("下单成功");
            changeHash('live_room-'+globalVar.room_id,1);
        }else if(orderStatus && orderStatus == -1){
            alert("下单失败，请重试");
        }
    }
    function changeHash(hash,reload){
        var objHash = hash.split('-')[0];
        if(objHash){
            globalVar.reload[objHash] = reload || 0;
            if(objHash == 'live_room' && reload){
                globalVar.lv_scroll_top = 0;
            }else if(objHash == 'live_room' && !reload){
//                globalVar.modules['live_room'].dealForCompactShare();//从产品页面返回直播页面时，恢复对应title和第一张图片，兼容朋友圈分享
                util.dealForCompactShare(globalVar.userInfo.nickname);
            }
            window.location.hash = '#'+hash;
        }
    }
    return {
        changeHash:changeHash
    }

});