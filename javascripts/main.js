function init(RANDOM_SEND_ID, RANDOM_LISTEN_ID) {
  /* MODULE */

  class Module {
    constructor(info) {
      for(var k in info) {
        this[k] = info[k];
      }
    }

    load() {
      if(this.loaded)
        return this.addCheckBox();
      else if(!this.loading) {
        this.loading = true;
        var script = document.createElement("script"),
        self = this;
        script.onload = function() {
          self.loaded = true;
          delete self.loading;
          if(self.name !== window[self.ID].name)
            throw "Module name doesn't match";
          self._ = window[self.ID]; // add loaded module to our object
          self.addCheckBox();
        };
        script.integrity = this.integrity;
        script.crossOrigin = "anonymous";
        script.src = this.url;
        document.body.appendChild(script);
      }
    }

    notify(i) {
      if(!this.settings || this.settings[i])
       notificationsQueue.push([this._.name, this._.messages[i], combineURL(this._.URLs[i], this._.baseURL), this._.icon]);
    }

    loadModuleData(name) {
      if(typeof this.data === "undefined")
        this.data = loadJSONfromLocalStorage(this.ID + "-data", "{}");
      return this.data[name];
    }

    saveModuleData(name, value) {
      this.data[name] = value;
      saveToLocalStorageAsJSON(this.ID + "-data", this.data);
    }

    addCheckBox() {
      if(document.getElementById(this.ID))
        throw "Setting already added";
      if(visible.indexOf(this.ID) === -1) {
        visible.push(this.ID);
        saveToLocalStorageAsJSON("visible", visible);
      }
      var modulesContainer = document.querySelector(".notifier"),
      cloned = modulesContainer.querySelector(".template").cloneNode(true),
      checkbox = cloned.querySelector("input.checkbox"),
      config = cloned.querySelector("i.config");
      cloned.removeAttribute("class");
      checkbox.id = this.ID;
      cloned.querySelector("span").innerHTML = this.name;
      cloned.querySelector("i.remove").addEventListener("click", this.removeCheckBox.bind(this), true);
      // show config button if needed
      if(this._.config && this._.config.length > 1 && this._.config.length === this._.messages.length) {
        config.classList.remove("hide");
        config.addEventListener("click", this.showSettings.bind(this), true);
      }
      // insert new module checkbox
      modulesContainer.insertBefore(cloned, modulesContainer.querySelector(".add"));
      document.querySelector(".list [value=" + this.ID + "]").setAttribute("disabled", "disabled");
      // load module settings
      this.settings = loadJSONfromLocalStorage(this.ID + "-settings", "null");
      // add common methods and missing properties
      this._.notify = this.notify.bind(this);
      this._.load = this.loadModuleData.bind(this);
      this._.save = this.saveModuleData.bind(this);
      if(!this._.URLs)
        this._.URLs = [];
      if(!this._.method)
        this._.method = "GET";
      // start enabled notifiers
      if(enabled.indexOf(this.ID) > -1) {
        checkbox.checked = true;
        this.start();
      }
      // add listener
      checkbox.addEventListener("change", this.checkboxChange.bind(this), false);
    }

    removeCheckBox(e) {
      var label = e.target.parentElement,
      index = visible.indexOf(this.ID);
      if(index > -1) {
        visible.splice(index, 1);
        saveToLocalStorageAsJSON("visible", visible);
      }
      this.stop();
      label.parentElement.removeChild(label);
      document.querySelector(".list [value=" + this.ID + "]").removeAttribute("disabled");
      removeFromLocalStorage(this.ID + "-settings");
      delete this.settings;
    }

    checkboxChange(e) {
      if(visible.indexOf(this.ID) === -1)
        return;
      var checkbox = e.target;
      if(checkbox.checked)
        this.start();
      else
        this.stop();
    }

    start() {
      if(enabled.indexOf(this.ID) === -1) {
        enabled.push(this.ID);
        saveToLocalStorageAsJSON("enabled", enabled);
      }
      if(!this.timeout)
        this.sendMessage();
      if(this._.loginURL && !this._.loggedIn)
        notificationsQueue.push([this.name, "Script won't be able to tell if you are " +
          "logged in, check it for yourself.", combineURL(this._.loginURL, this._.baseURL), this._.icon]);
    }

    stop() {
      if(this.timeout) {
        window.clearTimeout(this.timeout);
        delete this.timeout;
      }
      var index = enabled.indexOf(this.ID);
      if(index > -1) {
        enabled.splice(index, 1);
        saveToLocalStorageAsJSON("enabled", enabled);
      }
    }

    showSettings(e) {
      e.preventDefault();
      var settingsElement = document.querySelector(".settings > .module"),
      labels = settingsElement.querySelectorAll("label:not(.hide)"),
      save = settingsElement.querySelector(".save");
      // remove config from previous module
      for(var i = labels.length; i--; ) {
        settingsElement.removeChild(labels[i]);
      }
      settingsElement.querySelector(".save").setAttribute("data-id", this.ID);
      if(!this.settings)
        this.settings = Array(this._.config.length).fill(1);
      this._.config.forEach(function(labelText, index) {
        var cloned = settingsElement.querySelector("label.template").cloneNode(true);
        cloned.removeAttribute("class");
        cloned.querySelector("span").innerHTML = labelText;
        if(this.settings[index] === 1)
          cloned.querySelector(".checkbox").checked = true;
        settingsElement.insertBefore(cloned, save);
      }, this);
      show(".overlay, .settings > .module");
    }

    saveSettings() {
      var checkboxes = document.querySelectorAll(".settings > .module > label:not(.hide) > .checkbox");
      for(var i = checkboxes.length; i--; )
        this.settings[i] = checkboxes[i].checked ? 1 : 0;
      if(this.settings.some(e => !!e))
        saveToLocalStorageAsJSON(this.ID + "-settings", this.settings);
      else {
        document.getElementById(this.ID).checked = false;
        removeFromLocalStorage(this.ID + "-settings");
        delete this.settings;
      }
    }
    // send message to userscript (download cross origin webpage)
    sendMessage() {
      if(enabled.indexOf(this.ID) > -1) {
        if(!settings.timeout || settings.timeout < 30) {
          settings.timeout = 60;
          saveToLocalStorageAsJSON("settings", settings);
        }
        var data = {
          ID: this.ID,
          method: this._.method,
          url: combineURL(this._.loadURL, this._.baseURL),
          timeout: settings.timeout
        },
        event = new CustomEvent("grand_notifier_page_" + RANDOM_SEND_ID, {detail: data});
        window.dispatchEvent(event);
      }
    }

    timeoutNextRun(message) {
      if(message)
        console.warn((new Date()).toLocaleTimeString(), this.name, message);
      if(!settings.interval || settings.interval < 30) {
        settings.interval = 60;
        saveToLocalStorageAsJSON("settings", settings);
      }
      var timeout = settings.interval;
      this.timeout = window.setTimeout(this.sendMessage.bind(this), timeout * 1000);
    }
  }

  /* STORAGE */

  function loadJSONfromLocalStorage(id, defaultValue) {
    if(typeof defaultValue === "undefined")
      defaultValue = null;
    var data = window.localStorage.getItem(id),
    parsedJSON;
    try {
      parsedJSON = JSON.parse(data);
    }
    catch(ignore) {}
    if(typeof parsedJSON === "undefined") {
      removeFromLocalStorage(id);
      parsedJSON = null;
    }
    if(parsedJSON === null)
      return JSON.parse(defaultValue);
    else
      return parsedJSON;
  }

  function saveToLocalStorageAsJSON(id, data) {
    var stringifiedData = JSON.stringify(data);
    window.localStorage.setItem(id, stringifiedData);
  }

  function removeFromLocalStorage(id) {
    window.localStorage.removeItem(id);
  }

  /* NOTIFICATIONS */

  function handleQueue() {
    if(notificationsQueue.length > 0)
      notify.apply(this, notificationsQueue.shift());
    window.setTimeout(handleQueue, 200);
  }

  function notify(title, body, url, icon) {
    var options = {
      requireInteraction: true, // prevent browser auto-closing, will work in Firefox 52 https://bugzilla.mozilla.org/show_bug.cgi?id=862395
      body: body,
      icon: icon
    },
    n = new Notification("Grand Notofier: " + title, options);
    if(typeof url === "string")
      n.onclick = function(e) {
        e.preventDefault(); // prevent the browser from focusing the Notification's tab
        window.open(url, "_blank");
      };
    if(!settings.closeTime || settings.closeTime < 5) {
      settings.closeTime = 15;
      saveToLocalStorageAsJSON("settings", settings);
    }
    setTimeout(n.close.bind(n), settings.closeTime * 1000);
  }

  /* GUI */

  // create document element from string
  function createDocument(responseText) {
    var doc = document.implementation.createHTMLDocument("");
    doc.documentElement.innerHTML = responseText;
    return doc;
  }
  // show elements passed as arguments
  function show(selector) {
    var el = document.querySelectorAll(selector);
    for(var i = el.length; i--; )
      el[i].classList.remove("hide");
  }
  // hide elements passed as arguments
  function hide(selector) {
    var el = document.querySelectorAll(selector);
    for(var i = el.length; i--; )
      el[i].classList.add("hide");
  }

  function closeModalWindows(e) {
    if(!e || e.target === document.querySelector(".overlay")) {
      hide(".overlay, .settings > *");
    }
  }

  /* DATA PROCESSING */

  function combineURL(url, base) {
    if(typeof url === "string" && url.indexOf("http") === -1 && typeof base === "string")
      return base + url;
    else
      return url;
  }

  /* COMMUNICATION WITH USERSCRIPT */
  
  // process message from userscript (handle loaded cross origin page)
  function processMessage(e) {
    var data = JSON.parse(e.detail), // {ID, type, xhr}
    module = modules[data.ID];
    if(data.type === "error" || data.type === "timeout")
      module.timeoutNextRun(data.type);
    else {
      console.info((new Date()).toLocaleTimeString(), module.name);
      try {
        if(module._.loadType === "document")
          module._.document = createDocument(data.xhr.responseText);
        else if(module._.loadType === "json")
          module._.json = JSON.parse(data.xhr.responseText);
      }
      catch(ignore) {}
      if(module._.loggedIn && !module._.loggedIn.apply(module._, [data.xhr]))
        notificationsQueue.push([module.name, "Please log in first.", combineURL(module._.loginURL, module._.baseURL), module._.icon]);
      else
        module._.process.apply(module._, [data.xhr]); // this is real process from module
      module.timeoutNextRun();
    }
  }

  /* START */

  var modules = {},
      visible = loadJSONfromLocalStorage("visible", "[]"),
      enabled = loadJSONfromLocalStorage("enabled", "[]"),
      settings = loadJSONfromLocalStorage("settings", '{"timeout":60,"interval":60,"closeTime":60}'),
      notificationsQueue = [];

  // show GUI
  show(".notifier");
  hide(".wrapper");

  // listen to messages from userscript
  window.addEventListener("grand_notifier_userscript_" + RANDOM_LISTEN_ID, processMessage, false);
   
  document.querySelector(".notifier .add").addEventListener("click", function() {
    document.querySelector(".list [value=---]").selected = true; // select placeholder
    show(".overlay, .settings > .add-modal");
  }, false);
  
  document.querySelector(".overlay .add").addEventListener("click", function() {
    var ID = document.querySelector(".list").value;
    modules[ID].load();
    closeModalWindows();
  }, false);
  
  // document.querySelector(".overlay .global .save").addEventListener("click", saveSettings, false);
  document.querySelector(".overlay .module .save").addEventListener("click", function(e) {
    modules[this.getAttribute("data-id")].saveSettings();
    this.removeAttribute("data-id");
    closeModalWindows();
  }, false);
  document.querySelector(".overlay").addEventListener("click", closeModalWindows, false);

  // load module list
  (function(req) {
    var list = document.querySelector(".list"),
    optionTemplate = list.querySelector(".template");
    list.removeChild(optionTemplate);
    req.open("GET", "modules.json", true);
    req.responseType = 'json';
    req.onload = function() {
      // create add list
      req.response.forEach(function(moduleInfo) {
        var module = modules[moduleInfo.ID] = new Module(moduleInfo);
        // add module to 'add list'
        var cloned = optionTemplate.cloneNode(true);
        cloned.removeAttribute("class");
        cloned.value = module.ID;
        cloned.innerHTML = module.name;
        list.appendChild(cloned);
        if(visible.indexOf(module.ID) > -1) {
          module.load();
        }
      });
    };
    req.send(null);
  })(new XMLHttpRequest());

  Notification.requestPermission().then(function(permission) {
    if(permission === "granted")
      // start notification queue
      handleQueue();
    else
      alert("You need to allow notifications to use this.\nRefresh this page.");
  });
}
