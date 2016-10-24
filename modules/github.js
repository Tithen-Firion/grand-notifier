var github = {
  name: "Github",
  loadType: "document",
  baseURL: "https://github.com",
  loadURL: "/watching",
  loginURL: "/login",
  messages: ["New notification."],
  URLs: ["/notifications"],
  process: function() {
    if(this.document.querySelector(".mail-status.unread"))
      this.notify(0);
  },
  loggedIn: function(xhr) {
    return xhr.finalUrl.indexOf(this.loginURL) === -1;
  }
};