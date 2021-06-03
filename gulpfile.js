var gulp = require("gulp");
var browserify = require("browserify");
var watchify = require("watchify");
var reactify = require("reactify");
var source = require("vinyl-source-stream");
var browserSync = require("browser-sync").create();
var run = require("gulp-run");
var spawn = require('child_process').spawn,node;

const {series} = require("gulp")
const {parallel} = require("gulp")


function bundle1 () {
    console.log('running browserify')
    return browserify({
        entries: "./app/main.jsx",
        debug: true
    }).transform(reactify)
        .bundle()
        .pipe(source("main.js"))
        .pipe(gulp.dest("app/dist"))
}

gulp.task("bundle", series(function () {
    console.log('running browserify')
    return browserify({
        entries: "./app/main.jsx",
        debug: true
    }).transform(reactify)
        .bundle()
        .pipe(source("main.js"))
        .pipe(gulp.dest("app/dist"))
}));

gulp.task("copy",series("bundle", function () {
    console.log('copy')
    return gulp.src(["app/index.html"])
        .pipe(gulp.dest("app/dist"));
}));



gulp.task("watch",series(
    function(){
        console.log('watch')
    var watcher = gulp.watch(['./app/components/*','./app/public/*','./app/*','./server/**/*','./server/*','./scripts/*'],gulp.series("refresh"));
    watcher.on("change",function(event){
        //browserSync.reload();
        console.log(event)
        //console.log("file "+event.path+" was "+event.type+",running tasks...");
    });
    
}));

gulp.task("server",series(
    function(done)
{
    console.log('server')
    if (node) node.kill()
  node = spawn('node', ['start.js'], {stdio: 'inherit'})
  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
  return done();
}))//);

gulp.task("browser-sync",series("copy","server",parallel("watch",function()
{
    console.log('browserSync')
    browserSync.init({
        proxy: 'localhost:7777',
        port: 5000
    });
})));

gulp.task("default",series("browser-sync",function(){
   console.log("Gulp completed..."); 
}));

gulp.task("refresh",series("copy","server",browserSync.reload,"watch",function(){
    console.log('refresh')
}));
