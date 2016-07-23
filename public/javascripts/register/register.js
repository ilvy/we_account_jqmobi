(function(global){

var emailReg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
var pwdReg = /^[\w]{6}$/;//数字密码组合

$(document).ready(function(){
    $("#username").on('input',debounce(function(){
        var $this = $(this),
            email = $this.val();
        if(emailReg.test(email)){
            var url = '/we_account/check_username?email='+email;//这里暂时只是检查邮箱是否已经注册
            var options = {
                    url:url,
                    type:'post'
                };
            checkUsername(options);
        }
    },500));
    $("a.bind-link").on('click',function(){
        var email = $("#username").val();
        service.fetchAjax({
            url:'/we_account/bind_account?email='+email,
            type:'post'
        }).done(function(results){
            window.location.href = '/we_account/live-room#billSystem';
        }).fail(function(err){
            alert("绑定失败！");
        });
    });
    $("a.cancel-link").on("click",function(){
        $('.w-links').addClass('hide');
        $('.w-reg-info').removeClass('hide');
    });
});

function checkUsername(options){
    service.fetchAjax(options).done(function(results){
        if(results.data == 1 && isWeixin()){//邮箱已经注册过，且当前在登录态
            $('.w-links').removeClass('hide');
            $('a.bind-link,a.cancel-link').removeClass('hide');
            $('a.login-link').addClass('hide');
            $('.w-reg-info').addClass('hide');
        }else if(results.data == 2 || results.data == 1){
            $('.w-links').removeClass('hide');
            $('a.login-link,a.cancel-link').removeClass('hide');
            $('a.bind-link').addClass('hide');
            $('.w-reg-info').addClass('hide');
        }else if(results.data == 0){//邮箱尚未注册
            $('.w-links').addClass('hide');
            $('.w-reg-info').removeClass('hide');
        }
    }).fail(function(err){
        console.log('?????????',err);
    });
}

function register(){
    var username = $("#username").val(),
            nickname = $("#nickname").val(),
            pwd = $("#pwd").val(),
            confirmPwd = $("#confirmPwd").val(),
            weixin = $('#weixin').val();
    var flag = true;
    if(!username || username.trim().length == 0 || !emailReg.test(username)){
        $("#username").css({
            borderBottomColor:"red"
        });
        $("#email-tip").css("display","block");
        setTimeout(function(){
            $("#email-tip").css("display","none");
        },2000);
        flag = false;
    }else{
        $("#username").css({
            borderBottomColor:"initial"
        });
    }
    if(!weixin || weixin.trim().length == 0){
        $("#weixin").css({
            borderBottomColor:"red"
        });
        flag = false;
    }else{
        $("#weixin").css({
            borderBottomColor:"initial"
        });
    }
    if(!pwd || pwd.trim().length == 0 || !pwdReg.test(pwd)){
        $("#pwd").css({
            borderBottomColor:"red"
        })
        flag = false;
    }else{
        $("#pwd").css({
            borderBottomColor:"initial"
        });
    }
    if(pwd != confirmPwd){
        $("#pwd-tip").css("display","block");
        setTimeout(function(){
            $("#pwd-tip").css("display","none");
        },2000);
        flag = false;
    }
    return flag;
}

/*
 *防止抖动
 */
function debounce(func, wait, immediate) {
    // immediate默认为false
    var timeout, args, context, timestamp, result;

    var later = function() {
      // 当wait指定的时间间隔期间多次调用_.debounce返回的函数，则会不断更新timestamp的值，导致last < wait && last >= 0一直为true，从而不断启动新的计时器延时执行func
      var last = new Date().getTime() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = new Date().getTime();
      // 第一次调用该方法时，且immediate为true，则调用func函数
      var callNow = immediate && !timeout;
      // 在wait指定的时间间隔内首次调用该方法，则启动计时器定时调用func函数
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    }
}

function isWeixin(){
    var ua = navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i)) {
        return true;
    } else {
        return false;
    }
}

global.register = register;
})(window);
