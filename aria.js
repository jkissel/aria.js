(function () { 'use strict';

	aria.attributes = {};

	window.aria = aria;

	function aria(element) {
		if (! (element instanceof HTMLElement)) {
			element = document.getElementById(element);
		}

		if (element) {
			var propertiesObject = {};
			for (var attributeName in aria.attributes) {
				propertiesObject[attributeName] = propertyDescriptor(
						element,
						attributeName,
						aria.attributes[attributeName]);
			}

			return Object.seal(Object.create(Object.prototype, propertiesObject));
		} else {
			return null;
		}
	}

	function propertyDescriptor(element, propertyName, valueConverter) {
		valueConverter = assign({ get: identity, set: identity }, valueConverter);

		var prefixedAttributeName = 'aria-' + propertyName;

		return {
			get: function () {
				return valueConverter.get(element.getAttribute(prefixedAttributeName));
			},
			set: function (value) {
				element.setAttribute(prefixedAttributeName, valueConverter.set(value));
			}
		};
	}

	function assign(target, source) {
		return Object.keys(source).reduce(function (target, key) {
			return (target[key] = source[key], target);
		}, target);
	}

	function identity(value) {
		return value;
	}

})();
