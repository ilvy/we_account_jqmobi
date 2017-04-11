var  roomReg = /^[\d]{5,8}$/;
var pwdReg = /^[\w]{6}$/;//数字密码组合
$(function(){
	initError();
    fillLoginInfo();
});

function loginSubmit(){
	var username = $("#username").val(),
        pwd = $("#pwd").val();
    var flag = true;
    if(!username || $.trim(username).length == 0 || !roomReg.test(username)){
        $("#username").addClass('invalid-style1');
        flag = false;
    }else{
        $("#username").removeClass('invalid-style1');
    }
    if(!pwd || $.trim(pwd).length == 0 || !pwdReg.test(pwd)){
        $("#pwd").addClass('invalid-style1');
        flag = false;
    }else{
        $("#pwd").removeClass('invalid-style1');
    }
    if(flag){
        storeLoginInfo(username,pwd);
    }
    return flag;
}

function submitData(){
    if(loginSubmit()){
        var username = $("#username").val(),
            pwd = $("#pwd").val();
        var fd = new FormData();
        fd.append("username",username);
        fd.append("pwd",pwd);
        $.ajax({
            url:"/we_account/loginService",
            type:"post",
            data:fd,
            contentType:false,
            processData:false,
            success:function(){

            },
            error:function(){

            }
        })
    }
}

function initError(){
	var lerr = util.getUrlParam('lerr');
	var errMsg = lerr == 1 ? "用户名密码不匹配" : lerr == 2 ? "用户名密码不能为空" : "";
	$('.login-fail').text(errMsg);
}

function storeLoginInfo(username,pwd){
    var ls = localStorage;
    ls.setItem('accountinfo',JSON.stringify({username:username,pwd:pwd}));
}

function fillLoginInfo(){
    var ls = localStorage;
    var accountInfo = JSON.parse(ls.getItem('accountinfo'));
    if(accountInfo){
        $('#username').val(accountInfo.username);
        $("#pwd").val(accountInfo.pwd);
    }
}