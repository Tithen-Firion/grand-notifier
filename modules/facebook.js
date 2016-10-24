var facebook = {
  name: "Facebook",
  loadType: "document",
  baseURL: "https://www.facebook.com",
  loadURL: "/settings",
  loginURL: "/login.php",
  messages: [
    "New friend request.",
    "New message.",
    "New notification."
  ],
  URLs: [
    "/friends/requests",
    "/messages",
    "/notifications"
  ],
  config: [
    "Friend requests",
    "Messages",
    "Notifications"
  ],
  IDs: ["requestsCountValue", "mercurymessagesCountValue", "notificationsCountValue"],
  process: function() {
    this.IDs.forEach(this.processID, this);
  },
  loggedIn: function(xhr) {
    return xhr.finalUrl.indexOf(this.loginURL) === -1;
  },
  processID: function(ID, i) {
    var notificationElement = this.document.getElementById(ID);
    if(notificationElement && parseInt(notificationElement.innerText) > 0)
      this.notify(i);
  }
};