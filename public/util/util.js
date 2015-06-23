/**
 * Created by man on 15-4-28.
 */

define([],function(){
    return {
        formatDate:function(date,isFormatTime, thedaybefore,formatType) {
            if(!date){
                date = new Date();
            }
            if(!formatType){
                formatType = '-';
            }
            var hms = "";
            if(isFormatTime){
                hms = " "+this.formatTime(date);
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
        },

        /**
         * 获取时分秒 00:00:00
         * @param date
         * @returns {string}
         */
        formatTime:function(date){
            if(!date){
                date = new Date();
            }
            var hh = date.getHours();
            var mm = date.getMinutes();
            var ss = date.getSeconds();
            return (hh >= 10?"":"0")+hh+":"+(mm >= 10?"":"0")+mm+":"+(ss >= 10?"":"0")+ss;
        },
        stopPropagation:function(event){
            if(event.stopPropagation){
                event.stopPropagation(event);
            }else if(event.cancelBubble){
                event.cancelBubble = true;
            }
        },

        /**
         *
         * @param fileName
         * @param callback
         */
        compress:function(fileName,callback){
            var data = {
                filePath:fileName//"/mnt/projects/weAccount_git/we_account/public/images/"+fileName
            };
            $.ajax({
                url:"/we_account/compressPic",
                data:data,
                type:"post",
                success:function(result){//不需要响应
                    console.log(result);
                    callback(null,result);
                },
                error:function(err){
                    console.log(err);
                    callback(err,{});
                }
            })
        },

        /**
         * 限制文件格式
         * @param ext
         * @returns {boolean}
         */
        filterFile:function(ext){
            var exceptExts = ['avi','mp4','wmv','3gp','flv','mkv','txt','js'];
            for(var i = 0; i < exceptExts.length; i++){
                if(ext == exceptExts[i]){
                    return false;
                }
            }
            return true;
        }
    }
});