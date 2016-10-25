var instagram = {
  name: "Instagram",
  loadType: "json",
  baseURL: "https://www.instagram.com",
  loadURL: "/accounts/activity/?__a=1",
  loginURL: "/accounts/login/",
  messages: [
    "New like.",
    "New comment.",
    "New follower.",
    "Unknown.",
    "New mention.",
    "New follow request."
  ],
  URLs: Array(6).fill("/accounts/activity/"),
  config: [
    "Likes",
    "Comments",
    "Followers",
    "Unknown",
    "Mentions",
    "Follow requests"
  ],
  loggedIn: function(xhr) {
    return xhr.finalUrl.indexOf(this.loginURL) === -1;
  },
  process: function() {
    var countArray = Array(6).fill(0),
    timestamp = this.load("timestamp") || 0;
    this.json.activityFeed.stories.forEach(function(story) {
      if(story.timestamp > timestamp)
        if(story.type > 4)
          countArray[3]++; // unknown
        else
          countArray[story.type-1]++;
    });
    countArray[5] = this.json.followRequests.length;
    countArray.forEach(function(count, index) {
      if(count > 0)
        this.notify(index);
    }, this);
    this.save("timestamp", this.json.timestamp);
  }
};
