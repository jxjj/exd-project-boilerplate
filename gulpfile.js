/*global -$ */
'use strict';
// generated on 2015-06-06 using generator-gulp-webapp 0.3.0
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var karma = require('karma').server;
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var babelify = require('babelify');
//var watchify = require('watchify'); // for faster browserify builds
var assign = require('lodash.assign');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var deploy = require('./.deploy.json'); // deploy specific secrets
var rsync = require('rsyncwrapper').rsync;


// STYLES
////////////////////////////////////////
gulp.task('styles', function () {
  return gulp.src('app/styles/main.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      outputStyle: 'nested', // libsass doesn't support expanded yet
      precision: 10,
      includePaths: ['.'],
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($.postcss([
      require('autoprefixer-core')({browsers: ['last 1 version']})
    ]))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});


// IMAGE COMPRESSION
//////////////////////////////////////
gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest('dist/images'));
});


// FONTS
///////////////////////////////////////
gulp.task('fonts', function () {
  return gulp.src(require('main-bower-files')({
    filter: '**/*.{eot,svg,ttf,woff,woff2}'
  }).concat('app/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});


// WATCH
////////////////////////////////////////
gulp.task('serve', ['styles', 'fonts', 'browserify'], function () {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components',
        '/test': 'test'
      }
    }
  });

  // watch for changes
  gulp.watch([
    'app/*.html',
    'app/images/**/*',
    '.tmp/fonts/**/*',
  ]).on('change', reload);

  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('app/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
  gulp.watch('app/scripts/**/*.js', ['jshint','browserify']);
});

// make sure browserify completes before reloading
// gulp.task('js-watch', ['browserify'], browserSync.reload);

// WIRE DEPENDENCIES (BOWER)
// (unnecessary with browserify?)
/////////////////////////////////////
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});


// JSHINT
///////////////////////////////////////
gulp.task('jshint', function () {
  return gulp.src('app/scripts/**/*.js')
    //.pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

// TDD with KARMA
///////////////////////////////
gulp.task('tdd', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js'
  }, done);
});

// BROWSERIFY
/////////////////////////////////
gulp.task('browserify', function(){
  return browserify({
      entries: ['./app/scripts/main.js'],
      debug: true
    })
    .transform(babelify)
    .bundle()
    .on("error", function (err) { console.log("Error : " + err.message); })
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true}));
});


// HTML
///////////////////////////////
gulp.task('html', ['styles'], function () {
  var assets = $.useref.assets({searchPath: ['.tmp', 'app', '.']});

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

// EXTRAS
////////////////////////////////////////
gulp.task('extras', function () {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

// CLEAN
////////////////////////////////////////
gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

// BUILD:STYLES-SCRIPTS (move .tmp to dist on build)
////////////////////////////////////////////////////
gulp.task('build:styles-scripts', ['styles','browserify'], function(){
  return gulp.src('.tmp/**/*')
          .pipe(gulp.dest('dist'));
});


// BUILD
//////////////////////////////////////////////
gulp.task('build', ['jshint', 'build:styles-scripts','html', 'images', 'fonts', 'extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});


// DEPLOY
//////////////////////////////////////////////
gulp.task('deploy', function() {
  return rsync({
    ssh: true,
    src: './dist/',
    dest: deploy.servers.dev.rsyncDest,
    recursive: true,
    syncDest: true,
    args: ['--verbose'],
  }, function(error, stdout, stderr, cmd) {
      console.log(stdout);
      console.log(stderr);
      if (error) {
        console.log(error.message);
      }
  });
});


// DEFAULT: Build
/////////////////////////////////////////////
gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
