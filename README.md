# URL QR Code — Publii Plugin

A [Publii](https://getpublii.com/) plugin that generates QR codes from URLs using a simple `[qrcode]` shortcode in post and page content. The QR codes are rendered as inline SVGs — no external services, no JavaScript on the client side.

## Installation

1. Download `urlQrCode.zip` from the [latest release](../../releases/latest)
2. In Publii, open the menu (three dots, top-right) → **Plugins**
3. Click **Install Plugin** and select the downloaded ZIP file
4. Enable **URL QR Code** in the plugin list

## Usage

Place the shortcode anywhere in your post or page content:

```
[qrcode url="https://example.com"]
```

### Parameters

| Parameter     | Values                                                      | Default    | Description                           |
|---------------|-------------------------------------------------------------|------------|---------------------------------------|
| `url`         | Any URL                                                     | —          | **Required.** The URL to encode       |
| `layout`      | `only`, `left`, `right`                                     | `only`     | QR code position relative to URL text |
| `size`        | `64`, `128`, `192`, `256`, `384`                            | `192`      | Fixed size in pixels                  |
|               | `dot-2`, `dot-4`, `dot-6`, `dot-8`                         | —          | Dynamic: module size fixed, total varies |
| `url-display` | `as-is`, `short`, `long`                                    | `as-is`    | URL text formatting                   |
| `align`       | `top`, `center`, `bottom`                                   | `center`   | Vertical alignment of URL text        |

### Examples

```
[qrcode url="https://example.com"]

[qrcode url="https://example.com" layout="left" size="dot-4" url-display="short"]

[qrcode url="example.com" layout="right" size="256" url-display="long" align="top"]
```

### Layout Options

- **`only`** — QR code only, no URL text
- **`left`** — QR code left, URL text right
- **`right`** — URL text left, QR code right

### Size Options

**Fixed size:** The SVG is scaled to exactly this pixel size.

**Dynamic size (dot-N):** Each QR module is exactly N×N pixels. The total size depends on the URL length. Multiple QR codes with different URLs will have identical dot sizes.

### URL Display Options

- **`as-is`** — URL displayed exactly as entered
- **`short`** — `https://` and trailing `/` removed
- **`long`** — `https://` prepended if missing

## Plugin Settings

All shortcode parameters have configurable defaults in the Publii plugin settings:

- Default size, layout, URL display, and vertical alignment
- Optional custom QR code color (defaults to text color via `currentColor`)
- Quiet zone (white border around QR code)

## Third-Party Library

QR code generation is powered by **[qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)** by Kazuhiko Arase, a well-tested, dependency-free JavaScript QR code generator.

- **Author:** Kazuhiko Arase
- **License:** MIT
- **GitHub:** [kazuhikoarase/qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)
- **npm:** [qrcode-generator](https://www.npmjs.com/package/qrcode-generator)

## Author

**Stefan Schmidbauer** — built with assistance from [Claude](https://claude.ai) (Anthropic)

## License

MIT — see [LICENSE](LICENSE)

---

*QR Code is a registered trademark of [DENSO WAVE INCORPORATED](https://www.denso-wave.com/).*
