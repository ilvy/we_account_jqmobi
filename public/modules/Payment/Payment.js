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
            $("#getpay .table .bill-record").remove();
            var url = '/we_account/getpay?room_id='+globalVar.room_id+'&nickname='+globalVar.nickname;
            $.ajax({
                url:url,
                type:'get',
                success:function(results){
                    if(results.flag == 1){
                        var data = results.data.dataList || [];
                        var rowStr = '',oidstr = '';
                        for(var i = 0; i < data.length; i++){
                            var record = data[i];
                            oidstr += record.oid + ',';
                            rowStr += '<div class="t-row bill-record"><div class="t-col t-col-2">'+(record.title?record.title:'')+'</div>' +
                                '<div class="t-col t-col-2">'+record.quantity+'</div>' +
                                '<div class="t-col t-col-2">'+(record.remark?record.remark:'')+'</div>' +
                                '<div class="t-col t-col-2">'+record.price+'</div>' +
                                '<div class="t-col t-col-2">'+record.single_total+'</div></div>';
                        }
                        var mailStr = '';
                        if(oidstr){
                            oidstr = oidstr.substring(0,oidstr.length - 1);
                            mailStr = '<div class="t-col-10">' +
                                '<i class="fa '+(record.mail_free?'fa-check-square':'fa-square-o')+' mailFree_getpay"></i><span>包邮</span> <span>邮费：</span>' +
                                '<input type="text" class="mailpay_getpay" placeholder="0" data-value="'+(record.mail_pay?record.mail_pay:"")+'" value="'+(record.mail_pay?record.mail_pay:"")+'">' +
                                '<span class="unit">元</span></div>';
                        }
                        $('.collection_object').html(results.data.nickname);
                        $('.mail-detail').data('oid',oidstr).html(mailStr);
                        var total = results.data.total;
                        $(".total-price").data('total_except_mail',record.mail_free?total:total - record.mail_pay).html('<span>总计：</span>'+'<span class="money">'+results.data.total+'</span><span class="money-type">rmb</span>');
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
            var _this = this;
            $("#backtobill").on('click',function(){
                router.changeHash('billSystem',0);
            });
            $(".mailFree_getpay").touch("click",function(event){
                var $this = event.$this;
                var mail_pay = Number($('.mailpay_getpay').val());
                var orders = $this.parents('.mail-detail').data('oid');
                if($this.hasClass("fa-square-o")){
                    $this.removeClass("fa-square-o").addClass("fa-check-square");
                    _this.updateMailPay(1,mail_pay,orders);
                }else{
                    $this.addClass("fa-square-o").removeClass("fa-check-square");
                    _this.updateMailPay(0,mail_pay,orders);
                }
            });
            $(document).on('blur','.mailpay_getpay',function(event){
                var $this = $(this);
                var $mailFree;
                if(($mailFree = $this.siblings('.mailFree_getpay')).length > 0){
                    var mail_pay = $this.val();
                    var orders = $this.parents('.mail-detail').data('oid');
                    if(mail_pay == 0 || mail_pay == $(".mailpay_getpay").data("value")){
                        return;
                    }
                    if($mailFree.hasClass("fa-check-square")){
                        if(confirm('邮费'+mail_pay+'元，包邮')){
                            _this.updateMailPay(1,mail_pay,orders);
                        }
                    }else if($mailFree.hasClass("fa-square-o")){
                        if(confirm('邮费'+mail_pay+'元，不包邮')){
                            _this.updateMailPay(0,mail_pay,orders);
                        }
                    }

                }
            });
            $(document).on("input",".mailpay_getpay",function(event){
                var originV = $(this).val();
                var currentInput = originV.substring(originV.length - 1);
                originV=originV.substring(0,originV.length - 1);
                if(!(currentInput >= 0 && currentInput <= 9 || currentInput == '.')){
                    $(this).val(originV);
                    return;
                }
            });
        },
        /**
         * 编辑邮费
         * @param isMailFree
         * @param mailPay
         * @param orderIds
         */
        updateMailPay:function(isMailFree,mailPay,orderIds){
            $.ajax({
                url:'/we_account/updateMailPay?mail_free='+isMailFree+'&mail_pay='+mailPay+'&oid='+orderIds,
                type:'post',
                success:function(results){
                    if(results.flag == 1){
                        $(".mailpay_getpay").data("value",mailPay);
                        var total = Number($('.total-price').data('total_except_mail'));
                        if(!isMailFree){
                            total += Number(mailPay||0);
                        }
                        $('.total-price').html('<span>总计：</span>'+'<span class="money">'+total+'</span><span class="money-type">rmb</span>');
                    }else{

                    }
                },
                error:function(err){
                    console.log(err);
                }
            })
        }
    }

    globalVar.modules['getpay'] = new Payment();
});