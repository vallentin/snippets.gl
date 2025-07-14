const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const terser = require("gulp-terser");
const htmlmin = require("gulp-htmlmin");
const pug = require("gulp-pug");
const data = require("gulp-data");
const browserSync = require("browser-sync").create();
const del = require("del").deleteAsync;

const BASE_URL = "https://snippets.gl";

const globPug = "www/**/*.pug";

const paths = {
    scss: "www/css/**/*.scss",
    js: "www/js/**/*.js",
    html: "www/**/*.html",
    pug: [globPug, "!www/**/_*.pug", "!www/{views,partials}/**"],
    out: "static",
};

function css() {
    return gulp
        .src(paths.scss)
        .pipe(
            sass({
                style: "compressed",
            }).on("error", sass.logError)
        )
        .pipe(gulp.dest(`${paths.out}/css`))
        .pipe(browserSync.stream());
}

function js() {
    return gulp
        .src(paths.js)
        .pipe(terser())
        .pipe(gulp.dest(`${paths.out}/js`))
        .pipe(browserSync.stream());
}

function html() {
    return gulp
        .src(paths.html)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(paths.out))
        .pipe(browserSync.stream());
}

function render() {
    return gulp
        .src(paths.pug)
        .pipe(
            data((file) => {
                const relPath = file.relative
                    .replace(/\\/g, "/") // Normalize path separators (Windows)
                    .replace(/\.pug$/, "")
                    .replace(/index$/, "");
                const url = relPath.length > 0 ? `${BASE_URL}/${relPath}` : BASE_URL;

                return {
                    url,
                };
            })
        )
        .pipe(pug())
        .pipe(gulp.dest(paths.out))
        .pipe(browserSync.stream());
}

function serve() {
    // Warning: This also checks gulp args
    const open = !process.argv.slice(2).includes("--no-open");

    browserSync.init({
        server: {
            baseDir: paths.out,
            middleware: [
                function (req, _res, next) {
                    const hasExt = /\.\w+$/.test(req.url);
                    if (!hasExt && !req.url.endsWith("/")) {
                        req.url += ".html";
                    }

                    next();
                },
            ],
        },
        open,
    });

    gulp.watch(paths.scss, css);
    gulp.watch(paths.js, js);
    gulp.watch(paths.html, html);
    gulp.watch(globPug, render);
}

function clean() {
    return del([paths.out]);
}

// TODO: Add `js` when any js file is added
const build = gulp.parallel(css, html, render);

exports.css = css;
exports.js = js;
exports.html = html;
exports.pug = render;
exports.build = build;
exports.rebuild = gulp.series(clean, build);
exports.serve = gulp.series(build, serve);
exports.clean = clean;
exports.default = exports.serve;
