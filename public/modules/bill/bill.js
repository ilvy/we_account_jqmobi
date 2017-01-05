/**
 * Created by Administrator on 2015/4/25.
 */

define(['router', 'util', 'wxAPI', 'jpopup', 'touchEvent', 'laydate'], function(router, util, wx) {
    var Bill = function() {
        this.init();
    };
    Bill.prototype = {
        room_id: '',
        orderListData: {},
        $objOrderTable: null,
        categories: {},
        init: function() {
            this.do();
            this.addListener();
            this.initDates();
            this.categories = {};
        },
        do: function() {
            this.flushOrderList();
        },
        doWithoutFlush: function() {
            $('body,html').animate({
                scrollTop: this.billScrollTop == 'toBottom' ? $('body').height() : this.billScrollTop
            }, 10);
            var orderListDataSS = util.ss(1, "buylist");
            if (orderListDataSS) {
                this.orderListData = orderListDataSS;
            }
        },
        getHostInfo: function() {
            var _this = this;
            var url = '/we_account/personalInfo';
            $.ajax({
                url: url,
                type: 'get',
                success: function(results) {
                    if (results.flag == 1) {
                        var userInfo = results.data.user;
                        globalVar.userInfo = userInfo;
                        globalVar.room_id = userInfo.room_id;
                    }
                }
            });
        },
        flushOrderList: function(type) {
            var _this = this;
            this.showLoading();
            $.ajax({
                url: '/we_account/get_bill_list?billType=1',
                type: 'get',
                success: function(results) {
                    _this.hideLoading();
                    if (results.flag == 1) {
                        var data = results.data;
                        _this.orderListData = data;
                        _this.exchange_rate = data[0].exchange_rate;
                        if (type == 'c') {
                            _this.dealOrderListOrderByCustomer(data);
                        } else {
                            _this.dealOrderList(data);
                        }
                    } else if (results.flag == 0) {
                        window.location.href = '/we_account/login';//'/follow_account.html';
                    }
                },
                error: function(err) {

                }
            });
        },
        flushPayList: function() {
            var _this = this;
            this.showLoading();
            $.ajax({
                url: '/we_account/get_bill_list?billType=2',
                type: 'get',
                success: function(results) {
                    _this.hideLoading();
                    if (results.flag == 1) {
                        var data = results.data;
                        _this.dealPayList(data);
                    }
                },
                error: function(err) {

                }
            });
        },
        flushBillList: function() {
            var _this = this;
            var date1 = $("#date1").val(),
                date2 = $("#date2").val(),
                nickname = $("#nickname-position").val();
            this.getBillList(date1, date2, nickname);
        },
        getBillList: function(date1, date2, nickname) {
            var _this = this;
            this.showLoading();
            $.ajax({
                url: '/we_account/get_final_bill?date1=' + date1 + '&date2=' + date2 + '&nickname=' + nickname,
                type: 'get',
                success: function(results) {
                    _this.hideLoading();
                    if (results.flag == 1) {
                        var data = results.data;
                        _this.dealFinalBillList(data);
                    }
                },
                error: function(err) {

                }
            });
        },
        //        dealOrderList:function(data,isAppend){
        //            if(!isAppend){
        //                $("#order-list-content").html("");
        //            }
        //            if(!(data && data.length > 0)){
        //                return;
        //            }
        //            var quantity = 0,cards = {};
        //            for(var i = 0; i < data.length; i++){
        //                var record = data[i];
        //                if(!cards[record.product_name+"_"+record.product_id]){
        //                    cards[record.product_name+"_"+record.product_id] = [];
        //                }
        //                cards[record.product_name+"_"+record.product_id].push(record);
        //            }
        //            for(var key in cards){
        //                var cates = cards[key];
        //                var quantity = 0;
        //                var procductName = cates[0].product_name;
        //                var tableStr = '<div class="table"><div class="t-row t-row-over-1 t-row-header">' +
        //                    '<div class="t-col t-col-4">买家</div><div class="t-col t-col-2">数量</div>' +
        //                    '<div class="t-col t-col-2">进价</div>' +
        //                    '<div class="t-col t-col-1">状态</div><div class="t-col t-col-1 extra">操作</div></div>';
        //                for(var j = 0; j < cates.length; j++){
        //                    var record = cates[j];
        //                    quantity += record.quantity;
        ////                    tableStr += '<div class="t-row t-row-over-1" data-oid='+record.oid+' data-cid='+record.cid+'><div class="t-col t-col-4 nickname" data-type="1" data-value="'+record.nickname+'" contenteditable="true">'+record.nickname+'</div>' +
        ////                        '<div class="t-col t-col-2 quantity" data-value="'+record.quantity+'"><div class="sub"><i class="fa fa-caret-left"></i></div>' +
        ////                        '<div class="num" contenteditable="true">'+record.quantity+'</div><div class="add"><i class="fa fa-caret-right"></i></div></div>' +
        ////                        '<div class="t-col t-col-2 input-div input-div-cost unit_cost" data-type="2" data-value="'+((!record.unit_cost && record.unit_cost != 0)?"":record.unit_cost)+'" data-exrate="'+record.exchange_rate+'">'+((!record.unit_cost && record.unit_cost != 0)?"":this.exchangeMoney(record.unit_cost,record.exchange_rate))+'</div>' +
        ////                        '<div class="t-col t-col-1 buy-status"><i class="fa fa-square-o"></i></div>' +
        ////                        '<div class="t-col t-col-1 extra">删除</div></div>';
        //                    tableStr += '<div class="t-row t-row-over-1" data-oid='+record.oid+' data-cid='+record.cid+'><div class="t-col t-col-4 nickname cnickname" data-type="1" data-value="'+record.nickname+'" >'+record.nickname+'</div>' +
        //                        '<div class="t-col t-col-2 quantity" data-value="'+record.quantity+'">' +
        //                        this.generateNumSelect(100,record.quantity)+'</div>' +
        //                        '<div class="t-col t-col-2 input-div input-div-cost unit_cost" data-type="2" data-price="'+((!record.unit_price && record.unit_price != 0)?"":record.unit_price)+'" ' +
        //                        'data-value="'+((!record.unit_cost && record.unit_cost != 0)?"":record.unit_cost)+'" data-exrate="'+record.exchange_rate+'">'+((!record.unit_cost && record.unit_cost != 0)?"":this.exchangeMoney(record.unit_cost,record.exchange_rate))+'</div>' +
        //                        '<div class="t-col t-col-1 buy-status"><i class="fa fa-square-o"></i></div>' +
        //                        '<div class="t-col t-col-1 extra">删除</div></div>';
        //                }
        //                tableStr += '</div>';
        //                var cardStr = '<div class="card"><div class="card-title">' +
        //                    '<div class="caret-wrapper"><i class="fa fa-caret-right card-btn"></i></div><div class="product"><span>商品：</span><span class="name">'+procductName+'</span> ×<span class="total-quantity"> '+quantity+'</span> </div>' +
        //                    '<div class="all-status ignore"><span>买到:</span><i class="fa fa-square-o"></i></div></div>';
        //                var lastRow = '<div class="extra-row"><div class="t-col-5 product-detail" data-pid="'+key.split('_')[1]+'">【商品详情】</span></div>' +
        //                    '<div class="t-col-5 order-add"><input class="order-add-btn" type="button" value="加单"/></div></div>';
        //                cardStr += tableStr + lastRow +'</div>';
        //                $("#order-list-content").append(cardStr);
        //            }
        //        },
        dealOrderList: function(data, isAppend) {
            if (!isAppend) {
                $("#order-list-content").html("");
                var $existCate = false;
            }
            if (!(data && data.length > 0)) {
                return;
            }
            var quantity = 0,
                cards = {};
            for (var i = 0; i < data.length; i++) {
                var record = data[i];
                if (!cards[record.cate_name]) {
                    cards[record.cate_name] = {};
                }
                if (!cards[record.cate_name][record.product_name + "_" + record.product_id]) {
                    cards[record.cate_name][record.product_name + "_" + record.product_id] = [];
                }
                cards[record.cate_name][record.product_name + "_" + record.product_id].push(record);
            }
            var orderlistStr = '';
            for (var cateName in cards) {
                if (!this.categories[cateName]) {
                    this.categories[cateName] = cateName;
                }
                var categoryCards = cards[cateName];
                var categoryStr = (isAppend && ($existCate = this.checkExistCate(cateName))) ? ("") : (this.billScrollTop = 0, '<div class="cate_wrap ' + cateName + '"><div class="category title">' + cateName + '</div>');
                for (var key in categoryCards) {
                    var cates = categoryCards[key];
                    var quantity = 0;
                    var procductName = cates[0].product_name;
                    var productId = key.split("_")[1];
                    var tableStr = '<div class="table"><div class="t-row t-row-over-1 t-row-header">' +
                        '<div class="t-col t-col-2">买家</div><div class="t-col t-col-2">数量</div>' +
                        '<div class="t-col t-col-4">备注</div>' +
                        '<div class="t-col t-col-1">状态</div><div class="t-col t-col-1 extra">操作</div></div>';
                    for (var j = 0; j < cates.length; j++) {
                        var record = cates[j];
                        quantity += Number(record.quantity);
                        //                    tableStr += '<div class="t-row t-row-over-1" data-oid='+record.oid+' data-cid='+record.cid+'><div class="t-col t-col-4 nickname" data-type="1" data-value="'+record.nickname+'" contenteditable="true">'+record.nickname+'</div>' +
                        //                        '<div class="t-col t-col-2 quantity" data-value="'+record.quantity+'"><div class="sub"><i class="fa fa-caret-left"></i></div>' +
                        //                        '<div class="num" contenteditable="true">'+record.quantity+'</div><div class="add"><i class="fa fa-caret-right"></i></div></div>' +
                        //                        '<div class="t-col t-col-2 input-div input-div-cost unit_cost" data-type="2" data-value="'+((!record.unit_cost && record.unit_cost != 0)?"":record.unit_cost)+'" data-exrate="'+record.exchange_rate+'">'+((!record.unit_cost && record.unit_cost != 0)?"":this.exchangeMoney(record.unit_cost,record.exchange_rate))+'</div>' +
                        //                        '<div class="t-col t-col-1 buy-status"><i class="fa fa-square-o"></i></div>' +
                        //                        '<div class="t-col t-col-1 extra">删除</div></div>';
                        tableStr += '<div class="t-row t-row-over-1" data-oid=' + record.oid + ' data-cid=' + record.cid + '><div class="t-col t-col-2 nickname cnickname" data-type="1" data-value="' + record.nickname + '" >' + record.nickname + '</div>' +
                            '<div class="t-col t-col-2 quantity" data-value="' + record.quantity + '">' +
                            this.generateNumSelect(100, record.quantity) + '</div>' +
                            //'<div class="t-col t-col-2 input-div input-div-cost unit_cost" data-type="2" data-price="'+((!record.unit_price && record.unit_price != 0)?"":record.unit_price)+'" ' +
                            //'data-value="'+((!record.unit_cost && record.unit_cost != 0)?"":record.unit_cost)+'" data-exrate="'+record.exchange_rate+'">'+((!record.unit_cost && record.unit_cost != 0)?"":this.exchangeMoney(record.unit_cost,record.exchange_rate))+'</div>' +
                            '<div class="t-col t-col-4 input-div order-remark" data-type="2" data-price="' + ((!record.unit_price && record.unit_price != 0) ? "" : record.unit_price) + '" ' +
                            'data-value="' + ((!record.unit_cost && record.unit_cost != 0) ? "" : record.unit_cost) + '" >' + (record.remark ? record.remark : "") + '</div>' +
                            '<div class="t-col t-col-1 buy-status"><i class="fa fa-square-o"></i></div>' +
                            '<div class="t-col t-col-1 extra">删除</div></div>';
                    }
                    tableStr += '</div>';
                    var cardStr = '<div data-pid="' + productId + '" class="card"><div class="card-title">' +
                        '<div class="caret-wrapper"><i class="fa fa-caret-right card-btn"></i></div><div class="product"><span>商品：</span><span class="name product_name">' + procductName + '</span> ×<span class="total-quantity"> ' + quantity + '</span> </div>' +
                        '<div class="all-status ignore"><span>买到:</span><i class="fa fa-square-o"></i></div></div>';
                    var lastRow = '<div class="extra-row"><div class="t-col-5 product-detail" data-pid="' + key.split('_')[1] + '">【商品详情】</span></div>' +
                        '<div class="t-col-5 order-add"><input class="order-add-btn" data-cate="' + cateName + '" type="button" value="加单" /></div></div>';
                    cardStr += tableStr + lastRow + '<div class="del-card-btn">删除</div></div>';
                    categoryStr += cardStr;
                    //$("#order-list-content").append(cardStr);
                }
                categoryStr += ((isAppend && $existCate) ? ("") : ('</div>'));
                orderlistStr += categoryStr;
            }
            if (isAppend && $existCate) {
                $existCate.append(orderlistStr);
            } else {
                $("#order-list-content").append(orderlistStr);
                this.billScrollTop = 'toBottom';
            }
        },
        checkExistCate: function(cateName) {
            var $res = false;
            $(".category.title").each(function() {
                if ($(this).text() == cateName) {
                    $res = $(this).parent();
                }
            });
            return $res;
        },
        dealOrderListOrderByCustomer: function(data, isAppend) {
            if (!isAppend) {
                $("#order-list-content").html("");
            }
            if (!(data && data.length > 0)) {
                return;
            }
            var totalMoney = 0,
                cards = {};
            globalVar.room_id = this.room_id = data[0].room_id;
            this.exchange_rate = data[0].exchange_rate;
            for (var i = 0; i < data.length; i++) {
                var record = data[i];
                if (!cards[record.nickname + "_" + record.cid]) {
                    cards[record.nickname + "_" + record.cid] = [];
                }
                cards[record.nickname + "_" + record.cid].push(record);
            }
            for (var key in cards) {
                totalMoney = 0;
                var cates = cards[key];
                var quantity = 0;
                var nickname = cates[0].nickname;
                var tableStr = '<div class="table"><div class="t-row t-row-over-1 t-row-header">' +
                    '<div class="t-col t-col-3">品名</div><div class="t-col t-col-2">数量</div>' +
                    '<div class="t-col t-col-4">备注</div>' +
                    '<div class="t-col t-col-1 extra">操作</div></div>';
                for (var j = 0; j < cates.length; j++) {
                    var record = cates[j];
                    totalMoney += record.quantity * (record.unit_price ? record.unit_price : 0);
                    tableStr += '<div class="t-row t-row-over-1" data-oid=' + record.oid + ' data-cid=' + record.cid + '><div class="t-col t-col-3 product_name" data-type="1" data-value="' + record.product_name + '">' + record.product_name + '</div>' +
                        '<div class="t-col t-col-2 quantity" data-value="' + record.quantity + '">' +
                        this.generateNumSelect(100, record.quantity) + '</div>' +
                        '<div class="t-col t-col-4 input-div unit_cost overflow-ellipsis order-remark" style="padding: 6px;">' + (record.remark ? record.remark : "") + '</div>' +
                        '<div class="t-col t-col-1 extra">删除</div></div>';
                }
                if (!record.mail_free) {
                    totalMoney += record.mail_pay;
                }
                var mailStr = '<div class="t-row t-row-over-1 mail-row"><div class="t-col t-col-9">' +
                    '<i class="fa ' + (record.mail_free ? 'fa-check-square' : 'fa-square-o') + ' mailFree"></i><span>包邮</span> <span>邮费：</span>' +
                    '<input type="text" class="mailpay" placeholder="0" value="' + (record.mail_pay ? record.mail_pay : "") + '">' +
                    '<span class="unit">元</span></div></div>';
                tableStr += '</div>';
                var cardStr = '<div class="card"><div class="card-title"><i class="fa fa-caret-right card-btn"></i>' +
                    '<div class="product"><span class="name-span">买家:</span><span class="name">' + nickname + '</span></div>' +
                    '</div>';
                var lastRow = '<div class="extra-row">' +
                    '<div class="t-col-10 c-add-order-btn"><input type="button" value="加单"/></div></div>';
                cardStr += tableStr + lastRow + '</div>';
                $("#order-list-content").append(cardStr);
            }
        },
        //cid: result.c_id,
        //exchange_rate: _this.exchange_rate,
        //mail_free: 0,
        //mail_pay: 0,
        //nickname: nickname,
        //oid: result.order_id,
        //product_id: result.product_id,
        //product_name: title,
        //quantity: quantity,
        //status: 1,
        //unit_cost: cost,
        //unit_price: price
        addOrderDataToList: function(orderInfo) {
            this.orderListData.push(orderInfo);
            var record = orderInfo;
            var type = $(".cate_btn_group .btn-check").data("type");
            var name = type == 'c' ? orderInfo.nickname : orderInfo.product_name;
            var cateName = type == 'c' ? '' : orderInfo.cate_name;
            if (this.$objOrderTable || (this.$objOrderTable = this.findOrderAddedObjTable(type, name,cateName))) {
                var newOrderRow = '<div class="t-row t-row-over-1" data-oid=' + record.oid + ' data-cid=' + record.cid + '>' +
                    '<div class="t-col t-col-2 nickname cnickname" data-type="1" data-value="' + record.nickname + '">' + record.nickname + '</div>' +
                    '<div class="t-col t-col-2 quantity" data-value="' + record.quantity + '">' +
                    this.generateNumSelect(100, record.quantity) + '</div>' +
                    //'<div class="t-col t-col-2 input-div input-div-cost unit_cost" data-type="2" data-value="'+((!record.unit_cost && record.unit_cost != 0)?"":record.unit_cost)+'" data-exrate="'+record.exchange_rate+'">'+((!record.unit_cost && record.unit_cost !== 0)?"":this.exchangeMoney(record.unit_cost,record.exchange_rate))+'</div>' +
                    '<div class="t-col t-col-4 input-div order-remark" data-type="2" data-value="' + ((!record.unit_cost && record.unit_cost != 0) ? "" : record.unit_cost) + '">' + (record.remark ? record.remark : "") + '</div>' +
                    '<div class="t-col t-col-1 buy-status"><i class="fa fa-square-o"></i></div>' +
                    '<div class="t-col t-col-1 extra">删除</div></div>';
                if (type == 'c') {
                    newOrderRow = '<div class="t-row t-row-over-1" data-oid=' + record.oid + ' data-cid=' + record.cid + '>' +
                        '<div class="t-col t-col-3 product_name" data-type="1" data-value="' + record.product_name + '">' + record.product_name + '</div>' +
                        '<div class="t-col t-col-2 quantity" data-value="' + record.quantity + '">' +
                        this.generateNumSelect(100, record.quantity) + '</div>' +
                        '<div class="t-col t-col-4 input-div unit_cost overflow-ellipsis" style="padding: 6px;">' + (record.remark ? record.remark : "") + '</div>' +
                        '<div class="t-col t-col-1 extra">删除</div></div>';
                }
                this.$objOrderTable.append(newOrderRow);

                this.updateTotalNum(this.$objOrderTable);
            } else {
                if ($(".cate_btn_group .btn-check").data("type") == 'p') {
                    this.dealOrderList([orderInfo], true);
                } else {
                    this.dealOrderListOrderByCustomer([orderInfo], true);
                }

            }
        },
        delOrderDataFromList:function(orderIds){
            orderIds = orderIds.toString().split(',');
            for(var i = 0; i < orderIds.length; i++){
                this.delOrderDataFromListByOid(orderIds[i]);
            }
        },
        delOrderDataFromListByOid:function(oid){
            var orderListData = this.orderListData;
            for(var i = 0; i < orderListData.length; i++){
                if(orderListData[i].oid == oid){
                    orderListData.splice(i,1);
                    return;
                }
            }
        },
        dealPayList: function(data) {
            $("#pay-list").html("");
            if (!(data && data.length > 0)) {
                return;
            }
            var totalMoney = 0,
                cards = {};
            globalVar.room_id = this.room_id = data[0].room_id;
            for (var i = 0; i < data.length; i++) {
                var record = data[i];
                if (!cards[record.nickname + "_" + record.cid]) {
                    cards[record.nickname + "_" + record.cid] = [];
                }
                cards[record.nickname + "_" + record.cid].push(record);
            }
            for (var key in cards) {
                totalMoney = 0;
                var cates = cards[key];
                var quantity = 0;
                var nickname = cates[0].nickname;
                var tableStr = '<div class="table"><div class="t-row t-row-over-1 t-row-header">' +
                    '<div class="t-col t-col-3">品名</div><div class="t-col t-col-2">数量</div>' +
                    '<div class="t-col t-col-2">进价</div>' +
                    '<div class="t-col t-col-2">售价</div><div class="t-col t-col-1 extra">操作</div></div>';
                for (var j = 0; j < cates.length; j++) {
                    var record = cates[j];
                    var addMailPay = 0;
                    var oRemark = record.remark;
                    totalMoney += record.quantity * (record.unit_price ? record.unit_price : 0);
                    tableStr += '<div class="t-row t-row-over-1" data-oid=' + record.oid + ' data-cid=' + record.cid + ' data-pid=' + record.product_id + '><div class="t-col t-col-3 product_name" data-type="1" data-value="' + record.product_name + '">' +'<span class="w-p-l-remark order-remark" data-oremark='+oRemark+'><span class="p-l-remark">注</span></span>'+ record.product_name + '</div>' +
                        '<div class="t-col t-col-2 quantity" data-value="' + record.quantity + '">' +
                        this.generateNumSelect(100, record.quantity) + '</div>' +
                        '<div class="t-col t-col-2 input-div input-div-cost unit_cost" data-value="' + ((!record.unit_cost && record.unit_cost != 0) ? "" : record.unit_cost) + '" data-type="2" data-exrate="' + record.exchange_rate + '">' + ((!record.unit_cost && record.unit_cost != 0) ? "" : this.exchangeMoney(record.unit_cost, record.exchange_rate)) + '</div>' +
                        '<div class="t-col t-col-2 input-div unit_price" data-type="3" data-discount="' + record.discount + '" data-value="' + ((!record.unit_price && record.unit_price != 0) ? "" : record.unit_price) + '">' + ((!record.unit_price && record.unit_price != 0) ? "" : record.unit_price) + '</div>' +
                        '<div class="t-col t-col-1 extra">删除</div></div>'; //<input class="unit_price" data-type="3" type="text" data-value="'+((!record.unit_price && record.unit_price != 0)?"":record.unit_price)+'" placeholder="" value="'+((!record.unit_price && record.unit_price != 0)?"":record.unit_price)+'"/>
                }
                record = this.getRecordHasMail(cates);
                if (!record.mail_free) {
                    addMailPay = record.mail_pay;
                    //totalMoney += record.mail_pay;
                }
                var mailStr = '<div class="t-row t-row-over-1 mail-row"><div class="t-col t-col-9">' +
                    '<i class="fa ' + (record.mail_free ? 'fa-check-square' : 'fa-square-o') + ' mailFree"></i><span>包邮</span> <span>邮费：</span>' +
                    '<input type="text" class="mailpay" placeholder="0" orgvalue="' + (record.mail_pay ? record.mail_pay : "") + '" value="' + (record.mail_pay ? record.mail_pay : "") + '">' +
                    '<span class="unit">元</span></div></div>';
                tableStr += mailStr + '</div>';
                var cardStr = '<div class="card"><div class="card-title"><div class="caret-wrapper"><i class="fa fa-caret-right card-btn"></i></div>' +
                    '<div class="product"><span class="name-span">买家:</span><span class="name">' + nickname + '</span> <span class="tq-span">合计: </span><span class="total-quantity" data-addmailpay=' + addMailPay + '>' + totalMoney.toFixed(1) + '</span> </div>' +
                    '<div class="all-status"><span>已付：</span><i class="fa fa-square-o"></i></div></div>';
                var lastRow = '<div class="extra-row">' +
                    '<div class="t-col-5 getpay-btn"><input type="button" value="收款"/></div></div>';
                cardStr += tableStr + lastRow + '</div>';
                $("#pay-list").append(cardStr);
            }
        },
        dealFinalBillList: function(data) {
            $(".bill-list-content").html("");
            if (!(data && data.length > 0)) {
                return;
            }
            var tableStr = '<div class="table"><div class="t-row t-row-over-1 t-row-header">' +
                '<div class="t-col t-col-2">客户</div><div class="t-col t-col-2">品名</div><div class="t-col t-col-1">数量</div>' +
                '<div class="t-col t-col-2">进价</div>' +
                '<div class="t-col t-col-2">售价</div><div class="t-col t-col-1 extra">操作</div></div>';
            var totalMoney = 0,
                totalCost = 0;
            var customerObj = {};
            for (var i = 0; i < data.length; i++) {
                var record = data[i];
                if (!customerObj[record.cid]) { //计算邮费，每个用户只取一条订单即可
                    customerObj[record.cid + '_' + record.pay_time] = record;
                }
                totalMoney += record.quantity * (record.unit_price ? record.unit_price : 0);
                totalCost += record.quantity * (record.unit_cost ? record.unit_cost : 0) * record.exchange_rate;
                tableStr += '<div class="t-row t-row-over-1" data-oid=' + record.oid + ' data-cid=' + record.cid + '><div class="t-col t-col-2 c_name">'+record.nickname+'</div><div class="t-col t-col-2 product_name">' + record.product_name + '</div>' +
                    '<div class="t-col t-col-1"><div class="num">' + record.quantity + '</div></div>' +
                    '<div class="t-col t-col-2">' + ((((!record.unit_cost && record.unit_cost != 0) ? "" : record.unit_cost) * record.exchange_rate).toFixed(1)) + '</div>' +
                    '<div class="t-col t-col-2">' + ((!record.unit_price && record.unit_price != 0) ? "" : record.unit_price) + '</div>' +
                    '<div class="t-col t-col-1 extra">删除</div></div>';
            }
            var mailCost = this.calcMailCost(customerObj);
            totalCost += mailCost;
            var mailStr = '<div class="t-row t-row-over-1"><div class="t-col t-col-9"><span>邮费成本：</span>' + mailCost + '<span class="unit">元</span></div></div>';
            tableStr += mailStr + '</div>';
            var cardStr = '<div class="card">';
            cardStr += tableStr + '</div>';
            cardStr += '<div class="bill-sum t-col-10"><div id="sum_cost" class="t-col-5">总成本：<span>' + totalCost.toFixed(1) + '</span>元</div>' +
                '<div id="sum_price" class="t-col-5">总收入：<span>' + (totalMoney.toFixed(1)) + '</span>元</div>' +
                '<div id="sum_earn" class="t-col-5">总盈利：<span>' + (totalMoney - totalCost).toFixed(1) + '</span>元</div></div>';
            $(".bill-list-content").append(cardStr);
        },
        /**
         * 邮费计算
         * @param customerOrders
         * @returns {number}
         */
        calcMailCost: function(customerOrders) {
            var mailCost = 0;
            for (var cid in customerOrders) {
                var record = customerOrders[cid];
                if (record.mail_free) {
                    mailCost += record.mail_pay;
                }
            }
            return mailCost;
        },
        addListener: function() {
            var _this = this;
            $("#add").touch('click', function() {
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
            $('#to_order,#to_pay,#to_bill').touch("click", function(event) {
                var $this = event.$this;
                $this.addClass('current-list').siblings('.current-list').removeClass('current-list');
                if ($this.attr("id") == 'to_order') {
                    $("#bill-list").css("display", 'none');
                    $("#pay-list").css("display", 'none');
                    $("#order-list").css("display", 'block');
                    _this.flushOrderList();
                    $("#bottom-btn-group").removeClass('hide');
                } else if ($this.attr("id") == 'to_pay') {
                    $("#pay-list").css("display", 'block');
                    $("#order-list").css("display", 'none');
                    $("#bill-list").css("display", 'none');
                    _this.flushPayList();
                    $("#bottom-btn-group").addClass('hide');
                } else {
                    $("#bill-list").css("display", 'block');
                    $("#order-list").css("display", 'none');
                    $("#pay-list").css("display", 'none');
                    _this.flushBillList();
                    $("#bottom-btn-group").addClass('hide');
                }
            });
            $("#order-list-content .card").touch("swipeleft",function(event){
                var $this = event.$this;
                $this.addClass("show-del");
                $('.op-cancel-mask').removeClass('hide');
            },true);
            //替代document的全局事件,方便触发
            $(".op-cancel-mask").on("touchstart",function(event){
                event.stopPropagation();
                $("#order-list-content .show-del").removeClass('show-del');
                $('.op-cancel-mask').addClass('hide');
            });
            $(".cate_product_btn,.cate_customer_btn").touch("click", function(event) {
                var $this = event.$this;
                var type = $this.data("type");
                $this.addClass("btn-check").siblings(".btn").removeClass("btn-check");
                if (type == 'c') {
                    _this.dealOrderListOrderByCustomer(_this.orderListData);
                } else {
                    _this.dealOrderList(_this.orderListData);
                }
                //_this.flushOrderList(type);
            });

            $(".c-add-order-btn input").touch("click", function(event) {
                var $this = event.$this;
                var customer = $this.parents(".card").find(".product > .name").text();
                _this.showAddOrderPanel("", "", customer);
                _this.$objOrderTable = $this.parents(".card").find(".table");
            }, true);

            $('.product-detail').touch('click', function(event) {
                var $this = event.$this;
                var product_id = $this.data('pid');
                globalVar.product_id = product_id;
                $('#take_order').remove();
                util.ss(1, "buylist", _this.orderListData);
                _this.billScrollTop = $('body').scrollTop();
                router.changeHash("product_display-" + product_id, 1);
            }, true);
            $(".t-row:not(.t-row-header)").touch("swipeleft", function(event) {
                //        event.stopPropagation();
                //                alert("删除当前列");
                var $this = event.$this;
                if ($this.hasClass('mail-row')) {
                    return;
                }
                //                $this.css({
                //                    marginLeft:- _this.getMarginLeft(event.$this)
                //                }).addClass('operateObj');
                $this.animate({
                    marginLeft: -_this.getMarginLeft(event.$this)
                }, 500).addClass('operateObj');
            });

            $(".t-row:not(.t-row-header)").touch("swiperight", function(event) {
                $(".operateObj").css("margin-left", 0).removeClass('operateObj');
            });

            $(".extra").touch("click", function(event) {
                var $this = event.$this;
                if (confirm("删除当前订单？")) {
                    var $currRow = $this.parents(".t-row");
                    var orderIds = $currRow.data("oid");
                    _this.updateOrderStatus($currRow, orderIds, 0);
                }
            }, true);

            $(".buy-status").touch('click', function(event) {
                var $this = event.$this,
                    $checkbox,
                    $card = $this.parents('.card');
                var orderId = $this.parents('.t-row').data('oid');
                if (($checkbox = $this.find(".fa-square-o")).length > 0) {
                    if (confirm("确认" + $($this.siblings('div.quantity').find('select')).val() + "个" + $this.parents('.card').find('span.name').text() + "已经购买")) {
                        //                        $this.parents('.t-row').remove();
                        _this.logBuyProductLocation($card.data("pid"));
                        if ($card.find(".t-row").length == 2) { //说明只有一个订单
                            //                            $card.remove();
                            _this.updateOrderStatus($card, orderId);
                            return;
                        }
                        _this.updateOrderStatus($this.parents('.t-row'), orderId);
                    }
                    //                    $checkbox.removeClass("fa-square-o").addClass("fa-check-square");
                } else {
                    $this.find(".fa-check-square").removeClass('fa-check-square').addClass('fa-square-o');
                }
            }, true);


            $(document).touch("click", function(event) {
                $(".operateObj").css("margin-left", 0).removeClass('operateObj');
                $("#vagueBox").css("display", "none");
                //                var $target =$(event.target);
                //                if(!($target.hasClass("sub")||$target.hasClass("add")||$target.hasClass("num") || $target.hasClass(".quantity"))){
                //                    $('.add,.sub').css("display",'none');
                //                }
                //                var $quantity = $('.quantity-modify').find('.quantity');
                //                var originValue = $quantity.data("value"),
                //                    value = $quantity.find('.num').text();
                //                if(originValue == value || !$quantity || $quantity.length == 0){
                //                    return;
                //                }
                //                var oid = $quantity.parents('.t-row').data("oid");
                //                $.ajax({
                //                    url:'/we_account/updateCustomerInfo?value='+value+'&type=4&objId='+oid,
                //                    type:'get',
                //                    success:function(results){
                //                        if(results.flag == 1){
                //                            $quantity.data("value",value).parents(".quantity-modify").removeClass('.quantity-modify');
                //                        }
                //                    },
                //                    error:function(err){
                //                        console.log(err);
                //                    }
                //                });
            });
            $("#order-edit-panel").touch('click', function(event) {
                $("#search-user-panel").removeClass("visible");
                event.$this.find(".match-obj-input").removeClass("match-obj-input");
            }, true);
            $("#addOrderPanel").touch("click", function(event) {
                $("#search-user-panel,#search-products-panel").removeClass("visible");
                event.$this.find(".match-obj-input").removeClass("match-obj-input");
            }, true);
            $(".card .card-title .card-btn").touch("click", function(e) {
                var event = e;
                var $this = event.$this,
                    $caret;
                $this = $this.parents(".card-title");
                setTimeout(function() {
                    $this.siblings('.table').toggle(500);
                    if (($caret = $this.find(".fa-caret-right")).length > 0) {
                        $caret.removeClass("fa-caret-right").addClass("fa-caret-down");
                        $this.parents(".card").siblings(".card").each(function() {
                            var $c = $(this),
                                $table;
                            if (($table = $c.find(".table")).css("display") != 'none') {
                                $table.toggle(500);
                                $c.find(".fa-caret-down").addClass("fa-caret-right").removeClass("fa-caret-down");
                                $c.find('.active').removeClass('active');
                            }
                        });
                        $this.addClass('active');
                    } else if (($caret = $this.find(".fa-caret-down")).length > 0) {
                        $caret.addClass("fa-caret-right").removeClass("fa-caret-down");
                        $this.removeClass('active');
                    }
                }, 100);
            }, true);
            $(".card .product .product_name").touch("click", function(e) {
                var event = e;
                var $this = event.$this,
                    $caret,
                    $objCard;
                ($objCard = $this.parents(".card")).addClass("move-card-obj");
                var categories = _this.categories,
                    cateOptionsStr = '';
                for (var cardName in categories) {
                    cateOptionsStr += '<option value="' + categories[cardName] + '" ' + ($objCard.siblings(".category").text() == cardName ? "selected" : "") + '>' + categories[cardName] + '</option>';
                }
                cateOptionsStr += '<option value="-100">添加新地址</option>';
                $("#cc_cate_select").html(cateOptionsStr);
                $("#changeCategory").pop();
            }, true);
            $("#cc_cate_select").on("change", function() {
                if ($(this).val() == -100) {
                    //if($("#cc_cate_custom").is(":hidden")){
                    $("#cc_cate_custom").slideDown(500);
                    //}
                } else {
                    //if($("#cc_cate_custom").is(":visible")){
                    $("#cc_cate_custom").slideUp(500);
                    //}
                }
            });
            $("#cc_seller_cancel,#cc_seller_submit").touch("click", function(event) {
                var $this = event.$this;
                if ($this.hasClass("yellow-btn")) {
                    $("#changeCategory").pop({
                        hidden: true
                    });
                    $("#cc_cate_custom").removeClass("visible");
                } else {
                    globalVar.showLoading();
                    var getOrderIds = function($card) {
                        var orderIds = '';
                        $card.find('[data-oid]').each(function() {
                            orderIds += $(this).data("oid") + ',';
                        });
                        return orderIds.substring(0, orderIds.length - 1);
                    };
                    var addCategory = function(cateName) {
                        _this.categories[cateName] ? "" : (_this.categories[cateName] = cateName);
                    };
                    var $objCard, $cateSelect;
                    $objCard = $(".move-card-obj");
                    if ($objCard.siblings(".card").length == 0) {
                        $objCard.parents('.cate_wrap').remove();
                    } else {
                        $objCard.remove();
                    }
                    var orderId = getOrderIds($objCard);
                    var url = "/we_account/change_cate?order_id=" + orderId + "&cate_name=" + (($cateSelect = $("#cc_cate_select")).val() == -100 ? $(".cc_cate_custom input").val() : $cateSelect.val());
                    $.ajax({
                        url: url,
                        type: "post"
                    }).success(function(results) {
                        if (results.flag == 1) {
                            $objCard.removeClass('move-card-obj');
                            if (($cateSelect = $("#cc_cate_select")).val() == -100) { //新建立一个分类
                                var newCateName = $(".cc_cate_custom input").val();
                                if ($("." + newCateName).length == 0) {
                                    var newCateStr = '<div class="cate_wrap ' + newCateName + '"><div class="category title">' + newCateName + '</div>' + $objCard[0].outerHTML + '</div>';
                                    $("#order-list-content").append(newCateStr);
                                    addCategory(newCateName);
                                } else {
                                    $("." + newCateName).append($objCard);
                                }

                            } else {
                                $("." + $cateSelect.val()).append($objCard);
                            }
                            $("#changeCategory").pop({
                                hidden: true
                            });
                            $("#cc_cate_custom").css('display', 'none').find('input').val('');
                        }
                        globalVar.hideLoading();
                    }).error(function() {

                    });

                }

            }, true);
            $(".options_toggle a.toggle_btn").touch("click",function(event){
                var $this = event.$this;
                if($this.hasClass('more_btn')){
                    $("#addOrderPanel .more").fadeIn(100);
                    $this.addClass('hide_more').removeClass('more_btn').text('收起');
                }else{
                    $("#addOrderPanel .more").fadeOut(100);
                    $this.removeClass('hide_more').addClass('more_btn').text('更多');
                }
            });
            $(".all-status").touch("click", function(event) {
                var $this = event.$this;
                var $card = $this.parents(".card");
                var isPriceOk = false;
                var $rows = $card.find(".t-row");
                for (var i = 0; i < $rows.length; i++) {
                    var $row = $rows.eq(i);
                    if ($row.hasClass('t-row-header') || $row.hasClass('mail-row')) {
                        continue;
                    }
                    var unitCost = $row.find(".unit_cost").text(),
                        unitPrice = $row.find(".unit_price").text();
                    if (!$this.hasClass('ignore') && (!unitCost && unitCost !== 0 || (!unitPrice && unitPrice !== 0))) {
                        alert("请编辑进价和售价!");
                        return;
                    }
                }
                var oids = '';
                $this.parents('.card').find('.t-row:not(.t-row-header)').each(function() {
                    var $row = $(this);
                    if ($row.hasClass('mail-row')) {
                        return;
                    }
                    oids += $row.data('oid') + ',';
                });
                oids = oids.substring(0, oids.length - 1);
                if ($this.parents("#order-list").length > 0) {
                    if (confirm("确认" + $($this.parents('.card').find('span.total-quantity')).text() + "个" + $this.parents('.card').find('span.name').text() + "已经购买?")) {
                        //                        $this.parents(".card").remove();
                        _this.logBuyProductLocation($card.data("pid"));
                        _this.updateOrderStatus($this.parents('.card'), oids);
                    }
                } else if ($this.parents("#pay-list").length > 0) {
                    if (confirm("确认" + $this.parents('.card').find('span.name').text() + "已经付款?")) {
                        //                        $this.parents(".card").remove();
                        _this.updateOrderStatus($this.parents('.card'), oids, 3);
                    }
                }

            }, true);
            $(".quantity .sub,.quantity .add").touch("click", function(event) {
                var $this = event.$this;
                var $quantity = $this.siblings(".num"),
                    $tq = $this.parents('.card').find('.total-quantity');
                var q = Number($quantity.text()),
                    total = Number($tq.text());
                if ($this.hasClass('sub')) {
                    if (q == 1) {
                        if (confirm("确认删除订单？")) {
                            //                            $quantity.text(--q);
                            //删除订单
                            var orderIds = $this.parents(".t-row").data("oid");
                            _this.updateOrderStatus($this.parents(".t-row"), orderIds, 0);
                            return;
                        }
                        return;
                    }
                    $tq.text(total - 1);
                    $quantity.text(--q);
                } else {
                    $tq.text(total + 1);
                    $quantity.text(++q);
                }
                if ($this.parents("#pay-list").length > 0) {
                    _this.calcBillPay($this.parents(".card"));
                }
            }, true);
            $(".quantity").touch("click", function(event) {
                var $this = event.$this;
                $this.find('.add,.sub').css("display", 'block');
                $this.parents(".t-row").addClass('quantity-modify').siblings('.t-row').removeClass('quantity-modify').find(".add,.sub").css("display", "none");
            }, true);
            //    $(".quantity").on("blur",function(){
            //        $(this).find('.add,.sub').css("display",'none');
            //    });
            $(document).on("input", ".t-col input[type='text']", function(event) {
                var originV = $(this).val();
                var currentInput = originV.substring(originV.length - 1);
                originV = originV.substring(0, originV.length - 1);
                if (!(currentInput >= 0 && currentInput <= 9 || currentInput == '.')) {
                    $(this).val(originV);
                    return;
                }
            }).on('blur', ".t-col input[type='text']", function() {
                var $this = $(this);
                var $card = $(this).parents('.card');
                if ($this.parents("#pay-list").length > 0) {
                    //_this.calcBillPay($card);
                    var $mailFree;
                    if (($mailFree = $this.siblings('.mailFree')).length > 0) {
                        var mail_pay = $mailFree.siblings(".mailpay").val();
                        var orders = '';
                        $this.parents('.mail-row').siblings(".t-row:not(.t-row-header)").each(function() {
                            var $row = $(this);
                            orders += $row.data("oid") + ',';
                        });
                        orders = orders.substring(0, orders.length - 1);
                        if (mail_pay == $(".mailpay").attr("orgvalue")) {
                            return;
                        }
                        if ($mailFree.hasClass("fa-check-square")) {
                            if (confirm('邮费' + mail_pay + '元，包邮')) {
                                _this.updateMailPay(1, mail_pay, orders);
                            }
                        } else if ($mailFree.hasClass("fa-square-o")) {
                            if (confirm('邮费' + mail_pay + '元，不包邮')) {
                                _this.updateMailPay(0, mail_pay, orders);
                            }
                        }

                    }
                }
            });

            $(".mailFree").touch("click", function(event) {
                var $this = event.$this;
                var orders = '';
                $this.parents('.mail-row').siblings(".t-row:not(.t-row-header)").each(function() {
                    var $row = $(this);
                    orders += $row.data("oid") + ',';
                });
                orders = orders.substring(0, orders.length - 1);
                if ($this.hasClass("fa-square-o")) {
                    $this.removeClass("fa-square-o").addClass("fa-check-square");
                    _this.updateMailPay(1, '', orders);
                } else {
                    $this.addClass("fa-square-o").removeClass("fa-check-square");
                    _this.updateMailPay(0, '', orders);
                }
            });
            //购买列表修改昵称
            $('div.nickname.cnickname').touch("click", function(event) {
                var $this = event.$this;
                var cnickname = $this.text();
                $(".order-cnickname-update-obj").removeClass("order-cnickname-update-obj");
                $this.addClass("order-cnickname-update-obj"); //标记当前更改备注的目标
                $("#pep_cnickname").addClass('visible-inline').val(cnickname).siblings('.pep_ele').removeClass('visible-inline');
                $("#order-edit-panel").pop();
            }, true);
            $(document).on("blur", 'div.nickname[contenteditable="true"],input.unit_price', function() {
                var $this = $(this);
                var value = '',
                    type = $this.data("type"),
                    originValue = $this.data("value");
                if (type == 1) { //nickname
                    value = $this.text();
                    if (value == originValue) {
                        return;
                    }
                    if (!confirm('确认修改该客户昵称？')) {
                        return;
                    }
                    var objId = $this.parents('.t-row').data('cid');
                    var url = '/we_account/updateCustomerInfo?nickname=' + value + '&objId=' + objId + '&type=' + type;
                    $.ajax({
                        url: url,
                        type: 'get',
                        success: function(results) {
                            if (results.flag == 1) {
                                //                                $this.parents('.t-row').data("value",value);
                                $(".t-row[data-cid = " + objId + "] .nickname").text(value).data("value", value);
                            } else {
                                alert('昵称修改失败，请重试！');
                            }
                        },
                        error: function(err) {

                        }
                    });
                } else if (type == 3) { //售价
                    var objId = $this.parents('.t-row').data('oid');
                    value = $this.val();
                    if (value == originValue || (!value && value !== 0)) {
                        return;
                    }
                    var url = '/we_account/updateCustomerInfo?value=' + value + '&objId=' + objId + '&type=' + type;
                    $.ajax({
                        url: url,
                        type: 'get',
                        success: function(results) {
                            if (results.flag == 1) {
                                $this.parents('.t-row').data("value", value);
                            }
                        },
                        error: function(err) {

                        }
                    });
                }
            });

            $("#search-go").touch('click', function() {
                var date1 = $("#date1").val(),
                    date2 = $("#date2").val(),
                    nickname = $("#nickname-position").val();
                _this.getBillList(date1, date2, nickname);
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
            $("#addOrderPanel").touch("click", function() {
                $(".cpanel").removeClass("visible");
            }, true);
            $(document).on("input", "#nickname-position", function() {
                var $this = $(this);
                var offset = $this.offset(),
                    left = offset.left,
                    top = offset.top,
                    inputHeight = $this.height(),
                    inputWidth = $this.width();
                var nickname = $this.val();
                if (nickname == '' || nickname.length == 0) {

                }
                $("#vagueBox").css({
                    left: left,
                    top: top + inputHeight,
                    width: inputWidth
                });
                _this.vagueMatchNames(nickname);
            });

            $(document).on("input", "#aopc_cate,#cc_cate_custom input", function(event) {
                var $this = $(this);
                var vagueStr = $this.val();
                var url = "/we_account/vague_cate?cate=" + vagueStr;
                var offset = $this.offset();
                if (vagueStr == '') {
                    $("#search-cates-panel").removeClass('visible');
                    return;
                }
                $.ajax({
                    url: url,
                    success: function(results) {
                        if (results.flag == 1) {
                            _this.renderVagueSearch("#search-cates-panel", results.data, "cate_name");
                            $("#search-cates-panel").css({
                                width: $this.width() + 30,
                                top: offset.top + $this.height() + 1,
                                left: offset.left
                            }).addClass('visible').data("objinput", $this.data("type"));
                        }
                    }
                })
            });

            $("#search-cates-panel li").touch("click", function(event) {
                var $this = event.$this;
                var cate = $this.text();
                $("#search-cates-panel").removeClass('visible');
                if ($("#search-cates-panel").data('objinput') == '+') {
                    $("#aopc_cate").val(cate);
                } else {
                    $("#cc_cate_custom input").val(cate);
                }

            }, true);

            $('#vagueBox > li').touch('click', function(event) {
                var $this = event.$this;
                var nickname = $this.text(),
                    date1 = $("#date1").val(),
                    date2 = $("#date2").val();
                $("#nickname-position").val(nickname);
                $this.parents("#vagueBox").css("display", "none");
                _this.getBillList(date1, date2, nickname);
            }, true);

            $(".getpay-btn input").touch('click', function(event) {
                var $this = event.$this;
                if (!canGetPay($this)) {
                    alert('请编辑进价和售价!');
                    return;
                }
                $this.parents(".card").addClass("active-getpaybtn").siblings(".card").removeClass("active-getpaybtn"); //TODO 与收账页面同步邮费
                var $tq = $this.parents(".card").find(".total-quantity");
                //var tq_addmailpay = $tq.data("addmailpay");//是否加上了多少邮费，若无邮费，则0
                var totalMoney = Number($tq.text());
                var $mailRow = $this.parents(".card").find(".mail-row");
                var mailpay = $mailRow.find(".fa-check-square").length ? 0 : Number($mailRow.find(".mailpay").val());
                var title = '亲，东西已经买好',
                    desc = '代购总费用:' + (totalMoney + mailpay) + ',详情请点开',
                    nickname = $this.parents('.card').find('.name').text(),
                    link = 'http://www.daidai2u.com/we_account/payit?room_id=' + _this.room_id + '&nickname=' + nickname;
                globalVar.room_id = _this.room_id;
                globalVar.nickname = nickname;
                _this.billScrollTop = $('body').scrollTop();
                wx.onMenuShareAppMessage({
                    title: title,
                    desc: desc,
                    link: link,
                    success: function() {
                        alert("用户账单发送成功");
                    },
                    cancel: function() {
                        alert("用户账单发送已取消");
                    }
                });
                router.changeHash('getpay', 1);
                //                alert("账单已选好，试试点击右上角按钮发送给相关好友哦");
                function canGetPay($getpayBtn) {
                    var $card = $getpayBtn.parents('.card');
                    var $unitCosts = $card.find('.unit_cost'),
                        $unitPrices = $card.find('.unit_price');
                    var isLegal = true;
                    $unitCosts.each(function() {
                        if (!$(this).text().trim() && $(this).text() !== '0') {
                            isLegal = false;
                            return false;
                        }
                    });
                    if (!isLegal) {
                        return false;
                    }
                    $unitPrices.each(function() {
                        if (!$(this).text().trim() && $(this).text() !== '0') {
                            isLegal = false;
                            return false;
                        }
                    });
                    if (!isLegal) {
                        return false;
                    }
                    return true;
                }
            }, true);
            $('.input-div-cost,.input-div.unit_price').touch('click', function(event) {
                //                wx.scanQRCode({
                //                    needResult:1,
                //                    scanType: ["barCode"],
                //                    success:function(res){
                //                        var result = res.resultStr;
                //                        alert(result);
                //                    }
                //                })
                var $this = event.$this;
                var $card = $(this).parents('.card');
                $this.addClass('current').parents('.t-row').siblings('.t-row').find('.current').removeClass('current');
                $this.siblings('.current').removeClass('current');
                var type = $this.data('type'),
                    exchange_rate = $this.attr('data-exrate'),
                    discount = Number($this.data('discount')),
                    objId = $this.parents('.t-row').data('oid'),
                    originValue = $this.data('value');
                if ($this.hasClass('unit_cost')) {
                    $('#money-input').val(originValue);
                    $('.cost_comp').addClass("visible").siblings(".price_comp").removeClass('visible');
                } else if ($this.hasClass('unit_price')) {
                    var $costInput = $this.siblings('.unit_cost'),
                        cost = $costInput.data('value');
                    cost = cost == '' ? '' : Number(cost);
                    var lastPrice = $this.text();
                    $('#price-money-input').val(lastPrice ? Math.ceil(Number(lastPrice) / discount) : cost);
                    $("#price-ratio").val(discount);
                    $("#price-result").val(lastPrice);
                    $('.price_comp').addClass("visible").siblings(".cost_comp").removeClass('visible');
                }
                //$('#price-result').val(Number($this.data("price")));
                //$('#price-ratio').val(originValue ? ((Number($this.data("price"))) / Number(originValue)):1);
                _this.rememberWhere();
                $("#light-popup").pop({
                    callback: function() {
                        $('.current').removeClass('current');
                    }
                }).find('#recharge-rate').val(exchange_rate ? exchange_rate : '');
            }, true);

            $('#input-sure').touch('click', function(event) {
                var $this = event.$this;
                var $inputDiv = $('.current');
                var value = '',
                    type = $inputDiv.data("type"),
                    originValue = $inputDiv.data("value"),
                    exchange_rate = $('#recharge-rate').val(),
                    exchange_type = $('#exchange-type').val(),
                    price = ''; //$("#price-result").val();
                if (type == 2) { //进价
                    var objId = $inputDiv.parents('.t-row').data('oid');
                    value = $('#money-input').val();
                    if ((!value && value !== 0)) {
                        $("#light-popup").pop({
                            hidden: 'true',
                            callback: function() {
                                $('.current').removeClass('current');
                                _this.cleanPopPanel();
                                _this.backToRemember();
                            }
                        });
                        return;
                    }
                    globalVar.showLoading();
                    var url = '/we_account/updateCustomerInfo?value=' + value + '&objId=' + objId + '&type=' + type + '&exchange_rate=' + exchange_rate + '&exchange_type=' + exchange_type;
                    $.ajax({
                        url: url,
                        type: 'get',
                        success: function(results) {
                            if (results.flag == 1) {
                                $inputDiv.data("value", value).attr('data-exrate', exchange_rate).text(Math.ceil(value * exchange_rate)).removeClass('current');
                                _this.updateDisplayExchangeRate(exchange_rate);
                                $("#light-popup").pop({
                                    hidden: 'true',
                                    callback: function() {
                                        $('.current').removeClass('current');
                                        _this.cleanPopPanel();
                                        _this.backToRemember();
                                    }
                                });
                                globalVar.hideLoading();
                            } else {
                                alert('进价保存失败，请重试');
                            }
                        },
                        error: function(err) {
                            alert('进价保存失败，请重试');
                            globalVar.hideLoading();
                        }
                    });
                } else if (type == 3) { //售价
                    var objId = $inputDiv.parents('.t-row').data('oid');
                    value = $("#price-result").val();
                    var discount = $("#price-ratio").val();
                    if ((!value && value !== 0)) {
                        $("#light-popup").pop({
                            hidden: 'true',
                            callback: function() {
                                $('.current').removeClass('current');
                                _this.cleanPopPanel();
                                _this.backToRemember();
                            }
                        });
                        return;
                    }
                    //if(value == originValue|| (!value && value !== 0)){
                    //    return;
                    //}
                    globalVar.showLoading();
                    var url = '/we_account/updateCustomerInfo?value=' + value + '&objId=' + objId + '&type=' + type + '&discount=' + discount;
                    $.ajax({
                        url: url,
                        type: 'get',
                        success: function(results) {
                            if (results.flag == 1) {
                                $inputDiv.data("value", value).data('discount', discount).text(value);
                                _this.calcBillPay($inputDiv.parents(".card"));
                                $("#light-popup").pop({
                                    hidden: 'true',
                                    callback: function() {
                                        $('.current').removeClass('current');
                                        _this.cleanPopPanel();
                                        _this.backToRemember();
                                    }
                                });
                            }
                            globalVar.hideLoading();
                        },
                        error: function(err) {
                            alert('售价保存失败，请重试');
                            globalVar.hideLoading();
                        }
                    });
                    //                    var objId = $inputDiv.parents('.t-row').data('oid');
                    //                    value = $('#money-input').val();
                    //                    if(value == originValue || (!value && value !== 0)){
                    //                        $("#light-popup").pop({hidden:'true',callback:function(){
                    //                            $('.current').removeClass('current');
                    //                        }});
                    //                        _this.cleanPopPanel();
                    //                        return;
                    //                    }
                    //                    var url = '/we_account/updateCustomerInfo?value='+value+'&objId='+objId+'&type='+type;
                    //                    $.ajax({
                    //                        url:url,
                    //                        type:'get',
                    //                        success:function(results){
                    //                            if(results.flag == 1){
                    //                                $inputDiv.data("value",value).text(value).removeClass('current');
                    //                                $("#light-popup").pop({hidden:'true',callback:function(){
                    //                                    $('.current').removeClass('current');
                    //                                }});
                    //                                _this.cleanPopPanel();
                    //                            }else{
                    //                                alert('售价保存失败，请重试');
                    //                            }
                    //                        },
                    //                        error:function(err){
                    //
                    //                        }
                    //                    });
                }
            });
            $('#input-cancel').on('click', function() {
                $("#light-popup").pop({
                    hidden: 'true',
                    callback: function() {
                        $('.current').removeClass('current');
                        _this.backToRemember();
                    }
                });
            });
            $(document).on('change', '.quantity select', function() {
                var $this = $(this);
                var $tq = $this.parents('.card').find('.total-quantity');
                var q = $(this).val(),
                    total = Number($tq.text());
                if (q == 0) {
                    if (confirm("确认删除订单？")) {
                        //                            $quantity.text(--q);
                        //删除订单
                        var orderIds = $this.parents(".t-row").data("oid");
                        _this.updateTotalNum($this);
                        _this.updateOrderStatus($this.parents(".t-row"), orderIds, 0);
                        return;
                    }
                    return;
                }
                _this.updateOrderQuantity($this);
                _this.updateTotalNum($this);
            });
            $("#record-start").touch('click', function() {
                alert('start record')
                wx.startRecord();
                wx.onVoiceRecordEnd({
                    // 录音时间超过一分钟没有停止的时候会执行 complete 回调
                    complete: function(res) {
                        var localId = res.localId;
                        alert(localId);
                        wx.translateVoice({
                            localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
                            isShowProgressTips: 1, // 默认为1，显示进度提示
                            success: function(res) {
                                alert(res.translateResult); // 语音识别的结果
                            }
                        });
                    }
                });
            }, true)
            $("#record-end").touch('click', function() {
                alert(wx.stopRecord)
                wx.stopRecord({
                    success: function(res) {
                        var localId = res.localId;
                        alert(localId)
                        wx.translateVoice({
                            localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
                            isShowProgressTips: 1, // 默认为1，显示进度提示
                            success: function(res) {
                                alert(res.translateResult); // 语音识别的结果
                            }
                        });
                    },
                    error: function(err) {
                        alert(err)
                    }
                });
            }, true)
            $("#bbg-create-order-box").touch("click", function(event) {
                //                router.changeHash("add_order",1);
                _this.showAddOrderPanel();
                _this.$objOrderTable = null;
            }, true);
            $("#bbg-create-order-box").touch("longtouch", function(event) {
                //                router.changeHash("add_order",1);
                alert(111);
            }, true);
            $(".order-add-btn").touch("click", function(event) {
                var $this = event.$this;
                var productId = $this.parents(".extra-row").find(".product-detail").data("pid"),
                    title = $this.parents(".card").find(".name").text();
                $("#aopc_cate").val($this.data("cate"));
                _this.showAddOrderPanel(productId, title);
                _this.$objOrderTable = $this.parents('.card').find(".table");
            }, true);
            $("#aop_seller_submit").touch("click", function(event) {
                if (!util.validateForm("#addOrderPanel")) {
                    return;
                }
                globalVar.showLoading();
                var nickname = $("#aopc_name").val(),
                    $titleWrapper = $(".aopp_name").filter(function() {
                        if ($(this).hasClass("visible-inline")) {
                            return true;
                        }
                    }),
                    desc = $("#aopc_desc").val(),
                    quantity = $("#aopq_quantity select").val(),
                    cost = ($("#aoppurchase_money").val() == '' ? -1 : $("#aoppurchase_money").val()),
                    price = ($("#aopprice_money").val() == '' ? -1 : $("#aopprice_money").val()),
                    productId = $("#addOrderPanel").data("productid"),
                    remark = $("#aopo_remark").val(),
                    cate = $("#aopc_cate").val();
                var title = $titleWrapper[0].tagName.toLowerCase() == 'span' ? $titleWrapper.text() : $titleWrapper.val();
                var url = "/we_account/add_order?title=" + title + "&desc=" + desc + "&quantity=" + quantity + "&cost=" + cost + "&price=" + price +
                    "&nickname=" + nickname + "&productid=" + productId + "&remark=" + remark + "&cate=" + cate;
                $.ajax({
                    url: url,
                    type: 'post'
                }).success(function(results) {
                    if (results.flag == 1) {
                        // alert("加单成功");
                        _this.cleanOrderPanel();
                        var result = results.data;
                        _this.addOrderDataToList({
                            cid: result.c_id,
                            exchange_rate: _this.exchange_rate,
                            mail_free: 0,
                            mail_pay: 0,
                            nickname: nickname,
                            oid: result.order_id,
                            product_id: result.product_id,
                            product_name: title,
                            quantity: quantity,
                            status: 1,
                            unit_cost: cost == -1 ? null : cost,
                            unit_price: price == -1 ? null : price,
                            remark: remark,
                            cate_name: cate == '' ? 'default' : cate
                        });
                        $("#order-list-content").removeClass("billSystem-short");
                        if (_this.billScrollTop) {
                            $('body,html').animate({
                                scrollTop: _this.billScrollTop == 'toBottom' ? $('body').height() : _this.billScrollTop
                            }, 10);
                        }
                        $("#addOrderPanel").pop({
                            hidden: true
                        });
                    } else {
                        alert("加单失败");
                    }
                    globalVar.hideLoading();
                }).error(function(err) {
                    console.log(err);
                })
            }, true);
            $("#aop_seller_cancel").touch("click", function(event) {
                $("#order-list-content").removeClass("billSystem-short");
                $('body,html').animate({
                    scrollTop: _this.billScrollTop
                }, 10);
                $("#addOrderPanel").pop({
                    hidden: true
                });
            });
            $("#search_user").touch("click", function(event) {
                var $nameInput = $("#aopc_name");
                var customer = $nameInput.val();
                if (!customer.trim()) {
                    return;
                }
                var offset = $nameInput.offset();
                $.ajax({
                    url: "/we_account/vague_search_user?customer=" + customer + "&type=" + 1,
                    type: "get"
                }).success(function(results) {
                    if (results.flag == 1) {
                        _this.renderSearchUserPanel("#search-user-panel", results.data);
                        $("#search-user-panel").css({
                            width: $nameInput.width() + 30,
                            top: offset.top + $nameInput.height() + 1,
                            left: offset.left
                        }).addClass('visible');
                    }
                }).error(function(err) {

                });

            }, true);
            //输入自动匹配熟客
            $("#aopc_name,#pep_cnickname").on("input", util.debounce(function(event) {
                console.log("输入自动匹配熟客");
                var $nameInput = $(this);
                var customer = $nameInput.val();
                $nameInput.addClass("match-obj-input");
                if (!customer.trim()) {
                    $("#search-user-panel").removeClass('visible');
                    return;
                }
                var offset = $nameInput.offset();
                $.ajax({
                    url: "/we_account/vague_search_user?customer=" + customer + "&type=3",
                    type: "get"
                }).success(function(results) {
                    if (results.flag == 1) {
                        _this.renderSearchUserPanel("#search-user-panel", results.data);
                        $("#search-user-panel").css({
                            width: $nameInput.width() + 30,
                            top: offset.top + $nameInput.height() + 1,
                            left: offset.left
                        }).addClass('visible');
                    }
                }).error(function(err) {

                });
            },250));
            $("#search_exists_customers").touch("click", function(event) {
                var $nameInput = $("#aopc_name");
                var customer = $nameInput.val();
                if (!customer.trim()) {
                    return;
                }
                var offset = $nameInput.offset();
                $.ajax({
                    url: "/we_account/vague_search_user?customer=" + customer + "&type=3",
                    type: "get"
                }).success(function(results) {
                    if (results.flag == 1) {
                        _this.renderSearchUserPanel("#search-user-panel", results.data);
                        $("#search-user-panel").css({
                            width: $nameInput.width() + 30,
                            top: offset.top + $nameInput.height() + 1,
                            left: offset.left
                        }).addClass('visible');
                    }
                }).error(function(err) {

                });
            }, true);
            $("#exists_customers").touch("click", function(event) {
                $.ajax({
                    url: "/we_account/vague_search_user?type=2",
                    type: "get"
                }).success(function(results) {
                    if (results.flag == 1) {
                        _this.renderSearchUserPanel("#search-customers", results.data);
                        $("#search-customers-panel,#mask").addClass('visible');
                    }
                }).error(function(err) {

                });
            });
            //模糊匹配商品名
            $("#aopp_name").on("input", util.debounce(function() {
                console.log('模糊匹配商品名');
                var $productInput = $(this);
                var productName = $productInput.val(),
                    offset = $productInput.offset();
                if (!productName.trim()) {
                    $("#search-products-panel").removeClass('visible');
                    return;
                }
                $.ajax({
                    url: "/we_account/vagueSearchProduct?product_name=" + productName,
                    type: "get"
                }).success(function(results) {
                    if (results.flag == 1) {
                        _this.renderVagueSearch("#search-products-panel", results.data, "product_name");
                        $("#search-products-panel").css({
                            width: $productInput.width() + 30,
                            top: offset.top + $productInput.height() + 1,
                            left: offset.left
                        }).addClass('visible');
                    }
                });
            },250));
            //搜商品名
            $("#search_product_btn").touch("click", function(event) {
                var $productInput = $("input.aopp_name");
                var productName = $productInput.val(),
                    offset = $productInput.offset();
                $.ajax({
                    url: "/we_account/vagueSearchProduct?product_name=" + productName,
                    type: "get"
                }).success(function(results) {
                    if (results.flag == 1) {
                        _this.renderVagueSearch("#search-products-panel", results.data, "product_name");
                        $("#search-products-panel").css({
                            width: $productInput.width() + 30,
                            top: offset.top + $productInput.height() + 1,
                            left: offset.left
                        }).addClass('visible');
                    }
                }).error(function(err) {

                });
            });
            $("#scp-cancel-btn").touch("click", function(event) {
                $("#search-customers-panel,#mask").removeClass('visible');
            }, true);
            $("#search-customers li").touch("click", function(event) {
                var $this = event.$this;
                var name = $this.text();
                $("#aopc_name").val(name);
                $("#search-customers-panel,#mask").removeClass('visible');
            }, true);
            $("#search-user-panel li").touch("click", function(event) {
                var name = event.$this.text();
                //var $matchobjInput = $(".match-obj-input");
                $(".match-obj-input").val(name).removeClass("match-obj-input");
                $("#search-user-panel").removeClass('visible');
            }, true);
            $("#search-products-panel li").touch("click", function(event) {
                var name = event.$this.text(),
                    pid = event.$this.data("id");
                $("input.aopp_name").data("id", pid).val(name);
                $("#search-products-panel").removeClass('visible');
            }, true);
            $(".order-remark").touch("click", function(event) {
                var $this = event.$this;
                var remark = $this.text();
                var plRemark = $this.attr("data-oremark");
                remark = typeof plRemark != 'undefined' ? plRemark : remark;
                $(".order-remark-update-obj").removeClass("order-remark-update-obj");
                $this.addClass("order-remark-update-obj"); //标记当前更改备注的目标
                $("#pep_remark").addClass('visible-inline').val(remark).siblings('.pep_ele').removeClass('visible-inline');
                $("#order-edit-panel").pop();
            }, true);
            $("#pep_cancel,#pep_submit").touch("click", function(event) {
                var $this = event.$this;
                $("#search-user-panel").removeClass("visible");
                if ($this.hasClass("yellow-btn")) {
                    $("#order-edit-panel").pop({
                        hidden: true
                    });
                } else {
                    _this.updateOrderInfo();
                }
            }, true);
            $("#calc-price-btn").touch("click", function(event) {
                var cost_hk = $("#price-money-input").val(); //初始价
                if (cost_hk == '') {
                    return;
                }
                var ratio = $("#price-ratio").val();
                var price = (cost_hk * ratio).toFixed(1);
                $("#price-result").val(price);
            }, true);
            $("#pay-list .product_name").touch("click", function(event) {
                var $this = event.$this;
                var product_id = $this.parents(".t-row").data("pid");
                globalVar.product_id = product_id;
                $('#take_order').remove();
                router.changeHash("product_display-" + product_id, 1);
            });
        },
        /**
         * 修改订单信息（remark）
         */
        updateOrderInfo: function() {
            var _this = this;
            if ($('#order-edit-panel .visible-inline').hasClass('pep_remark')) {
                var $remarkObj = $(".order-remark-update-obj");
                var newRemark = $("#pep_remark").val();
                if (!util.validateForm("#order-edit-panel") || newRemark == $remarkObj.text()) {
                    return;
                }
                var data = {
                    order_id: $remarkObj.parents(".t-row").data("oid"),
                    remark: newRemark
                };
                globalVar.showLoading();
                var url = "/we_account/update_order_info";
                $.ajax({
                    url: url,
                    type: "post",
                    data: data,
                    success: function(results) {
                        if (results.flag == 1) {
                            var $updateObj = $(".order-remark-update-obj");
                            if(!$updateObj.hasClass("w-p-l-remark")){
                                $updateObj.text(newRemark);
                            }else{
                                $updateObj.attr("data-oremark",newRemark);
                            }
                            //var updateDataSource = function() { //修改本地数据源
                            //    for (var i = 0; i < _this.orderListData.length; i++) {
                            //        if (_this.orderListData[i].oid == data.order_id) {
                            //            _this.orderListData[i].remark = newRemark;
                            //            return;
                            //        }
                            //    }
                            //}
                            _this.updateDataSource('remark',newRemark,data.order_id);
                        } else {
                            alert("修改备注失败！");
                        }
                        //$remarkObj.removeClass("order-remark-update-obj");
                        $("#order-edit-panel").pop({
                            hidden: true
                        });
                        globalVar.hideLoading();
                    },
                    error: function(err) {
                        alert("修改备注失败！！");
                        $("#order-edit-panel").pop({
                            hidden: true
                        });
                        globalVar.hideLoading();
                        //$remarkObj.removeClass("order-remark-update-obj");
                    }
                });
            } else {
                if (!confirm('确认修改该客户昵称？')) {
                    return;
                }
                var $objRow = $('.order-cnickname-update-obj').parent();
                var objId = $objRow.data('cid'),
                    orderId = $objRow.data("oid");
                var value = $("#pep_cnickname").val();
                globalVar.showLoading();
                var url = '/we_account/updateCustomerInfo?nickname=' + value + '&objId=' + objId + '&type=1' + "&order_id=" + orderId;
                $.ajax({
                    url: url,
                    type: 'get',
                    success: function(results) {
                        if (results.flag == 1) {
                            var newCid = results.data.newCid;
                            //                                $this.parents('.t-row').data("value",value);
                            $(".t-row[data-oid = " + orderId + "] .nickname").text(value).data("value", value);
                            _this.updateDataSource(["nickname","cid"],[value,newCid],orderId);
                        } else {
                            alert('昵称修改失败，请重试！');
                        }
                        $("#order-edit-panel").pop({
                            hidden: true
                        });
                        globalVar.hideLoading();
                    },
                    error: function(err) {
                        alert('昵称修改失败，请重试！');
                        $("#order-edit-panel").pop({
                            hidden: true
                        });
                        globalVar.hideLoading();
                    }
                });
            }
        },
        /**
         *
         * @param orderType
         * @param name
         */
        findOrderAddedObjTable: function(orderType, name,cateName) {
            var _this = this,
                objTable = false;
            if(cateName){
                var $cateTitle = $("#order-list .category.title").filter(function(){
                    var $this = $(this);
                    if($this.text() == cateName){
                        return true;
                    }
                });
                var $card = $cateTitle.siblings('.card');
                if($card.find(".name").text() == name){
                    objTable = $card.find('.table');
                };
            }else{
                $("#order-list .card").each(function() {
                    var $this = $(this);
                    if ($this.find(".name").text() == name) {
                        objTable = $this.find(".table");
                    }
                });
            }
            return objTable;
        },
        renderSearchUserPanel: function(wrapperSelector, customers) {
            var len = customers.length,
                listr = "";
            for (var i = 0; i < len; i++) {
                listr += '<li>' + customers[i].nickname + '</li>';
            }
            $(wrapperSelector).html(listr);
        },
        renderVagueSearch: function(wrapperSelector, datas, colname) {
            var len = datas.length,
                listr = "";
            for (var i = 0; i < len; i++) {
                listr += '<li data-id="' + datas[i].id + '">' + datas[i][colname] + '</li>';
            }
            $(wrapperSelector).html(listr);
        },
        showAddOrderPanel: function(productId, title, customer) {
            if (arguments.length == 2) {
                $("#addOrderPanel span.aopp_name").text(title).addClass("visible-inline").removeClass("hide");
                $("#addOrderPanel input.aopp_name").removeClass("visible-inline").addClass("hide");
                $("#addOrderPanel .aop_product_desc").addClass("hide");
                $("#aopc_desc,input.aopp_name").removeClass("required");
                $("#aopc_name").val("");
                $("#addOrderPanel").data("productid", productId);
            } else {
                $("#addOrderPanel input.aopp_name").addClass("visible-inline").removeClass("hide");
                $("#addOrderPanel span.aopp_name").removeClass("visible-inline").addClass("hide");
                $("#addOrderPanel .aop_product_desc").removeClass("hide");
                $("input.aopp_name").addClass("required");
                $("#aopc_name").val(customer ? customer : "");
                $("#addOrderPanel").data("productid", -1);
            }
            $("#addOrderPanel").pop();
            this.billScrollTop = $('body').scrollTop();
            $("#order-list-content").addClass("billSystem-short");
        },
        /**
         * 加单完成后，清理加单panel
         */
        cleanOrderPanel: function() {
            $("input.input-comp").val("");
            $(".cpanel").removeClass("visible");
            $("#aopq_quantity option").get(1).selected = true;
        },
        /**
         * 更新每条记录用于显示的汇率
         * @param newRate
         */
        updateDisplayExchangeRate: function(newRate) {
            $('.input-div-cost').each(function() {
                var $this = $(this);
                if ($this.text() == '') {
                    $this.attr('data-exrate', newRate);
                }
            });
        },
        cleanPopPanel: function() {
            $('#money-input').val('');
        },
        initDates: function() {
            this.getHostInfo();
            var date1 = util.formatDate(null, false, 7);
            var date2 = util.formatDate(null, false);
            $("#date1").val(date1);
            $("#date2").val(date2);
            $("#aopq_quantity select")[0].outerHTML = this.generateNumSelect(100, 1);
        },
        getMarginLeft: function($row) {
            var ml = 0;
            $row.find('.extra').each(function() {
                ml += $(this).width();
            });
            return ml;
        },
        updateTotalNum: function($select) {
            var total = 0;
            var $tq = $select.parents('.card').find('.total-quantity');
            if ($select.parents("#pay-list").length > 0) {
                this.calcBillPay($select.parents(".card"));
            } else if ($select.parents("#order-list").length > 0) {
                $select.parents('.card').find('.quantity select').each(function() {
                    var $select = $(this);
                    total += Number($select.val());
                });
                $tq.text(total);
            }
        },
        /**
         * 更改订单商品数量
         * @param $select
         */
        updateOrderQuantity: function($select) {
            var value = Number($select.val());
            var oid = $select.parents('.t-row').data("oid");
            $.ajax({
                url: '/we_account/updateCustomerInfo?value=' + value + '&type=4&objId=' + oid,
                type: 'get',
                success: function(results) {
                    if (results.flag == 1) {
                        console.log('updateOrderQuantity success');
                        $select.data("value", value);
                    }
                },
                error: function(err) {
                    console.log(err);
                }
            });
        },
        /**
         * 编辑邮费
         * @param isMailFree
         * @param mailPay
         * @param orderIds
         */
        updateMailPay: function(isMailFree, mailPay, orderIds) {
            $.ajax({
                url: '/we_account/updateMailPay?mail_free=' + isMailFree + '&mail_pay=' + mailPay + '&oid=' + orderIds,
                type: 'post',
                success: function(results) {
                    if (results.flag == 1) {
                        if (isMailFree) {

                        }
                        $(".mailpay").attr("orgvalue", mailPay);
                    } else {

                    }
                },
                error: function(err) {
                    console.log(err);
                }
            })
        },

        /**
         * 计算账单费用
         */
        calcBillPay: function($card) {
            var total = 0,
                $mailpay;
            $card.find(" .table .t-row:not(.t-row-header)").each(function() {
                var $row = $(this);
                var num = Number($row.find('.quantity select').val()),
                    unitPrice = Number($row.find('.unit_price').text());
                num = isNaN(num) ? 0 : num;
                unitPrice = isNaN(unitPrice) ? 0 : unitPrice;
                total += num * unitPrice;
                //if(($mailpay = $row.find(".mailpay")).length > 0 && $mailpay.siblings('.fa-square-o').length == 0){
                //    total += Number($mailpay.val());
                //}
            });
            $card.find(" .total-quantity").text(total.toFixed(1));
        },
        /**
         * 更改订单状态
         * @param $obj
         * @param orderIds
         * @param status
         */
        updateOrderStatus: function($obj, orderIds, status) {
            var _this = this;
            $.ajax({
                url: '/we_account/updateOrderStatus?oid=' + orderIds + '&status=' + (typeof status != 'undefined' ? status : 2),
                type: 'post',
                success: function(results) {
                    if (results.flag == 1) {
                        _this.delOrderDataFromList(orderIds);
                        var removeEmptyCate = function($card) {
                            if ($card.siblings('.card').length == 0) {
                                $card.parents('.cate_wrap').remove();
                                return true;
                            }
                            return false;
                        };
                        if ($obj.hasClass('t-row')) {
                            if ($obj.siblings('.t-row:not(.t-row-header,.mail-row)').length == 0) {
                                if (!removeEmptyCate($obj.parents('.card'))) {
                                    $obj.parents('.card').remove();
                                }
                                return;
                            }
                            if ($obj.parents("#pay-list").length > 0) {
                                var $tq = $obj.parents('.card').find('.total-quantity');
                                var total = Number($tq.text());
                                var subQuantity = Number($obj.find('.num').text()),
                                    unitPrice = Number($obj.find('.unit_price').val());
                                $tq.text(total - subQuantity * unitPrice);
                            } else if ($obj.parents("#order-list").length > 0) {
                                var $tq = $obj.parents('.card').find('.total-quantity');
                                var total = Number($tq.text());
                                var subQuantity = Number($obj.find('.num').text());
                                $tq.text(total - subQuantity);
                            }
                        } else if ($obj.parents("#order-list").length > 0) {
                            if (!removeEmptyCate($obj)) {
                                $obj.remove();
                            }
                            return;
                        }
                        $obj.remove();
                    } else {
                        alert('操作失败，请重试');
                    }
                },
                error: function(err) {
                    console.log(err);
                }
            })
        },
        vagueMatchNames: function(nickname) {
            $.ajax({
                url: '/we_account/vagueMatchNames?nickname=' + nickname,
                type: 'post',
                success: function(results) {
                    if (results.flag == 1) {
                        var data = results.data;
                        if (data == 1) {
                            $("#vagueBox").css("display", "none");
                            return;
                        } else {
                            var listr = '';
                            for (var i = 0; i < data.length; i++) {
                                listr += '<li>' + data[i].name + '</li>';
                            }
                            $("#vagueBox").html(listr).css("display", "block");
                        }
                    }
                },
                error: function(err) {
                    console.log(err);
                }
            });
        },
        exchangeMoney: function(money, exchange_rate) {
            return Math.ceil(money * exchange_rate);
        },
        generateNumSelect: function(optionNum, currentNum) {
            //            optionNum = Math.max(optionNum,currentNum>1000?1000:currentNum);
            var selectStr = '<select>';
            currentNum = currentNum ? currentNum : 0;
            var selectClass = '';
            for (var i = 0; i <= optionNum; i++) {
                if (i == currentNum) {
                    selectClass = 'selected';
                } else {
                    selectClass = '';
                }
                selectStr += '<option value="' + i + '" ' + selectClass + '>' + i + '</option>';
            }
            selectStr += '</select>';
            return selectStr;
        },
        getRecordHasMail: function(cates) {
            for (var j = 0; j < cates.length; j++) {
                var record = cates[j];
                var addMailPay = 0;
                if (record.mail_free || record.mail_pay) {
                    return record;
                }
            }
            return record;
        },
        logBuyProductLocation: function(product_id) {
            wx.getLocation({
                type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                success: function(res) {
                    var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                    var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                    var accuracy = res.accuracy; // 位置精度
                    wx.getLocation({
                        type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                        success: function(res) {
                            var latitude_gcj = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                            var longitude_gcj = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                            var accuracy_gcj = res.accuracy; // 位置精度
                            var logData = {
                                pid: product_id,
                                latitude: latitude,
                                longitude: longitude,
                                accuracy: accuracy,
                                latitude_gcj: latitude_gcj,
                                longitude_gcj: longitude_gcj,
                                accuracy_gcj: accuracy_gcj
                            }
                            $.ajax({
                                url: "/we_account/hit_point_buylocation",
                                type: "post",
                                data: logData,
                                success: function(results) {
                                    console.log(results.flag);
                                }
                            });
                        }
                    });
                }
            });
        },
        updateDataSource:function(objKeys,objValues,objOrderId) { //修改本地数据源
            for (var i = 0; i < this.orderListData.length; i++) {
                if (this.orderListData[i].oid == objOrderId) {
                    if(objKeys instanceof Array){
                        for(var j = 0; j < objKeys.length; j++){
                            this.orderListData[i][objKeys[j]] = objValues[j];
                        }
                    }else{
                        this.orderListData[i][objKeys] = objValues;
                    }
                    return;
                }
            }
        },
        rememberWhere:function(){
            this.billScrollTop = $("body").scrollTop();
            console.log('remember,',this.billScrollTop);
        },
        backToRemember:function(){
            var _this = this;
            $('body,html').animate({
                scrollTop: _this.billScrollTop
            }, 10);
            console.log('backToRemember,',this.billScrollTop);
        },
        showLoading: function() {
            $("#loading").css('display', 'block');
        },
        hideLoading: function() {
            $("#loading").css('display', 'none');
        }
    };
    globalVar.modules['billSystem'] = new Bill();
});