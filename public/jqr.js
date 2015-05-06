/**
 * Created by man on 15-4-3.
 */

requirejs.config({
    baseUrl:'/',
    paths:{
        text:'javascripts/libs/require/text',
        jquery:'javascripts/jquery',
        router:'javascripts/router',
        routerConfig:'javascripts/routerConfig',
        'room-door':'javascripts/room-door',
        touchEvent:'touchUtil',
        laydate:'Jplugin/laydate/laydate',
        util:'util/util',
        wxAPI:'http://res.wx.qq.com/open/js/jweixin-1.0.0'
    },
    shim:{
        jquery:{
            exports:'jquery'
        },
        'room-door':{
            exports:'room_door'
        },
        touchEvent:{
            exports:'touchEvent'
        },
        laydate:{
            exports:'laydate'
        }
    }
});

/**
 * 全局变量
 */
var globalVar = {
    scrollTop:0,
    live_room:'',
    reload:{},//标示模块是否重新加载
    modules: {},
    productArray : [],
    hashFrom:'',
    showLoading:function(){
        $("#loading").css('display','block');
    },
    hideLoading:function(){
        $("#loading").css('display','none');
    }
};

define(['text','router','wxAPI'],function(text,router,wxAPI){
    wxjssdkInit(function(err,results){
        var config;
        if(results.flag == 1){
            var data = results.data;
            config = {
                app:"wxaef4aefd905a4662",
                jsapi_ticket: data.jsapi_ticket,
                nonceStr: data.nonceStr,
                timestamp: data.timestamp,
                signature:data.signature,
                url: data.url,
                jsApiList: ['onMenuShareAppMessage']
            };
            wx.config(config);
            wx.ready(function(){
                console.log("wxjssdkinit success");
            })
        }
    })
});

function wxjssdkInit(callback){
    var data = {
        url:window.location.href.split("#")[0]
    };
    $.ajax({
        url:'/we_account/wxjssdkinit',
        type:'post',
        data:data,
        success:function(results){
            if(results.flag == 1){
                callback(null,results);
            }else{

            }
        },
        error:function(err){
            if(err){
                console.log("wxjssdkinit err:",err);
            }
        }
    });
}