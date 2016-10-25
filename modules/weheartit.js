var weheartit = {
  name: "We Heart It",
  loadType: "document",
  baseURL: "http://weheartit.com",
  loadURL: "/settings/goodies",
  loginURL: "/login/",
  messages: ["New message.", "New notification."],
  URLs: ["/my/postcards", "/notifications"],
  config: ["Messages", "Notifications"],
  loggedIn: function(xhr) {
    return !!this.document.querySelector(".icon-messages+span");
  },
  process: function() {
    [".icon-messages+span", ".icon-notifications+span"].forEach(function(selector, index) {
      var element = this.document.querySelector(selector);
      if(element.style.display !== "none")
        this.notify(index);
    }, this);
  }
};