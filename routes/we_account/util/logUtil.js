var logger =  require("log4js");

function Logger(category){
	this.category = category;
	this.objLogger = logger.getLogger(category);
	this.objLogger.setLevel("INFO");
}

/**
* 类似反射的方式调用
*/
Logger.prototype.logging = function(logInfoArray,level,type){
	var logStr = logInfoArray.join(",");
	var cate = this.category,
		objLogger = this.objLogger,
		logMethod = this.getLogMethod(level);
	switch(type){
		case "login":
			logMethod.call(this.objLogger,["com.daigo.logging.login",logStr].join(","));
			break;
		case "addorder":
			logMethod.call(this.objLogger,["com.daigo.logging.addorder",logStr].join(","));
			break;
		default:
			break;
	}
}

Logger.prototype.getLogMethod = function(level){
	var objLogger = this.objLogger;
	switch(level){
		case "info":
			return objLogger.info;
		case "error":
			return objLogger.error;
		default:
			return objLogger.info;
	}
}

exports.Logger = Logger;