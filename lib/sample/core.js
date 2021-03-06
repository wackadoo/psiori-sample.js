var chooseProtocol = function()
{
  var protocol = (location.protocol || "https:");
  if (protocol !== "http:" && protocol !=="https:")
  {
    protocol = "https:";
  }
  return protocol;
};

var endpoint       = chooseProtocol() + "//events.psiori.com/sample/v01/event",
    sdk            = "Sample.JS",
    sdk_version    = "0.0.7",
    installToken   = null,
    appToken       = null,
    sessionToken   = null,
    module         = null,
    userId         = null,
    email          = null,
    platform       = null,
    client         = null,
    client_version = null,
    longitude      = null,
    latitude       = null,
    ad_referer     = null,
    ad_campaign    = null,
    ad_placement   = null,
    locale         = null,
    autoping       = null,
    host           = null,
    facebook_id    = null,
    country_code   = null,
    present_page_id= null,
    timestamp      = null, 
    browserMode    = true,
    debugMode      = false,
    forceDate      = false,
    autoExtractRef = true,
    acc_value      = null,
    has_cookies    = false,
    c_domain       = typeof window.Sample === "undefined" ? null : (window.Sample.DOMAIN || null);
    
    
var getItemInStorage = function(key, storage)
{
  storage = storage || "sessionStorage";
  
  try // safari on private settings (do not allow websites to store local data)   
  {   // throws a security exception already when trying to get the typeof.
    if (typeof window[storage] !== "undefined")
    {
      return window[storage].getItem(key);
    }
  } 
  catch (e) 
  {}
  
  return null;
};

var setItemInStorage = function(key, value, storage)
{
  storage = storage || "sessionStorage"; // default is sessionStorage
  
  try // safari on private settings (do not allow websites to store local data)   
  {   // throws a security exception already when trying to get the typeof.
    if (typeof window[storage] !== "undefined")
    {
      window[storage].setItem(key, value);
      return window[storage].getItem(key);
    }
  } 
  catch (e) 
  {}
  
  return null;
};

var removeItemInStorage = function(key, storage)
{
  storage = storage || "sessionStorage"; // default is sessionStorage
  
  try // safari on private settings (do not allow websites to store local data)   
  {   // throws a security exception already when trying to get the typeof.
    if (typeof window[storage] !== "undefined")
    {
      window[storage].removeItem(key);
    }
  } 
  catch (e) 
  {}
  
  return null;
};

var getQueryVars = function(search)
{
  var result = {};

  var parts = search.split('&');
  for (var i=0; i < parts.length; i++) {
    var item = parts[i].split("=");
    if (item.length === 2) {
      result[item[0].toLowerCase()] = decodeURIComponent(item[1]);
    }
  }
  return result;
};

var setPageId = function(page_id) 
{
  present_page_id = page_id;
  return setItemInStorage('page_id', page_id);
};

var getPageId = function() 
{
  return getItemInStorage('page_id') || present_page_id || null;
};

var clearPageId = function() 
{
  present_page_id = null;
  removeItemInStorage('page_id');
};

