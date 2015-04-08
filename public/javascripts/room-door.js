/**
 * Created by Administrator on 2015/1/14.
 */

$(document).ready(function(){
    addListener();
});

function addListener(){
    $(".favour_room_option").on("click",function(){
        var room = encodeURI($(this).data("id"));
        $.ajax({
            url:'/we_account/knock_door',
            type:"post",
            data:{room:room},
            success:function(results){
                if(results && results.flag == 1){
                    window.location.href = '/we_account/live-room?room_id='+room;
                }else{
                    alert("对不起，您输入的门牌号有误");
                }
            },
            error:function(err){
                console.log(err);
            }
        })
    });
    $(".submit-div").on("click",function(){
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
                        window.location.href = '/we_account/live-room?room_id='+room;
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
    });
    /**
     * 取消该直播间收藏
     */
    $(".fav-remove").on("click",function(event){
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