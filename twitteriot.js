/**
 * Twitter IOT Assignment
 *
 * Use the twitter API (https://developer.twitter.com/en/docs.html) to gather
 * 2000 unique tweets with the hashtag #IOT and output them to a CSV file.
 * Implement this solution with concurrency in some way.
 *
 * Implemented using basic node.js libraries, and Mocha for unit testing.
 *
 * Create a server that waits for
 *
 * @author    Keith Blackard
**/


var http = require('http');
var fs = require('fs');
var path = require('path');
var events = require('events');
var csvManager = require('./modules/csvManager');
var twitterKeys = require('./modules/twitterKeys');
var twitter = require('./modules/twitter');

var eventEmitter = new events.EventEmitter();

//Simple File Server
http.createServer(function (request, response) {

  //we only want files in www to be served, everything else should be hidden
  var filePath = './www' + request.url;
  if (filePath.endsWith('/')) filePath += 'index.html';

  console.log('request at: '+filePath);

  //Discover the content type that is being requested
  var extname = path.extname(filePath);
  var contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'text/json';
      break;
    case '.csv':
      contentType = 'text/csv';
      break;
    default:
      contentType = 'text/html';
      break;
  }

  if(filePath == './www/getTweets.json'){
    //This is the path the server will respond to
    if(request.method == "POST"){
        serveJson(request, function(jsonData){
          if(jsonData.requestID && jsonData.keyword && jsonData.count && jsonData.includeRT){
            console.log('keyword:'+jsonData.keyword+', count:'+jsonData.count+', RT:'+jsonData.includeRT);
            //Check if we need to filter out ReTweets
            var query = jsonData.keyword + (jsonData.includeRT == 'false' ? '%20-filter:retweets':'');
            //Create a filename that is a combination of the date and the pseudorandomly generated requestID
            var fileName = new Date() + jsonData.requestID + '.csv';
            search(query,jsonData.count,fileName,function(error,fileName){
              if(error){
                //Whoops, something happened, write the error
                response.writeHead(500, { 'Content-Type': contentType });
                response.end('{ "status":"failed", "reason": "'+error+'" }');
              } else {
                //A filename was returned to us.  CSV created, time to respond to request
                response.writeHead(200, { 'Content-Type': contentType });
                response.end('{ "status":"success", "requestID": '+jsonData.requestID+', "fileName": "'+fileName+'"}');
              }
            });
          } else {
            //Whoops, there was post data, but not enough information was found to make a request
            response.writeHead(400);
            response.end('{ "status":"failed", "reason":"Malformed Request Encountered"}');
          }
        });
    } else {
      //This is our response if no POST data was submitted
      response.writeHead(200, { 'Content-Type': contentType });
      response.end('{ "status":"failed", "reason":"No POST data found.", "requestID": "undefined" }');
    }
  } else {
    //Replace HTML space entities with normal spaces so operating system can fetch
    filePath = filePath.replace(/\%20/g , ' ');
    fs.readFile(filePath, function (error, data) {
      if (error){
        if(error.code == "ENOENT" || error.code == "EISDIR"){
          //No file or No directories found
          response.writeHead(404);
          response.end('Error: 404 encountered');
        } else {
          //Something else happened!  Write out the error.
          response.writeHead(500)
          response.end('Error: '+error.code+' encountered');
        }
      } else {
        //We found the requested file, serve it.
        response.writeHead(200, { 'Content-Type': contentType });
        response.end(data, 'utf-8');
      }
    });
  }

}).listen(8080);

/**
 * @name serveJson
 * @class Receive POST data and callback.
 *
 * @param {object} request has data to parse
 * @param {function} callback return with a JSON object.
*/
function serveJson(request, callback){
  let body = '';
  request.on('data', function(chunk){
    body += chunk.toString();
  });
  request.on('end', function(){
    callback(JSON.parse(body));
  });
}

/**
 * @name search
 * @class search for Tweets and save them to a CSV
 *
 * @param {string} keyword has the query we are going to call
 * @param {integer} count is how many tweets we want to save.
 * @param {string} fileName has the fileName we want to save to
 * @param {function} callback return with a JSON object.
*/
function search(keyword,count,fileName,callback){
  twitter.findTweets(keyword,count,function(error,tweets){
    if(error) done(error)
    else if ('statuses' in tweets){ //Indicates if there are tweets to sort
      var extracted = twitter.extractTweets(tweets);
      csvManager.saveCSV(fileName,extracted); //Save to file
      var found = tweets['statuses'].length;
      console.log('Saved '+found+' Tweets to: '+fileName);
      if(found!= 0 && found < count){ //if we found nothing, we reached the end
        searchForMore(tweets['statuses'][found-1]['id_str'],keyword, count-found,fileName,function(error,fileName){
          if(error) callback(error,fileName)
          else callback(null,fileName);
        });
      } else {
        callback(null,fileName); // We found the end, time to return to the top
      }
    }
    else callback("Tweets were not found",null); // No Tweets found!
  });
}

/**
 * @name searchForMore
 * @class sub call for search.  Append any Tweets found to CSV file
 *
 * @param {object} request has data to parse
 * @param {function} callback return with a JSON object.
*/
function searchForMore(next,keyword,countRemaining,fileName,callback){
  console.log('finding up to '+(countRemaining > 100 ? 100 : countRemaining)+' out of '+countRemaining+' more using id: '+next);
  twitter.findTweetsAfter(next,keyword,countRemaining,function(error,tweets){
    if (error == null && 'statuses' in tweets){ //Indicates if there are tweets to sort
      var extracted = twitter.extractTweets(tweets);
      csvManager.appendCSV(fileName,extracted);
      var found = tweets['statuses'].length;
      console.log('Saved '+found+' Tweets to: '+fileName);
      if( found != 0 && found < countRemaining){
        var foundNext = tweets['search_metadata']['next_results'];
        searchForMore(tweets['statuses'][found-1]['id_str'],keyword,(countRemaining-found),fileName,callback);
      } else {
        //Found the end of our search
        callback(null,fileName);
      }
    } else {
      callback("did not return an object",fileName); // There is also a world where this gets called.
    }
  });
}
