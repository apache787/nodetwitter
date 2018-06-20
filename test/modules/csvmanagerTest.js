var assert = require('assert');
var csvmanager = require('../../modules/csvManager');

var csvText = '[{"string":"Value","number":"1"},{"string":"Value2","number":"2"}]';
var fileName = new Date() + ".csv";

describe('csvManagerTest', function() {
  describe('isStringJson()', function() {
    it('Should return true', function() {
      assert.equal(csvmanager.isStringJson('[{"string":"Value"}]'), true);
    });
    it('Should return false', function() {
      assert.equal(csvmanager.isStringJson(null), false);
    });
  });
    describe('parseJson()', function() {
      it('Should return "Value,1"', function() {
        assert.equal(csvmanager.parseJson(csvText), "Value,1\r\nValue2,2\r\n");
      });
      it('Should return null', function() {
        assert.equal(csvmanager.parseJson(null), null);
      });
    });
  describe('saveCSV()', function() {
    it('Should return the current date+".csv" when run', function() {
      assert.equal(csvmanager.saveCSV(fileName,csvText), fileName);
    });
    it('Should return null when given a value', function() {
      assert.equal(csvmanager.saveCSV(fileName,-1), null);
    });
    it('Should return null when given null', function() {
      assert.equal(csvmanager.saveCSV(null,null), null);
    });
  });
  describe('appendCSV()', function() {
    it('Should return the "appendfile.csv" when run', function() {
      assert.equal(csvmanager.appendCSV("appendfile.csv",csvText), "appendfile.csv");
    });
    it('Should return the "appendfile.csv" when run again', function() {
      assert.equal(csvmanager.appendCSV("appendfile.csv",csvText), "appendfile.csv");
    });
  });
});
