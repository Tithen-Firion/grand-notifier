var greasyfork = {
  name: "Greasy Fork",
  loadType: "document",
  baseURL: "https://greasyfork.org",
  loadURL: "/forum/",
  loginURL: "/users/sign_in",
  messages: ["New notification.", "New inbox message."],
  URLs: ["/forum/profile/notifications", "/forum/messages/all"],
  config: ["Notifications", "Messages"],
  classes: ["Notifications", "Inbox"],
  process: function() {
    this.classes.forEach(function(class_, i) {
      if(this.document.querySelector(".Sp" + class_ + "+em+span"))
        this.notify(i);
    });
  },
  loggedIn: function() {
    return !this.document.querySelector(".SignInPopup");
  }
};
