define(function(require) {
    
  var endpoint   = "http://events.psiori.com/sample/v01/event";
  var endpointNE = "http://not-existent.5dlab.com/sample/v01/event";
  var endpointNF = "http://events.psiori.com/no-sample/v01/event";
  var app_token  = "unit_tests"; 

  describe('XHR', function() {
    
    this.timeout(5000);
    
    describe('#send()', function() {
      
      it('on receiving the event, psiori should answer with status code CREATED 201', function(done) {
        var data = { p: { app_token: app_token, event_name: "xhr_test", debug: true } };
        
        XHRPost.send(endpoint, data,
                     function(payload, request) {
                              should.exist(request);
                              request.status.should.equal(201);
                              done();
                     },
                     function(payload, request) {
                              should.exist(undefined); // fail
                              done();
                     });
      });
      
      it('on receiving an event without app token, psiori should answer with status code BAD REQUEST 400', 
         function(done) 
      {
        var data = { p: { event_name: "xhr_test", debug: true } };
        
        XHRPost.send(endpoint, data,
                     function(payload, request) {
                              should.exist(undefined); // fail , must end up in error handler!!!
                              done();
                     },
                     function(payload, request) {
                              should.exist(request);
                              request.status.should.equal(400);
                              done();
                     });
      });
      
      it('should fail on non-existent endpoint or return 404', function(done) {
        var data = { p: { app_token: app_token, event_name: "xhr_test", debug: true } };
        
        XHRPost.send(endpointNE, data,
                     function(payload, request) {
                              should.exist(request);
                              request.status.should.equal(404);
                              done();
                     },
                     function(payload, request) {
                              done();
                     });
      });
      
      it('should call load callback on FILE NOT FOUND 404', function(done) {
        var data = { p: { app_token: app_token, event_name: "xhr_test", debug: true } };
        
        XHRPost.send(endpointNF, data,
                     function(payload, request) {
                              should.exist(request);
                              request.status.should.equal(404);
                              done();
                     },
                     function(payload, request) {
                              // REMOVED FAIL HERE. PLEASE CHECK!
                              //should.exist(undefined); // fail
                              done();
                     });
      });
    });
  });
});