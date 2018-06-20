var assert = require('assert');
var csvManager = require('../modules/csvManager');
var twitterKeys = require('../modules/twitterKeys');
var twitter = require('../modules/twitter');

describe('Twitter Call And Save To CSV', function() {
  this.timeout(20000);
  describe('findTweets(keyword,count,callback)', function() {
    it('Should generate a search request and save to a file', function(done) {
      var fileName = "Save100.csv";
      twitter.findTweets('#IOT',100,function(error,tweets){
        var next = tweets['search_metadata']['next_results'];
        if(error) done(error)
        else if (tweets){;
          var extracted = twitter.extractTweets(tweets);
          var location = csvManager.saveCSV(fileName,extracted);
          console.log('Saved '+tweets['statuses'].length+' Tweets to: '+location);
          done();
        }
        else done("Tweets were not found");
      });
    });
      it('Should generate multiple search request and save to a single file', function(done) {
        var max = 150;
        var keyword = '#IOT%20-filter:retweets';
        var fileName = "Save150.csv";
        console.log('Starting to find '+max+' Tweets');
        twitter.findTweets(keyword,max,function(error,tweets){
          if(error) done(error)
          else if ('statuses' in tweets){;
            var extracted = twitter.extractTweets(tweets);
            fileName = csvManager.saveCSV(fileName,extracted);
            var found = tweets['statuses'].length;
            console.log('Saved '+found+' Tweets to: '+fileName);
            searchForMore(tweets['statuses'][found-1]['id_str'],keyword, max-found,fileName,function(error){
              done(error);
            });
          }
          else done("Tweets were not found");
        });
      });
  });
});

function searchForMore(next,keyword,countRemaining,fileName,callback){
  console.log('finding up to '+( countRemaining > 100 ? 100 : countRemaining )+' out of '+countRemaining+' more using id: '+next);
  twitter.findTweetsAfter(next,keyword,countRemaining,function(error,tweets){
    if (error == null && 'statuses' in tweets){
      var extracted = twitter.extractTweets(tweets);
      csvManager.appendCSV(fileName,extracted);
      var found = tweets['statuses'].length;
      console.log('Saved '+found+' Tweets to: '+fileName);
      if(found < countRemaining){
        var foundNext = tweets['search_metadata']['next_results'];
        searchForMore(tweets['statuses'][found-1]['id_str'],keyword,(countRemaining-found),fileName,callback);
      } else {
        callback();
      }
    } else {
      callback("did not return an object");
    }
  });
}
