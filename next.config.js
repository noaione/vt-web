const { ESBuildMinifyPlugin } = require("esbuild-loader");

function useESBuildMinify(config, options) {
    const terserIndex = config.optimization.minimizer.findIndex(
        (minimizer) => minimizer.constructor.name === "TerserPlugin"
    );
    if (terserIndex > -1) {
        config.optimization.minimizer.splice(terserIndex, 1, new ESBuildMinifyPlugin(options));
    }
}

function useESBuildLoader(config, options) {
    const tsLoader = config.module.rules.find((rule) => rule.test && rule.test.test(".ts"));
    if (tsLoader && tsLoader.use && tsLoader.use.loader) {
        tsLoader.use.loader = "esbuild-loader";
        tsLoader.use.options = options;
    }
    const jsLoader = config.module.rules.find((rule) => rule.test && rule.test.test(".js"));
    if (jsLoader && jsLoader.use && jsLoader.use.loader) {
        jsLoader.use.loader = "esbuild-loader";
        if (Object.keys(options).length > 0) {
            // eslint-disable-next-line dot-notation
            options["loader"] = "jsx";
        }
        jsLoader.use.options = options;
    }
}

module.exports = {
    future: {
        webpack5: true,
    },
    productionBrowserSourceMaps: true,
    webpack: (config, { dev, isServer, webpack }) => {
        config.plugins.push(
            new webpack.ProvidePlugin({
                React: "react",
            })
        );

        if (!isServer && !dev) {
            Object.assign(config.resolve.alias, {
                react: "preact/compat",
                "react-dom/test-utils": "preact/test-utils",
                "react-dom": "preact/compat",
                "react-ssr-prepass": "preact-ssr-prepass",
            });
        }

        const prependToEntry = isServer ? "pages/_document" : "main.js";
        const preactDebug = dev ? ["preact/debug"] : ["preact/devtools"];

        const entry = config.entry;
        config.entry = () => {
            return entry().then((entries) => {
                entries[prependToEntry] = preactDebug.concat(entries[prependToEntry] || []);
                return entries;
            });
        };

        useESBuildMinify(config);
        useESBuildLoader(config, {
            loader: "tsx",
            target: "es2015",
        });

        return config;
    },
};
