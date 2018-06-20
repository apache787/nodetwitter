var assert = require('assert');
var twitterKeys = require('../../modules/twitterKeys');

describe('twitterKeysTest', function() {
  describe('getToken()', function() {
    it('Should not be null', function() {
      assert.equal(twitterKeys.getToken() != null, !null);
    });
    it('Should be longer than 0 characters', function() {
      assert.equal(twitterKeys.getToken().length > 0, true);
    });
  });
    describe('getTokenSecret()', function() {
      it('Should not be empty or null', function() {
        assert.equal(twitterKeys.getTokenSecret() != '', true);
      });
      it('Should be longer than 0 characters', function() {
        assert.equal(twitterKeys.getTokenSecret().length > 0, true);
      });
    });
});
