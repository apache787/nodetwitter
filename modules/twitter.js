/**
 * Twitter Module
 *
 * This module should handle basic Twitter API Functions.  Main input should
 * receive a keyword and maximum number of tweets.  Then should parse the
 * returned data into a csv format.
 *
 * @author    Keith Blackard
 * @see       https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets.html
**/

const https = require('https');
const keys = require('./twitterKeys');
const oAuthAPI = {'host': 'api.twitter.com', 'path': '/oauth2/token'};
const requestAPI = {'host': 'api.twitter.com', 'path': '/1.1/search/tweets.json'};
const userAgent = 'nodetwitterIOT 1.0';

var bearerStore = null;


/**
 * @name findTweets
 * @class returns a twitter JSON object
 *
 * @param {string} keyword - the keyword to look for
 * @param {integer} max - maxiumum number of tweets to fetch
 * @param {callback} callback({string})
 * @example
 * findTweetsUsingNext(string,100,function(data){var json = data});
*/
exports.findTweets = function(keyword, max, callback){
  this.fetchAuthToken(function(bearer){
    var count = (max > 100 ? 100 : max); //Twitter's API allows max 100 items
    if(count < 3){
      count = 3; //Twitter's API seems to have a minimum of 3 in order to search
    }
    var options = {
      host: requestAPI['host'],
      path: requestAPI['path']+'?count='+count+'&q=?'+keyword+'&include_entities=1',
      method: 'get',
      headers: {
        'User-Agent': userAgent,
        'Authorization' : 'Bearer ' + bearer,
      },
    };
    https.get(options,function(response){
     response.setEncoding('utf8');
      let rawData = '';
      response.on('data', function(chunk){
        rawData += chunk;
      });
      response.on('end', function(){

        var json = JSON.parse(rawData);
        if(json['statuses'].length > 0){
          callback(null,json);
        } else {

          var error = 'No tweets retreived';
          callback(error,json);
        }
      });
    }).on('error', (error) => {
      console.error(error);
    });
  });
}

/**
 * @name findTweetsAfter
 * @class returns a twitter JSON object after a tweet id
 *
 * @param {string} from - a string containing tweet id, need to subtract 1
 * to get id to search.  Exclusive search
 * @param {string} keyword - a string containing tweet id
 * @param {integer} max - maxiumum number of tweets to fetch
 * @param {callback} callback({string})
 * @example
 * findTweetsAfter("101010","keywords",100,function(data){var json = data});
*/
exports.findTweetsAfter = function(from,keyword,max,callback){
  var count = (max > 100 ? 100 : max); //Twitter's API allows max 100 items
  if(count < 3){
    count = 3; //Twitter's API seems to have a minimum of 3 in order to search
  }
  this.fetchAuthToken(function(bearer){
    var options = {
      host: requestAPI['host'],
      path: requestAPI['path']+'?max_id='+subtractInt64(from)+'&count='+count+'&q=?'+keyword+'&include_entities=1',
      method: 'get',
      headers: {
        'User-Agent': userAgent,
        'Authorization' : 'Bearer ' + bearer,
      },
    };
    https.get(options,function(response){
     response.setEncoding('utf8');
      let rawData = '';
      response.on('data', function(chunk){
        rawData += chunk;
      });
      response.on('end', function(){
        var json = JSON.parse(rawData);
        if(json['statuses'].length > 0){
          callback(null,json);
        } else {
          var error = 'No tweets retreived';
          callback(error,json);
        }
      });
    }).on('error', (error) => {
      console.error(error);
    });
  });
}

/**
 * @name fetchAuthToken
 * @class returns bearer token or calls twitter's API and retreives it
 *
 * @param {callback} callback({string})
 * @example
 * fetchAuthToken(function(token){var bearer = token});
*/
exports.fetchAuthToken = function(callback){
  if(bearerStore != null) return callback(bearerStore);
  var base64 = Buffer.from(keys.getToken() + ':' + keys.getTokenSecret(), 'utf8').toString('base64');
  var body = 'grant_type=client_credentials';
  var options = {
    host: oAuthAPI['host'],
    path: oAuthAPI['path'],
    method: 'post',
    headers: {
      'User-Agent': userAgent,
      'Authorization' : 'Basic ' + base64,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Content-Length': body.length,
    },
  }
 var request = https.request(options,function(response){
    response.on('data', function(data){
      var token = JSON.parse(Buffer.from(data).toString('utf8'));
      bearerStore = token['access_token'];
      callback(bearerStore);
    });
  }).on('error', function(error){
    console.error(error);
  });
  request.write(body);
  request.end();
}

/**
 * @name extractTweets
 * @class extract tweets from a Twitter response object
 *
 * For documentation example json structure
 * @see https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/intro-to-tweet-json
 *
 * @param {JSON} json is a JSON object from twitter
 * @returns {string} string containing filename saved to.
 * @example
 * extractTweets(JSON.parse(object))
 *
*/
exports.extractTweets = function(json){
  var extracted = [{}];
  for(var i = 0; i < json['statuses'].length; i++){
    var id = json.statuses[i].id_str;
    var user_id = json.statuses[i].user.id_str;
    var user_name = json.statuses[i].user.name;
    var user_screen_name = json.statuses[i].user.screen_name;
    var text = escape(json.statuses[i].text);
    extracted[i] = {
      "id" : '"'+id+'"',
      "text" : '"'+text+'"',
      "user_id" : '"'+user_id+'"',
      "user_name" : '"'+user_name+'"',
      "user_screen_name" : '"'+user_screen_name+'"'
    };
  }
  return JSON.stringify(extracted);
}

/**
 * @name escape
 * @class excapes quotations, which causes problems with intepreting csv files
 *
 * @param {string} string to be escaped;
 * @returns {string} string containing filename saved to.
 * @example
 * escape('There was "quotes" here')
*/
function escape(string){
  return string.replace(/"/g , "&quot;");
}

/**
 * @name subtractInt64
 * @class take a 64bit integer string, slice it up into processable 32bit
 *   integers, subtract by one, and stitch back together
 *
 * @param {string} int64 to be subracted from, expecting values > 1
 * @returns {string} a int64 minus one, or 0
 *    ** 0 should be impossible to reach since we only have access to the
 *       last 7 days of tweets.
 * @example
 * subtractInt64('1008860206615416832');
*/
function subtractInt64(int64){
  var mid = Math.floor(int64.length/2);
  var high = int64.substring(0,mid);
  var low = int64.substring(mid);
  var highInt = new Number(high);
  var lowInt = new Number(low);

  if (lowInt == 0){
    if (highInt == 0){
      return '0';
    } else {
      return (highInt-1).toString()+(new Number('1'+low)-1);
    }
  } else {
    var newLowStr = (lowInt-1).toString();
    //Add Leading Zeros incase something cascaded
    while (newLowStr.length < low.length) {
      newLowStr = '0'+ newLowStr;
    }
    return high+newLowStr;
  }
}
