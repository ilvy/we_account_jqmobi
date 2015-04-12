/**
 * Created by Administrator on 2015/4/5.
 */
define(['routerConfig'],function(routerConfig){
    var key = window.location.hash.substring(1) || 'live_room',
        path = routerConfig[key];
//    $.ui.loadContent("#"+key,false,false,'slide');
    var module = require([path],function(module){

    });
    $(window).on('hashchange',function(){
        for(var hash in routerConfig){
            var path = routerConfig[hash];
            if(window.location.hash == '#'+hash){
//                $.ui.loadContent("#"+key,false,false,'slide');
                $("#"+hash).trigger("click");
                require([path],function(module){

                });
            }
        }
    });

});