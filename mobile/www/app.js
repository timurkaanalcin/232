(function () {
  var form = document.getElementById("server-form");
  var input = document.getElementById("server-url");
  var error = document.getElementById("form-error");
  var button = document.getElementById("continue");

  function showError(message) {
    error.hidden = false;
    error.textContent = message;
  }

  function normalizeServerUrl(raw) {
    var trimmed = String(raw || "").trim();
    if (!trimmed) return null;
    var url;
    try {
      url = new URL(trimmed);
    } catch (e) {
      return null;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname || url.username || url.password) return null;
    if (url.pathname !== "/" && url.pathname !== "") return null;
    if (url.search || url.hash) return null;
    return url.protocol + "//" + url.host;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    error.hidden = true;
    var normalized = normalizeServerUrl(input.value);
    if (!normalized) {
      showError("Enter an http(s) server URL without a path, for example https://livetrack.example.com.");
      return;
    }
    var cap = window.Capacitor;
    if (!cap || typeof cap.registerPlugin !== "function" || !cap.isNativePlatform || !cap.isNativePlatform()) {
      showError("Open this screen in the LiveTrack Android or iOS app.");
      return;
    }
    button.disabled = true;
    var plugin = cap.registerPlugin("LiveTrack");
    Promise.resolve(plugin.setServerUrl({ url: normalized }))
      .catch(function (err) {
        button.disabled = false;
        showError((err && err.message) || "Could not save that server URL.");
      });
  });
})();
