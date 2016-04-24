/* global $ */

$.fn.aria = function (attributeName, value) {

	if (arguments.length <= 1) { // get
		if (! this.length) return;

		value = aria(this[0])[attributeName];
		if ([].concat(value).every(isElement)) {
			value = $(value);
		}
		return value;
	} else if ($.isFunction(value)) { // set with value function
		return this.each(function () {
			aria(this)[attributeName] = value.call(this, aria(this)[attributeName]);
		});
	} else { // set
		if (value instanceof $ && ! isListAttribute(attributeName)) {
			value = value[0];
		}
		return this.each(function () {
			aria(this)[attributeName] = value;
		});
	}

	function isElement(object) {
		return (object instanceof HTMLElement);
	}

	function isListAttribute(attributeName) {
		return $.isArray(aria($('<div>')[0])[attributeName]);
	}

};