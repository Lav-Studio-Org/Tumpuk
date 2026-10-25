# Tumpuk — Web Build

This folder contains the web assets extracted from the Android APK's bundled `assets/www/` directory.

## Run locally

Serve this folder over HTTP (ES modules and game assets should not be opened directly with `file://`):

```bash
python -m http.server 8000
```

Then open <http://localhost:8000/>.

## Publish with GitHub Pages

1. Create a repository named `Tumpuk`.
2. Upload the contents of this folder to the repository root (so `index.html` is at the root).
3. In **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/(root)`, then save.
4. The project site will use a URL like `https://OWNER.github.io/Tumpuk/`.

The project uses relative paths, which is suitable for a GitHub Pages project site under `/Tumpuk/`.

## Notes

- This is the web payload packaged inside the APK, not a decompiled reconstruction of the Android app's Java/Kotlin source.
- Test the game after publishing, especially audio playback and any runtime asset paths.