var mergeParams = function(userParams, eventName, eventCategory)
{
  var params = {};
  
  var add = function(key, value) 
  {
    // we'll add "0" but ignore value that equals null
    if (key && typeof value !== "undefined" && (typeof value === "number" || value)) 
    {
      params[key] = value;
    }
  };

  add("sdk",            sdk);
  add("sdk_version",    sdk_version);
  
  add("platform",       userParams.platform       || platform);
  add("client",         userParams.client         || client);
  add("client_version", userParams.client_version || client_version);
  
  add("event_name",     eventName);
  add("app_token",      appToken);
  add("install_token",  installToken);
  add("session_token",  sessionToken);
  add("debug",          debugMode);
  add("force_date",     forceDate);
  add("timestamp",      userParams.timestamp || timestamp || Math.round(new Date().getTime() /1000));
  add("user_id",        userId);

  add("event_category", eventCategory || "custom");
  add("module",         userParams.module || module);
  add("content_id",     userParams.content_id);
  add("content_ids",    userParams.content_ids);
  add("content_type",   userParams.content_type);
  add("page_id",        userParams.page_id || getPageId());
  add("translation",    userParams.translation);
  
  add("parameter1",     userParams.parameter1);
  add("parameter2",     userParams.parameter2);
  add("parameter3",     userParams.parameter3);
  add("parameter4",     userParams.parameter4);
  add("parameter5",     userParams.parameter5);
  add("parameter6",     userParams.parameter6);

  add("callback",       userParams.callback);
  add("automatic",      userParams.automatic);
  
  if (eventName === "purchase" ||
      eventName === "chargeback")
  {
    add("pur_provider",           userParams.pur_provider);
    add("pur_gross",              userParams.pur_gross);
    add("pur_currency",           userParams.pur_currency);
    add("pur_country_code",       userParams.pur_country_code);
    add("pur_earnings",           userParams.pur_earnings);
    add("pur_product_sku",        userParams.pur_product_sku);
    add("pur_product_category",   userParams.pur_product_category);
    add("pur_receipt_identifier", userParams.pur_receipt_identifier);
  }
  
  if (eventName === "session_start"  ||
      eventName === "session_update" ||
      eventName === "session_resume" ||
      (eventCategory && eventCategory === "account")) 
  {
    add("email",         userParams.email     || email);
    add("locale",        userParams.locale    || locale);
    
    if (!userParams.ad_referer && 
        !ad_referer && 
        autoExtractRef &&
        window.location &&
        window.location.search) 
    {
      var vars    = getQueryVars(window.location.search.substring(1));
      
      ad_referer     = vars.refid || vars.ref_id || null;
      ad_campaign    = vars.subid || vars.sub_id || null;
      ad_placement   = vars.placeid || vars.place_id || null;
    }
    
    add("ad_referer",    userParams.ad_referer   || ad_referer);
    add("ad_campaign",   userParams.ad_campaign  || ad_campaign);
    add("ad_placement",  userParams.ad_placement || ad_placement);
    
    add("longitute",     userParams.longitude || longitude);
    add("latitude",      userParams.latitude  || latitude);

    add("country_code",  userParams.country_code  || country_code);
    add("facebook_id",   userParams.facebook_id   || facebook_id);
    
    add("target_group",  userParams.target_group);
    
    if (browserMode)
    {
      add("http_referrer", document.referrer);
      add("http_request", window.location.href);
    }
    
    // send host only, if explicitly set or presently in browser mode
    add("host", host || (browserMode ? window.location.host : null));
  }
  if (eventCategory === "custom")
  {
    add("acc_value", userParams.acc_value || acc_value);
  }
  return params;
};

var removeCookie = function(name, path, domain) 
{
  document.cookie = encodeURIComponent(name) +
    "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + 
    (domain ? "; domain=" + domain : "") + 
    (path ? "; path=" + path : "");
};

var setTokenInCookie = function(token)
{
  var now = new Date(); now.setTime(now.getTime() + 180 * 24 * 3600 * 1000);
  document.cookie = "psi=" + token + "; expires=" + now.toUTCString() + 
    (c_domain ? "; domain=" + c_domain : "") + "; path=/";  
};

var getTokenFromCookie = function() {
    var nameEQ = "psi=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)===' ') { c = c.substring(1,c.length); }
        if (c.indexOf(nameEQ) === 0) { return c.substring(nameEQ.length,c.length); }
    } 
    return null;
};

var checkCookie = function() 
{
    var cookieDisabled = typeof navigator.cookieEnabled !== "undefined" && 
      !navigator.cookieEnabled; // we know, it's off
    
    if (!cookieDisabled) {  // due to IE high privacy  and browsers without cookieEnabled we need to check.
        document.cookie="_psi";
        cookieDisabled = (document.cookie.indexOf("_psi") !== -1) ? false : true;
        if (!cookieDisabled) {
          removeCookie("_psi");
        }
    }
    return !cookieDisabled;
};

var randomToken = function(length) 
{
  var str = "";
  
  for (var i=0; i < length; ++i) 
  {
    if (i > 0 && i % 4 === 0) 
    {
      str += "-";
    }
    str += Math.floor(16*Math.random()).toString(16).toUpperCase();
  }
  
  return str;
};


