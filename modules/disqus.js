var disqus = {
  name: "Disqus",
  loadType: "json",
  baseURL: "https://disqus.com",
  loadURL: "/api/3.0/timelines/getUnreadCount?type=notifications&routingVersion=12&api_key=E8Uh5l5fHZ6gD8U3KycjAIAk46f68Zw7C6eW8WSjZvCLXebZ7p0r1yrYDrLilk2F",
  loginURL: "/profile/login/",
  messages: ["New notification."],
  URLs: ["/home/inbox/"],
  process: function() {
    if(this.json.response > 0)
      this.notify(0);
  },
  loggedIn: function() {
    return this.json.code === 0;
  }
};