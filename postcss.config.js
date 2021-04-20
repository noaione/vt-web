const isProd = process.env.NODE_ENV === "production";

module.exports = {
    plugins: {
        "postcss-import": {},
        tailwindcss: {},
        autoprefixer: {},
        cssnano: isProd ? {} : false,
    },
};
