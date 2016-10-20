/**
 * Created by man on 15-4-28.
 */
/**
 * 兼容非模块化页面
 */
if(typeof define == 'undefined'){
    var define = function(deps,callback){
        if(callback && typeof callback == 'function'){
            util = callback();
        }
    }
}

define(['wxAPI'],function(wx){
    console.log("util");
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
        },
        /**
         * 英文字母算一个字，中文字算两个
         * @param string
         * @returns {number}
         */
        calcChars:function(string){
            var cnWordReg = /[\u4E00-\u9FA5\uF900-\uFA2D]/g;
            var matchResults = string.match(cnWordReg) || [];
            var cnWordNum = matchResults.length;
            var strLen = string.length;
            return strLen + cnWordNum;
        },
        //获取url中的参数
        getUrlParam:function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
            var r = window.location.search.substr(1).match(reg);  //匹配目标参数
            if (r != null) return unescape(r[2]); return null; //返回参数值
        },
        wxjssdkInit:function(callback){
            var data = {
                url:window.location.href.split("#")[0]
            };
            $.ajax({
                url:'/we_account/wxjssdkinit',
                type:'post',
                data:data,
                success:function(results){
                    if(results.flag == 1){
                        callback(null,results);
                    }else{

                    }
                },
                error:function(err){
                    if(err){
                        console.log("wxjssdkinit err:",err);
                    }
                }
            });
        },
        wxShare:function(title,desc,link,imgUrl,successTip,cancelTip,fTip){
            wx.onMenuShareAppMessage({
                title:title,
                desc:desc,
                link:link,
                imgUrl:imgUrl||"http://www.daidai2u.com/images/logo.jpg",
                success:function(){
                    alert(successTip||'分享成功');
                },
                cancel:function(){
                    alert(cancelTip||"取消分享");
                },
                error:function(){
                    alert(fTip||'分享失败，请重试！');
                }
            });
            wx.onMenuShareTimeline({
                title:title,
                desc:desc,
                link:link,
                imgUrl:imgUrl,
                success:function(){
                    alert(successTip||'分享成功');
                },
                cancel:function(){
                    alert(cancelTip||"取消分享");
                },
                error:function(){
                    alert(fTip||'分享失败，请重试！');
                }
            });
        },
        validateForm:function(formSelector){
            var $f = $(formSelector);
            var tag = "";
            var flag = true;
            var $this;
            $f.find(".required").each(function(){
                $this = $(this);
                tag = $this[0].tagName.toLowerCase();
                switch (tag){
                    case 'input':
                        if(!($.trim($this.val())+"")){
                            $this.addClass("invalid");
                            (function(){
                                var $input = $this;
                                setTimeout(function(){
                                    $input.removeClass("invalid").addClass("renew-input");
                                },3000);
                            })();
                            flag = false;
                            return;
                        }
                        break;
                    case 'textarea':
                        if(!($.trim($this.val())+"")){
                            $this.addClass("invalid");
                            (function(){
                                var $input = $this;
                                setTimeout(function(){
                                    $input.removeClass("invalid");
                                },3000);
                            })();
                            flag = false;
                            return;
                        }
                        break;
                    default :
                        break;
                }
            });
            return flag;
        },
        /**
         * 兼容分享处理
         */
        dealForCompactShare:function(nickname){
            $('title').text(nickname ? nickname + '的代袋' : "主人的代袋");
            $('#for-share').attr('src',"http://www.daidai2u.com/images/logo.jpg");
        },
        /**
         * 获取url参数
         * @param {type} name
         * @returns {unresolved}
         */
        getUrlParam:function(queryName){
            var reg = new RegExp("(^|&)"+ queryName +"=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r!=null) return decodeURI(r[2]); return null;
        },
        ss:function(isJson,key,value){
            if(arguments.length == 2){
                var results = window.sessionStorage.getItem(["daidai_",key].join(""));
                return (isJson ? JSON.parse(results) : results);
            }else if(arguments.length == 3){
                window.sessionStorage.setItem(["daidai_",key].join(""),isJson ? JSON.stringify(value) : value);
            }
        },
        debounce:function(func, wait, immediate) {
            // immediate默认为false
            var timeout, args, context, timestamp, result;

            var later = function() {
              // 当wait指定的时间间隔期间多次调用_.debounce返回的函数，则会不断更新timestamp的值，导致last < wait && last >= 0一直为true，从而不断启动新的计时器延时执行func
              var last = new Date().getTime() - timestamp;

              if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
              } else {
                timeout = null;
                if (!immediate) {
                  result = func.apply(context, args);
                  if (!timeout) context = args = null;
                }
              }
            };

            return function() {
              context = this;
              args = arguments;
              timestamp = new Date().getTime();
              // 第一次调用该方法时，且immediate为true，则调用func函数
              var callNow = immediate && !timeout;
              // 在wait指定的时间间隔内首次调用该方法，则启动计时器定时调用func函数
              if (!timeout) timeout = setTimeout(later, wait);
              if (callNow) {
                result = func.apply(context, args);
                context = args = null;
              }

              return result;
            }
      },
      isWeixin:function(){
        var ua = window.navigator.userAgent.toLowerCase();
        if(ua.match(/MicroMessenger/i)){
            return true;
        }else{
            return false;
        }
      }
    }

});