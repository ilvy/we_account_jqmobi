/**
 * Created by man on 15-4-3.
 */

requirejs.config({
    baseUrl:'./',
    paths:{
        text:'javascript/require/text',
        jquery:'javascript/jquery',
        router:'javascript/router',
        routerConfig:'javascript/routerConfig'
    },
    shim:{
        jquery:{
            export:'jquery'
        }
    }
});

define(['text','jquery','router'],function(text,$,router){

});