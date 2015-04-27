/**
 * Created by man on 15-4-24.
 */

var dbOperator = require("../../../db/dbOperator"),
    response = require("../response/response"),
    accountInfo = require("../accountInfo"),
    tokenManager = require("../access_token"),
    util = require("../util/util");

/**
 * 买家下订单
 * @param req
 * @param res
 */
function takeOrder(req,res){
    var openId = req.session.openId,
        body = req.body;
    var roomId = body.room_id,
        remark = body.remark,
        productId = body.product_id,
        quantity = body.quantity,
        create_time = util.formatDate(null,true);
    if(!openId){//未关注公众号，跳到公众号关注界面
        response.failed(0,res,'');
    }
    var paras = [openId,roomId,remark,productId,quantity,create_time];
    dbOperator.query('call pro_take_order(?,?,?,?,?,?)',paras,function(err,rows){
        if(err){
            console.log(err);
            response.failed(-2,res,'');
        }else{
            console.log(rows);
            response.success('',res,'');
            if(rows[0][0] && rows[0][0].isExistCustomer){
                getNicknameFromWeix(openId,roomId);
            }
        }
    });
}

function getNicknameFromWeix(openid,roomid){
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
 * 更新1、昵称，2、进价或者3、售价 4、数量 信息
 * @param req
 * @param res
 */
function updateCustomerInfo(req,res){
    var openid = req.session.openId,
        objid = req.query.objId,
        nickname = req.query.nickname,
        value = req.query.value,
        type = req.query.type;//
    var args = [objid,value||0,nickname||'',type];
    dbOperator.query('call pro_set_customer_info(?,?,?,?)',args,function(err,rows){
        if(err){
            console.log(err);
            response.failed('',res,'');
        }else{
            console.log(rows);
            response.success('',res,'');
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
            console.log(rows);
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
    var sql = 'UPDATE t_order o SET o.status = '+status+',o.buy_time=\''+buy_time+'\' WHERE o.id IN ('+order_id+')';
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
    var openId = req.session.openId||'oHbq1t0enasGWD7eQoJuslZY6R-4';
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
    var openId = req.session.openId;
    var query = req.query,
        date1 = query.date1,
        date2 = query.date2,
        nickname = query.nickname || '';
    var paras = [openId,nickname,date1,date2]
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

exports.takeOrder = takeOrder;
exports.filter_takeOrder = filter_takeOrder;
exports.getBillList = getBillList;
exports.filter_bill = filter_bill;
exports.getFinalBill = getFinalBill;
exports.updateCustomerInfo = updateCustomerInfo;
exports.updateOrderStatus = updateOrderStatus;