var Sample = 
{
  PLATFORM_BROWSER:  'browser',
  PLATFORM_IOS:      'ios',
  PLATFORM_ANDROID:  'android',
  PLATFORM_WINDOWS:  'windows',
  PLATFORM_FACEBOOK: 'facebook',
  
  init: function(params) 
  {
    has_cookies = checkCookie();
    
    if (has_cookies) {
      if (!(installToken = getTokenFromCookie())) {
        installToken = randomToken(24);
      }
      setTokenInCookie(installToken);
      setItemInStorage('SampleToken', installToken, 'localStorage');
    }
    else {
      if (!(installToken = getItemInStorage('SampleToken', 'localStorage')))
      {
        setItemInStorage('SampleToken', (installToken = randomToken(24)), 'localStorage');
      }
    }

    if (!(sessionToken = getItemInStorage('SampleToken', 'sessionStorage')))
    {
      setItemInStorage('SampleToken', (sessionToken = randomToken(32)), 'sessionStorage');
    }

    platform = this.PLATFORM_BROWSER;
    connector.setRequestMethod("xhr");
  },
  
  /** Stops the tracking of user events */
  stop: function() 
  {
    connector.stop();
  },
  
  /** Resumes the tracking of user events */
  resume: function() 
  {
    connector.start();
  },
  
  /** Sets the endpoint.
    * The endpoint specifies the location where the events will be send to
    */
  setEndpoint: function(newEndpoint) 
  {
    endpoint = newEndpoint;
  },

  /** Returns the endpoint */
  getEndpoint: function() 
  {
    return endpoint;
  },

  /** Sets the method being used to communicate with the event server.
    * request methods to choose from: xhr (recommended), img (legacy,
    * works across different origins), iframe (legacy with same origin) 
    */
  setRequestMethod: function(method) 
  {
    connector.setRequestMethod(method);
  },

  /** Sets the app token.
    * Remember that it should be unique across all your apps
    */
  setAppToken: function(newAppToken) 
  {
    appToken = newAppToken;
  },
  
  setAutoExtractCampaign: function(mode)
  {
    autoExtractRef = mode;
  },
  
  /** Sets the module.
    * Probably you want to separate your app into parts for better event
    * evaluation
    */
  setModule: function(newModule) 
  {
    module = newModule;
  },
  
  /** Sets the plattform
    * E.g. iOS, android
    */
  setPlatform: function(newPlatform) 
  {
    platform = newPlatform;
  },
  

  /** Returns the current platform
    */
  getPlatform: function()
  {
    return platform;
  },

  /** Sets the client id */
  setClient: function(clientId) 
  {
    client = clientId;
  },
  
  /** Sets the clients version */
  setClientVersion: function(newClientVersion) 
  {
    client_version = newClientVersion;
  },
  
  /** Sets the user id of the current user */
  setUserId: function(newUserId) 
  {
    userId = newUserId;
  },
  
  /** Sets the facebook id of the current facebook user */
  setFacebookId: function(newFacebookId)
  {
    facebook_id = newFacebookId;
  },
  
  /** Sets the email of the current user
    */
  setEmail: function(newEmail) 
  {
    email = newEmail;
  },
  
  /** Sets the users location in form of latitude and longitude
    */
  setLocation: function(newLongitude, newLatitude)
  {
    longitude = newLogitude;
    latitude = newLatitude;
  },
  
  /** Sets the local
    * E.g. DE, EN
    */
  setLocale: function(newLocale)
  {
    locale = newLocale;
  },
  
  /** Sets the ad referrer, campaign and placement for all events
    */
  setReferer: function(referer, campaign, placement)
  {
    ad_referer = referer || null;
    ad_campaign = campaign || null;
    ad_placement = placement || null;
  },
  
  /** Enable debug mode if the event should not be considered in evaluations
    */
  setDebug: function(flag) 
  {
    debugMode = flag;
  },
  
  /** Forces Psiori to use the client date although it's unreliable
    */
  setForceDate: function(flag) 
  {
    forceDate = flag;
  },
  
  /** Usually, the tracking SDK uses now as the timestamp, but
    * with this method Sample.JS can be forced to send any 
    * arbitrary event creation date to the server. Usually
    * you'd use it in combination with setForceDate(true) to
    * force the PSIORI server to use your date instead of
    * the date the event came in. Please note, that the
    * given date will be used for all subsequent events
    * until you either set a different timestamp OR set
    * it back to null with Sample.setTimestamp(null) what
    * will cause the SDK to use NOW again.
    *
    * Alternatively, you can pass-in a timestamp with the
    * user parameters of a tracking event.
    */
  setTimestamp: function(date) 
  {
    timestamp = date ? Math.round(date.getTime() /1000) : null;
  },
  
  /** sets the browser mode
    * Indicates whether or not the application runs in a browser. If browser mode is enabled 
    * additional such as the http_referer, the http_request and the host will be send with each 
    * event.
    */
  setBrowserMode: function(flag)
  {
    inBrowser = !!flag;
  },
  
  /** sets the hostname
    * The host name will be send with each event, if it is set explicitly or when browser mode is
    * enabled
    */
  setHost : function(hostname)
  {
    host = hostname;
  },
  
  /** sets the installToken
    * Only use this method when you really need to overwrite the installToken.
    * E.g when you create a hybrid mobile version or switch hosts during one session.
    * The preferred way is to let PSIORI create an installToken for each Device.
    */
  setInstallToken: function(newInstallToken)
  {
    installToken = newInstallToken;    
    if (has_cookies) {
      setTokenInCookie(installToken);
    }
    setItemInStorage('SampleToken', (installToken = newInstallToken), 'localStorage');
  },

  /** returns the present install token */
  installToken: function()
  {
    return installToken;
  },

  /** sets the sessionToken
    * Only use this method when you really need to overwrite the sessionToken.
    * E.g when you create a hybrid mobile version or switch hosts during one session.
    * The preferred way is to let PSIORI create an sessionToken for each session.
    */
  setSessionToken: function(newSessionToken)
  {
    setItemInStorage('SampleToken', (sessionToken = newSessionToken), 'sessionStorage');
  },
  
  /** returns the present session token */
  sessionToken: function()
  {
    return sessionToken;
  },

  // /////////////////////////////////////////////////////////////////////////
  //
  //   EVENT GROUPING
  //
  // /////////////////////////////////////////////////////////////////////////
  
  /** start an event group. All tracking events created between startGroup()
    * and endGroup() will be grouped together and send in one single HTTP
    * packet right after the closing call to endGroup(). */
  startGroup: function() 
  {
    connector.startGroup();
  },
  
  /** closes an event group and sends all grouped events in one HTTP packet
    * to the server. */
  endGroup: function() 
  {
    connector.endGroup();
  },
  
  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   GENERIC TRACKING EVENT
  //
  // /////////////////////////////////////////////////////////////////////////
  
  /** generic tracking event that could be used to send pre-defined tracking
    * events as well as user-defined, custom events. Just pass the eventName,
    * the eventCategory (used for grouping in reports of the backend) and
    * an optional hash of parameters. 
    *
    * Please note that only known parameters will be passed to the server.
    * If you want to come up with your own parameters in you custom events,
    * use the six pre-defined fields "parameter1" to "parameter6" for this
    * purpose. 
    *
    * Examples:
    * Sample.track('session_start', 'session'); // send the session start event
    * Sample.track('found_item', 'custom', {    // send custom item event
    *   parameter1: 'Black Stab',               // custom item name
    *   parameter2: '21',                       // level of item
    * });
    */
  track: function(eventName, eventCategory, params) 
  {
    params = mergeParams(params || {}, eventName, eventCategory);
    connector.add(endpoint, params, params.callback);
  },
  
  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   SESSION EVENTS
  //
  // /////////////////////////////////////////////////////////////////////////
  
  /** should be send on the start of a new session. 
    * At the start of each session send one sessionStart event with an appToken. Make sure that
    * the userId is set before starting this function. 
    * The params are optional.
    */
  sessionStart: function(newAppToken, newUserId, params)
  {    
    appToken = newAppToken || appToken;
    userId = newUserId || userId;

    this.pageEnd({
      automatic: true
    }); // close a page that has been opened earlier. 

    this.track('session_start', 'session', params);
  },
  
  /** should be send when the session receives an update 
    * The parameters field is optional.
    */
  sessionUpdate: function(params)
  {
    this.track('session_update', 'session', params);
  },
  
  /** should be send when the session gets paused */
  sessionPause: function()
  {
    this.track('session_pause', 'session');
  },
  
  /** should be send when the session resumes */
  sessionResume: function()
  {
    this.track('session_resume', 'session');
  },
  
  /** sends one ping event to the server.
    * if you want to send ping events automaticaly use the autoping method
    */
  ping: function() 
  {
    this.track('ping', 'session');
  },
  
  /** starts or stops autopinging every seconds seconds.
    * pass seconds = 0 to stop pinging. */
  autoPing: function(seconds) 
  {
    var that = this;
    if (typeof seconds === "undefined") 
    {
      seconds = 60;
    }
    clearTimeout(autoping);
    autoping = null;
    if (seconds && seconds > 0) 
    {
      autoping = setInterval(function() {
        that.ping();
      }, seconds * 1000);
    }
  },
  
  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   ACCOUNT EVENTS
  //
  // /////////////////////////////////////////////////////////////////////////
  
  /** Should be send when a new user did register
    * Each registration takes, besides the user id, an optional list of key-value pairs.
    */
  registration: function(newUserId, params)
  {
    userId = newUserId || userId;
    this.track('registration', 'account', params);
  },
  
  /** Should be send when an existing user signs in
    * Each sign intakes, besides the user id, an optional list of key-value pairs.
    */
  signIn: function(newUserId, params)
  {
    userId = newUserId || userId;
    this.track('sign_in', 'account', params);
  },
  
  /** Should be send when the account of the current user needs an update.
    * For example when an field relating to the account changes. Like the target group
    * or country
    */
  profileUpdate: function(params)
  {
    this.track('update', 'account', params);
  },
  
  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   CONTENT EVENTS
  //
  // /////////////////////////////////////////////////////////////////////////


  /** should be send when a user views one or more contents. This event is
    * used for counting views per-content. An event should send at least one 
    * content id. Multiple content ids can be passed as array. The content type
    * is optional, wheres if no type is provided the default 
    * one, ‘content’ is taken (to distinguish this event from page-related 
    * views).
    */
  contentView: function(content_ids, content_type, params) 
  {
    params = params || {};
    params.content_type = content_type || params.content_type || 'content';

    if (isArray(content_ids)) 
    {
      params.content_ids = content_ids;
    }
    else 
    {
      params.content_id = content_ids;      
    }
    this.track('view', 'content', params);
  },
  
  /** should be send when a user interacts with one or more contents in-app 
    * A content usage event should take at least one product id. Multiple 
    * product ids can be passed as array. The content type is optional,
    * wheres if no type is provided the default 
    * one, ‘content’ is taken.
    */
  contentUsage: function(content_ids, content_type, params) 
  {
    params = params || {};
    params.content_type = content_type || params.content_type || 'content';

    if (isArray(content_ids)) 
    {
      params.content_ids = content_ids;
    }
    else 
    {
      params.content_id = content_ids;      
    }
    this.track('usage', 'content', params);
  },
  
  // /////////////////////////////////////////////////////////////////////////
  //
  //  PAGE EVENTS
  //
  // /////////////////////////////////////////////////////////////////////////
 
 
  /** manually tracks a single page view / page impression. Each time you
   * send this event, the number of page impressions of the given page_id
   * will be increased by one. 
   *
   * This method is the most simplest way to track page impressions. You
   * have the full control in the client what is counted and what is not
   * counted.
   *
   * Please note that this event is stateless in the sense, that it does 
   * not support tracking of the time a user stayed on a particular page.
   * If you want more detailed information about page usage, use the 
   * alternative methods pageStart and pageEnd instead of using this 
   * method.
   *
   * Please note, if you use pageStart AND pageView, two events will be 
   * send and a page view will be counted twice.
   */ 
  pageView: function(page_id, params)
  {
    params              = params || {};
    params.content_type = 'page';
    params.page_id      = page_id;      
    this.track('view', 'content', params);
  }, 

  /** tracks a single view / page impression and sets the given page_id as
   * the present page viewed by the user. From hereon, ping-events will send
   * this page_id until the page impression is manually ended (by calling
   * pageEnd), another page is set with pageStart, or a call to sessionStart
   * happens.
   *
   * To indicate that the user has left this page or time shouldn't be tracked
   * any further, call pageEnd. pageEnd will be send automatically, if the 
   * user browses to another page where a new sessionStart or / pageStart is
   * called, or in case you do another call to pageStart within the same session,
   * for example, because you've loaded a second page using AJAX, thus, replacing
   * the old page, but not ending the page session.
   *
   * A usual implementation would have the following lines at the start of a page
   * inside a script tag:
   *   Sample.sessionStart();
   *   Sample.pageStart(your_page_id);
   *
   * An explicit call to pageEnd is not necessary, as each page uses these calls 
   * and thus would trigger an automatic page end.
   * 
   * If a pageStart is NOT ended, because for example the user closed the browser
   * tab, PSIORI will first accumulate the time of the time-stamps of ping events
   * including this page id, and, if there's not even a ping, would assume a 
   * default view time of 1s. 
   *
   * PSIORI will also give you the precentage of page-start events that were not
   * "closed" by an end-event.
   *
   * Please note that the more simple pageView call is a completely separated 
   * mechanism that does NOT interfere with pageStart / pageEnd and that you should 
   * NOT mix in your implementation, as it could lead to page views being counted 
   * twice. Use either pageStart/pageEnd OR pageView.
   */ 
  pageStart: function(page_id, params)
  {
    this.pageEnd({
      automatic: true
    }); // close a page that has been opened earlier.
    
    setPageId(page_id);
    this.pageView(page_id, params);
  },
  
  /** sends a view-end envent to indicate the user has left the present page. 
   * Will only send an event, if there's a page that has been "opened" with
   * a pageStart event and that hasn't been closed so far by a corresponding
   * pageEnd call. 
   */
  pageEnd: function(params)
  {
    var page_id = getPageId();
    
    if (page_id) 
    {
      params = params || {};
      params.page_id      = page_id;
      params.content_type = 'page';
      
      this.track('view-end', 'content', params);
      clearPageId();
    }
  },


  // /////////////////////////////////////////////////////////////////////////
  //
  //   PROGRESSION EVENTS
  //
  // /////////////////////////////////////////////////////////////////////////
  
  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   PURCHASE EVENTS
  //
  // /////////////////////////////////////////////////////////////////////////
  
  /** should be send when a user triggers a purchase 
    * A purchase event should take at minimum the product_id, provider(payment provider), gross, 
    * currency, country and the product_category. The product id is identical with the product 
    * sku.
    */
  purchase: function(product_id, params)
  {
    var userParams = params || {};
    userParams.pur_product_sku = product_id;
    this.track('purchase', 'revenue', userParams);
  },
  
  /** should be send when a users charges his money back
    * A chargeback event should take at minimum the product_id, provider(payment provider), gross,
    * currency, country and the product_category. The product id is identical with the product 
    * sku.
    */
  chargeback: function(product_id, params)
  {
    var userParams = params || {};
    userParams.product_sku = product_id;
    this.track('chargeback', 'revenue', userParams);
  },
  
  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   VIRTUAL CURRENCY EVENTS
  //
  // /////////////////////////////////////////////////////////////////////////
  
  
  
  isWebkit: (function() 
  {
    var memo = null;
    
    return function() 
    {
      if (memo === null) 
      {
        var ua = navigator.userAgent.toLowerCase(); 
        memo = ua.indexOf('safari') !== -1 || ua.indexOf('chrome') !== -1; 
      }
      return memo;
    };
  })(),
  
  isIE: (function() 
  {
    var memo = null;
    
    return function() 
    {
      if (memo === null) 
      {
        var ua = navigator.userAgent; 
        memo = (ua.indexOf('MSIE') !== -1 || ua.indexOf('Trident/') > 0);
      }
      return memo;
    };
  })(),

  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   Custom events
  //
  // /////////////////////////////////////////////////////////////////////////
  
  /** This function can be used to send custom Events 
  * an eventName has to be included. If the event is tied to some sort of
  * numeric value it can be passed with the key acc_value. If no accumulator value
  * is supplied the event will be ignored in min,max and accumulator computations.
  * However it will still be counted through the C_COUNT metric.
  */
  customEvent: function(eventName,params)
  {
    var userParams = params || {};
    this.track(eventName, 'custom', userParams);
  }

};

Sample.init();	
