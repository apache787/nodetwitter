
/**
 * @name generateRequest
 *
 * This is used to launch a JQuery ajax request
*/
function generateRequest(keyword,count,includeRT){
  //This is used to generate a unique id by user's browser and current time
  var id = (navigator.userAgent+Math.random()+new Date().getMilliseconds()).hashCode();
  $('#console').append('<p>Launching request '+id+' for <br />**Keyword: '+keyword+'<br />**Total: '+count+'<br />**Include Retweets?: '+keyword+'</p>');
  jQuery.ajax({
    url: '/getTweets.json',
    data: '{"requestID" : "'+id+'","keyword" : "'+keyword+'","count" : "'+count+'","includeRT" : "'+keyword+'"}',
    dataType: "json",
    method: "POST",
    success: handleResponse
  });
}

/**
 * @name handleResponse
 *
 * This is used to output the server responses to the HTML console panel
*/
function handleResponse(response){
  $('#console').append('<p>Request '+response.requestID+' returned:<br /><a target="_blank" href="/exports/'+response.fileName+'">Download '+response.fileName+'</a></p>');
  $('html, body').scrollTop($(document).height());
}


/**
 * @name hashCode
 *
 * This is used to generate a pseudorandom Request String that is unique
 *
 * @function returns a hashed integer of a string.
*/
String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
