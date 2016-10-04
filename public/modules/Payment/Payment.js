/**
 * Created by man on 15-5-8.
 */
define(['router','util'],function(router,util){
    var Payment = function(){
        this.init();
    };
    Payment.prototype = {
        orgPrice:0,//除去邮费的总价
        init:function(){
            this.do();
            this.offListener();
            this.addListener();
            this.initScreenshot();
        },
        do:function(){
            this.initPayment();
            var _this = this;
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
                            rowStr += '<div class="t-row bill-record"><div class="t-col getpay-title-cell t-col-2">'+(record.title?record.title:'')+'</div>' +
                                '<div class="t-col t-col-2">'+record.quantity+'</div>' +
                                '<div class="t-col getpay-remark t-col-2">'+(record.remark?record.remark:'')+'</div>' +
                                '<div class="t-col t-col-2">'+record.price+'</div>' +
                                '<div class="t-col t-col-2">'+record.single_total+'</div></div>';
                        }
                        var mailStr = '';
                        var mail_free = results.data.isMailFree,
                            mail_pay = results.data.mailPay;
                        if(oidstr){
                            oidstr = oidstr.substring(0,oidstr.length - 1);
                            mailStr = '<div class="t-col-10">' +
                                '<i class="fa '+(mail_free?'fa-check-square':'fa-square-o')+' mailFree_getpay"></i><span>包邮</span> <span>邮费：</span>' +
                                '<input type="number" class="mailpay_getpay" placeholder="0"  data-value="'+(mail_pay?mail_pay:"")+'" value="'+(mail_pay?mail_pay:"")+'">' +
                                '<span class="unit">元</span></div>';
                        }
                        $('.collection_object').html(results.data.nickname);
                        $('.mail-detail').data('oid',oidstr).html(mailStr);
                        var total = results.data.total;
                        _this.orgPrice = !mail_free?total - mail_pay:total;
                        $(".total-price").data('total_except_mail',!mail_free?total - mail_pay:total).html('<span>总计：</span>'+'<span class="money" data-addmailpay="'+mail_pay+'">'+results.data.total+'</span><span class="money-type">rmb</span>');
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
        initPayment:function(){
            this.afterScreenshot();
        },
        addListener:function(){
            var _this = this;
            $("#backtobill").on('click',function(){
                router.changeHash('billSystem',0);
            });
            $(".mailFree_getpay").on("click",function(event){
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
            $(document).on("click",".screenshot-btn",function(){
                var $shotBtn = $(this);
                if(typeof ScreenShot != 'undefined'){
                    _this.beforeSceenshot();
                    setTimeout(function(){
                        ScreenShot.shot("shot",function(success){
                            if(success == 1){
                                alert("截屏成功，请前往sd卡下的daigo文件目录查看");
                                setTimeout(function(){
                                    _this.afterScreenshot();
                                },1000);
                            }
                        },function(fail){
                            if(fail){
                                alert("截屏失败，请重试");
                                _this.afterScreenshot();
                            }
                        });
                    },500);
                }else if($shotBtn.hasClass('hide-remark')){
                    _this.beforeSceenshot();
                    $shotBtn.removeClass('hide-remark').addClass('show-remark');
                }else{
                    _this.afterScreenshot();
                    $shotBtn.addClass('hide-remark').removeClass('show-remark');
                }
            });
            //$(document).on("input",".mailpay_getpay",function(event){
            //    var originV = $(this).val();
            //    var currentInput = originV.substring(originV.length - 1);
            //    originV=originV.substring(0,originV.length - 1);
            //    if(!(currentInput >= 0 && currentInput <= 9 || currentInput == '.')){
            //        $(this).val(originV);
            //        return;
            //    }
            //});
        },
        offListener:function(){
            $("#backtobill").off("click");
            $(".mailFree_getpay").off("click");
            $(".mailpay_getpay").off("blur");
            $(".screenshot-btn").off("click");
        },
        initScreenshot:function(){
            if(util.isWeixin()){
                $(".share-tip.screenshot").addClass("hide").siblings(".share-tip").removeClass("hide");
            }else{
                $(".share-tip.screenshot").removeClass("hide").siblings(".share-tip").addClass("hide");
            }
        },
        beforeSceenshot:function(){
            $('#getpay .getpay-title-cell').removeClass('t-col-2').addClass('t-col-4');
            $('#getpay .getpay-remark').addClass('hide');
        },
        afterScreenshot:function(){
            $('#getpay .getpay-title-cell').addClass('t-col-2').removeClass('t-col-4');
            $('#getpay .getpay-remark').removeClass('hide');
        },
        /**
         * 编辑邮费
         * @param isMailFree
         * @param mailPay
         * @param orderIds
         */
        updateMailPay:function(isMailFree,mailPay,orderIds){
            var _this = this;
            $.ajax({
                url:'/we_account/updateMailPay?mail_free='+isMailFree+'&mail_pay='+mailPay+'&oid='+orderIds,
                type:'post',
                success:function(results){
                    if(results.flag == 1){
                        $(".mailpay_getpay").data("value",mailPay);
                        var total = _this.orgPrice;//Number($('.total-price').data('total_except_mail'));
                        if(!isMailFree){
                            total += Number(mailPay||0);
                        }
                        $('.total-price').html('<span>总计：</span>'+'<span class="money">'+total+'</span><span class="money-type">rmb</span>');
                        _this.wxShare();
                    }else{

                    }
                },
                error:function(err){
                    console.log(err);
                }
            })
        },
        wxShare:function(){
            var room_id = globalVar.room_id;
            var title = '亲，东西已经买好',
                desc = '代购总费用:'+Number($(".total-price .money").text())+',详情请点开',
                nickname = globalVar.nickname,
                link = 'http://www.daidai2u.com/we_account/payit?room_id='+room_id+'&nickname='+nickname;
            util.wxShare(title,desc,link,'',"发送账单成功","取消发送");
        }
    }

    globalVar.modules['getpay'] = new Payment();
});