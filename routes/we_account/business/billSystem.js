/**
 * Created by man on 15-4-24.
 */

var dbOperator = require("../../../db/dbOperator"),
    response = require("../response/response"),
    accountInfo = require("../accountInfo"),
    tokenManager = require("../access_token"),
    util = require("../util/util"),
    async = require('async'),
    we_auth = require('../we_auth');
var logger =  require("log4js").getLogger("billSystem");
logger.setLevel("INFO");

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
    var checkSubscribe = function(cb){
//        dbOperator.query('call pro_check_customer_subscribe(?)',[openId],function(err,rows){
//            cb(err,rows);
//        });
        cb(null,null);
    };
    var takeOrderFun = function(results,cb){
//        if(!(results[0] && results[0][0] && results[0][0]['isSubscribe'])){
//            response.failed(-1,res,'');
//            cb('not subscribe',null);
//            return;
//        }
        var paras = [openId,roomId,remark,productId,quantity,create_time];
        dbOperator.query('call pro_take_order(?,?,?,?,?,?)',paras,function(err,rows){
            if(err){
                logger.error(err);
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
                logger.debug(rows);
                if(rows[0] && rows[0][0] && rows[0][0].isExistCustomer){
//                    getNicknameFromWeix(openId,roomId);
                }
                response.success('',res,'');
                logger.info("call pro_take_order results:"+rows[0] && rows[0].length);
            }
            cb(err,results);
        });
    };
    async.waterfall([checkSubscribe,takeOrderFun],function(err,results){
        if(err){
            logger.error(err);
        }
    });
//    else if(!openId && isWeChat){//若是微信客户端打开，获取openid
//        we_auth.getWeAuth('/we_account/getAuthAndTakeOrder?room_id='+roomId+'&remark='+remark+'' +
//            '&product_id='+productId+'&quantity='+quantity+'&create_time='+create_time);
//        return;
//    }

}

/**
 * 检测买家是否已经关注
 * @param openId
 * @param callback
 */
function checkCustomerSubscribe(openId,callback){
    dbOperator.query('call pro_check_customer_subscribe(?)',[openId],function(err,rows){
        if(err){
            logger.error('call pro_check_customer_subscribe err',err);
        }else{
            callback(rows);
        }
    });
}

