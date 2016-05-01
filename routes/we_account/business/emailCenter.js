var nodemailer = require("nodemailer");
 
var transport = nodemailer.createTransport("SMTP", {
    host: "smtp.qq.com",
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    auth: {
        user: "478283225@qq.com",
        pass: "86545959J2cs"
    }
});
 
transport.sendMail({
    from : "478283225@qq.com",
    to : "3122389700@qq.com",
    subject: "邮件主题",
    generateTextFromHTML : true,
    html : "&lt;p&gt;这是封测试邮件&lt;/p&gt;"
}, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent: " + response.message);
    }
    transport.close();
});


