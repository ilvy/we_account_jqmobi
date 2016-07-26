var gulp = require('gulp'),
	fs = require('fs'),
	gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();
var del = require('del');
var runSequence = require('run-sequence');
var srcPath = 'public/',
	distPath = 'public-dist/',
	tmpPath = 'public-tmp/',
	viewsPath = 'views/',
	viewsDistPath = 'views-dist/';
var distAssetsPath = distPath + 'stylesheets/';
var srcAssetsPath = srcPath + 'stylesheets/';
var tmpAssetsPath = tmpPath + 'stylesheets/';

/******************* 正式环境 ********************/
gulp.task('clean',function(){
	return del([distPath,tmpPath,viewsDistPath,"rev/"]);
});

gulp.task('uglifyjs',function(){
	return gulp.src([srcPath+"javascripts/**/*.js",srcPath+"Jplugin/**/*.js",srcPath+"modules/**/*.js",srcPath+"modules/**/*.js",srcPath+"util/**/*.js",srcPath+"*.js"],{base:srcPath})
		       .pipe(plugins.uglify())
		       .pipe(gulp.dest(tmpPath));
});


gulp.task('concatcss',function(){
	var concatCssFiles = [srcPath+'Jplugin/jquery.light-popup/jquery.light-popup.css'];
	['bootstrap.css','bootstrap-grid.css','mystyle.css','style_new.css'].forEach(function(item,i){
		concatCssFiles.push(srcAssetsPath + item);
	});
	return gulp.src(concatCssFiles,{base:srcPath})
			   .pipe(plugins.concat('all.css'))
			   .pipe(gulp.dest(srcAssetsPath));
});

gulp.task('minifycss',function(){
	return gulp.src([srcAssetsPath+'*.css'],{base:srcAssetsPath})
			   .pipe(plugins.minifyCss())
			   .pipe(gulp.dest(tmpAssetsPath));

});

gulp.task('md5-cssjs',function(){
	return gulp.src([tmpPath+"**/*.js",tmpPath+"**/*.css","!"+tmpPath+"jqr.js","!"+tmpPath+"Jplugin/laydate/**/*"],{base:tmpPath})
			   .pipe(plugins.rev())
			   .pipe(gulp.dest(distPath))
			   .pipe(plugins.rev.manifest('rev/rev-manifest.json',{merge:true,base: process.cwd()+'/rev'}))
			   .pipe(gulp.dest("rev"));
});

gulp.task('dealrevjson',function () {
	var data = fs.readFileSync('rev/rev-manifest.json').toString('utf8').replace(/\.js/g,'');
	fs.writeFileSync('rev/rev-manifest.json',data);
	// fs.readFile(distPath+'rev/rev-manifest.json','utf-8',function(err,data){
	// 	data = data.replace(/\.js/g,'');
	// 	fs.writeFile(distPath+'rev/rev-manifest.json',data,function(err){

	// 	});
	// });
});

gulp.task('revReplace',function(){
	var manifest = gulp.src("rev/rev-manifest.json");
	// console.log(manifest)
	return gulp.src([tmpPath+"jqr.js"],{base:tmpPath})
			   .pipe(plugins["revReplace"]({manifest:manifest}))
			   .pipe(plugins.rev())
			   .pipe(gulp.dest(distPath))
			   .pipe(plugins.rev.manifest('rev/rev-manifest.json',{merge:true,base: process.cwd()+'/rev'}))
			   .pipe(gulp.dest("rev"));
});

gulp.task('revReplaceHtml',function(){
	var manifest = gulp.src("rev/rev-manifest.json");
	// console.log(manifest)
	return gulp.src([srcPath+"*.html"],{base:srcPath})
			   .pipe(plugins["revReplace"]({manifest:manifest}))
			   .pipe(gulp.dest(distPath));
});


gulp.task('revReplaceJade',function(){
	var manifestJson = require('./rev/rev-manifest.json');
	return gulp.src([viewsPath+"*.jade"],{base:viewsPath})
			   .pipe(through2.obj(function(file,enc,cb){
			   	// console.log(file.contents.toString());
			   	var fileContents = file.contents.toString();
			   	for(var key in manifestJson){
			   		var regStr = new RegExp(key,"g");
					fileContents = fileContents.replace(regStr,manifestJson[key]);
				}
			   	// console.log((fileContents.match(reg))[1])
			   	// var jsFileSrc = srcPath + fileContents.match(reg)[1];
			   	
			   	// console.log(resultFile)
			   	file.contents = new Buffer(fileContents,"utf8");
			   	cb(null,file);
			   }))
			   .pipe(gulp.dest(viewsDistPath));
});

var through2 = require('through2');
/*
 * 静态页面部分js文件内联写入
 */
gulp.task('inlinejs',function(){
	return gulp.src([distPath+'*.html'],{base:distPath})
			   .pipe(through2.obj(function(file,enc,cb){
			   	// console.log(file.contents.toString());
			   	var fileContents = file.contents.toString();
			   	var reg = /<script src=".*?[^\/]\/(.*)\?__inline.*"><\/script>/gi;
			   	// console.log((fileContents.match(reg))[1])
			   	// var jsFileSrc = srcPath + fileContents.match(reg)[1];
			   	var resultFile = fileContents.replace(reg,function(match, src, index, input) {
                    return ['<script>',
                        fs.readFileSync(distPath+src).toString('utf8'),
                        '<\/script>'
                    ].join("");
                });
			   	// console.log(resultFile)
			   	file.contents = new Buffer(resultFile,"utf8");
			   	cb(null,file);
			   }))
			   // .pipe(plugins.htmlmin({collapseWhitespace: true}))
			   .pipe(gulp.dest(distPath));
});


 /***************** 生产环境 ********************/


gulp.task('build',['clean'],function(){
	runSequence('uglifyjs','concatcss','minifycss','md5-cssjs','dealrevjson','revReplace','revReplaceHtml','inlinejs','revReplaceJade');
});

gulp.task('watch',function(){
	gulp.watch([srcPath+'stylesheets/*.css',"!"+srcPath+"**/all.css"],['concatcss']);
});