/**
 * Created by man on 15-4-16.
 */
define(['router'],function(router){
    function myFavorite(){
        this.init = function(){
            this.do();
            this.addListener();
            return this;
        }
        this.do = function(){
            var url = '/we_account/fav';
            $.ajax({
                url:url,
                type:'get',
                success:function(result){
                    if(result.flag == 1){
                        var favourite_rooms = result.data;
                        var roomObj,listr = '';
                        for(var i = 0; i < favourite_rooms.length; i++){
                            roomObj = favourite_rooms[i];
                            listr += '<li data-id="'+roomObj.room_id+'" class="favour_room_option col-xxs-10 col-xxs-offset-1 col-xs-6 col-xs-offset-3">' +
                                '<div class="nickname col-xxs-6">'+(roomObj.nickname || ' ')+'</div>' +
                                '<div class="room col-xxs-4">'+roomObj.room_id+'</div>' +
                                '<div class="fav-remove col-xxs-2"><i class="fa fa-times-circle"></i></div></li>'
                        }
                        $("#room-list").html(listr);
                    }
                },
                error:function(err){
                    console.log(err);
                }
            });
        }
        this.addListener = function(){
            $(document).on("vclick",".favour_room_option",function(){
                var room = encodeURI($(this).data("id"));
                $.ajax({
                    url:'/we_account/knock_door',
                    type:"post",
                    data:{room:room},
                    success:function(results){
                        if(results && results.flag == 1){
//                            window.location.href = '/we_account/live-room?room_id='+room;
                            router.changeHash('live_room-'+room,1);
                        }else{
                            alert("对不起，您输入的门牌号有误");
                        }
                    },
                    error:function(err){
                        console.log(err);
                    }
                })
            });
            /**
             * 取消该直播间收藏
             */
            $(document).on("vclick",".fav-remove",function(event){
                if(event.stopPropagation){
                    event.stopPropagation();
                }else if(event.cancelBubble){
                    event.cancelBubble = true;
                }
                var $this = $(this);
                var roomId = $this.parents("li").find(".room").val();
                if(!confirm("取消收藏该直播间?")){
                    return;
                }
                var url = '/we_account/favourite_cancel?room_id='+roomId;
                $.ajax({
                    url:url,
                    type:"post",
                    success:function(result){
                        if(result.flag == 1){
                            $this.parents("li").remove();
                        }else if(result.data == -11){
                            window.location.href = '/follow_account.html';
                        }
                    },
                    error:function(err){
                        console.log(err);
                    }
                });
            });
        }
    }
    globalVar.modules['myFavorite'] = new myFavorite().init();
});