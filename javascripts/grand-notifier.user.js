// ==UserScript==
// @name        Grand Notifier
// @descriptopn Notifies about new notifications from various websites
// @namespace   tithen-firion.github.io
// @downloadURL https://tithen-firion.github.io/grand-notifier/javascripts/grand-notifier.user.js
// @updateURL   https://tithen-firion.github.io/grand-notifier/javascripts/grand-notifier.meta.js
// @include     https://tithen-firion.github.io/grand-notifier/
// @version     1
// @grant       GM_xmlhttpRequest
// ==/UserScript==

// generate two random IDs for communicating with JS on page
var RANDOM_LISTEN_ID = Math.random(),
RANDOM_SEND_ID = Math.random();
// and initiate JS on page passing them as arguments
window.setTimeout("init(" + RANDOM_LISTEN_ID + ", " + RANDOM_SEND_ID + ")", 0);

// listen to messages from page
window.addEventListener("grand_notifier_page_" + RANDOM_LISTEN_ID, processMessage, false);
// and process them
function processMessage(e) {
  var data = e.detail, // {ID, method, url, timeout}
  xhr = {
    method: data.method,
    url: data.url,
    timeout: data.timeout * 1000,
  };
  xhr.onload = sendMessage.bind(this, data.ID, "load");
  xhr.onerror = sendMessage.bind(this, data.ID, "error");
  xhr.ontimeout = sendMessage.bind(this, data.ID, "timeout");
  // download cross origin page
  GM_xmlhttpRequest(xhr);
}
// send data back to page
function sendMessage(ID, type, xhr) {
  var data = {
    ID: ID,
    type: type,
    xhr: xhr
  },
  event = new CustomEvent("grand_notifier_userscript_" + RANDOM_SEND_ID, {detail: JSON.stringify(data)});
  window.dispatchEvent(event);
}
