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
                        window.location.href = '/follow_account.html';
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
            var _this = this;
            var date1 = $("#date1").val(),
                date2 = $("#date2").val(),
                nickname = $("#nickname-position").val();
            $.ajax({
                url:'/we_account/get_final_bill?date1='+date1+'&date2='+date2+'&nickname='+nickname,
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
        dealOrderList:function(data){
            if(!(data && data.length > 0)){
                return;
            }
            var quantity = 0,cards = {};
            for(var i = 0; i < data.length; i++){
                var record = data[i];
                if(!cards[record.product_name+"_"+record.product_id]){
                    cards[record.product_name+"_"+record.product_id] = [];
                }
                cards[record.product_name+"_"+record.product_id].push(record);
            }
            for(var key in cards){
                var cates = cards[key];
                var quantity = 0;
                var procductName = cates[0].product_name;
                var tableStr = '<div class="table"><div class="t-row t-row-over-1 t-row-header">' +
                    '<div class="t-col t-col-4">买家</div><div class="t-col t-col-2">数量</div>' +
                    '<div class="t-col t-col-2">进价</div>' +
                    '<div class="t-col t-col-1">状态</div><div class="t-col t-col-1 extra">操作</div></div>';
                for(var j = 0; j < cates.length; j++){
                    var record = cates[j];
                    quantity += record.quantity;
                    tableStr += '<div class="t-row t-row-over-1" data-oid='+record.oid+' data-cid='+record.cid+'><div class="t-col t-col-4 nickname" data-type="1" data-value="'+record.nickname+'" contenteditable="true">'+record.nickname+'</div>' +
                        '<div class="t-col t-col-2 quantity" data-value="'+record.quantity+'"><div class="sub"><i class="fa fa-caret-left"></i></div>' +
                        '<div class="num" contenteditable="true">'+record.quantity+'</div><div class="add"><i class="fa fa-caret-right"></i></div></div>' +
                        '<div class="t-col t-col-2 input-div"><input class="unit_cost" data-type="2" type="text" data-value="'+(record.unit_cost||"")+'" placeholder="" value="'+(record.unit_cost||"")+'"/></div>' +
                        '<div class="t-col t-col-1 buy-status"><i class="fa fa-square-o"></i></div>' +
                        '<div class="t-col t-col-1 extra">删除</div></div>';
                }
                tableStr += '</div>';
                var cardStr = '<div class="card"><div class="card-title">' +
                    '<div class="product"><span class="name">'+procductName+'</span> × <span class="total-quantity">'+quantity+'</span> <i class="fa fa-caret-right"></i></div>' +
                    '<div class="all-status"><i class="fa fa-square-o"></i></div></div>';
                cardStr += tableStr +'</div>';
                $("#order-list").html(cardStr);
            }
        },
        dealPayList:function(data){
            if(!(data && data.length > 0)){
                return;
            }
            var totalMoney = 0,cards = {};
            for(var i = 0; i < data.length; i++){
                var record = data[i];
                if(!cards[record.nickname+"_"+record.cid]){
                    cards[record.nickname+"_"+record.cid] = [];
                }
                cards[record.nickname+"_"+record.cid].push(record);
            }
            for(var key in cards){
                totalMoney = 0;
                var cates = cards[key];
                var quantity = 0;
                var nickname = cates[0].nickname;
                var tableStr = '<div class="table"><div class="t-row t-row-over-1 t-row-header">' +
                    '<div class="t-col t-col-3">品名</div><div class="t-col t-col-2">数量</div>' +
                    '<div class="t-col t-col-2">进价</div>' +
                    '<div class="t-col t-col-2">售价</div><div class="t-col t-col-1 extra">操作</div></div>';
                for(var j = 0; j < cates.length; j++){
                    var record = cates[j];
                    totalMoney += record.quantity * (record.unit_price ? record.unit_price:0);
                    tableStr += '<div class="t-row t-row-over-1" data-oid='+record.oid+' data-cid='+record.cid+'><div class="t-col t-col-3 product_name" data-type="1" data-value="'+record.product_name+'" contenteditable="true">'+record.product_name+'</div>' +
                        '<div class="t-col t-col-2 quantity" data-value="'+record.quantity+'"><div class="sub"><i class="fa fa-caret-left"></i></div>' +
                        '<div class="num" contenteditable="true">'+record.quantity+'</div><div class="add"><i class="fa fa-caret-right"></i></div></div>' +
                        '<div class="t-col t-col-2 input-div"><input class="unit_cost" data-type="2" type="text" data-value="'+(record.unit_cost||"")+'" placeholder="" value="'+(record.unit_cost||"")+'"/></div>' +
                        '<div class="t-col t-col-2 input-div"><input class="unit_price" data-type="3" type="text" data-value="'+(record.unit_price||"")+'" placeholder="" value="'+(record.unit_price||"")+'"/></div>' +
                        '<div class="t-col t-col-1 extra">删除</div></div>';
                }
                var mailStr = '<div class="t-row t-row-over-1 mail-row"><div class="t-col t-col-9">' +
                    '<span>编辑邮费：</span><input type="text" class="mailpay" placeholder="0"><span class="unit">元</span>' +
                    '<i class="fa fa-square-o mailFree"></i><span>包邮</span></div></div>';
                tableStr += mailStr+'</div>';
                var cardStr = '<div class="card"><div class="card-title">' +
                    '<div class="product"><span class="name">'+nickname+'</span> 总计: <span class="total-quantity">'+totalMoney+'</span> <i class="fa fa-caret-right"></i></div>' +
                    '<div class="all-status"><span>已付：</span><i class="fa fa-square-o"></i></div></div>';
                var lastRow = '<div class="extra-row"><div class="t-col-5 remark-col">备注：<span>'+record.remark+'</span></div>' +
                    '<div class="t-col-5 getpay"><input type="button" value="向买家收款"/></div></div>';
                cardStr += tableStr +lastRow+'</div>';
                $("#pay-list").html(cardStr);
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
                    '<div class="t-col t-col-2 input-div"><input type="text" class="unit_price" placeholder=""/></div>' +
                    '<div class="t-col t-col-1 extra">删除</div></div>';
                $("#pay-list .table .t-row-header").after(record)
            });
            $('#to_order,#to_pay,#to_bill').touch("click",function(event){
                var $this = event.$this;
                if($this.attr("id") == 'to_order'){
                    $("#bill-list").css("display",'none');
                    $("#pay-list").css("display",'none');
                    $("#order-list").css("display",'block');
                    _this.flushOrderList();
                }else if($this.attr("id") == 'to_pay'){
                    $("#pay-list").css("display",'block');
                    $("#order-list").css("display",'none');
                    $("#bill-list").css("display",'none');
                    _this.flushPayList();
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
                var orderId = $this.parents('.t-row').data('oid');
                if(($checkbox = $this.find(".fa-square-o")).length > 0){
                    if(confirm("确认"+$($this.parents('.t-row').find('div.num')).text()+"个"+$this.parents('.card').find('span.name').text()+"已经购买")){
//                        $this.parents('.t-row').remove();
                        if($card.find(".t-row").length == 2){//说明只有一个订单
//                            $card.remove();
                            _this.updateOrderStatus($card,orderId);
                            return;
                        }
                        _this.updateOrderStatus($this.parents('.t-row'),orderId);
                    }
//                    $checkbox.removeClass("fa-square-o").addClass("fa-check-square");
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
                var $quantity = $('.quantity-modify').find('.quantity');
                var originValue = $quantity.data("value"),
                    value = $quantity.find('.num').text();
                if(originValue == value || !$quantity || $quantity.length == 0){
                    return;
                }
                var oid = $quantity.parents('.t-row').data("oid");
                $.ajax({
                    url:'/we_account/updateCustomerInfo?value='+value+'&type=4&objId='+oid,
                    type:'get',
                    success:function(results){
                        if(results.flag == 1){
                            $quantity.data("value",value);
                            $quantity.parents('.card').find(".total-quantity").text(value);
                        }
                    },
                    error:function(err){
                        console.log(err);
                    }
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
                var oids = '';
                $this.parents('.card').find('.t-row:not(.t-row-header)').each(function(){
                    var $row = $(this);
                    if($row.hasClass('mail-row')){
                        return;
                    }
                    oids += $row.data('oid') + ',';
                });
                oids = oids.substring(0,oids.length - 1);
                if($this.parents("#order-list").length > 0){
                    if(confirm("确认"+$($this.parents('.card').find('span.total-quantity')).text()+"个"+$this.parents('.card').find('span.name').text()+"已经购买?")){
//                        $this.parents(".card").remove();
                        _this.updateOrderStatus($this.parents('.card'),oids);
                    }
                }else if($this.parents("#pay-list").length > 0){
                    if(confirm("确认"+$this.parents('.card').find('span.name').text()+"已经付款?")){
//                        $this.parents(".card").remove();
                        _this.updateOrderStatus($this.parents('.card'),oids,3);
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
                $this.parents(".t-row").addClass('quantity-modify').siblings('.t-row').removeClass('quantity-modify').find(".add,.sub").css("display","none");
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

            $(document).on("blur",'div.nickname[contenteditable="true"],.input-div input',function(){
                var $this = $(this);
                var value = '',
                    type = $this.data("type"),
                    originValue = $this.data("value");
                if(type == 1){//nickname
                    value = $this.text();
                    if(value == originValue){
                        return;
                    }
                    if(!confirm('确认修改该客户昵称？')){
                        return;
                    }
                    var objId = $this.parents('.t-row').data('cid');
                    var url = '/we_account/updateCustomerInfo?nickname='+value+'&objId='+objId+'&type='+type;
                    $.ajax({
                        url:url,
                        type:'get',
                        success:function(results){
                            if(results.flag == 1){
                                $this.parents('.t-row').data("value",value);
                                $(".t-row[data-cid = "+objId+"] .nickname").text(value).data("value",value);
                            }
                        },
                        error:function(err){

                        }
                    });
                }else if(type == 2){//进价
                    var objId = $this.parents('.t-row').data('oid');
                    value = $this.val();
                    if(value == originValue){
                        return;
                    }
                    var url = '/we_account/updateCustomerInfo?value='+value+'&objId='+objId+'&type='+type;
                    $.ajax({
                        url:url,
                        type:'get',
                        success:function(results){
                            if(results.flag == 1){
                                $this.data("value",value);
                            }
                        },
                        error:function(err){

                        }
                    });
                }else if(type == 3){//售价
                    var objId = $this.parents('.t-row').data('oid');
                    value = $this.val();
                    if(value == originValue){
                        return;
                    }
                    var url = '/we_account/updateCustomerInfo?value='+value+'&objId='+objId+'&type='+type;
                    $.ajax({
                        url:url,
                        type:'get',
                        success:function(results){
                            if(results.flag == 1){
                                $this.parents('.t-row').data("value",value);
                            }
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
                    unitPrice = Number($row.find('.unit_price').val());
                num = isNaN(num)?0:num;
                unitPrice = isNaN(unitPrice)?0:unitPrice;
                total += num * unitPrice;
                if(($mailpay = $row.find(".mailpay")).length > 0){
                    total += Number($mailpay.val());
                }
            });
            $card.find(" .total-quantity").text(total);
        },
        /**
         * 更改订单状态
         * @param $obj
         * @param orderIds
         * @param status
         */
        updateOrderStatus:function($obj,orderIds,status){
            $.ajax({
                url:'/we_account/updateOrderStatus?oid='+orderIds+'&status='+(status || 2),
                type:'post',
                success:function(results){
                    if(results.flag == 1){
                        $obj.remove();
                    }else{
                        alert('操作失败，请重试');
                    }
                },
                error:function(err){
                    console.log(err);
                }
            })
        }
    };
    globalVar.modules['bill'] = new Bill();
});