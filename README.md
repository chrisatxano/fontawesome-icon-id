# Font Awesome Icon ID

A Chrome extension that identifies Font Awesome icons on any webpage. Hover over an icon to see its name, or right-click to copy it to your clipboard.

## Features

- **Hover tooltip** — mouse over any Font Awesome icon to see its name
- **Click to copy** — click an icon while the tooltip is showing to copy the name
- **Right-click to copy** — right-click an icon and select "Copy Font Awesome Icon Name"
- Supports Font Awesome 4, 5, and 6
- Works with both CSS class-based icons (`<i class="fa-solid fa-house">`) and SVG+JS icons (`<svg data-icon="house">`)

## Install

1. Clone or download this repo
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** and select the project folder

## Usage

Once installed, navigate to any page with Font Awesome icons:

- **Hover** over an icon to see a tooltip with its name (e.g. `fa-chart-column`)
- **Click** the icon while the tooltip is visible to copy the name to your clipboard
- **Right-click** any icon and choose **"Copy Font Awesome Icon Name"** from the context menu to copy it

A green "Copied" confirmation will flash briefly when the name is copied.
