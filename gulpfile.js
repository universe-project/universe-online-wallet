/**
 * Gulp file for the Universe Online Wallet.
 * This file is part of Universe Online Wallet project.
 *
 * Iridium Framework is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Universe Online Wallet is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Universe Online Wallet. If not, see <http://www.gnu.org/licenses/>.
 *
 * @author rayleigh <rayleigh@protonmail.com>
 * @copyright 2019 Vladislav Pashaiev
 * @license LGPL-3.0+
 */

const gulp        = require('gulp'),
	  include     = require('gulp-include'),
	  rename      = require('gulp-rename'),
	  concat      = require('gulp-concat'),
	  cleanCSS    = require('gulp-clean-css'),
	  sass        = require('gulp-sass'),
	  uglify      = require('gulp-uglify'),
	  del         = require('del'),
	  path        = require('path');

const paths = {
	src: 'src',
	build: 'public',
	css: 'css',
	scss: 'scss',
	js: 'js'
};

const clean = () => del([path.join(paths.build, paths.js), path.join(paths.build, paths.css)]);
clean.description = 'Cleans the build directories.';

const buildJS = () => {
	return gulp.src(path.join(paths.src, paths.js, 'main.js'))
		.pipe(include())
		.pipe(uglify())
		.pipe(concat('script.js'))
		.pipe(gulp.dest(path.join(paths.build, paths.js)));
};

const buildSCSS = () => {
	return gulp.src(path.join(paths.src, paths.scss, 'main.scss'))
		.pipe(sass.sync().on('error', sass.logError))
		.pipe(cleanCSS())
		.pipe(rename('styles.css'))
		.pipe(gulp.dest(path.join(paths.build, paths.css)));
};

const build = gulp.series(clean, gulp.parallel(buildJS, buildSCSS));
build.description = 'Build the project.';

module.exports = {
	clean: clean,
	build: build
};