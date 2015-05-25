/**
 * Created by man on 15-4-24.
 */

var dbOperator = require("../../../db/dbOperator"),
    response = require("../response/response"),
    accountInfo = require("../accountInfo"),
    tokenManager = require("../access_token"),
    util = require("../util/util"),
    we_auth = require('../we_auth');

/**
 * 买家下订单
 * @param req
 * @param res
 */
function takeOrder(req,res,callback){
    var openId = req.session.openId,
        body = req.body,
        query = req.query;
    var roomId = body.room_id,
        remark = body.remark,
        productId = body.product_id,
        quantity = body.quantity,
        isWeChat = body.isWeChat,
        create_time = util.formatDate(null,true);
    if(callback){
        roomId = query.room_id;
        remark = query.remark;
        productId = query.product_id;
        quantity = query.quantity;
    }
    if(!openId){//未关注公众号，跳到公众号关注界面
        response.failed(0,res,'');
        return;
    }
//    else if(!openId && isWeChat){//若是微信客户端打开，获取openid
//        we_auth.getWeAuth('/we_account/getAuthAndTakeOrder?room_id='+roomId+'&remark='+remark+'' +
//            '&product_id='+productId+'&quantity='+quantity+'&create_time='+create_time);
//        return;
//    }
    var paras = [openId,roomId,remark,productId,quantity,create_time];
    dbOperator.query('call pro_take_order(?,?,?,?,?,?)',paras,function(err,rows){
        if(err){
            console.log(err);
            if(callback){
                callback(err,null,res);
                return;
            }
            response.failed(-2,res,'');
        }else{
            if(callback){
                callback(null,rows,res);
                return;
            }
            console.log(rows);
            if(rows[0] && rows[0][0] && rows[0][0].isExistCustomer){
                getNicknameFromWeix(openId,roomId);
            }
            response.success('',res,'');
        }
    });
}

function getNicknameFromWeix(openid,roomid,callback){
    accountInfo.getAccountInfo(tokenManager.access_token,openid,function(accountInfo){
        console.log(accountInfo);
        accountInfo = JSON.parse(accountInfo);
        var args = [openid,roomid,accountInfo.nickname];
        dbOperator.query('call pro_set_customer_nickname(?,?,?)',args,function(err,rows){
            if(err){
                console.log(err);
            }else{
                console.log(rows);
            }
        });
    });
}

/**
 * 更新1、昵称，2、进价或者3、售价 4、type 5、汇率 6、币种
 * @param req
 * @param res
 */
function updateCustomerInfo(req,res){
    var openid = req.session.openId || 'oHbq1t0enasGWD7eQoJuslZY6R-4',
        objid = req.query.objId,
        nickname = req.query.nickname,
        value = req.query.value?Number(req.query.value):0,
        type = req.query.type,
        exchange_rate = req.query.exchange_rate,
        exchange_type = req.query.exchange_type;//
    var args = [objid,value||0,nickname||'',type,exchange_rate || '',openid,exchange_type || ''];

    dbOperator.query('call pro_set_customer_info(?,?,?,?,?,?,?)',args,function(err,rows){
        if(err){
            console.log(err);
            response.failed('',res,'');
        }else{
            console.log('updateCustomerInfo type:'+type +',id:'+objid+' success');
//            if(rows.affectedRows != 0){
                response.success('',res,'');
//            if(value == ''){
//
//            }
//            }else{
//                response.failed(-2,res,'');//未修改成功
//            }

        }
    });
}

function filter_takeOrder(req,res,next){
    var openId = req.session.openId,
        body = req.body;
    var roomId = body.room_id,
        productId = body.product_id;
    var paras = [openId,roomId,productId];
    dbOperator.query('call pro_filter_order(?,?,?,?,?,?)',paras,function(err,rows){
        if(err){
            console.log(err);
            response.failed(-1,res,'');
        }else{
            console.log(rows);
            next();
        }
    });
}

/**
 * 获取购物清单列表，收款列表
 * @param req
 * @param res
 */
function getBillList(req,res){
    var openId = req.session.openId||'oHbq1t0enasGWD7eQoJuslZY6R-4';
    var status = req.query.billType;
    var paras = [openId,status];
    dbOperator.query('call pro_get_order_info(?,?)',paras,function(err,rows){
        if(err){
            console.log(err);
            response.failed(-2,res,'');
        }else{
//            console.log(rows);
            response.success(rows[0],res,'');
        }
    });
}

/**
 * 修改订单状态
 * @param req
 * @param res
 */
