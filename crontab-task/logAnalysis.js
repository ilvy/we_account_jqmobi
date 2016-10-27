var fs = require("fs");
var path = require("path");
var util = require("../routes/we_account/util/util");
var readline = require("readline");
var mailCenter = require("../routes/we_account/business/emailCenter");
var mysql = require("mysql"),
    dbPoolConfig = require("../config/config").dbPoolConfig

var connection = mysql.createConnection(dbPoolConfig);
connection.connect();
var yesterday = util.formatDate('','',1);
var logsDir = "/mnt/projects/we_account_jqmobi/logs";//path.resolve("..","logs");
var logFilePath = [logsDir+"/operate.log",yesterday].join("-");
// fs.readFile();
var rl = readline.createInterface({
	input:fs.createReadStream(logFilePath)
})
var loginUsers = {};
var openIds = [];
var mailContentHtml = "";
var analysisLogin = (lineStr)=>{
	line = lineStr.split("com.daigo.logging.login")[1].split(",");
	if(!loginUsers[line[1]]){
		loginUsers[line[1]] = {count:1,successCount:0,failCount:0,appCount:0,explorerCount:0,open_id:line[1]};
		openIds.push(line[1]);
	}else{
		loginUsers[line[1]].count++;
	}
	var record = loginUsers[line[1]];
	line[3] != 1 ? record.explorerCount++ : record.appCount++;
	line[4] == 0 ? record.successCount++ : record.failCount++;
};
/**
 * 根据openId获取数据
 * @param  {[type]} openIds [description]
 * @return {[type]}         [description]
 */
var fetchInfo = (openIds,cb)=>{
	var sql = "select u.room_id,w.nickname,u.open_id from user u left join t_weix_account_info w on u.open_id = w.open_id where u.status = 1 and u.open_id in ('"+(openIds.join("','"))+"')";
	connection.query(sql,(err,rows,fields)=>{
		// console.log(rows);
		cb && cb(err,rows);
	});
	connection.end();
	console.log(sql);
	// select u.room_id,w.nickname from user u join t_weix_account_info w on u.open_id = w.open_id where u.open_id in (oxfQVs0l0bPG6YgvWfRZB4efz5kY,oxfQVs6ds6dBEan1paynrNM80UYo,oxfQVs4l4i86vhXBeXKYPv85HM6w,oxfQVs3fSNZiaePKTn24MKR4xCU4,lopid_14705859558720.9519012409678949,oxfQVs0syRbm4_uTNY0jG-j-N6Sw,oxfQVs4m5spT8HSXl79qQkXtZ4rI,oxfQVsxeZpqTMRns0t07PoLAu280,oxfQVs70UzGfSidA5dBwkGzNJkh4)
};
/**
 * 整合所有用户信息
 * @param  {[type]} rows [description]
 * @return {[type]}      [description]
 */
var integrate = (rows)=>{
	for(var i = 0; i < rows.length; i++){
		var row = rows[i];
		var record = loginUsers[row.open_id];
		record.room_id = row.room_id;
		record.nickname = row.nickname;
	}
	console.log(loginUsers);
};
var generateHtml = ()=>{
	var user ;
	mailContentHtml = "<table><thead><th>room_id</th><th>昵称</th><th>登录次数</th><th>登录成功次数</th><th>终端登录</th><th>网页登录</th></thead>"
	for(var openId in loginUsers){
		user = loginUsers[openId];
		mailContentHtml += '<tr style="border:1px solid #cecece;"><td>'+user.room_id+'</td><td>'+user.nickname+'</td><td>'+user.count+'</td><td>'+user.successCount+'</td><td>'+user.appCount+'</td><td>'+user.explorerCount+'</td></tr>'
	}
	mailContentHtml += "</table>";
};
var sendMail = ()=>{
	// receiveMails.forEach(function(item,i){
		// console.log("*****************",item);
	mailCenter.sendMail({
	    to : "798737701@qq.com,478283225@qq.com",
	    subject: "代go每日数据分析",
	    generateTextFromHTML : true,
	    html : mailContentHtml
	},function(err,res){

	});
	// });
};
rl.on("line",(line)=>{
	analysisLogin(line);
});
rl.on("close",()=>{
	fetchInfo(openIds,(err,rows)=>{
		if(err){
			mailContentHtml = "<p>统计出错，联系你们家帅气的程序猿！</p>";
		}else{
			integrate(rows);
			generateHtml();
		}
		sendMail();
	});
})