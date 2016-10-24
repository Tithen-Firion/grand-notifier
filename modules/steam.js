var steam = {
  name: "Steam",
  loadType: "json",
  baseURL: "https://steamcommunity.com",
  loadURL: "/actions/GetNotificationCounts",
  loginURL: "/login/home/",
  messages: [
    "New comment.",
    "New item.",
    "New invite.",
    "New gift.",
    "New message.",
    "New trade offer.",
    "Unknown notification 1",
    "Unknown notification 2",
    "Unknown notification 3",
    "Unknown notification 4"
  ],
  URLs: [
    "/my/commentnotifications",
    "/my/inventory",
    "/my/home/invites",
    "/my/inventory/#pending_gifts",
    "/chat/",
    "/my/tradeoffers/"
  ],
  config: [
    "Comments",
    "Items",
    "Invites",
    "Gifts",
    "Messages",
    "Trade offers",
    "Unknown 1",
    "Unknown 2",
    "Unknown 3",
    "Unknown 4"
  ],
  IDs: ["4", "5", "6", "8", "9", "1", "2", "3", "10", "11"],
  process: function() {
    this.IDs.forEach(this.processID, this);
  },
  loggedIn: function(xhr) {
    return this.json; // null when not logged in
  },
  processID: function(ID, i) {
    if(this.json.notifications && this.json.notifications[ID] && this.json.notifications[ID] > 0)
      this.notify(i);
  }
};
