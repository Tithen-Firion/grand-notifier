var deviantart = {
  name: "DeviantArt",
  loadType: "document",
  baseURL: "http://www.deviantart.com",
  loadURL: "/notifications/",
  loginURL: "/users/login",
  messages: [
    "New feedback.",
    "New notes.",
    "New correspondence.",
    "New notices.",
    "New watch notification."
  ],
  URLs: [
    "/notifications/#view=feedback",
    "/notifications/notes/",
    "/notifications/#view=correspondence",
    "/notifications/#view=notices",
    "/notifications/#view=watch"
  ],
  config: [
    "Feedback",
    "Notes",
    "Correspondence",
    "Notices",
    "Watch Notifications"
  ],
  IDs: ["feedback", "notes", "correspondence", "notices", "watch"],
  loggedIn: function(xhr) {
    return xhr.finalUrl.indexOf(this.loginURL) === -1;
  },
  process: function() {
    try{
    var scriptContent = this.document.querySelector("#bubbleview-messages+script").innerHTML,
        json = scriptContent.match(/^(?:[^\)]+\)){2},\s*(.*?)(?:\)[^\)]+){2}$/m)[1],
        data = JSON.parse(json).preload, count = {};
    this.IDs.forEach(function(ID) {
      count[ID] = 0;
    });
    for(var key in data) {
      if(key.indexOf("fb_") > -1)
        count.feedback += this.getCount(key, data);
      else if(key.indexOf("notes_unread") > -1)
        count.notes += this.getCount(key, data);
      else if(key.indexOf("correspondence") > -1)
        count.correspondence += this.getCount(key, data);
      else if(key.indexOf("devwatch") > -1)
        count.watch += this.getCount(key, data);
      else
        count.notices += this.getCount(key, data);
    }
    }catch(e){console.error(e)}
    this.IDs.forEach(function(ID, index) {
      if(count[ID] > 0)
        this.notify(index);
    }, this);
  },
  getCount: function(key, data) {
    return parseInt(data[key].result.matches);
  }
};
