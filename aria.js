(function () { 'use strict';

	function aria(element) {
		if (! (element instanceof HTMLElement)) {
			element = document.getElementById(element);
		}

		if (element) {
			var propertiesObject = {};
			for (var attributeName in aria.attributes) {
				propertiesObject[attributeName] = propertyDescriptor(element, attributeName);
			}

			return Object.seal(Object.create(Object.prototype, propertiesObject));
		} else {
			return null;
		}
	}

	function propertyDescriptor(element, propertyName) {
		var prefixedAttributeName = 'aria-' + propertyName;

		return {
			get: function () {
				return element.getAttribute(prefixedAttributeName);
			},
			set: function (value) {
				element.setAttribute(prefixedAttributeName, value);
			}
		};
	}

	aria.attributes = {};

	window.aria = aria;

})();