function getNicknameFromWeix(openid,roomid,callback){
    accountInfo.getAccountInfo(tokenManager.access_token,openid,function(accountInfo){
        logger.debug(accountInfo);
        accountInfo = JSON.parse(accountInfo);
        if(!(accountInfo && accountInfo.nickname)){
            return;
        }
        var args = [openid,roomid,accountInfo.nickname];
        dbOperator.query('call pro_set_customer_nickname(?,?,?)',args,function(err,rows){
            if(err){
                logger.error(err);
            }else{
                logger.debug(rows);
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
    var openid = req.session.openId || 'oxfQVswUSy2KXBPOjNi_BqdNI3aA',
        objid = req.query.objId,
        nickname = req.query.nickname,
        value = req.query.value,
        type = req.query.type,
        exchange_rate = req.query.exchange_rate,
        exchange_type = req.query.exchange_type,
        discount = req.query.discount;//
    value = value == '' ? null:value;
    var args = [objid,value || 0,nickname||'',type,exchange_rate || '',openid,exchange_type || '',discount||''];

    dbOperator.query('call pro_set_customer_info(?,?,?,?,?,?,?,?)',args,function(err,rows){
        if(err){
            logger.error(err);
            response.failed('',res,'');
        }else{
            logger.info('updateCustomerInfo type:'+type +',id:'+objid+' success');
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
            logger.error(err);
            response.failed(-1,res,'');
        }else{
            logger.debug(rows);
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
    var openId = req.session.openId||'oxfQVswUSy2KXBPOjNi_BqdNI3aA';
    var status = req.query.billType;
    var paras = [openId,status];
    dbOperator.query('call pro_get_order_info_new(?,?)',paras,function(err,rows){
        if(err){
            logger.error(err);
            response.failed(-2,res,'');
        }else{
            //console.log(rows);
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
    var openId = req.session.openId ||'oxfQVswUSy2KXBPOjNi_BqdNI3aA';
    var status = req.query.status,
        order_id = req.query.oid,
        buy_time = util.formatDate(null,true);
    if(!openId){
        response.failed(0,res,'');
        return;
    }
    if(status == 2){
        var sql = 'call pro_bought(\''+order_id+'\');';//'UPDATE t_order o SET o.status = '+status+',o.buy_time=\''+buy_time+'\' WHERE o.id IN ('+order_id+')';
    }else if(status == 3){
        sql = 'UPDATE t_order o SET o.status = '+status+',o.pay_time=\''+buy_time+'\' WHERE o.id IN ('+order_id+');';
    }else if(status == 0){
        sql = 'UPDATE t_order o SET o.status = '+status+',o.modify_time=\''+buy_time+'\' WHERE o.id IN ('+order_id+')';
    }

    dbOperator.query(sql,[],function(err,results){
        if(err){
            logger.error(err);
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
    var openId = req.session.openId||'oxfQVswUSy2KXBPOjNi_BqdNI3aA';
    var isMailFree = req.query.mail_free,
        order_id = req.query.oid,
        mailPay = req.query.mail_pay;
    var sql = 'UPDATE t_order o SET o.mail_free = '+isMailFree+' ,o.mail_pay = '+ mailPay + ' where o.id in ('+order_id+');';
    if(!mailPay && mailPay !== 0){
        sql = 'UPDATE t_order o SET o.mail_free = '+isMailFree+' where o.id in ('+order_id+');';
    }
    dbOperator.query(sql,[],function(err,results){
        if(err){
            logger.error(err);
            response.failed(-1,res,'');
        }else{
            response.success('',res,'');
        }
    });
}


function filter_bill(req,res,next){
    var openId = req.session.openId || 'oxfQVswUSy2KXBPOjNi_BqdNI3aA';
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
    var openId = req.session.openId ||'oxfQVswUSy2KXBPOjNi_BqdNI3aA';
    var query = req.query,
        date1 = query.date1,
        date2 = query.date2,
        nickname = query.nickname || '';
    var paras = [openId,nickname,date1,date2];
    dbOperator.query('call pro_get_final_bill(?,?,?,?)',paras,function(err,rows){
        if(err){
            logger.error(err);
            response.failed(-2,res,'');
        }else{
            logger.info(rows);
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
    var openId = req.session.openId;
    var room_id = req.query.room_id,
        nickname = req.query.nickname;//1:卖家查看账单，其他（包括undefined）：买家查看账单
    var paras = [nickname,room_id];
    if(!room_id || !nickname){
        if(!isRequestBySeller){
            res.render('error',{reason:"args invalid:102"});
        }else{
            response.failed(0,res,'');
        }
        return;
    }
    dbOperator.query('call pro_getpayment(?,?)',paras,function(err,rows){
        if(err){
            logger.error(err);
            if(!isRequestBySeller){
                res.render('error',{reason:"gpm:101"})
            }else{
                response.failed(-1,res,'')
            }
        }else{
            logger.debug(rows);
            var data = rows[0] || [];
            var total = 0,
                mailRecord;
            for(var i = 0; i < data.length; i++){
                var quantity = data[i].quantity?Number(data[i].quantity):0,
                    price = data[i].price?Number(data[i].price):0;
                data[i].single_total = quantity * price;
                total += data[i].single_total;
                if(data[i].mail_free || data[i].mail_pay && !mailRecord){
                    mailRecord = data[i];
                }
            }
            !mailRecord ? (mailRecord = data[0]) : "";
            if(!mailRecord.mail_free){
                total += mailRecord.mail_pay;
            }

            if(!isRequestBySeller){
                res.render('payment',{dataList:data,roomId:room_id,total:total,isMailFree:mailRecord.mail_free,mailPay:mailRecord.mail_pay,nickname:data[0].nickname})
            }else{
                response.success({dataList:data,roomId:room_id,total:total,isMailFree:mailRecord.mail_free,mailPay:mailRecord.mail_pay,nickname:nickname},res,'')
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
    var openId = req.session.openId || 'oxfQVswUSy2KXBPOjNi_BqdNI3aA',
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

//in cnickname varchar(50),in title varchar(40),in text varchar(600),in image_urls varchar(200),
// in sell_room_id varchar(16),in remark varchar(60),in productid int,in in_quantity int
/**
 * 卖家帮买家下单
 * @param req
 * @param res
 */
function addOrderBySeller(req,res){
    var nickname = req.query.nickname,
        title = req.query.title,
        desc = req.query.desc,
        image_urls = req.query.image_urls || "",
        remark = req.query.remark || "",
        productid = req.query.productid || -1,
        in_quantity = req.query.quantity,
        cost = req.query.cost,
        price = req.query.price,
        discount = 1,
        cate = req.query.cate;
    var openId = req.session.openId || "oxfQVswUSy2KXBPOjNi_BqdNI3aA";
    dbOperator.query("call pro_add_order_by_seller_new(?,?,?,?,?,?,?,?,?,?,?,?)",[nickname,title,desc,image_urls,openId,remark,productid,in_quantity,cost,price,discount,cate],function(err,rows){
        if(err){
            logger.error("call pro_add_order_by_seller err:",err);
        }else{
            logger.info("pro_add_order_by_seller results:",rows);
            if(rows && rows[0] && rows[0][0]){
                response.success(rows[0][0],res,"");
            }else{
                response.failed(-1,res,"");
            }
        }
    });
}

function vagueSearchUser(req,res){
    var customer = req.query.customer,
        type = req.query.type;
    var openId = req.session.openId || 'oxfQVswUSy2KXBPOjNi_BqdNI3aA';
    dbOperator.query("call pro_vague_search_user(?,?,?)",['%'+customer+'%',openId,type],function(err,rows){
        if(err){
            logger.error("call pro_vague_search_user err:",err);
        }else{
            logger.debug("call pro_vague_search_user results:",rows);
            response.success(rows[0],res,"");
        }
    });
}

/**
 * 收账前先授权
 * @param req
 * @param res
 * @param next
 */
function wxauth_pay(req,res,next){
    var openId = req.session.openId || 'oxfQVswUSy2KXBPOjNi_BqdNI3aA';
    var room_id = req.query.room_id,
        nickname = req.query.nickname;
    if(openId){
        next();
        return;
    }
    if(!req.session.authority){
        req.session.authority = true;
        var redirect_uri = "http://www.daidai2u.com/we_account/payit?nickname="+nickname+"&room_id="+room_id;
        we_auth.getWeAuth(redirect_uri,res,"snsapi_userinfo");
    }else{
        we_auth.redirectToUrl(req,res,function(err,results,requ,resp,nocode){
            if(err){
                logger.error('getAuth snsapi_userinfo failed in payit:',err);
            }else if(nocode){
                delete req.session.authority;
                return;
            }else if(results){
                if(!(results && results.openid)){
                    res.render("error",{reason:'no permit:103'});
                    return;
                }
                var openId = req.session.openId = results.openid;
                var accessToken = results.access_token;
                logger.info("get openId:"+results.openid);
                we_auth.getSnsapi_userinfo(req,res,accessToken,openId,function(err,userInfo){
                    //in cnickname varchar(50),in roomid varchar(40),in c_openid varchar(200),
                    //in headimgurl varchar(150),in sex bit,in city varchar(30),in country varchar(30),in unionid varchar(200),in subscribe_time datetime
                    dbOperator.query("call pro_integrate_customer_info(?,?,?,?,?,?,?,?,?,?)",[nickname,room_id,openId,userInfo.headimgurl,userInfo.sex,userInfo.nickname,
                                    userInfo.city,userInfo.country,userInfo.unionid,userInfo.subscribe_time],function(err,rows){
                        if(err){
                            logger.error("call pro_integrate_customer_info err",err);
                        }
                        next();
                    })
                });

            }
        });
    }
}

/**
 * 更新订单信息
 * @param req
 * @param res
 */
function updateOrderInfo(req,res){
    var openId = req.session.openId ||'oxfQVswUSy2KXBPOjNi_BqdNI3aA',
        body = req.body;
    var order_id = body.order_id,
        remark = body.remark;
    dbOperator.query("call pro_update_order_info(?,?,?)",[openId,remark,order_id],function(err,rows){
        if(err){
            logger.error("call pro_update_order_info err:",err);
            response.failed(-1,res,"");
        }else{
            if(rows && rows[0] && rows[0][0] && rows[0][0].result){
                response.success(1,res,"");
            }else{
                response.failed(0,res,"");
            }
        }
    })
}

/**
 *
 * @param req
 * @param res
 */
function vagueCate(req,res){
    var cate = req.query.cate;
    dbOperator.query("call pro_vague_search_category(?)",['%'+cate+'%'],function(err,rows){
        if(err){
            logger.error("call pro_vague_search_category err:",err);
            response.failed(-1,res,"");
        }else{
            if(rows && rows[0]){
                if(rows[0].length){
                    response.success(rows[0],res,"");
                }else{
                    response.success(0,res,"");
                }
            }else{
                response.failed(0,res,"");
            }
        }
    })
}

/**
 * 订单更改分类
 * @param req
 * @param res
 */
function changeCategory(req,res){
    var cateName = req.query.cate_name,
        oid = req.query.order_id;
    dbOperator.query("call pro_change_category(?,?)",[oid,cateName],function(err,rows){
        if(err){
            logger.error("call pro_change_category err:",err);
            response.failed(-1,res,"");
        }else{
            response.success(1,res,"");
        }
    })
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
exports.checkCustomerSubscribe = checkCustomerSubscribe;
exports.addOrderBySeller = addOrderBySeller;
exports.vagueSearchUser = vagueSearchUser;
exports.wxauth_pay = wxauth_pay;
exports.updateOrderInfo = updateOrderInfo;
exports.vagueCate = vagueCate;
exports.changeCategory = changeCategory;