function updateOrderStatus(req,res){
    var openId = req.session.openId||'oHbq1t0enasGWD7eQoJuslZY6R-4';
    var status = req.query.status,
        order_id = req.query.oid,
        buy_time = util.formatDate(null,true);
    if(!openId){
        response.failed(0,res,'');
        return;
    }
    if(status == 2){
        var sql = 'UPDATE t_order o SET o.status = '+status+',o.buy_time=\''+buy_time+'\' WHERE o.id IN ('+order_id+')';
    }else if(status == 3){
        sql = 'UPDATE t_order o SET o.status = '+status+',o.pay_time=\''+buy_time+'\' WHERE o.id IN ('+order_id+');';
    }else if(status == 0){
        sql = 'UPDATE t_order o SET o.status = '+status+',o.modify_time=\''+buy_time+'\' WHERE o.id IN ('+order_id+')';
    }

    dbOperator.query(sql,[],function(err,results){
        if(err){
            console.log(err);
            response.failed(-1,res,'');
        }else{
            response.success('',res,'');
        }
    });
}

/**
 * 编辑邮费
 * @param req
 * @param res
 */
function updateMailPay(req,res){
    var openId = req.session.openId||'oHbq1t0enasGWD7eQoJuslZY6R-4';
    var isMailFree = req.query.mail_free,
        order_id = req.query.oid,
        mailPay = req.query.mail_pay;
    var sql = 'UPDATE t_order o SET o.mail_free = '+isMailFree+' ,o.mail_pay = '+ mailPay + ' where o.id in ('+order_id+');';
    if(!mailPay && mailPay !== 0){
        sql = 'UPDATE t_order o SET o.mail_free = '+isMailFree+' where o.id in ('+order_id+');';
    }
    dbOperator.query(sql,[],function(err,results){
        if(err){
            console.log(err);
            response.failed(-1,res,'');
        }else{
            response.success('',res,'');
        }
    });
}


function filter_bill(req,res,next){
    var openId = req.session.openId || 'oHbq1t0enasGWD7eQoJuslZY6R-4';
    var status = req.query.billType;
    if(!openId){
        response.failed(0,res,'');//
    }else{
        next();
    }
}

/**
 * 获取最终账单列表
 * @param req
 * @param res
 */
function getFinalBill(req,res){
    var openId = req.session.openId||'oHbq1t0enasGWD7eQoJuslZY6R-4';
    var query = req.query,
        date1 = query.date1,
        date2 = query.date2,
        nickname = query.nickname || '';
    var paras = [openId,nickname,date1,date2];
    dbOperator.query('call pro_get_final_bill(?,?,?,?)',paras,function(err,rows){
        if(err){
            console.log(err);
            response.failed(-2,res,'');
        }else{
            console.log(rows);
            response.success(rows[0],res,'');
        }
    });
}

/**
 * 跟买家收款时生成收款列表
 * @param req
 * @param res
 */
function getPayment(req,res,isRequestBySeller){//需要验证openid
    var openId = req.session.openid;
    var room_id = req.query.room_id,
        nickname = req.query.nickname;//1:卖家查看账单，其他（包括undefined）：买家查看账单
    var paras = [nickname,room_id];
    if(!room_id || !nickname){
        if(!isRequestBySeller){
            res.render('error')
        }else{
            response.failed(0,res,'')
        }
        return;
    }
    dbOperator.query('call pro_getpayment(?,?)',paras,function(err,rows){
        if(err){
            console.log(err);
            if(!isRequestBySeller){
                res.render('error')
            }else{
                response.failed(-1,res,'')
            }
        }else{
            console.log(rows);
            var data = rows[0] || [];
            var total = 0;
            for(var i = 0; i < data.length; i++){
                var quantity = data[i].quantity?Number(data[i].quantity):0,
                    price = data[i].price?Number(data[i].price):0;
                data[i].single_total = quantity * price;
                total += data[i].single_total;
            }
            if(!data[0].mail_free){
                total += data[0].mail_pay;
            }

            if(!isRequestBySeller){
                res.render('payment',{dataList:data,roomId:room_id,total:total,isMailFree:data[0].mail_free,mailPay:data[0].mail_pay,nickname:nickname})
            }else{
                response.success({dataList:data,roomId:room_id,total:total,isMailFree:data[0].mail_free,mailPay:data[0].mail_pay,nickname:nickname},res,'')
            }
        }
    });
}

/**
 * 模糊匹配查询
 * @param req
 * @param res
 */
function vagueMatchNames(req,res){
    var openId = req.session.openId || 'oHbq1t0enasGWD7eQoJuslZY6R-4',
        vagueName = req.query.nickname;
    dbOperator.query('call pro_vague_match_customer(?,?)',['%'+vagueName+'%',openId],function(err,rows){
        if(err){
            response.failed(-1,res,'');
        }else{
            if(rows[0] && rows[0].length > 0){
                response.success(rows[0],res,'');
            }else{
                response.success(1,res,'');//查询成功，无匹配项
            }
        }
    });
}

exports.takeOrder = takeOrder;
exports.filter_takeOrder = filter_takeOrder;
exports.getBillList = getBillList;
exports.filter_bill = filter_bill;
exports.getFinalBill = getFinalBill;
exports.updateCustomerInfo = updateCustomerInfo;
exports.updateOrderStatus = updateOrderStatus;
exports.updateMailPay = updateMailPay;
exports.getNicknameFromWeix = getNicknameFromWeix;
exports.vagueMatchNames = vagueMatchNames;
exports.getPayment = getPayment;