var assert = require('assert');
var twitter = require('../../modules/twitter');

var json = '';

describe('twitterTests', function() {
  describe('fetchAuthToken(callback)', function(){
    var stored_bearer = '';
    it('should return bearer string', function(done){
      twitter.fetchAuthToken(function(bearer){
        if (typeof bearer == 'string' && bearer.length>0){stored_bearer = bearer; done();}
        else done("Bearer not valid");
      });
    });
      it('should return matching stored bearer munch faster', function(done){
        twitter.fetchAuthToken(function(bearer){
          if (typeof bearer == 'string' && bearer.length>0 && bearer == stored_bearer) done();
          else done("Bearer did not match previous stored");
        });
      });
  });
  describe('findTweets(keyword,max,callback)', function() {
    it('should return a json object of tweets with a key called "statuses"', function(done) {
      twitter.findTweets('#IOT',100,function(error,tweets){
        if(error) done(error)
        else if (typeof tweets == 'object' && 'statuses' in tweets){ json = tweets; done();}
        else done("Tweets were not found");
      });
    });
  });
  describe('findTweetsUsingNext(string,max,callback)', function() {
    it('should return a json object of tweets with a key called "statuses"', function(done) {
      twitter.findTweetsAfter('1008860206615416831','%3F%23IOT',100,function(error,tweets){
        if(error) done(error);
        else if (typeof tweets == 'object' && 'statuses' in tweets){ done();}
        else done("Tweets were not found");
      });
    });
  });
  describe('extractTweets(json)', function() {
    it('should return an string', function() {
      assert.equal(typeof twitter.extractTweets(json),'string');
    });
  });
});
