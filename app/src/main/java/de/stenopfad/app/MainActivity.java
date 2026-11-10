package de.stenopfad.app;

import android.app.Activity;
import android.os.Bundle;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;

/** All learning content ships inside the APK. No network permission is requested. */
public final class MainActivity extends Activity {
    private WebView web;
    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(0xfff8f9f3);
        getWindow().setNavigationBarColor(0xfff8f9f3);
        getWindow().getDecorView().setSystemUiVisibility(
            android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR |
            android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        web = new WebView(this);
        setContentView(web);
        // Target SDK 35 enforces edge-to-edge. Keep interactive content inside system bars.
        web.setOnApplyWindowInsetsListener(new android.view.View.OnApplyWindowInsetsListener() {
          @Override public android.view.WindowInsets onApplyWindowInsets(android.view.View v, android.view.WindowInsets insets) {
            if (android.os.Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(android.view.WindowInsets.Type.systemBars());
                v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            }
            return insets;
          }
        });
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        web.addJavascriptInterface(new ClipboardBridge(), "NativeClipboard");
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                // Keep the trusted, self-contained document as the only bridge-enabled page.
                return true;
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                // The learning images are embedded as data: URLs. They are local content, not network requests.
                if (request != null && request.getUrl() != null && "data".equalsIgnoreCase(request.getUrl().getScheme())) return null;
                return new WebResourceResponse("text/plain", "UTF-8", new ByteArrayInputStream(new byte[0]));
            }
        });
        try (InputStream input = getAssets().open("index.html"); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192]; int count;
            while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
            web.loadDataWithBaseURL("https://appassets.androidplatform.net/", output.toString("UTF-8"), "text/html", "UTF-8", null);
        } catch (java.io.IOException e) {
            android.widget.TextView error = new android.widget.TextView(this);
            error.setText("Stenopfad konnte nicht geladen werden. Bitte installiere die App erneut.");
            setContentView(error);
        }
    }
    public final class ClipboardBridge {
        @JavascriptInterface public void copy(final String text) {
            if (text == null || text.length() > 2000000) return;
            runOnUiThread(new Runnable() { @Override public void run() {
                ((ClipboardManager)getSystemService(Context.CLIPBOARD_SERVICE)).setPrimaryClip(ClipData.newPlainText("Stenopfad-Sicherung", text));
            }});
        }
        @JavascriptInterface public void closeApp() { runOnUiThread(new Runnable() { @Override public void run() { finish(); }}); }
    }
    @Override public void onBackPressed() {
        web.evaluateJavascript("window.handleAndroidBack && window.handleAndroidBack()", null);
    }
    @Override protected void onDestroy() {
        if (web != null) { web.removeJavascriptInterface("NativeClipboard"); web.destroy(); }
        super.onDestroy();
    }
}
