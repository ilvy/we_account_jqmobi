/**
 * Created by Administrator on 2015/4/25.
 */

define(['router','touchEvent'],function(router){
    var Bill = function(){
        this.init();
    };
    Bill.prototype = {
        init:function(){
            this.do();
            this.addListener();
        },
        do:function(){
            this.flushOrderList();
        },
        flushOrderList:function(){
            var _this = this;
            $.ajax({
                url:'/we_account/get_bill_list?billType=1',
                type:'get',
                success:function(results){
                    if(results.flag == 1){
                        var data = results.data;
                        _this.dealOrderList(data);
                    }else if(results.flag == 0){
//                        window.location.href = '/follow_account.html';
                    }
                },
                error:function(err){

                }
            });
        },
        flushPayList:function(){
            var _this = this;
            $.ajax({
                url:'/we_account/get_bill_list?billType=2',
                type:'get',
                success:function(results){
                    if(results.flag == 1){
                        var data = results.data;
                        _this.dealPayList(data);
                    }
                },
                error:function(err){

                }
            });
        },
        flushBillList:function(){

        },
        dealOrderList:function(data){
            if(!(data && data.length > 0)){
                return;
            }
            var quantity = 0,cards = {};
            for(var i = 0; i < data.length; i++){
                var record = data[i];
                if(!cards[record.product_name]){
                    cards[record.product_name+"_"+record.product_id] = [];
                }
                cards[record.product_name+"_"+record.product_id].push(record);
            }
            for(var key in cards){
                var cates = cards[key];
                var quantity = 0;
                var procductName = cates[0].product_name;
                var tableStr = '<div class="table"><div class="t-row t-row-over-1 t-row-header">' +
                    '<div class="t-col t-col-4">卖家</div><div class="t-col t-col-2">数量</div>' +
                    '<div class="t-col t-col-2">进价</div>' +
                    '<div class="t-col t-col-1">状态</div><div class="t-col t-col-1 extra">操作</div></div>';
                for(var j = 0; j < cates.length; j++){
                    var record = cates[j];
                    quantity += record.quantity;
                    tableStr += '<div class="t-row t-row-over-1" oid='+record.oid+' cid='+record.cid+'><div class="t-col t-col-4" data-value="'+record.nickname+'" contenteditable="true">'+record.nickname+'</div>' +
                        '<div class="t-col t-col-2 quantity" contenteditable="true" data-value="'+record.quantity+'"><div class="sub"><i class="fa fa-caret-left"></i></div>' +
                        '<span class="num">'+record.quantity+'</span><div class="add"><i class="fa fa-caret-right"></i></div></div>' +
                        '<div class="t-col t-col-2 input-div"><input type="text" data-value="'+record.unit_cost+'" placeholder=""/></div>' +
                        '<div class="t-col t-col-1 buy-status"><i class="fa fa-square-o"></i></div>' +
                        '<div class="t-col t-col-1 extra">删除</div></div>';
                }
                tableStr += '</div>';
                var cardStr = '<div class="card"><div class="card-title">' +
                    '<div class="product"><span class="name">'+procductName+'</span> × <span class="total-quantity">'+quantity+'</span> <i class="fa fa-caret-right"></i></div>' +
                    '<div class="all-status"><i class="fa fa-square-o"></i></div></div>';
                cardStr += tableStr +'</div>';
                $("#order-list").append(cardStr);
            }
        },
        addListener:function(){
            var _this = this;
            $("#add").touch('click',function(){
                var record = '<div class="t-row t-row-over-1"><div class="t-col t-col-3">哇哈哈哈</div>' +
                    '<div class="t-col t-col-2 quantity">' +
                    '<div class="sub"><i class="fa fa-caret-left"></i></div>' +
                    '<div class="num" contenteditable="true">2</div>' +
                    '<div class="add"><i class="fa fa-caret-right"></i></div></div>' +
                    '<div class="t-col t-col-2 input-div"><input type="text" placeholder=""/></div>' +
                    '<div class="t-col t-col-2 input-div"><input type="text" class="unitPrice" placeholder=""/></div>' +
                    '<div class="t-col t-col-1 extra">删除</div></div>';
                $("#pay-list .table .t-row-header").after(record)
            });
            $('#to_order,#to_pay,#to_bill').touch("click",function(event){
                var $this = event.$this;
                if($this.attr("id") == 'to_order'){
                    $("#bill-list").css("display",'none');
                    $("#pay-list").css("display",'none');
                    $("#order-list").css("display",'block');
                }else if($this.attr("id") == 'to_pay'){
                    $("#pay-list").css("display",'block');
                    $("#order-list").css("display",'none');
                    $("#bill-list").css("display",'none');
                }else{
                    $("#bill-list").css("display",'block');
                    $("#order-list").css("display",'none');
                    $("#pay-list").css("display",'none');
                }
            });
//    $(".t-row:not(.t-row-header)").touch("swipeleft",function(event){
////        event.stopPropagation();
//        alert("删除当前列");
//        var $this = event.$this;
////        $this.css({
////            marginLeft:- getMarginLeft(event.$this)
////        }).addClass('operateObj');
//    });

            $(".buy-status").touch('click',function(event){
                var $this = event.$this,
                    $checkbox,
                    $card = $this.parents('.card');
                if(($checkbox = $this.find(".fa-square-o")).length > 0){
                    $checkbox.removeClass("fa-square-o").addClass("fa-check-square");
                    var checkCount = 0;
                    $this.parents(".t-row").siblings(".t-row").find(".buy-status .fa-check-square").each(function(){
                        var $ckbox = $(this);
                        checkCount++;
                    });
                    if(checkCount == $card.find(".t-row:not(.t-row-header)").length - 1){
                        if(confirm("确认"+$($this.parents('.card').find('span.total-quantity')).text()+"个"+$this.parents('.card').find('span.name').text()+"已经购买")){
                            $card.remove();
                        }else{
                            $checkbox.addClass("fa-square-o").removeClass("fa-check-square");
                        }
                    }
                }else{
                    $this.find(".fa-check-square").removeClass('fa-check-square').addClass('fa-square-o');
                }
            });


            $(document).touch("click",function(event){
                $(".operateObj").css("margin-left",0).removeClass('operateObj');
                var $target =$(event.target);
                if(!($target.hasClass("sub")||$target.hasClass("add")||$target.hasClass("num") || $target.hasClass(".quantity"))){
                    $('.add,.sub').css("display",'none');
                }
                $.ajax({
                    url:'/we_account/updateCustomerInfo'
                });
            });
            $(".card .product").touch("click",function(event){
                event.$this.parent().siblings('.table').toggle(500);
                var $this = event.$this,
                    $caret;
                if(($caret = $this.find(".fa-caret-right")).length > 0){
                    $caret.removeClass("fa-caret-right").addClass("fa-caret-down");
                    $this.parents(".card").siblings(".card").each(function(){
                        var $c = $(this),$table;
                        if(($table = $c.find(".table")).css("display") != 'none'){
                            $table.toggle(500);
                            $c.find(".product .fa-caret-down").addClass("fa-caret-right").removeClass("fa-caret-down");
                        }
                    });
                }else if(($caret = $this.find(".fa-caret-down")).length > 0){
                    $caret.addClass("fa-caret-right").removeClass("fa-caret-down");
                }
            });
            $(".all-status").touch("click",function(event){
                var $this = event.$this;
                if($this.parents("#order-list").length > 0){
                    if(confirm("确认"+$($this.parents('.card').find('span.total-quantity')).text()+"个"+$this.parents('.card').find('span.name').text()+"已经购买?")){
                        $this.parents(".card").remove();
                    }
                }else if($this.parents("#pay-list").length > 0){
                    if(confirm("确认"+$this.parents('.card').find('span.name').text()+"已经付款?")){
                        $this.parents(".card").remove();
                    }
                }

            });
            $(".quantity .sub,.quantity .add").touch("click",function(event){
                var $this = event.$this;
                var $quantity = $this.siblings(".num");
                var q = Number($quantity.text());
                if($this.hasClass('sub')){
                    $quantity.text(--q);
                    if(q == 1){
                        if(confirm("确认删除订单？")){
                            $quantity.text(--q);
                            //删除订单
                        }
                    }
                }else{
                    $quantity.text(++q);
                }
                if($this.parents("#pay-list").length > 0){
                    _this.calcBillPay($this.parents(".card"));
                }
            },true);
            $(".quantity").touch("click",function(event){
                var $this = event.$this;
                $this.find('.add,.sub').css("display",'block');
                $this.parents(".t-row").siblings('.t-row').find(".add,.sub").css("display","none");
            },true);
//    $(".quantity").on("blur",function(){
//        $(this).find('.add,.sub').css("display",'none');
//    });
            $(document).on("input",".t-col input[type='text']",function(event){
                var originV = $(this).val();
                var currentInput = originV.substring(originV.length - 1);
                originV=originV.substring(0,originV.length - 1);
                if(!(currentInput >= 0 && currentInput <= 9)){
                    $(this).val(originV);
                    return;
                }
            }).on('blur',".t-col input[type='text']",function(){
                var $this = $(this);
                var $card = $(this).parents('.card');
                if($this.parents("#pay-list").length > 0){
                    _this.calcBillPay($card);
                }
            });

            $(".mailFree").touch("click",function(event){
                var $this = event.$this;
                if($this.hasClass("fa-square-o")){
                    $this.removeClass("fa-square-o").addClass("fa-check-square");
                }else{
                    $this.addClass("fa-square-o").removeClass("fa-check-square");
                }
            });

            $('div[contenteditable="true"],.input-div input').on("blur",function(){
                var $this = $(this);
                var value = '',
                    type = $this.data("type");
                if(type == 1){//nickname
                    if(!confirm('确认修改该客户昵称？')){
                        return;
                    }
                    var objId = $this.parents('.t-row').data('cid');
                    value = $this.text();
                    var url = '/we_account/update_customer_info?value='+value+'&objId='+objId+'&type='+type;
                    $.ajax({
                        url:url,
                        type:'post',
                        success:function(results){

                        },
                        error:function(err){

                        }
                    });
                }else if(type == 2){//进价
                    var objId = $this.parents('.t-row').data('oid');
                    value = $this.val();
                    var url = '/we_account/update_customer_info?value='+value+'&objId='+objId+'&type='+type;
                    $.ajax({
                        url:url,
                        type:'post',
                        success:function(results){

                        },
                        error:function(err){

                        }
                    });
                }else if(type == 3){//售价
                    var objId = $this.parents('.t-row').data('oid');
                    value = $this.val();
                    var url = '/we_account/update_customer_info?value='+value+'&objId='+objId+'&type='+type;
                    $.ajax({
                        url:url,
                        type:'post',
                        success:function(results){

                        },
                        error:function(err){

                        }
                    });
                }
            });

        },

        getMarginLeft:function($row){
            var ml = 0;
            $row.find('.extra').each(function(){
                ml += $(this).width();
            });
            return ml;
        },
        /**
         * 计算账单费用
         */
        calcBillPay:function($card){
            var total = 0,
                $mailpay;
            $card.find(" .table .t-row:not(.t-row-header)").each(function(){
                var $row = $(this);
                var num = Number($row.find('.quantity .num').text()),
                    unitPrice = Number($row.find('.unitPrice').val());
                num = isNaN(num)?0:num;
                unitPrice = isNaN(unitPrice)?0:unitPrice;
                total += num * unitPrice;
                if(($mailpay = $row.find(".mailpay")).length > 0){
                    total += Number($mailpay.val());
                }
            });
            $card.find(" .total-quantity").text(total);
        }
    };
    globalVar.modules['bill'] = new Bill();
});