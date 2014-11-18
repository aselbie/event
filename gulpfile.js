// include the required packages.
var gulp = require('gulp');
var stylus = require('gulp-stylus');
var sourcemaps = require('gulp-sourcemaps');
var nodemon = require('gulp-nodemon');

// Get one .styl file and render
gulp.task('stylus', function () {
  gulp.src('./client/stylus/main.styl')
    .pipe(stylus({
      compress: true,
      sourcemap: {
        inline: true,
        sourceRoot: '.',
        basePath: './public/css'
      }
    }))
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(sourcemaps.write('.', {
      includeContent: false,
      sourceRoot: '.'
    }))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('dev-server', function () {
  nodemon({
      script: 'server/start.js',
      ext: 'html js styl',
      env: { 'NODE_ENV': 'development' }
    })
    .on('change', ['stylus'])
})

gulp.task('default', ['dev-server']);