/**
 * Created by Administrator on 14-8-27.
 */

var touchEvent = {

    touchstart:"touchstart",
    touchmove:"touchmove",
    touchend:"touchend",
    longtouch:"longtouch",//touchstart 超过0.5s
    click:"click",//touchstart -> touchend
    swipeleft:"swipeleft",
    swiperight:"swiperight",
    /**
     * 判断是否触摸设备，若非触摸设备，touch事件替换为鼠标事件
     */
    init:function(){
        if (isPC()) {
            this.touchstart = "mousedown";
            this.touchmove = "mousemove";
            this.touchend = "mouseup";
//            alert('pc');
        }
        return this;
    }
}

/**
 * 判断是否pc设备
 * @returns {boolean}
 */
function isPC(){
    var userAgentInfo = navigator.userAgent;
    var Agents = new Array("android", "iphone", "symbianos", "windows phone", "ipad", "ipod");
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.toLowerCase().indexOf(Agents[v]) > 0) { flag = false; break; }
    }
    return flag;
}

touchEvent.init();

/**
 * 封装触摸事件
 * @param type
 * @param cb
 */
var longTouchtimeout;
var touchStartTime,touchEndTime;
var startX,endX;
$.fn.touch = function(type,selector,cb,cancelBubble){
//    if(isPC()){
//        $(this).each(function(){
//            $(this).on(type,cb);
//        });
//        return;
//    }
    if(arguments.length == 2){
        cb = selector;
    }else if(arguments.length == 3){
        cancelBubble = cb;
        cb = selector;
    }
    selector = $(this).selector;
    //移动设备触摸事件
    $(this).each(function(){
        $(this).off(touchEvent.touchstart);
        $(document).on(touchEvent.touchstart,selector,function(event){
            if(event.originalEvent && event.originalEvent.targetTouches){
                event = event.originalEvent.targetTouches[0];
            }
//            alert('start');
            startX = event.clientX;
            touchStartTime = new Date().getTime();
            var _$this = $(this);
            _$this.attr("touchstart",1);
            event.$this = _$this;
            //长按0.5s后进入longTouch事件
//            _$this.longTouchtimeout = setTimeout(function(){
//                cb(event);
//            },500);
        });
    });

    switch (type){
        case touchEvent.longtouch:
//            $(this).each(function(){
                $(document).on(touchEvent.touchend,selector,function(event){
                    touchEndTime = new Date().getTime();
                    event.$this = event.originalEvent.currentTarget;
                    if((touchEndTime - touchStartTime) < 500){//若非长按，移除长按的定时器，消除事件触发
                        clearTimeout($(this).longTouchtimeout);
                    }
                })
//            });
            break;
        case touchEvent.click:
//            $(this).each(function(){
                $(document).on(touchEvent.touchend,selector,function(event){
                    touchEndTime = new Date().getTime();
                    var _$this = $(this);
                    var longTouchtimeout = '';
                    if((longTouchtimeout = $(this).longTouchtimeout)){
                        clearTimeout(longTouchtimeout);
                    }
                    if(cancelBubble){
                        event.stopPropagation();
                        event.originalEvent.stopPropagation();
                    }
//                    alert($(event.target).html() +" "+$(event.originalEvent.target).html()+" "+$(event.originalEvent.changedTouches[0]).html());
                    if(event.originalEvent && event.originalEvent.changedTouches){
                        event = event.originalEvent.changedTouches[0];
                    }
                    endX = event.clientX;
                    if((touchEndTime - touchStartTime) < 500 && Math.abs(startX - endX) < 10){
//                        alert('end')
                        event.$this = _$this;
                        cb(event);
                    }
                });
//            });
            break;
        case touchEvent.swipeleft:
//            $(this).each(function(){
                $(document).on(touchEvent.touchmove,selector,function(event){
                    clearTimeout($(this).longTouchtimeout);
                    if(cancelBubble){
                        event.stopPropagation();
                        event.originalEvent.stopPropagation();
                    }
                    if(event.originalEvent && event.originalEvent.targetTouches){
                        event = event.originalEvent.targetTouches[0];
                    }
                    var $this = $(this);
                    if($this.attr("touchstart") != 1){
                        return;
                    }
                    endX = event.clientX;
                    event.$this = $(this);
//                    alert("swipeLeft "+$this.attr("touchstart"))
                    if(startX - endX < 30){
                        return;
                    }
//                    alert(startX +" "+endX);
                    $this.attr("touchstart",0);
                    cb(event);
                });
                $(document).on(touchEvent.touchend,selector,function(event){
                    clearTimeout($(this).longTouchtimeout);
                    if(cancelBubble){
                        event.stopPropagation();
                        event.originalEvent.stopPropagation();
                    }
                    if(event.originalEvent && event.originalEvent.changedTouches){
                        event = event.originalEvent.changedTouches[0];
                    }
                    endX = event.clientX;
                    var $this = event.$this = $(this);
                    $this.attr("touchstart",0);
                    if(startX - endX < 30){
                        return;
                    }
//                    cb(event);
                });
//            });
            break;
        case touchEvent.swiperight:
//            $(this).each(function(){
                $(document).on(touchEvent.touchend,$(this),function(event){
                    clearTimeout($(this).longTouchtimeout);
                    if(cancelBubble){
                        event.stopPropagation();
                        event.originalEvent.stopPropagation();
                    }
                    if(event.originalEvent && event.originalEvent.changedTouches){
                        event = event.originalEvent.changedTouches[0];
                    }
                    endX = event.clientX;
                    event.$this = $(this);
                    if(endX - startX < 30){
                        return;
                    }
                    cb(event);
                });
//            });
            break;
    }

}

