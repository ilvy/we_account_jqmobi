/**
 * Created by Administrator on 14-4-28.
 */

/**
 * desc:格式化date前thedaybefore天的日期
 * @param date
 * @param thedaybefore
 * @param formatType
 * @returns {string}
 */
function formatDate(date,isFormatTime, thedaybefore,formatType) {
    if(!date){
        date = new Date();
    }
    if(!formatType){
        formatType = '-';
    }
    var hms = "";
    if(isFormatTime){
        hms = " "+formatTime(date);
    }
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    if (!thedaybefore) {
        m++;
        return y + formatType + ((m < 10 ? "0" : "") + m) + formatType + ((d < 10 ? "0" : "") + d)+hms;
    }
    d -= thedaybefore;
    date = new Date(y, m, d);
    d = date.getDate();
    m = date.getMonth() + 1;
    y = date.getFullYear();
    return y + formatType + ((m < 10 ? "0" : "") + m) + formatType + ((d < 10 ? "0" : "") + d)+hms;
}

/**
 * 获取时分秒 00:00:00
 * @param date
 * @returns {string}
 */
function formatTime(date){
    if(!date){
        date = new Date();
    }
    var hh = date.getHours();
    var mm = date.getMinutes();
    var ss = date.getSeconds();
    return (hh >= 10?"":"0")+hh+":"+(mm >= 10?"":"0")+mm+":"+(ss >= 10?"":"0")+ss;
}

/**
 * 过滤未登陆的用户
 * @param req
 * @param res
 * @param next
 */
function filterLoginAjax(req,res,next){
    if(!req.session.openId){
        res.send({
            flag:0,//失败
            data:0//失败原因：未登陆
        });
    }else{
        next();
    }
}

/**
 * 去字符串两边的空格
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
var trim = (str)=>{
    return str.replace(/^\s+|\s+$/g,'');
}

exports.getImageExt = function getImageExt(imageName){

}

exports.formatDate = formatDate;
exports.filterLoginAjax = filterLoginAjax;
exports.trim = trim;