# Image Renaming Strategy for Pictograms

This document outlines the strategy and process used to rename the PNG pictogram files within this directory. The goal was to enhance file identifiability, improve web usability, and ensure uniqueness.

## 1. Initial State

Originally, 8 PNG files were present, each containing a 2x2 grid of four distinct images. File names were long and descriptive (e.g., `ChatGPT Image 2025年12月16日 14_31_13.png`), making them unsuitable for direct web use and programmatic identification.

## 2. Step 1: Image Splitting

Each original 2x2 grid image was split into four individual PNG files.
*   **Action:** Each of the 8 original PNGs was decomposed into 4 separate images (top-left, top-right, bottom-left, bottom-right).
*   **Result:** 8 files became 32 distinct image files.
*   **Tools:** Python with the Pillow library.
*   **Naming Convention (Temporary):** Original filename appended with `_tl`, `_tr`, `_bl`, `_br` (e.g., `ChatGPT Image ..._bl.png`).

## 3. Step 2: Initial Renaming (Size & Dominant Hex Color)

To provide a more concise and machine-readable name, the files were renamed to reflect their dimensions and primary color.
*   **Action:** Each of the 32 files was renamed.
*   **Strategy:**
    *   Image dimensions (e.g., `512x512`) were extracted.
    *   The average (dominant) color of each image was calculated.
    *   This dominant color was represented by its hexadecimal code (e.g., `#a1b2c3`).
    *   A unique index was assigned to each file to prevent collisions.
*   **Result:** Files adopted the format `[width]x[height]-[HEXCODE]-[index].png` (e.g., `512x512-a1b2c3-1.png`).
*   **Tools:** Python with the Pillow library.

## 4. Step 3: Accent Color Addition (CSS Color Names & Hue Distance)

To further enhance human readability and distinctiveness, especially for similar-looking images, an accent color was incorporated into the filenames.
*   **Action:** Files were renamed again to include a human-readable CSS color name for the dominant color and a secondary accent color.
*   **Strategy:**
    *   The dominant color's hexadecimal code was converted to its closest matching CSS color name.
    *   To find the accent color, the script identified the most "visually distant" color from the dominant color based on the hue (color type) in the HSV color space. Up to 5 dominant colors were sampled from the image.
    *   The closest matching CSS color name for this distant color was used as the accent color.
    *   **Exception for 'bisque' and 'peachpuff'**: Due to the very limited color diversity in images primarily composed of 'bisque' or 'peachpuff' tones, an effective visually distant accent color could not be reliably determined programmatically. For these files, the accent color was omitted, and they retained the basic `[width]x[height]-[MAINCOLOR]-[index].png` format.
*   **Result:** Files generally adopted the format `[width]x[height]-[MAINCOLOR]-[ACCENTCOLOR]-[index].png` (e.g., `512x512-sienna-darkslategray-2.png`).
*   **Tools:** Python with the Pillow and `colorsys` libraries.

## 5. Step 4: Duplicate Resolution

During the renaming process, it was identified that some images (despite having different original indices) were exact duplicates.
*   **Action:** Duplicate images were identified and removed, retaining only one instance per unique image content.
*   **Strategy:** File hashes (SHA256) were used to detect binary-identical images.
*   **Result:** The total number of unique image files was reduced from 32 to 28.
*   **Tools:** Python with the `hashlib` library.

## Summary of Final Naming Convention:

`[width]x[height]-[DOMINANT_CSS_COLOR_NAME]-[ACCENT_CSS_COLOR_NAME]-[index].png`
*(Exception: For 'bisque' and 'peachpuff', ACCENT_CSS_COLOR_NAME is omitted).*
