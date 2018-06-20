/**
 * Twitter Keys
 *
 * This module contains twitter's API keys.  The sole purpose of this module is
 * to allow hiding sensitive information from github.
 *
 * replace ACCESS_TOKEN with your Access Token
 * replace ACCESS_TOKEN_SECRET with your Access Token Secret
 *
 * @author    Keith Blackard
**/


var token = "ACCESS_TOKEN";
var secret = "ACCESS_TOKEN_SECRET";


exports.getToken = function(){
  return token;
}
exports.getTokenSecret = function(){
  return secret;
}
