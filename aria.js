(function () { 'use strict';

	// https://www.w3.org/TR/wai-aria/states_and_properties#propcharacteristic_value

	aria.types = {
		trueFalse: function () { return {
			get: function (attributeValue) {
				if (attributeValue == 'true')
					return true;
				if (attributeValue == 'false' || attributeValue == null)
					return false;
				throw new TypeError('"' + attributeValue + '" is not true/false');
			},
			set: function (value) {
				return Boolean(value).toString();
			}
		}},
		tristate: function () { return {
			get: function (attributeValue) {
				switch (attributeValue) {
				case 'true':  return  true;
				case 'false': return  false;
				case 'mixed': return 'mixed';
				case  null :  return  undefined;
				default:      throw new TypeError('"' + attributeValue + '" is not tristate');
				}
			},
			set: function (value) {
				return (value == 'mixed') ? 'mixed' : Boolean(value).toString();
			}
		}},
		trueFalseUndefined: function () { return {
			get: function (attributeValue) {
				switch (attributeValue) {
				case 'true':  return true;
				case 'false': return false;
				case  null :  return undefined;
				default:      throw new TypeError('"' + attributeValue + '" is not true/false/undefined');
				}
			},
			set: function (value) {
				return Boolean(value).toString();
			}
		}},
		idReference: function () { return {
			get: function (attributeValue) {
				return document.getElementById(attributeValue);
			},
			set: function (value) {
				if (value instanceof HTMLElement)
					return value.id;
				if (typeof value == 'string')
					return value || null;
				throw new TypeError('The value is not an ID reference');
			}
		}}
	};

	aria.attributes = {};

	window.aria = aria;

	function aria(element) {
		if (! (element instanceof HTMLElement)) {
			element = document.getElementById(element);
		}

		if (element) {
			if (element.aria) {
				return element.aria;
			}

			var propertiesObject = {};
			for (var attributeName in aria.attributes) {
				propertiesObject[attributeName] = propertyDescriptor(
						element,
						attributeName,
						aria.attributes[attributeName]);
			}

			var ariaInstance = Object.seal(Object.create(Object.prototype, propertiesObject));
			element.aria = ariaInstance;
			return ariaInstance;
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
				if (value == null) {
					element.removeAttribute(prefixedAttributeName);
				} else {
					element.setAttribute(prefixedAttributeName, valueConverter.set(value));
				}
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
