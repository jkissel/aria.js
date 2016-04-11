/* global QUnit, aria */
// http://api.qunitjs.com/category/assert/

QUnit.fixture = () => document.getElementById('qunit-fixture');

QUnit.testDone(() => QUnit.fixture().aria = null);

QUnit.test('aria() returns an aria instance when given an element or a valid element ID, otherwise null', assert => {

	assert.ok(aria(QUnit.fixture()) instanceof aria, 'Returns an aria instance when given an element');
	assert.ok(aria('qunit-fixture') instanceof aria, 'Returns an aria instance when given a valid element ID');

	assert.strictEqual(aria(), null, 'Returns null when given no parameters');
	assert.strictEqual(aria('invalid'), null, 'Returns null when given an invalid element ID');

});

QUnit.test('aria() caches the aria instance', assert => {

	let element = QUnit.fixture();

	assert.ok(aria(element) === aria(element), 'Returns the same aria instance when given the same element again');

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

QUnit.test('When assigning null (or undefined) to the property, the element attribute is removed', assert => {

	aria.attributes.label = {};

	let element = QUnit.fixture();

	element.setAttribute('aria-label', 'value');
	aria(element).label = null;
	assert.notOk(element.hasAttribute('aria-label'), 'The attribute was removed');

});

QUnit.test('Attributes are mapped to their type', (assert) => {

	let ariaInstance = aria(QUnit.fixture());

	// control samples
	assert.strictEqual(ariaInstance.hidden, false, 'Sample 1');
	assert.deepEqual(ariaInstance.dropeffect, [ 'none' ], 'Sample 2');

});

QUnit.module('Error handling', () => {

	aria.attributes.errorTest = {
		get: (attributeValue) => {
			if (attributeValue == null) {
				return 'default';
			}
			if (attributeValue == 'error') {
				throw new Error();
			}
			throw new TypeError();
		},
		set: function (value) {
			if (value == 'error') {
				throw new Error();
			}
			throw new TypeError();
		}
	};

	var element = QUnit.fixture();
	var ariaInstance = aria(element);

	QUnit.test('get()', (assert) => {
		element.setAttribute('aria-errorTest', 'invalid');
		assert.strictEqual(ariaInstance.errorTest, 'default', 'Returns the default value for an invalid attribute value');

		element.setAttribute('aria-errorTest', 'error');
		assert.throws(() => ariaInstance.errorTest, Error, 'Throws errors which are not TypeErrors');
	});

	QUnit.test('set()', (assert) => {
		element.setAttribute('aria-errortest', 'default');
		ariaInstance.errorTest = 'invalid';
		assert.strictEqual(element.getAttribute('aria-errortest'), 'default', 'Does not apply an invalid value');

		assert.throws(() => ariaInstance.errorTest = 'error', Error, 'Throws errors which are not TypeErrors');
	});

});

QUnit.module('aria.types.trueFalse', () => {

	let type = aria.types.trueFalse();

	QUnit.test('get()', assert => {
		assert.strictEqual(type.get('true'), true, 'Returns true for "true"');
		assert.strictEqual(type.get('false'), false, 'Returns false for "false"');
		assert.strictEqual(type.get(null), false, 'Returns false for null');
		assert.throws(() => type.get('string'), TypeError, 'Throws TypeError for any other string');
	});

	QUnit.test('set()', assert => {
		assert.strictEqual(type.set(true), 'true', 'Returns "true" for true');
		assert.strictEqual(type.set(false), 'false', 'Returns "false" for false');
		assert.strictEqual(type.set(1), 'true', 'Returns "true" for truthy');
		assert.strictEqual(type.set(0), 'false', 'Returns "false" for falsy');
	});

});

QUnit.module('aria.types.tristate', () => {

	let type = aria.types.tristate();

	QUnit.test('get()', assert => {
		assert.strictEqual(type.get('true'), true, 'Returns true for "true"');
		assert.strictEqual(type.get('false'), false, 'Returns false for "false"');
		assert.strictEqual(type.get('mixed'), 'mixed', 'Returns "mixed" for "mixed"');
		assert.strictEqual(type.get(null), undefined, 'Returns undefined for null');
		assert.throws(() => type.get('string'), TypeError, 'Throws TypeError for any other string');
	});

	QUnit.test('set()', assert => {
		assert.strictEqual(type.set(true), 'true', 'Returns "true" for true');
		assert.strictEqual(type.set(false), 'false', 'Returns "false" for false');
		assert.strictEqual(type.set(1), 'true', 'Returns "true" for truthy');
		assert.strictEqual(type.set(0), 'false', 'Returns "false" for falsy');
		assert.strictEqual(type.set('mixed'), 'mixed', 'Returns "mixed" for "mixed"');
	});

});

QUnit.module('aria.types.trueFalseUndefined', () => {

	let type = aria.types.trueFalseUndefined();

	QUnit.test('get()', assert => {
		assert.strictEqual(type.get('true'), true, 'Returns true for "true"');
		assert.strictEqual(type.get('false'), false, 'Returns false for "false"');
		assert.strictEqual(type.get(null), undefined, 'Returns undefined for null');
		assert.throws(() => type.get('string'), TypeError, 'Throws TypeError for any other string');
	});

	QUnit.test('set()', assert => {
		assert.strictEqual(type.set(true), 'true', 'Returns "true" for true');
		assert.strictEqual(type.set(false), 'false', 'Returns "false" for false');
		assert.strictEqual(type.set(1), 'true', 'Returns "true" for truthy');
		assert.strictEqual(type.set(0), 'false', 'Returns "false" for falsy');
	});

});

QUnit.module('aria.types.idReference', () => {

	let type = aria.types.idReference();

	QUnit.test('get()', assert => {
		assert.strictEqual(type.get('qunit-fixture'), QUnit.fixture(), 'Returns the referenced element');
		assert.strictEqual(type.get('invalid'), null, 'Returns null for an invalid reference');
		assert.strictEqual(type.get('41'), null, 'Returns null for an invalid ID');
		assert.strictEqual(type.get(null), null, 'Returns null for null');
	});

	QUnit.test('set()', assert => {
		assert.strictEqual(type.set('ID'), 'ID', 'Returns a given string');
		assert.strictEqual(type.set(QUnit.fixture()), 'qunit-fixture', 'Returns the ID of a given element');
		assert.strictEqual(type.set(document.body), '', 'Returns an empty string for an element without an ID');
		assert.throws(() => type.set(true), TypeError, 'Throws TypeError for any other value');
	});

});

QUnit.module('aria.types.integer', () => {

	let type = aria.types.integer();

	QUnit.test('get()', assert => {
		assert.strictEqual(type.get('42'), 42, 'Returns the number parsed from a given string');
		assert.strictEqual(type.get('3.6'), 3, 'Removes decimal places from that number');
		assert.strictEqual(type.get('-3.6'), -3, 'Does this correctly also for negative numbers');
		assert.ok(Number.isNaN(type.get(null)), 'Returns NaN for null');
	});

	QUnit.test('set()', assert => {
		assert.strictEqual(type.set(42), '42', 'Returns a string representation of a given number');
		assert.strictEqual(type.set( 3.6), '3', 'Removes decimal places from that number');
		assert.strictEqual(type.set(-3.6), '-3', 'Does this correctly also for negative numbers');
		assert.strictEqual(type.set('string'), 'NaN', 'Returns "NaN" for any other value');
	});

});

QUnit.module('aria.types.number', () => {

	let type = aria.types.number();

	QUnit.test('get()', assert => {
		assert.strictEqual(type.get('42'), 42, 'Returns the number parsed from a given string');
		assert.ok(Number.isNaN(type.get(null)), 'Returns NaN for null');
	});

	QUnit.test('set()', assert => {
		assert.strictEqual(type.set(42), '42', 'Returns a string representation of a given number');
		assert.strictEqual(type.set('string'), 'NaN', 'Returns "NaN" for any other value');
	});

});

QUnit.module('aria.types.string', () => {

	let type = aria.types.string();

	QUnit.test('get()', assert => {
		assert.strictEqual(type.get('string'), 'string', 'Returns a given string');
		assert.strictEqual(type.get(null), null, 'Returns null for null');
	});

	QUnit.test('set()', assert => {
		assert.strictEqual(type.set('string'), 'string', 'Returns a given string');
		assert.ok(typeof type.set(true) == 'string', 'Returns a string representation of any other value');
	});

});

QUnit.module('aria.types.token', () => {

	let type = aria.types.token([ 'foo', 'bar' ]);
	let trueFalse = aria.types.token([ 'true', 'false' ]);

	QUnit.test('get()', assert => {
		assert.strictEqual(type.get('bar'), 'bar', 'Returns a given valid token');
		assert.strictEqual(type.get(null), 'foo', 'Returns the default token for null');
		assert.throws(() => type.get('true'), TypeError, 'Throws TypeError for any other string');

		assert.strictEqual(trueFalse.get('true'), true, 'Returns true for "true", if latter is a valid token');
		assert.strictEqual(trueFalse.get('false'), false, 'Returns false for "false", if latter is a valid token');
	});

	QUnit.test('set()', assert => {
		assert.strictEqual(type.set('bar'), 'bar', 'Returns a given valid token');
		assert.throws(() => type.get('true'), TypeError, 'Throws TypeError for any other string');

		assert.strictEqual(trueFalse.set(true), 'true', 'Returns "true" for true, if first is a valid token');
		assert.strictEqual(trueFalse.set(false), 'false', 'Returns "false" for false, if first is a valid token');
	});

});

QUnit.module('aria.types.list', () => {

	let type = aria.types.list(aria.types.idReference());

	QUnit.test('get()', assert => {
		assert.deepEqual(type.get('qunit-fixture invalid'), [ QUnit.fixture(), null ], 'Returns an array of values for space separated list');
		assert.deepEqual(type.get(null), [], 'Returns an empty array for null');

		assert.deepEqual(aria.types.list(aria.types.idReference(), [ document.body ]).get(null), [ document.body ],
				'Returns a default value for null if one was given');
	});

	QUnit.test('set()', assert => {
		assert.deepEqual(type.set([ QUnit.fixture(), document.body ]), 'qunit-fixture', 'Returns space separated list for an array of values');
		assert.deepEqual(type.set(QUnit.fixture()), 'qunit-fixture', 'Works also for single values');
	});

});
