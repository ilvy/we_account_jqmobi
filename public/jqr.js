/**
 * Created by man on 15-4-3.
 */

requirejs.config({
    baseUrl:'/',
    paths:{
        text:'javascripts/libs/require/text',
        jquery:'javascripts/jquery',
        router:'javascripts/router',
        routerConfig:'javascripts/routerConfig'
    },
    shim:{
        jquery:{
            export:'jquery'
        }
    }
});

define(['text','router'],function(text,router){

});