/**
 * Created by Administrator on 2015/4/25.
 */

define(['router','util','wxAPI','Jpopup','touchEvent','laydate'],function(router,util,wx,Jpopup){
    var Bill = function(){
        this.init();
    };
    Bill.prototype = {
        room_id:'',
        init:function(){
            this.do();
            this.addListener();
            this.initDates();
        },
        do:function(){
            this.flushOrderList();
        },
        flushOrderList:function(){
            var _this = this;
            this.showLoading();
            $.ajax({
                url:'/we_account/get_bill_list?billType=1',
                type:'get',
                success:function(results){
                    _this.hideLoading();
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
            this.showLoading();
            $.ajax({
                url:'/we_account/get_bill_list?billType=2',
                type:'get',
                success:function(results){
                    _this.hideLoading();
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
            this.getBillList(date1,date2,nickname);
        },
        getBillList:function(date1,date2,nickname){
            var _this = this;
            this.showLoading();
            $.ajax({
                url:'/we_account/get_final_bill?date1='+date1+'&date2='+date2+'&nickname='+nickname,
                type:'get',
                success:function(results){
                    _this.hideLoading();
                    if(results.flag == 1){
                        var data = results.data;
                        _this.dealFinalBillList(data);
                    }
                },
                error:function(err){

                }
            });
        },
        dealOrderList:function(data){
            $("#order-list").html("");
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
                    '<div class="all-status ignore"><i class="fa fa-square-o"></i></div></div>';
                cardStr += tableStr +'</div>';
                $("#order-list").append(cardStr);
            }
        },
        dealPayList:function(data){
            $("#pay-list").html("");
            if(!(data && data.length > 0)){
                return;
            }
            var totalMoney = 0,cards = {};
            this.room_id = data[0].room_id;
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
                if(!record.mail_free){
                    totalMoney += record.mail_pay;
                }
                var mailStr = '<div class="t-row t-row-over-1 mail-row"><div class="t-col t-col-9">' +
                    '<i class="fa '+(record.mail_free?'fa-check-square':'fa-square-o')+' mailFree"></i><span>包邮</span> <span>邮费：</span>' +
                    '<input type="text" class="mailpay" placeholder="0" value="'+(record.mail_pay?record.mail_pay:"")+'">' +
                    '<span class="unit">元</span></div></div>';
                tableStr += mailStr+'</div>';
                var cardStr = '<div class="card"><div class="card-title">' +
                    '<div class="product"><span class="name">'+nickname+'</span> 总计: <span class="total-quantity">'+totalMoney+'</span> <i class="fa fa-caret-right"></i></div>' +
                    '<div class="all-status"><span>已付：</span><i class="fa fa-square-o"></i></div></div>';
                var lastRow = '<div class="extra-row"><div class="t-col-5 remark-col">备注：<span>'+(record.remark || "无")+'</span></div>' +
                    '<div class="t-col-5 getpay-btn"><input type="button" value="向买家收款"/></div></div>';
                cardStr += tableStr +lastRow+'</div>';
                $("#pay-list").append(cardStr);
            }
        },
        dealFinalBillList:function(data){
            $(".bill-list-content").html("");
            if(!(data && data.length > 0)){
                return;
            }
            var tableStr = '<div class="table"><div class="t-row t-row-over-1 t-row-header">' +
                '<div class="t-col t-col-3">品名</div><div class="t-col t-col-2">数量</div>' +
                '<div class="t-col t-col-2">进价</div>' +
                '<div class="t-col t-col-2">售价</div><div class="t-col t-col-1 extra">操作</div></div>';
            var totalMoney = 0,totalCost = 0;
            var customerObj = {};
            for(var i = 0; i < data.length; i++){
                var record = data[i];
                if(!customerObj[record.cid]){//计算邮费，每个用户只取一条订单即可
                    customerObj[record.cid+'_'+record.pay_time] = record;
                }
                totalMoney += record.quantity * (record.unit_price ? record.unit_price:0);
                totalCost += record.quantity * (record.unit_cost ? record.unit_cost:0);
                tableStr += '<div class="t-row t-row-over-1" data-oid='+record.oid+' data-cid='+record.cid+'><div class="t-col t-col-3 product_name">'+record.product_name+'</div>' +
                    '<div class="t-col t-col-2"><div class="num">'+record.quantity+'</div></div>' +
                    '<div class="t-col t-col-2">'+(record.unit_cost||"")+'</div>' +
                    '<div class="t-col t-col-2">'+(record.unit_price||"")+'</div>' +
                    '<div class="t-col t-col-1 extra">删除</div></div>';
            }
            var mailCost = this.calcMailCost(customerObj);
            totalCost += mailCost;
            var mailStr = '<div class="t-row t-row-over-1"><div class="t-col t-col-9"><span>邮费成本：</span>'+mailCost+'<span class="unit">元</span></div></div>';
            tableStr += mailStr+'</div>';
            var cardStr = '<div class="card">';
            cardStr += tableStr +'</div>';
            cardStr += '<div class="bill-sum t-col-10"><div id="sum_cost" class="t-col-5">总成本：<span>'+totalCost+'</span>元</div>' +
                '<div id="sum_earn" class="t-col-5">总盈利：<span>'+(totalMoney - totalCost)+'</span>元</div></div>';
            $(".bill-list-content").append(cardStr);
        },
        /**
         * 邮费计算
         * @param customerOrders
         * @returns {number}
         */
        calcMailCost:function(customerOrders){
            var mailCost = 0;
            for(var cid in customerOrders){
                var record = customerOrders[cid];
                if(record.mail_free){
                    mailCost += record.mail_pay;
                }
            }
            return mailCost;
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
                $this.addClass('current-list').siblings('.current-list').removeClass('current-list');
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
                    _this.flushBillList();
                }
            });
            $(".t-row:not(.t-row-header)").touch("swipeleft",function(event){
        //        event.stopPropagation();
//                alert("删除当前列");
                var $this = event.$this;
                if($this.hasClass('mail-row')){
                    return;
                }
//                $this.css({
//                    marginLeft:- _this.getMarginLeft(event.$this)
//                }).addClass('operateObj');
                $this.animate({
                    marginLeft:- _this.getMarginLeft(event.$this)
                },500).addClass('operateObj');
            });

            $(".t-row:not(.t-row-header)").touch("swiperight",function(event){
                $(".operateObj").css("margin-left",0).removeClass('operateObj');
            });

            $(".extra").touch("click",function(event){
                var $this = event.$this;
                if(confirm("删除当前订单？")){
                    var $currRow = $this.parents(".t-row");
                    var orderIds = $currRow.data("oid");
                    _this.updateOrderStatus($currRow,orderIds,0);
                }
            });

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
                $("#vagueBox").css("display","none");
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
                            $quantity.data("value",value).parents(".quantity-modify").removeClass('.quantity-modify');
                        }
                    },
                    error:function(err){
                        console.log(err);
                    }
                });
            });
            $(".card .product").touch("click",function(e){
                var event = e;
                var $this = event.$this,
                    $caret;
                setTimeout(function(){
                    $this.parent().siblings('.table').toggle(500);
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
                },100);
            });
            $(".all-status").touch("click",function(event){
                var $this = event.$this;
                var $card = $this.parents(".card");
                var isPriceOk = false;
                var $rows = $card.find(".t-row");
                for(var i = 0; i < $rows.length; i++){
                    var $row = $rows.eq(i);
                    if($row.hasClass('t-row-header')||$row.hasClass('mail-row')){
                        continue;
                    }
                    var unitCost = $row.find(".unit_cost").val(),
                        unitPrice = $row.find(".unit_price").val();
                    if(!$this.hasClass('ignore') && (!unitCost && unitCost !== 0 || (!unitPrice && unitPrice !== 0))){
                        alert("请编辑进价和售价!");
                        return;
                    }
                }
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
                var $quantity = $this.siblings(".num"),
                    $tq = $this.parents('.card').find('.total-quantity');
                var q = Number($quantity.text()),
                    total = Number($tq.text());
                if($this.hasClass('sub')){
                    if(q == 1){
                        if(confirm("确认删除订单？")){
//                            $quantity.text(--q);
                            //删除订单
                            var orderIds = $this.parents(".t-row").data("oid");
                            _this.updateOrderStatus($this.parents(".t-row"),orderIds,0);
                            return;
                        }
                        return;
                    }
                    $tq.text(total-1);
                    $quantity.text(--q);
                }else{
                    $tq.text(total+1);
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
                    var $mailFree;
                    if(($mailFree = $this.siblings('.mailFree')).length > 0){
                        var mail_pay = $mailFree.siblings(".mailpay").val();
                        var orders = '';
                        $this.parents('.mail-row').siblings(".t-row:not(.t-row-header)").each(function(){
                            var $row = $(this);
                            orders += $row.data("oid") + ',';
                        });
                        orders = orders.substring(0,orders.length - 1);
                        if(mail_pay == 0 || mail_pay == $(".mailpay").data("value")){
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
                }
            });

            $(".mailFree").touch("click",function(event){
                var $this = event.$this;
                var orders = '';
                $this.parents('.mail-row').siblings(".t-row:not(.t-row-header)").each(function(){
                    var $row = $(this);
                    orders += $row.data("oid") + ',';
                });
                orders = orders.substring(0,orders.length - 1);
                if($this.hasClass("fa-square-o")){
                    $this.removeClass("fa-square-o").addClass("fa-check-square");
                    _this.updateMailPay(1,'',orders);
                }else{
                    $this.addClass("fa-square-o").removeClass("fa-check-square");
                    _this.updateMailPay(0,'',orders);
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

            $("#search-go").touch('click',function(){
                var date1 = $("#date1").val(),
                    date2 = $("#date2").val(),
                    nickname = $("#nickname-position").val();
                _this.getBillList(date1,date2,nickname);
            });
//            $('#date1,#date2').touch('click',function(event){
//                var $this = event.$this;
//                if($this.attr("id") == 'date1'){
//                    laydate();
//                }else{
//                    laydate({
//                        max:laydate.now()
//                    })
//                }
//            });
            $(document).on("input","#nickname-position",function(){
                var $this = $(this);
                var offset = $this.offset(),
                    left = offset.left,
                    top = offset.top,
                    inputHeight = $this.height(),
                    inputWidth = $this.width();
                 var nickname = $this.val();
                if(nickname == '' || nickname.length == 0){

                }
                $("#vagueBox").css({
                    left:left,
                    top:top + inputHeight,
                    width:inputWidth
                });
                _this.vagueMatchNames(nickname);
            });

            $('#vagueBox > li').touch('click',function(event){
                var $this = event.$this;
                var nickname = $this.text(),
                    date1 = $("#date1").val(),
                    date2 = $("#date2").val();
                $("#nickname-position").val(nickname);
                $this.parents("#vagueBox").css("display","none");
                _this.getBillList(date1,date2,nickname);
            },true);

            $(".getpay-btn input").touch('click',function(event){
                var $this = event.$this;
                var title = '亲，东西已经买好',
                    desc = '代购总费用:'+$this.parents(".card").find(".total-quantity").text()+',详情请点开',
                    nickname = $this.parents('.card').find('.name').text(),
                    link = 'http://120.24.224.144/we_account/payit?room_id='+_this.room_id+'&nickname='+nickname;
                globalVar.room_id = _this.room_id;
                globalVar.nickname = nickname;
                wx.onMenuShareAppMessage({
                    title:title,
                    desc:desc,
                    link:link,
                    success:function(){
                        alert("用户账单发送成功");
                    },
                    cancel:function(){
                        alert("用户账单发送已取消");
                    }
                });
                router.changeHash('getpay',1);
//                alert("账单已选好，试试点击右上角按钮发送给相关好友哦");
            });
        },
        initDates:function(){
            var date1 = util.formatDate(null,false,7);
            var date2 = util.formatDate(null,false);
            $("#date1").val(date1);
            $("#date2").val(date2);
        },
        getMarginLeft:function($row){
            var ml = 0;
            $row.find('.extra').each(function(){
                ml += $(this).width();
            });
            return ml;
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

                    }else{

                    }
                },
                error:function(err){
                    console.log(err);
                }
            })
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
                if(($mailpay = $row.find(".mailpay")).length > 0 && $mailpay.siblings('.fa-square-o').length == 0){
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
                url:'/we_account/updateOrderStatus?oid='+orderIds+'&status='+(typeof status != 'undefined'?status : 2),
                type:'post',
                success:function(results){
                    if(results.flag == 1){
                        if($obj.hasClass('t-row')){
                            if($obj.siblings('.t-row:not(.t-row-header,.mail-row)').length == 0){
                                $obj.parents('.card').remove();
                                return;
                            }
                            if($obj.parents("#pay-list").length > 0){
                                var $tq = $obj.parents('.card').find('.total-quantity');
                                var total = Number($tq.text());
                                var subQuantity = Number($obj.find('.num').text()),
                                    unitPrice = Number($obj.find('.unit_price').val());
                                $tq.text(total - subQuantity * unitPrice);
                            }else if($obj.parents("#order-list").length > 0){
                                var $tq = $obj.parents('.card').find('.total-quantity');
                                var total = Number($tq.text());
                                var subQuantity = Number($obj.find('.num').text());
                                $tq.text(total - subQuantity);
                            }
                        }
                        $obj.remove();
                    }else{
                        alert('操作失败，请重试');
                    }
                },
                error:function(err){
                    console.log(err);
                }
            })
        },
        vagueMatchNames:function(nickname){
            $.ajax({
                url:'/we_account/vagueMatchNames?nickname='+nickname,
                type:'post',
                success:function(results){
                    if(results.flag == 1){
                        var data = results.data;
                        if(data == 1){
                            $("#vagueBox").css("display","none");
                            return;
                        }else{
                            var listr = '';
                            for(var i = 0; i < data.length;i++){
                                listr += '<li>'+data[i].name+'</li>';
                            }
                            $("#vagueBox").html(listr).css("display","block");
                        }
                    }
                },
                error:function(err){
                    console.log(err);
                }
            });
        },
        showLoading:function(){
            $("#loading").css('display','block');
        },
        hideLoading:function(){
            $("#loading").css('display','none');
        }
    };
    globalVar.modules['billSystem'] = new Bill();
});