/* global QUnit, aria */
// http://api.qunitjs.com/category/assert/

QUnit.test('aria() returns an aria instance when given an element or a valid element ID, otherwise null', assert => {

	assert.ok(aria(document.getElementById('qunit-fixture')), 'Returns an aria instance when given an element');
	assert.ok(aria('qunit-fixture'), 'Returns an aria instance when given a valid element ID');

	assert.strictEqual(aria(), null, 'Returns null when given no parameters');
	assert.strictEqual(aria('invalid'), null, 'Returns null when given an invalid element ID');

});
