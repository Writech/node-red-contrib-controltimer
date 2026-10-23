// Node-RED settings for the local dev instance. Copied to .node-red/settings.js on every run.
module.exports = {
    uiPort: process.env.PORT || 1880,
    editorTheme: {
        // Provided by @node-red-contrib-themes/theme-collection, installed by reinstall-package.sh (v3.x, the last line compatible with Node-RED 3)
        theme: 'dark',
    },
};
