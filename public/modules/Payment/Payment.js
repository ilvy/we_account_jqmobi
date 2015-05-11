/**
 * Created by man on 15-5-8.
 */
define(['router'],function(router){
    var Payment = function(){
        this.init();
    };
    Payment.prototype = {
        init:function(){
            this.do();
            this.addListener();
        },
        do:function(){
            var url = '/we_account/getpay?room_id='+globalVar.room_id+'&nickname='+globalVar.nickname;
            $.ajax({
                url:url,
                type:'get',
                success:function(results){
                    if(results.flag == 1){
                        var data = results.data.dataList || [];
                        var rowStr = '';
                        for(var i = 0; i < data.length; i++){
                            var record = data[i];
                            rowStr += '<div class="t-row"><div class="t-col t-col-2">'+(record.title?record.title:'')+'</div>' +
                                '<div class="t-col t-col-2">'+record.quantity+'</div>' +
                                '<div class="t-col t-col-2">'+(record.remark?record.remark:'')+'</div>' +
                                '<div class="t-col t-col-2">'+record.price+'</div>' +
                                '<div class="t-col t-col-2">'+record.single_total+'</div></div>';
                        }
                        $(".total-price").html('<span>总计：</span>'+'<span>'+results.data.total+'元</span>');
                        $("#getpay .table").append(rowStr);
                    }else if(results.flag == 0){
                        if(results.data == -1){
                            $("#getpay .table").html("<div style='text-align: center;'>查询出错</div>")
                        }
                    }
                },
                error:function(err){
                    console.log(err);
                }
            })
        },
        addListener:function(){
            $("#backtobill").on('click',function(){
                router.changeHash('billSystem',0);
            });
        }
    }

    globalVar.modules['getpay'] = new Payment();
});