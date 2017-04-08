var stackexchange = {
  name: "StackExchange",
  loadType: "json",
  baseURL: "http://stackexchange.com",
  loadURL: "/topbar/get-unread-counts",
  loginURL: "/users/login",
  messages: ["New inbox message.", "New reputation.", "New achievement."],
  URLs: ["/users/current?tab=inbox", "/users/current?tab=reputation", "/users/current?tab=activity"],
  config: ["Messages", "Reputation", "Achievements"],
  IDs: ["UnreadInboxCount", "UnreadRepCount", "UnreadNonRepCount"],
  process: function(xhr) {
    this.IDs.forEach(this.processID, this);
  },
  // http://meta.stackexchange.com/questions/286012/
  // loggedIn: function(xhr) {
    // return true;
  // },
  processID: function(ID, i) {
    if(this.json[ID] !== 0) // UnreadRepCount can be negative
      this.notify(i);
  }
};
