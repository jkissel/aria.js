/* global QUnit, aria */
// http://api.qunitjs.com/category/assert/

QUnit.fixture = () => document.getElementById('qunit-fixture');

QUnit.test('aria() returns an aria instance when given an element or a valid element ID, otherwise null', assert => {

	assert.ok(aria(QUnit.fixture()), 'Returns an aria instance when given an element');
	assert.ok(aria('qunit-fixture'), 'Returns an aria instance when given a valid element ID');

	assert.strictEqual(aria(), null, 'Returns null when given no parameters');
	assert.strictEqual(aria('invalid'), null, 'Returns null when given an invalid element ID');

});

QUnit.test('Only properties can be set whose corresponding attributes are defined in aria.attributes', assert => {

	aria.attributes.defined = {};

	let ariaInstance = aria(QUnit.fixture());

	assert.ok(ariaInstance.hasOwnProperty('defined'), 'An aria instance has a property which is defined');
	assert.ok(Object.getOwnPropertyDescriptor(ariaInstance, 'defined').set, 'That property can be set');

	ariaInstance.undefined = 'value';
	assert.notOk(ariaInstance.hasOwnProperty('undefined'), 'An undefined property cannot be added');

});

QUnit.test('Properties are proxies to the corresponding aria-prefixed element attributes', assert => {

	aria.attributes.label = {};

	let element = QUnit.fixture();
	let ariaInstance = aria(element);

	element.setAttribute('aria-label', 'value');
	assert.equal(ariaInstance.label, 'value', 'The value of the attribute is also the property value');

	ariaInstance.label = 'another value';
	assert.equal(element.getAttribute('aria-label'), 'another value', 'When assigning the property, the attribute value is also set');

});

QUnit.test('Values are converted using the get() and set() functions defined the attribute definition', assert => {

	aria.attributes.label = {
		get: attributeValue => attributeValue.slice(1, -1),
		set: value => `(${value})`
	};

	let element = QUnit.fixture();
	let ariaInstance = aria(element);

	element.setAttribute('aria-label', '(value)');
	assert.equal(ariaInstance.label, 'value', 'The attribute value is converted using get() before being returned as property value');

	ariaInstance.label = 'another value';
	assert.equal(element.getAttribute('aria-label'), '(another value)', 'A value assigned to the property is converted using set() before being set as attribute value');

});
