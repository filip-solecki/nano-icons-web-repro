import type {NextConfig} from "next";

// Typical Next.js wiring for react-native-nano-icons on the web. VARIANT selects
// how `__DEV__` is provided:
//   baseline   - nothing defines it
//   define-dev - DefinePlugin({__DEV__: dev})
//   no-rn      - like define-dev, without the react-native -> react-native-web alias
const variant = process.env.VARIANT ?? "baseline";

const nextConfig: NextConfig = {
    transpilePackages: ["react-native-web"],
    webpack(config, {dev, webpack}) {
        if (variant !== "no-rn") {
            config.resolve.alias = {
                ...config.resolve.alias,
                "react-native$": "react-native-web",
            };
        }

        // Without `.web.*` first webpack resolves the native renderer, which needs
        // TurboModuleRegistry and breaks the build.
        config.resolve.extensions = [
            ".web.ts",
            ".web.tsx",
            ".web.js",
            ...config.resolve.extensions,
        ];

        // Next has no loader for fonts; the Icon imports the .ttf as a URL.
        config.module.rules.push({test: /\.ttf$/, type: "asset/resource"});

        if (variant === "define-dev" || variant === "no-rn") {
            config.plugins.push(new webpack.DefinePlugin({__DEV__: dev}));
        }

        return config;
    },
};

export default nextConfig;
