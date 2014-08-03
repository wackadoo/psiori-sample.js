define(function(require) 
{
  describe('Sample', function() 
  {
    it('should set constants correctly', function () 
    {
      Sample.PLATFORM_IOS.should.equal('ios');
      Sample.PLATFORM_WINDOWS.should.equal('windows');
      Sample.PLATFORM_BROWSER.should.equal('browser');
      Sample.PLATFORM_ANDROID.should.equal('android');
    });

    describe('#init', function () 
    {
      it('should be called automatically during loading', function () 
      {
        should.exist(installToken); // init sets install token
      });

      it('should fill necessary tokens', function () 
      {
        localStorage.removeItem('SampleToken');
        sessionStorage.removeItem('SampleToken');
        
        Sample.init();
        
        should.exist(installToken);
        should.exist(sessionToken);
        should.exist(platform);
        platform.should.equal(Sample.PLATFORM_BROWSER);
      });
      
      
      it('should not change already existing tokens', function () 
      {
        Sample.init(); 
        
        should.exist(installToken);
        should.exist(sessionToken);
        
        var itoken = installToken;
        var stoken = sessionToken;
        
        Sample.init();
        
        itoken.should.equal(installToken);
        stoken.should.equal(sessionToken);
      });
    });        


    describe('#getEndpoint', function () 
    {
      it('should return a string', function () 
      {
        Sample.getEndpoint().should.be.a('string');
      });
    }); 
    
    describe('#setEndpoint', function () 
    {
      it('should change endpoint value', function () 
      {
        Sample.setEndpoint("myendpoint");
        Sample.getEndpoint().should.equal('myendpoint');
      });
    }); 
    
    describe('#setAppToken', function () 
    {
      it('should change internal appToken value', function () 
      {
        Sample.setAppToken("token");
        appToken.should.equal('token');
      });
    });
    
    describe('#setModule', function () 
    {
      it('should change internal module value', function () 
      {
        Sample.setModule("module");
        module.should.equal('module');
      });
    });

    describe('#setUserId', function () 
    {
      it('should change internal userId value', function () 
      {
        Sample.setUserId("userId");
        userId.should.equal("userId");
      });
    });    

    describe('#setEmail', function () 
    {
      it('should change internal email value', function () 
      {
        Sample.setEmail("email");
        email.should.equal('email');
      });
    });              
    
    describe('#setDebug', function () 
    {
      it('should change debug value', function () 
      {
        Sample.setDebug(true);
        debug.should.equal(true);
        Sample.setDebug(false);
        debug.should.equal(false);
      });
    });
    
    describe('#[start|End]Group', function () 
    {
      it('should change set value in connector', function () 
      {
        Sample.endGroup();
        connector.isGroup().should.equal(false);
        Sample.startGroup();
        connector.isGroup().should.equal(true);
        Sample.endGroup();
        connector.isGroup().should.equal(false);
      });
    });
    
    describe('#[stop|resume]', function () 
    {
      it('should change set value in connector', function () 
      {
        Sample.resume();
        connector.isRunning().should.equal(true);
        Sample.stop();
        connector.isRunning().should.equal(false);
        Sample.resume();
        connector.isRunning().should.equal(true);
      });
    });
    
    var injectTrack = function(injectFunc, testFunc) 
    {
      var original = connector.add;
      
      connector.add = injectFunc;
      testFunc();
      
      connector.add = original;
    };
    
    describe('#track', function () 
    {
      it('should send event an event to connector', function () 
      {
        var haveBeenCalled = false;
        
        injectTrack(function(params, callback) {
          params.event_name.should.equal('trackEvent');
          haveBeenCalled = true;
        }, function() {
          Sample.track('trackEvent', null);
          haveBeenCalled.should.equal(true);
        });
      });

      it('should merge event parameters', function () 
      {
        var haveBeenCalled = false;
        
        injectTrack(function(params, callback) {
          params.content_id.should.equal(99);
          haveBeenCalled = true;
        }, function() {
          Sample.track('trackEvent', { content_id: 99});
          haveBeenCalled.should.equal(true);
        });
      });
    });
    
    describe('#sessionStart', function () 
    {
      it('should send sessionStart event to connector', function () 
      {
        var haveBeenCalled = false;
        
        injectTrack(function(params, callback) {
          params.event_name.should.equal('session_start');
          params.event_category.should.equal('session');
          haveBeenCalled = true;
        }, function() {
          Sample.sessionStart();
          haveBeenCalled.should.equal(true);
        });
      });
    });
    
    describe('#sessionUpdate', function () 
    {
      it('should send sessionUpdate event to connector', function () 
      {
        var haveBeenCalled = false;
        
        injectTrack(function(params, callback) {
          params.event_name.should.equal('session_update');
          params.event_category.should.equal('session');
          haveBeenCalled = true;
        }, function() {
          Sample.sessionUpdate();
          haveBeenCalled.should.equal(true);
        });
      });
    });
    
    describe('#ping', function () 
    {
      it('should send ping event to connector', function () 
      {
        var haveBeenCalled = false;
        
        injectTrack(function(params, callback) {
          params.event_name.should.equal('ping');
          params.event_category.should.equal('session');
          haveBeenCalled = true;
        }, function() {
          Sample.ping();
          haveBeenCalled.should.equal(true);
        });
      });
    });
    
    describe('#autoping', function () 
    {
      it('should schedule ping timer', function () 
      {
        autoping = null;
        Sample.autoPing(60);
        should.exist(autoping);
      });
      
      it('should stop ping timer on non-positive argument', function () 
      {
        Sample.autoPing(60);
        should.exist(autoping);
        Sample.autoPing(0);
        should.not.exist(autoping);
      });
      
      it('should schedule ping timer if no argument given', function () 
      {
        Sample.autoPing(0);
        should.not.exist(autoping);
        Sample.autoPing();
        should.exist(autoping);
      });
    });
    
    describe('#contentUsage', function () 
    {
      it('should send correct event for single content to connector', function () 
      {
        var haveBeenCalled = false;
        
        injectTrack(function(params, callback) {
          params.event_name.should.equal('usage');
          params.event_category.should.equal('content');
          params.content_type.should.equal('content');
          params.content_id.should.equal(99);
          haveBeenCalled = true;
        }, function() {
          Sample.contentUsage(99);
          haveBeenCalled.should.equal(true);
        });
      });
      
      it('should send correct event for single page to connector', function () 
      {
        var haveBeenCalled = false;
        
        injectTrack(function(params, callback) {
          params.event_name.should.equal('usage');
          params.event_category.should.equal('content');
          params.content_type.should.equal('page');
          params.content_id.should.equal(88);
          haveBeenCalled = true;
        }, function() {
          Sample.contentUsage(88, 'page');
          haveBeenCalled.should.equal(true);
        });
      });
      
      it('should send correct event for multiple contents to connector', function () 
      {
        var haveBeenCalled = false;
        
        injectTrack(function(params, callback) {
          params.event_name.should.equal('usage');
          params.event_category.should.equal('content');
          params.content_type.should.equal('content');
          
          should.not.exist(params.content_id);
          
          params.should.have.property("content_ids").of.length(2);
          
          params.content_ids[0].should.equal(88);
          params.content_ids[1].should.equal(99);

          haveBeenCalled = true;
        }, function() {
          Sample.contentUsage([88, 99], 'content');
          haveBeenCalled.should.equal(true);
        });
      });      
    });
    
    describe('#isWebkit', function () 
    {
      it('should detect safari and chrome', function () 
      {
        var ua = navigator.userAgent.toLowerCase(); 
        var target = ua.indexOf('safari') !== -1 || ua.indexOf('chrome') !== -1;
        Sample.isWebkit().should.equal(target);
      });
    });
  });
  
  describe('Helpers', function() 
  {
    describe('#randomToken', function () 
    {
      it('should return a string', function () 
      {
        randomToken(12).should.be.a('string');
      });
      
      it('should place a delimiter char every four digits', function () 
      {
        randomToken(4).should.have.length(4);
        randomToken(5).should.have.length(6);
        randomToken(6).should.have.length(7);
        randomToken(7).should.have.length(8);
        randomToken(8).should.have.length(9);
        randomToken(9).should.have.length(11);
      });
      
      it('should use "-" as delimiter', function () 
      {
        randomToken(12)[4].should.equal('-');
      });
    });
    
    describe('#mergeParams', function () 
    {
      it('should only add values that are non-null', function () 
      {
        var params = { content_id: 99 };
        appToken = "myToken";
        userId = null;
        
        var result = mergeParams(params, "event");
        
        result.app_token.should.equal("myToken");
        result.content_id.should.equal(99);
        should.not.exist(result.user_id);
        should.not.exist(result.content_ids);
      });
      
      it('should add some values only to sessionStart and Update', function () 
      {
        var params = { email: "test@test.com" };
        Sample.setPlatform(Sample.PLATFORM_IOS);
        
        should.not.exist(mergeParams(params, "event").platform);
        should.not.exist(mergeParams(params, "event").email);

        should.exist(mergeParams(params, "sessionStart").platform);
        should.exist(mergeParams(params, "sessionStart").email);

        should.exist(mergeParams(params, "sessionUpdate").platform);
        should.exist(mergeParams(params, "sessionUpdate").email);
        
        mergeParams(params, "sessionUpdate").platform.should.equal(Sample.PLATFORM_IOS);     
      });  
      
      it('should add necessary values', function () 
      {
        var params = { };
        
        should.exist(mergeParams(params, "event").install_token);
        should.exist(mergeParams(params, "event").session_token);
        should.exist(mergeParams(params, "event").timestamp);
        
        mergeParams(params, "event").install_token.should.equal(installToken);
        mergeParams(params, "event").session_token.should.equal(sessionToken);
      });    
    });
  });

});
 

 
 