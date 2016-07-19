var service = {
	fetchAjax:function(options){
		var deferred = $.Deferred();

		$.ajax(options).then(function(results){
			console.log(results);
			if(results.flag == 1){
				deferred.resolve(results);
			}else{
				deferred.reject(results);
			}
		},function(err){
			//TODO 错误处理
			deferred.reject(err);
		});
		return deferred.promise();
	}
}