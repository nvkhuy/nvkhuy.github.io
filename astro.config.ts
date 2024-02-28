import {defineConfig} from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import {mermaid} from "./src/plugins/mermaid"
import {SITE} from "./src/config";

// https://astro.build/config
export default defineConfig({
    site: SITE.website,
    integrations: [
        tailwind({
            applyBaseStyles: false,
        }),
        react(),
        sitemap(),
    ],
    markdown: {
        remarkPlugins: [
            remarkToc,
            [
                remarkCollapse,
                {
                    test: "Table of contents",
                },
            ],
            mermaid
        ],
        shikiConfig: {
            // Choose from Shiki's built-in themes (or add your own)
            // https://github.com/shikijs/shiki/blob/main/docs/themes.md
            experimentalThemes: {
                light: 'material-theme-ocean',
                dark: 'material-theme-ocean',
            },
            wrap: true,
        },
    },
    vite: {
        ssr: {
            external: ["svgo"],
        },
        optimizeDeps: {
            exclude: ["@resvg/resvg-js"],
        },
    },
    scopedStyleStrategy: "where",
});
