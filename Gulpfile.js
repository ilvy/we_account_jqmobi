var gulp = require('gulp'),
	fs = require('fs'),
	gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();
var del = require('del');
var runSequence = require('run-sequence');
var srcPath = 'public/',
	distPath = 'public-dist/';


/******************* 正式环境 ********************/
gulp.task('clean',function(){
	return del([distPath]);
});

gulp.task('uglifyjs',function(){
	return gulp.src([srcPath+"javascripts/**/*.js",srcPath+"Jplugin/**/*.js",srcPath+"modules/**/*.js",srcPath+"modules/**/*.js",srcPath+"util/**/*.js",srcPath+"*.js"],{base:srcPath})
		       .pipe(plugins.uglify())
		       .pipe(gulp.dest(distPath));
});

var distAssetsPath = distPath + 'stylesheets/';
var srcAssetsPath = srcPath + 'stylesheets/';

gulp.task('concatcss',function(){
	var stylesPath = srcPath + 'stylesheets/';
	var concatCssFiles = [];
	['bootstrap.css','bootstrap-grid.css','style_new.css','mystyle.css'].forEach(function(item,i){
		concatCssFiles.push(stylesPath + item);
	});
	concatCssFiles.push(srcPath+'Jplugin/jquery.light-popup/jquery.light-popup.css');
	return gulp.src(concatCssFiles,{base:srcPath})
			   .pipe(plugins.concat('all.css'))
			   .pipe(gulp.dest(srcAssetsPath));
});

gulp.task('minifycss',function(){
	return gulp.src([srcAssetsPath+'all.css'],{base:srcAssetsPath})
			   .pipe(plugins.minifyCss())
			   .pipe(gulp.dest(distAssetsPath));

});

gulp.task('md5-cssjs',function(){
	return gulp.src([distPath+"**/*.js",distAssetsPath+"**/*.css","!"+distPath+"jqr.js"],{base:distPath})
			   .pipe(plugins.rev())
			   .pipe(gulp.dest(distPath))
			   .pipe(plugins.rev.manifest())
			   .pipe(gulp.dest(distPath));
});

gulp.task('dealrevjson',function () {
	fs.readFile(distPath+'rev-manifest.json','utf-8',function(err,data){
		data = data.replace(/\.js/g,'');
		fs.writeFile(distPath+'rev-manifest.json',data,function(err){

		});
	});
});

gulp.task('revReplace',function(){
	var manifest = gulp.src(distPath+"rev-manifest.json");
	return gulp.src([distPath+"jqr.js"],{base:distPath})
			   .pipe(plugins["revReplace"]({manifest:manifest}))
			   .pipe(plugins.rev())
			   .pipe(gulp.dest(distPath));
});


 /***************** 生产环境 ********************/
 

gulp.task('build',['clean'],function(){
	runSequence('uglifyjs','concatcss','minifycss','md5-cssjs','dealrevjson','revReplace');
});

gulp.task('watch',function(){
	gulp.watch([srcPath+'stylesheets/*.css',"!"+srcPath+"**/all.css"],['concatcss']);
});