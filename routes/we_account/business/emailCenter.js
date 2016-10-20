var nodemailer = require("nodemailer"),
    extend = require('extend');
 
var transport = nodemailer.createTransport("SMTP", {
    host: "smtp.qq.com",
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    auth: {
        user: "478283225@qq.com",
        pass: "igxvakmtfxeqbihi"
    }
});
 
// transport.sendMail({
//     from : "sHy<478283225@qq.com>",
//     to : "3122389700@qq.com",
//     subject: "邮件主题",
//     generateTextFromHTML : true,
//     html : "<p>亲爱的代go用户，</p><p>请点击一下链接激活您的账号，</p><a href='http://www.baidu.com/'>激活链接</a><p>如有疑问，请电联客服17722699552</p><p>感谢您的使用</p>"
// }, function(error, response){
//     if(error){
//         console.log(error);
//     }else{
//         console.log("Message sent: " + response.message);
//     }
//     transport.close();
// });

var defaultOptions = {
    from : "sHy<478283225@qq.com>",
    generateTextFromHTML : true
};

var sendMail = (options,cb)=>{
    options = extend(defaultOptions,options);
    transport.sendMail(options,function(error,response){
        cb(error,response);
        transport.close();
    });
}

exports.sendMail = sendMail;
