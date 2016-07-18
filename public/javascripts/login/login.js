$(function(){
	initError();
});

function loginSubmit(){
	var username = $("#username").val(),
        pwd = $("#pwd").val();
    var flag = true;
    if(!username || $.trim(username).length == 0){
        $("#username").addClass('invalid-style1');
        flag = false;
    }else{
        $("#username").removeClass('invalid-style1');
    }
    if(!pwd || $.trim(pwd).length == 0){
        $("#pwd").addClass('invalid-style1');
        flag = false;
    }else{
        $("#pwd").removeClass('invalid-style1');
    }
    return flag;
}

function initError(){
	var lerr = util.getUrlParam('lerr');
	var errMsg = lerr == 1 ? "用户名密码不匹配" : lerr == 2 ? "用户名密码不能为空" : "";
	$('.login-fail').text(errMsg);
}