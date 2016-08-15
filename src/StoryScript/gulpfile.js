﻿var gulp = require("gulp"),
    cssmin = require("gulp-cssmin"),
    uglify = require("gulp-uglify"),
    ts = require('gulp-typescript'),
    merge = require('merge'),
    sourcemaps = require('gulp-sourcemaps'),
    project = require("./project.json"),
    del = require('del');

var paths = {
    webroot: "./" + project.webroot + "/",
    root: "./"
};

gulp.task('build-game-template', ['delete-files'], buildGame('_GameTemplate'));
gulp.task('build-my-new-game', ['delete-files'], buildGame('MyNewGame'));
gulp.task('build-dangerous-cave', ['delete-files'], buildGame('DangerousCave'));
gulp.task('build-quest-for-the-king', ['delete-files'], buildGame('QuestForTheKing'));
gulp.task('build-path-of-heroes', ['delete-files'], buildGame('PathOfHeroes'));
gulp.task('build-ridder-magnus', ['delete-files'], buildGame('RidderMagnus'));

gulp.task('delete-files', function () {
    del([paths.webroot + 'locations/**/*', paths.webroot + 'resources/**/*', paths.webroot + 'ui/**/*']);
});

function buildGame(nameSpace) {
    return function () {
        copyLibraries();
        copyResources(nameSpace);
        copyCss(nameSpace);
        copyHtml(nameSpace);
        compileTypeScript(nameSpace);
    }
}

function copyLibraries() {
    gulp.src([paths.root + 'Libraries/**/*.js'])
        .pipe(gulp.dest(paths.webroot + 'js/lib'));

    gulp.src([paths.root + 'Libraries/bootstrap/bootstrap.css'])
        .pipe(gulp.dest(paths.webroot + 'css/lib'));
}

function copyResources(nameSpace) {
    // Copy resources
    gulp.src([paths.root + 'Games/' + nameSpace + '/resources/**/*.*'])
        .pipe(gulp.dest(paths.webroot + 'resources'));
}

function copyCss(nameSpace) {
    // Copy css
    gulp.src([paths.root + 'StoryScript/ui/styles/*.css', paths.root + 'Games/' + nameSpace + '/ui/styles/*.css'])
        .pipe(gulp.dest(paths.webroot + 'css'));
}

function copyHtml(nameSpace) {
    // Copy html
    gulp.src([paths.root + 'StoryScript/**/*.html', paths.root + 'Games/' + nameSpace + '/**/*.html'])
      .pipe(gulp.dest(paths.webroot));
}

function compileTypeScript(nameSpace) {
    var tsResult = gulp.src([paths.root + 'StoryScript/Components/**/*.ts', paths.root + 'StoryScript/**/!(app)*.ts', paths.root + 'StoryScript/app.ts', paths.root + 'Games/' + nameSpace + '/**/*.ts', 'Types/**/*.ts'], { base: paths.webroot + 'js' })
                        .pipe(sourcemaps.init())
                        .pipe(ts({
                            target: "es5",
                            outFile: "game.js"
                        }));

    return merge([
        tsResult.js.pipe(sourcemaps.write('../maps')).pipe(gulp.dest(paths.webroot + 'js'))
    ]);
}