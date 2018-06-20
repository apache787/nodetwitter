/**
 * CSV Manager Module
 *
 * This module should handle receiving data, format to a csv,
 * save to a datestamped file, and return the fileName
 *
 * @author    Keith Blackard
**/
var fs = require('fs');

/**
 * @name saveCSV
 * @class Save a JSON string as CSV to an existing file
 *
 * @param {string} fileName is the fileName
 * @param {string} string is a JSON encoded string
 * @returns {string} string containing fileName saved to.
 * @example
 * saveCSV(JSON.stringify(object))
*/
exports.saveCSV = function(fileName,string){
  if(string){
    if(this.isStringJson(string)){
      var writeString = this.parseJson(string);
      fs.writeFile("./www/exports/"+fileName,writeString,function(error){
        if (error) throw error;
      });
      return fileName;
    } else {
      //Improperly formatted JSON
      return null;
    }
  } else {
    //received a null object
    return null;
  }
}

/**
 * @name appendCSV
 * @class Save a JSON string in CSV format
 *
 * @param {string} fileName is the fileName to save to
 * @param {string} string is a JSON encoded string
 * @returns {string} string containing fileName saved to.
 * @example
 * appendCSV("File.csv",JSON.stringify(object))
*/
exports.appendCSV = function(fileName,string){
  if(string && fileName){
    if(this.isStringJson(string)){
      var writeString = this.parseJson(string);
      fs.appendFile("./www/exports/"+fileName,writeString,function(error){
        if (error) throw error;
      });
      return fileName;
    } else {
      //Improperly formatted JSON
      return null;
    }
  } else {
    //received a null object
    return null;
  }
}

/**
 * @name isStringJson
 * @class check if an input is in json format
 *
 * @param {string} str is a JSON encoded string
 * @returns {boolean} true if JSON.parse is successful
 * @example
 * isStringJson(JSON.stringify(object))
*/
exports.isStringJson = function(str){
    if(!str && typeof str != 'string') return false;
    var text = str;
    try {
         text = JSON.parse(str);

    } catch (err) {
        console.log(err);
        return false;
    }
    return text != str;
}

/**
 * @name parseJson
 * @class translates a JSON string into a CSV formatted string per key value
 *    pair
 *
 * @param {string} str is a JSON encoded string
 * @returns {string} returns a csv string
 * @example
 * parseJson(JSON.stringify(object))
*/
exports.parseJson = function(str){
  try {
    var output = "";
    var json = JSON.parse(str);
    for(var i = 0; i<json.length; i++){
      var line = '';
      for(var key in json[i]){
        if (line != '') line += ','
        line += json[i][key];
      }
      output += line + '\r\n';
    }
    return output;
  } catch (error){
    return null;
  }
}
