'use strict';

const qrcode = require('./qrcode-lib.js');

// Match [qrcode ...] even when the renderer has auto-linked URLs inside it.
// The literal ] won't match URL-encoded %5D, so this still finds the right closing bracket.
// Optionally consume a trailing </a> that wraps the shortcode.
const SHORTCODE_REGEX = /\[qrcode\s[\s\S]*?\](?:<\/a>)?/g;

const VALID_SIZES = ['64', '128', '192', '256', '384', 'dot-2', 'dot-4', 'dot-6', 'dot-8'];
const VALID_LAYOUTS = ['only', 'left', 'right'];
const VALID_URL_DISPLAYS = ['as-is', 'short', 'long'];
const VALID_ALIGNS = ['top', 'center', 'bottom'];
const ALIGN_CSS = { top: 'flex-start', center: 'center', bottom: 'flex-end' };

class urlQrCode {
    constructor(API, name, config) {
        this.API = API;
        this.name = name;
        this.config = config;
    }

    addInsertions() {
        this.API.addInsertion('publiiHead', this.getCSS, 1, this);
    }

    addModifiers() {
        this.API.addModifier('htmlOutput', this.replaceShortcodes, 1, this);
    }

    getCSS(renderer) {
        let color = this.config.useCustomColor ? (this.config.foregroundColor || '#000000') : 'currentColor';
        return `<style>
.qrcode-container{display:inline-flex;gap:1rem;margin:.5rem 0}
.qrcode-only{display:inline-block}
.qrcode-svg{flex-shrink:0}
.qrcode-svg rect{fill:${color}}
.qrcode-url{word-break:break-all}
</style>`;
    }

    replaceShortcodes(rendererInstance, text) {
        return text.replace(SHORTCODE_REGEX, (match) => {
            let clean = this.stripHTML(match);
            let params = this.parseParams(clean);
            if (!params.url) return match;
            return this.renderQRCode(params);
        });
    }

    stripHTML(str) {
        // Remove HTML tags
        let result = str.replace(/<[^>]+>/g, '');
        // Decode common HTML entities
        result = result.replace(/&quot;/g, '"');
        result = result.replace(/&#34;/g, '"');
        result = result.replace(/&amp;/g, '&');
        result = result.replace(/&lt;/g, '<');
        result = result.replace(/&gt;/g, '>');
        // Normalize smart quotes (from marked smartypants) to ASCII
        result = result.replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"');
        result = result.replace(/[\u2018\u2019\u201A\u201B]/g, "'");
        // Decode URL-encoded characters that may appear
        try {
            result = decodeURIComponent(result);
        } catch (e) {
            // ignore decode errors
        }
        return result;
    }

    parseParams(str) {
        let params = {};
        let m;
        let regex = /([\w][\w-]*)="([^"]*?)"/g;
        while ((m = regex.exec(str)) !== null) {
            params[m[1]] = m[2];
        }
        return {
            url: params.url || '',
            layout: VALID_LAYOUTS.includes(params.layout) ? params.layout : (this.config.defaultLayout || 'only'),
            size: VALID_SIZES.includes(params.size) ? params.size : (this.config.defaultSize || '192'),
            urlDisplay: VALID_URL_DISPLAYS.includes(params['url-display']) ? params['url-display'] : (this.config.defaultUrlDisplay || 'as-is'),
            align: VALID_ALIGNS.includes(params.align) ? params.align : (this.config.defaultAlign || 'center')
        };
    }

    renderQRCode(params) {
        let url = params.url;
        let quietZone = parseInt(this.config.quietZone) || 1;

        // Ensure URL has protocol for href
        let href = url;
        if (!/^https?:\/\//i.test(href)) {
            href = 'https://' + href;
        }

        // Generate QR code (always encode the full href with protocol)
        let qr;
        try {
            qr = qrcode(0, 'M'); // 0 = auto version, M = medium EC
            qr.addData(href);
            qr.make();
        } catch (e) {
            return `<!-- QR Code Error: ${e.message} -->`;
        }

        let svg = this.qrToSVG(qr, params.size, quietZone);
        let displayUrl = this.formatURL(url, params.urlDisplay);

        if (params.layout === 'only') {
            return `<div class="qrcode-container qrcode-only">${svg}</div>`;
        }

        let alignStyle = `align-items:${ALIGN_CSS[params.align] || 'center'}`;
        let link = `<a class="qrcode-url" href="${this.escapeHtml(href)}">${this.escapeHtml(displayUrl)}</a>`;

        if (params.layout === 'left') {
            return `<div class="qrcode-container qrcode-left" style="${alignStyle}">${svg}${link}</div>`;
        }

        // layout === 'right'
        return `<div class="qrcode-container qrcode-right" style="${alignStyle}">${link}${svg}</div>`;
    }

    qrToSVG(qr, sizeParam, quietZone) {
        let moduleCount = qr.getModuleCount();
        let totalModules = moduleCount + quietZone * 2;
        let pixelSize;

        if (sizeParam.startsWith('dot-')) {
            let dotSize = parseInt(sizeParam.split('-')[1]);
            pixelSize = totalModules * dotSize;
        } else {
            pixelSize = parseInt(sizeParam);
        }

        let rects = '';
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (qr.isDark(row, col)) {
                    rects += `<rect x="${col + quietZone}" y="${row + quietZone}" width="1" height="1"/>`;
                }
            }
        }

        return `<svg class="qrcode-svg" xmlns="http://www.w3.org/2000/svg" ` +
               `width="${pixelSize}" height="${pixelSize}" ` +
               `viewBox="0 0 ${totalModules} ${totalModules}">${rects}</svg>`;
    }

    formatURL(url, display) {
        if (display === 'short') {
            return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
        }
        if (display === 'long') {
            if (!/^https?:\/\//i.test(url)) {
                return 'https://' + url;
            }
            return url;
        }
        // as-is
        return url;
    }

    escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
}

module.exports = urlQrCode;
