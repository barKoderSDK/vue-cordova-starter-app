#!/usr/bin/env node

/*
 * The barKoder plugin attaches its fullscreen camera container to the Cordova
 * WebView's parent, so it is added after the WebView and therefore draws after
 * it. The camera preview is a SurfaceView, which punches a transparent hole
 * through the window as it draws - wiping out any UI the WebView had already
 * painted, so the scanner controls disappear as soon as the camera attaches.
 *
 * Keeping the WebView as the last child of that parent makes it draw over the
 * hole instead: the camera shows through the WebView's transparent areas while
 * the scanner overlay stays visible.
 *
 * MainActivity.java is generated into platforms/, which is not tracked, so this
 * runs as an after_prepare hook to re-apply the change whenever the Android
 * platform is prepared or regenerated.
 */

const fs = require('fs');
const path = require('path');

const MARKER = 'barKoder: keep the WebView above the camera SurfaceView';

const IMPORTS = [
  'import android.graphics.Color;',
  'import android.graphics.PixelFormat;',
  'import android.view.View;',
  'import android.view.ViewGroup;',
].join('\n');

const PATCH = `
        // ${MARKER}
        getWindow().setFormat(PixelFormat.TRANSLUCENT);
        getWindow().getDecorView().setBackgroundColor(Color.TRANSPARENT);

        final View barkoderWebView = appView != null ? appView.getView() : null;
        if (barkoderWebView != null) {
            barkoderWebView.setBackgroundColor(Color.TRANSPARENT);

            final ViewGroup barkoderWebViewParent = (ViewGroup) barkoderWebView.getParent();
            if (barkoderWebViewParent != null) {
                barkoderWebViewParent.setBackgroundColor(Color.TRANSPARENT);
                barkoderWebViewParent.setOnHierarchyChangeListener(new ViewGroup.OnHierarchyChangeListener() {
                    @Override
                    public void onChildViewAdded(View parent, View child) {
                        if (child == barkoderWebView) {
                            return;
                        }
                        barkoderWebView.post(new Runnable() {
                            @Override
                            public void run() {
                                barkoderWebView.bringToFront();
                                barkoderWebViewParent.invalidate();
                            }
                        });
                    }

                    @Override
                    public void onChildViewRemoved(View parent, View child) {}
                });
            }
        }
`;

const findMainActivity = (projectRoot) => {
  const javaRoot = path.join(projectRoot, 'platforms', 'android', 'app', 'src', 'main', 'java');
  if (!fs.existsSync(javaRoot)) {
    return null;
  }

  const stack = [javaRoot];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
      } else if (entry.name === 'MainActivity.java') {
        return entryPath;
      }
    }
  }

  return null;
};

module.exports = function (context) {
  const projectRoot = context && context.opts ? context.opts.projectRoot : process.cwd();
  const mainActivityPath = findMainActivity(projectRoot);

  if (!mainActivityPath) {
    return;
  }

  const source = fs.readFileSync(mainActivityPath, 'utf8');

  if (source.includes(MARKER)) {
    return;
  }

  const loadUrlCall = 'loadUrl(launchUrl);';
  if (!source.includes(loadUrlCall) || !source.includes('import android.os.Bundle;')) {
    console.warn('[barkoder] MainActivity.java has an unexpected shape, skipping WebView z-order patch.');
    return;
  }

  // appView only exists once loadUrl has run, so the patch goes after it.
  const patched = source
    .replace('import android.os.Bundle;', `import android.os.Bundle;\n${IMPORTS}`)
    .replace(loadUrlCall, `${loadUrlCall}\n${PATCH}`);

  fs.writeFileSync(mainActivityPath, patched, 'utf8');
  console.log('[barkoder] Patched MainActivity.java to keep the WebView above the camera view.');
};
