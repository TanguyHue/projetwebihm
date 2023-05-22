'use strict';

/* eslint-env node */

const cssvalidate = require('gulp-w3c-css');
const htmlvalidate = require('gulp-html');
const bs = require('browser-sync').create();

// const path = require('path');
const gulp = require('gulp');
const colors = require('ansi-colors');
const map = require('map-stream');

const cssSrcPath = '*.css';
const htmlSrcPath = '*.html';

gulp.task('validatecss', function (done) {
    bs.reload();
    gulp.src(cssSrcPath)
        .pipe(cssvalidate())
        .pipe(map(function (file, done) {
            console.log('============== CSS ==================');
            if (file.contents.length === 0) {
                console.log('Success: ' + file.path);
                console.log(colors.green('No errors or warnings\n'));
            }
            else {
                const results = JSON.parse(file.contents.toString());
                results.errors.forEach(function (error) {
                    console.log('Error: ' + file.path + ': line ' + error.line);
                    console.log(colors.red(error.message) + '\n');
                });
                results.warnings.forEach(function (warning) {
                    console.log('Warning: ' + file.path + ': line ' + warning.line);
                    console.log(colors.yellow(warning.message) + '\n');
                });
                console.log(results.errors.length + ' error - ' + results.warnings.length + ' warnings\n');
            }
            done(null, file);
        }));
    done();
});

gulp.task('validatehtml', function (done) {
    let status = true;
    bs.reload();
    gulp.src(htmlSrcPath)
        .pipe(htmlvalidate({'Werror':true}))
        .on('error', function (error){
            status = false;
            console.log('============== HTML ==================');
            let nbErrors = 0;
            let nbWarnings = 0;
            let lines = error.message.split('\n');
            lines.forEach(function (line) {
                let parts=line.split(':');
                if( parts.length >= 4){
                    if( parts[3].trim() === 'error' ){
                        console.log(colors.red(line));
                        nbErrors++;
                    }
                    else if ( parts[3].trim() === 'info warning' )
                    {
                        console.log(colors.yellow(line));
                        nbWarnings++
                    }
                    else
                        console.log(line);
                }
            });
            console.log(nbErrors + ' error - ' + nbWarnings + ' warnings\n');
        })
        .on('end', function(message) {
            if (status === true) {
                console.log(colors.green('No errors or warnings\n'));
            }
        })
        .pipe(map(function (file, done) {
            console.log('============== HTML ==================');
            done(null, file);
        }));
    done();
});

gulp.task('browser-sync', function (done) {
    bs.init({
        server: {
            baseDir: './',
        },
    });
    done();
});

gulp.task('watch', function (done) {
    gulp.watch(htmlSrcPath).on('change', gulp.series('validatehtml'));
    gulp.watch(cssSrcPath).on('change', gulp.series('validatecss'));
    done();

});

gulp.task('validate', gulp.series('validatehtml', 'validatecss'));

// The default task (called when you run `gulp` from cli)
gulp.task('default', gulp.series('validate', 'watch', 'browser-sync'));

