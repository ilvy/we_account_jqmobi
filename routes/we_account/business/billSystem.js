/**
 * Created by man on 15-4-24.
 */

var dbOperator = require("../../../db/dbOperator"),
    response = require("../response/response"),
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