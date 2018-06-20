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


var token = "p8f6yGGmnRj4K1cUKkYmij2g7";
var secret = "LJcZjHdzRplWqada6S2CSvaxzyfpOJ1804ym2CMQIwZ1irUxVW";


exports.getToken = function(){
  return token;
}
exports.getTokenSecret = function(){
  return secret;
}
