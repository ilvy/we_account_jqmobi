/**
 * Created by Administrator on 2015/8/29.
 */
var margin = 8;
$(document).ready(function(){
    var headerW = this.win_w - 2 * margin;
    $("#header").css({
        //width:headerW,
        'padding-left':margin,
        'padding-right':margin,
        "height":$('.head').width() + margin * 2
    });
});