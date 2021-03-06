
var createGroup = function() {
  return {
    callback: function() {},
    events: []
  };
};


var connector = (function() {
  var queue = [], group = createGroup(),
      sending = false, running = false, timer = null, grouping = false, 
      timeout=500, maxTimeout=60000, failureCount=0;

  var that = {
    
    useXHR: true,
    
    start: function() {
      if (running) {
        return ;
      }
      running = true;
      timer = setInterval(function() {
        that.sendNext();
      }, 5000);
    },
    
    stop: function() {
      if (!running) {
        return ;
      }
      running = false;
      clearInterval(timer);
    },
    
    isRunning: function() {
      return running === true;
    },
    
    setRequestMethod: function(method)
    {
      this.useXHR = method === "xhr";
    },
    
    length: function () {
      return queue.length;
    },

    isEmpty: function() {
      return queue.length === 0;
    },

    isSending: function() {
      return sending === true;
    },
    
    startGroup: function() {
      grouping = true;
    },
    
    endGroup: function() {
      var tmp = group;
      grouping = false;

      if (group.events.length === 0) {
        return ;
      }
      
      group = createGroup();
      this.add(tmp.url, tmp.events, tmp.callback);
    },
    
    isGroup: function() {
      return grouping;
    },

    add: function(url, event, callback) {
      if (grouping) {
        if (callback) {
          var gc = group.callback;
          group.callback = function() {
            callback.apply(this, arguments);
            gc.apply(this, arguments);
          };
        }
        group.events[group.events.length] = event;
        group.url = url; // last url will win
      }
      else {
        queue[queue.length] = {
          event: event,
          callback: callback,
          url: url
        };
        this.sendNext();
      }
    },

    clear: function() {
      queue = [];
    },

    sendNext: function() {
      if (!running || !isOnline() || sending || this.isEmpty()) {
        return ;
      }

      sending = true;
      var data = queue[0];
      var self = this;
      
      var url = data.url;
      var payload = { p: data.event };
      
      var success = function(payload, request) 
      {
        queue.shift();
        failureCount = 0;
        
        sending = false;
        self.sendNext();
        if (typeof data.callback === "function")
        {
          data.callback.call(data.callback, payload, request);
        }
      };
      
      var error = function(payload, request) 
      {
        sending = false;
        failureCount += 1;
        
        if (request.status === 400 || request.status === 500)
        {
          queue.shift();
          self.sendNext();
          
          if (typeof data.callback === "function")
          {
            data.callback.call(data.callback, payload, request);
          }
        }
        else 
        {
          setTimeout(function() {
            self.sendNext();
          }, Math.min(timeout * failureCount, maxTimeout));
        }
      };
      
      if (this.useXHR) {
        XHRPost.send(url, payload, success, error);
      }
      else {
        Pixel.send(url, payload, success, error);
      }
    }
  };
  
  document.addEventListener("online", function() {
    that.sendNext();
  });
  document.addEventListener("offline", function() {
    // presently nothing to do on going offline.
  });
  
  that.start();
  
  return that;

})();