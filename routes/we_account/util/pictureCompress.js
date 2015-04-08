/**
 * Created by Administrator on 15-1-15.
 */

//var smushit = require("node-smushit");
//var Imagemin = require('imagemin');
//var rename = require("gulp-rename");

//
////smushit.smushit('./test_1.jpg');
//
//var imagemin = new Imagemin()
//    .src('./big_1.jpg')
//    .use(rename('./big_1.png'));
//var imagemin = new Imagemin()
//    .src('./big_1.jpg')
//    .dest('./public')
//    .use(Imagemin.pngquant());

//imagemin.run(function (err, files) {
//    if (err) {
//        throw err;
//    }
//
//    console.log(files);
//    console.log(files[0]);
//    // => { contents: <Buffer 89 50 4e ...> }
//});


//var fs = require('fs');
//var imagemin = require('image-min');
//var path = require('path');
//
//var src = fs.createReadStream('big_1.jpg');
//var ext = path.extname(src.path);
//
//src
//    .pipe(imagemin({ ext: ext }))
//    .pipe(fs.createWriteStream('big_1-minified' + ext));


var gulp = require('gulp');
var imagemin = require('gulp-imagemin');

var paths = {
    scripts: ['client/js/**/*.coffee', '!client/external/**/*.coffee'],
    images: './big_1.jpg'
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use all packages available on npm
gulp.task('clean', function(cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
//    del(['build'], cb);
});

gulp.task('scripts', ['clean'], function() {
    // Minify and copy all JavaScript (except vendor scripts)
    // with sourcemaps all the way down
//    return gulp.src(paths.scripts)
//        .pipe(sourcemaps.init())
//        .pipe(coffee())
//        .pipe(uglify())
//        .pipe(concat('all.min.js'))
//        .pipe(sourcemaps.write())
//        .pipe(gulp.dest('build/js'));
});

// Copy all static images
gulp.task('images', ['clean'], function() {
    return gulp.src(paths.images)
        // Pass in options to the task
        .pipe(imagemin({optimizationLevel: 5}))
        .pipe(gulp.dest('./public'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['scripts']);
    gulp.watch(paths.images, ['images']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', [ 'images']);