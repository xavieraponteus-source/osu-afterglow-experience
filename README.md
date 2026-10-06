# Ōsu Afterglow Experience

Complete static website with a moonlit 3D Japanese restaurant, walking controls, automatic right-sliding door, Xavier and Chisa host content, and the uploaded music with Play/Stop controls.

## Publish on GitHub Pages

1. Create a repository named `osu-afterglow-experience`.
2. Upload the contents of this folder so `index.html` is at the repository root.
3. In Settings → Pages, choose Deploy from a branch, then main and /(root), and Save.
4. GitHub will show the published URL after deployment completes. Its usual form is https://YOUR-USERNAME.github.io/osu-afterglow-experience/.

All asset paths are relative, so this project works under the repository subpath. No build or package installation is required.

Edit index.html for text, style.css for styling, app.js for the 3D scene, and music.js for playback behavior.

Local preview: run `python -m http.server 8000` in this folder, then visit http://localhost:8000.

The files contain no Sites hosting identity or credentials. Three.js license is included in THREE-LICENSE.txt. The model and song were supplied by the site owner.
