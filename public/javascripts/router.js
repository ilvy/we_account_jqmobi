/**
 * Created by Administrator on 2015/4/5.
 */
define(['jquery','routerConfig'],function($,routerConfig){
    var key = window.location.hash.substring(1) || 'page1',
        path = routerConfig[key];
    var module = require([path],function(module){

    });
    $(window).on('hashchange',function(){
        for(var hash in routerConfig){
            var path = routerConfig[hash];
            if(window.location.hash == '#'+hash){
                require([path],function(module){

                });
            }
        }
    });

});