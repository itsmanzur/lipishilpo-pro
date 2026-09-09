# Lipishilpo Pro (লিপিশিল্প প্রো) — Book Get-Up Studio, AI Editorial & Export

**Lipishilpo Pro** is the premium companion add-on for the [Lipishilpo](https://github.com/itsmanzur/lipishilpo) WordPress plugin. It adds a **Book Get-Up Studio** (live preview, cover wrap, barcode, layout checklist), **universal AI editorial** (OpenAI, Gemini, Claude, OpenRouter, or a custom endpoint), **browser text-to-speech** proofreading, and **PDF / EPUB 3.0 / Word (.docx)** export.

Without a license the studio stays open as a **demo**: preview fonts, cover art, and layout. PDF, DOCX, EPUB, and cover downloads stay locked.

---

## Pro features (what actually ships)

### 1. Book Get-Up Studio
- **Trim sizes:** Banglabazar Demy 1/8, Royal, pocket Demy 1/16, A5, US Trade 6×9, Digest, B5, A4, and custom millimetres.
- **Typography:** Body fonts that preview **and** embed in PDF/EPUB: **Noto Serif Bengali**, **Hind Siliguri**, **Tiro Bangla**. Kalpurush / SolaimanLipi are not offered until those files ship.
- **Pages:** Running headers, page-number position and style (Bengali or Western digits: plain, dash, bracket, motif, circle). Front-matter skip. Five TOC presets (dotted, modern, ornamented, summary, minimal). Drop caps and scene-break motifs.
- **Cover & spine:** Front/back **image upload**, colour fallback, optional title overlay, paperback spine estimate from page count and **70 / 80 / 100 GSM**, full wrap preview, vector **EAN-13** barcode and price tag.
- **Layout checklist (not a press preflight scan):** Gutter, line-height, crop-mark toggle, TOC, ISBN/publisher, unclosed `:::box`, cover-art reminder. Score is a checklist percentage — it is **not** bleed/overflow/imposition inspection and is never labelled “Press Ready 100%”.
- **Export:** Interior PDF (optional crop marks), cover wrap PDF, EPUB 3.0, layout Word. Kindle/tablet/mobile are **preview modes**, not separate MOBI files.

### 2. Live preview
Two-page spread, wrap, and a simple 3D mockup. Optional trim/safe-zone overlay. Device frames are simulations.

### 3. AI editorial & audio
- **Universal AI:** The provider saved in Settings (OpenAI, Gemini, Claude, OpenRouter, or custom). Proofread, chapter arc, whole-book continuity. Keys stay on the server.
- **Audio proofreader:** Browser **Web Speech API** — voice picker, 0.75×–2.0×, sentence highlight. Not neural cloud TTS.

---

## Requirements
- **WordPress:** 6.0 or higher.
- **Parent plugin:** [Lipishilpo (Free)](https://github.com/itsmanzur/lipishilpo) installed and active.
- **PHP:** 7.4 or higher.

---

## Installation

1. Upload `lipishilpo-pro` to `/wp-content/plugins/`.
2. Activate **Lipishilpo Pro** after the free plugin.
3. In **Lipishilpo > Settings**, save a Pro license key (any non-empty key currently unlocks Pro) and, if you use AI, an API key for the chosen provider.
4. Open the editor → Book Studio. Unlicensed users can demo the studio; export buttons stay locked.

---

## License
GPLv2 or later.
