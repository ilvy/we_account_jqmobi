/**
 * Created by man on 15-4-16.
 */
define(['router','touchEvent'],function(router){
    function RoomDoor(){
        this.init = function(){
            this.do();
            this.addListener();
            return this;
        }
        this.do = function(){
            $("#room").val("");//清空
        }
        this.addListener = function(){
            $(".submit-div").touch("click",function(){
                var room = encodeURI($("#room").val().trim());
                if(room.length > 20){
                    alert("输入不合法");
                }else if(room.length == 0){
                    alert("不能为空");
                }else{
                    $.ajax({
                        url:'/we_account/knock_door',
                        type:"post",
                        data:{room:room},
                        success:function(results){
                            if(results && results.flag == 1){
//                                window.location.href = '/we_account/live-room?room_id='+room;
                                router.changeHash('live_room-'+room,1);
//                        window.location.href = '/we_account/open_door';
                            }else{
                                alert("对不起，您输入的门牌号有误");
                            }
                        },
                        error:function(err){
                            console.log(err);
                        }
                    })
                }
            },true);
        }
    }
    globalVar.modules['room_door'] = new RoomDoor().init();
});