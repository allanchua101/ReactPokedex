"use strict";

const gulp = require("gulp");
const connect = require("gulp-connect"); // Run local server
const open = require("gulp-open"); // Open URL in a web browser
const browserify = require("browserify"); // Bundles JS
const sass = require("gulp-sass"); // Transform SASS files to CSS
const babelify = require("babelify"); // Transpile ES 6 to Common JS
const vinylStream = require("vinyl-source-stream"); // Use conventional text streams with Gulp
const lint = require("gulp-eslint"); // Lint JS files, including JSX

let config = { 
   port: 9005,
   devBaseUrl: "http://localhost",
   paths: {
       dataSources: "./src/**/*.json",
       images: "./src/**/*.png",
       html: "./src/*.html",
       js: "./src/**/*.jsx",
       sass: "./src/**/*.scss",
       appJSX: "./src/components/app.jsx",
       mainSass: "./src/styles/site.scss",
       dist: "./dist",
       favicon: "./src/favicon.ico"
   } 
};

const START_CONNECT_TASK = "boot:start-connect";
const BROWSE_APP_TASK = "boot:browse-app";
const COPY_SOURCE_TASK = "boot:copy-source";
const TRANSPILE_JSX_TASK = "boot:reactify-transpile-jsx";
const LINT_RAW_SCRIPTS_TASK = "boot:lint-raw-scripts";
const TRANSPILE_SASS_TASK = "boot:transpile-sass";
const WATCH_SOURCE_TASK = "boot:watch-source";


/**
 * Gulp task for running a local dev server 
 * with live reloading capability.
 */
gulp.task(START_CONNECT_TASK, function() {
    connect.server({
        root: "dist",
        port: config.port,
        base: config.devBaseUrl,
        livereload: true
    });
});

/**
 * Gulp task for opening the app after the 
 * web server started.
 */
gulp.task(BROWSE_APP_TASK, [START_CONNECT_TASK], function() {
    gulp.src("dist/index.html")
                .pipe(open({
                    uri: (config.devBaseUrl + ":" + config.port + "/")
                }));
});

/**
 * Gulp task for copying task source files
 * to distribution folder.
 */
gulp.task(COPY_SOURCE_TASK, function() {
    gulp.src([
            config.paths.html,
            config.paths.images,
            config.paths.dataSources,
            config.paths.favicon
        ])
        .pipe(gulp.dest(config.paths.dist))
        .pipe(connect.reload());
});

/**
 * Gulp for streamlining JSX files:
 *  - Transforms JSX files to JS
 *  - Bundle JS files
 *  - Use Vinyl Stream to name the bundle
 *  - Use gulp to transfer the bundle to distribution scripts
 *  - Reload connect server
 */
gulp.task(TRANSPILE_JSX_TASK, function() {
    browserify(config.paths.appJSX)
        .transform(babelify, {presets: ["es2015", "react"]})
        .bundle()
        .on("error", console.error.bind(console))
        .pipe(vinylStream("main.min.js"))
        .pipe(gulp.dest(config.paths.dist + "/scripts"))
        .pipe(connect.reload());
});

gulp.task(TRANSPILE_SASS_TASK, function () {
    return gulp.src(config.paths.mainSass)
               .pipe(sass().on('error', sass.logError))
               .pipe(gulp.dest(config.paths.dist + "/styles"))
               .pipe(connect.reload());
  });

/**
 * Gulp task for linting JS and JSX files
 */
gulp.task(LINT_RAW_SCRIPTS_TASK, function () {
    return gulp.src(config.paths.js)
               .pipe(lint({ config: 'eslint.config.json' }))
               .pipe(lint.format())
               .pipe(lint.failOnError());
});

/**
 * Gulp task for watching changes.
 */
gulp.task(WATCH_SOURCE_TASK, function() {
    gulp.watch(config.paths.html, [COPY_SOURCE_TASK]);
    gulp.watch(config.paths.js, [
        LINT_RAW_SCRIPTS_TASK,
        TRANSPILE_JSX_TASK,
        COPY_SOURCE_TASK
    ]);
    gulp.watch(config.paths.sass, [
        TRANSPILE_SASS_TASK, 
        COPY_SOURCE_TASK
    ]);
});

gulp.task("default", [
    COPY_SOURCE_TASK, 
    TRANSPILE_JSX_TASK, 
    TRANSPILE_SASS_TASK,
    LINT_RAW_SCRIPTS_TASK,
    WATCH_SOURCE_TASK, 
    BROWSE_APP_TASK
]);