define(["text!./modules/side-nav/side-nav.html", 'touchEvent'],function(sideNavTpl){
	var SideNav = function(){
		this.init();
	};
	SideNav.prototype = {
		init:function(){
			$('html').append(sideNavTpl);
			this.addListener();
			this.getUserInfo();
		},
		addListener:function(){
			var _this = this;
			$('#side-nav-switch').touch('click',function(event){
				var $this = event.$this;
				_this.open();
			},true);
			$('.sn-open-mask').touch('click',function(){
				_this.hide();
			},true);
		},
		getUserInfo:function(){
			$.ajax({
				url:'/we_account/get_user_info',
				type:"get"
			}).success(function(results){
				if(results.flag == 1){
					var userInfo = results.data;
					$('.side-nav .room-id').text(userInfo.room_id);
				}else{
					alert(results.msg);
				}
			}).error(function(err){
				console.log(err);
			})
		},
		open:function(){
			$('.side-nav').addClass('open-sn');
		},
		hide:function(){
			$('.side-nav').removeClass('open-sn');
		}
	};
	return SideNav;
});