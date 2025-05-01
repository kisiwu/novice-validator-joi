/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
    entryPoints: ['src'],
    out: 'docs',
    excludeInternal: true,
    excludePrivate: true,
    includeVersion: true,
    hideGenerator: true
};

export default config;