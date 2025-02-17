Every extension must have a manifest.json file in its root directory that lists important information about the structure and behavior of that extension

The icon must not be a svg

The extension when tested for development is loaded by directory. Manually refreshed when we want to see changes.

- [ ] TODO icons optional during development, but required in Chrome Web Store.

Icon size Icon use
16x16 Favicon on the extension's pages and context menu.
32x32 Windows computers often require this size.
48x48 Displays on the Extensions page.
128x128 Displays on installation and in the Chrome Web Store.

content scripts: isolated scripts that read and modify the content of a page.
