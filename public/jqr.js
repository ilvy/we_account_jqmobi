/**
 * Created by man on 15-4-3.
 */

requirejs.config({
    baseUrl:'/',
    paths:{
        //jquery:'javascripts/jquery',
        router:'javascripts/router',
        //routerConfig:'javascripts/routerConfig',
        'room-door':'javascripts/room-door',
        touchEvent:'touchUtil',
        laydate:'Jplugin/laydate/laydate',
        util:'util/util',
        jqmobiTouch:"javascripts/libs/jquery.mobile.custom",
        preloadImg:"javascripts/preloadImg",
        waterfall:"javascripts/waterfall_relative",
        ajaxupload:"javascripts/ajaxupload",
        jpopup:'Jplugin/jquery.light-popup/jquery.light-popup',
        //wxAPI:'http://res.wx.qq.com/open/js/jweixin-1.0.0'
        wxAPI:'javascripts/jweixin-1.0.0',
        sideNav:'modules/side-nav/side-nav',
        text:'javascripts/libs/require/text'
        //bill:'modules/bill/bill'
    },
    // paths:{
    //    //jquery:'javascripts/jquery',
    //    router:'http://static.daidai2u.com/javascripts/router.js?v=1.0',
    //    routerConfig:'http://static.daidai2u.com/javascripts/routerConfig',
    //    'room-door':'http://static.daidai2u.com/javascripts/room-door',
    //    touchEvent:'http://static.daidai2u.com/touchUtil',
    //    laydate:'http://static.daidai2u.com/Jplugin/laydate/laydate',
    //    util:'http://static.daidai2u.com/util/util.js?v=1.0',
    //    jqmobiTouch:"http://static.daidai2u.com/javascripts/libs/jquery.mobile.custom",
    //    preloadImg:"http://static.daidai2u.com/javascripts/preloadImg",
    //    waterfall:"http://static.daidai2u.com/javascripts/waterfall_relative.js?v=1.0",
    //    ajaxupload:"http://static.daidai2u.com/javascripts/ajaxupload",
    //    jpopup:'http://static.daidai2u.com/Jplugin/jquery.light-popup/jquery.light-popup.js?v=2.1',
    //    //wxAPI:'http://res.wx.qq.com/open/js/jweixin-1.0.0'
    //    wxAPI:'http://static.daidai2u.com/javascripts/jweixin-1.0.0'
    //    //bill:'modules/bill/bill'
    // },
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
//        ,
//        jqmobiTouch:{
//            exports:'jqmobiTouch'
//        },
//        preloadImg:{
//            exports:'preloadImg'
//        },
//        ajaxupload:{
//            exports:'ajaxupload'
//        },
//        waterfall:{
//            exports:'waterfall'
//        }
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
    nickname:'',//当前账单用户昵称
    showLoading:function(){
        $("#loading").css('display','block');
    },
    hideLoading:function(){
        $("#loading").css('display','none');
    }
};

var routerConfig = {
    live_room:'modules/live_room/live_room',
    register:'modules/register/register',
    publish:'modules/publish/publish',
    product_display:'modules/product/product',
    myFavorite:'modules/myFavorite/myFavorite',//收藏夹
    room_door:'modules/room_door/room_door',
    personality:'modules/personality/personality',
    billSystem:'modules/bill/bill',
    add_order:'modules/add_order/add_order',
    getpay:'modules/Payment/Payment'
};
// var routerConfig = {
//    live_room:'http://static.daidai2u.com/modules/live_room/live_room.js',
//    register:'http://static.daidai2u.com/modules/register/register.js',
//    publish:'http://static.daidai2u.com/modules/publish/publish.js?v=1.1',
//    product_display:'http://static.daidai2u.com/modules/product/product.js?v=1.1',
//    myFavorite:'http://static.daidai2u.com/modules/myFavorite/myFavorite.js',//收藏夹
//    room_door:'http://static.daidai2u.com/modules/room_door/room_door.js?v=1.1',
//    personality:'http://static.daidai2u.com/modules/personality/personality.js',
//    billSystem:'http://static.daidai2u.com/modules/bill/bill.js?v=3.1',
//    add_order:'http://static.daidai2u.com/modules/add_order/add_order.js',
//    getpay:'http://static.daidai2u.com/modules/Payment/Payment.js?v=1.1'
// };

define(['router','wxAPI','sideNav'],function(router,wx,sideNav){
    deviceReady();
    wxjssdkInit(function(err,results){
        var config;
        if(results.flag == 1){
            var data = results.data;
//            alert(data.url);
            config = {
//                debug:true,
                appId:"wx2f81c72f4e91b732",
                jsapi_ticket: data.jsapi_ticket,
                nonceStr: data.nonceStr,
                timestamp: data.timestamp,
                signature:data.signature,
                url: data.url,
                jsApiList: ['onMenuShareAppMessage','scanQRCode']
            };
            wx.config(config);
            wx.ready(function(){
//                alert("wxjssdkinit success");
                wx.checkJsApi({
                    jsApiList: ['onMenuShareAppMessage','onMenuShareTimeline','scanQRCode','startRecord','stopRecord','onVoiceRecordEnd','translateVoice','getLocation'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
                    success: function(res) {
                        // 以键值对的形式返回，可用的api值true，不可用为false
                        // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
//                        (res.checkResult.onMenuShareAppMessage);
                    }
                });
            });
            wx.error(function(res){
                alert("wxjssdkinit failed");
            });
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


function deviceReady(argument) {
    // alert("deviceready")
    document.addEventListener('deviceready',onDeviceReady,false);
}

function onDeviceReady(){
     // alert("deviceready")
    document.addEventListener('backbutton',function(){
        // alert("backbutton");
    },false);
}