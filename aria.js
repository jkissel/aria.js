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
					return value;
				throw new TypeError('The value is not an ID reference');
			}
		}},
		idReferenceList: function () {
			return aria.types.list(aria.types.idReference());
		},
		integer: function () { return {
			get: function (attributeValue) {
				var value = parseFloat(attributeValue);
				if (! isNaN(value)) value = value | 0;
				return value;
			},
			set: function (value) {
				value = Number(value);
				if (! isNaN(value)) value = value | 0;
				return value.toString();
			}
		}},
		number: function () { return {
			get: function (attributeValue) {
				return parseFloat(attributeValue);
			},
			set: function (value) {
				return Number(value).toString();
			}
		}},
		string: function () { return {
			get: function (attributeValue) {
				return attributeValue;
			},
			set: function (value) {
				return String(value);
			}
		}},
		token: function (tokens) { return {
			get: function (attributeValue) {
				if (attributeValue == null)
					return tokens[0];
				if (tokens.indexOf(attributeValue) == -1)
					throw new TypeError('Invalid token');
				if (attributeValue == 'true')
					return true;
				if (attributeValue == 'false')
					return false;
				return attributeValue;
			},
			set: function (value) {
				value = String(value);
				if (tokens.indexOf(value) == -1)
					throw new TypeError('Invalid token');
				return value;
			}
		}},
		tokenList: function (tokens, defaultValue) {
			return aria.types.list(aria.types.token(tokens), defaultValue);
		},
		list: function (itemType, defaultValue) { return {
			get: function (attributeValue) {
				if (attributeValue == null)
					return defaultValue || [];
				return attributeValue.split(' ').map(itemType.get);
			},
			set: function (value) {
				if (! Array.isArray(value)) {
					if (typeof value.length == 'number')
						value = [].slice.call(value); // array-like
					else
						value = [ value ];
				}
				return value.map(itemType.set).filter(identity).join(' ');
			}
		}}
	};

	// https://www.w3.org/TR/wai-aria/states_and_properties#state_prop_def

	var attributesByType = {
		trueFalse: [
			'atomic',
			'busy',
			'disabled',
			'haspopup',
			'hidden',
			'multiline',
			'multiselectable',
			'readonly',
			'required'
		],
		trueFalseUndefined: [
			'expanded',
			'grabbed',
			'selected'
		],
		idReference: [
			'activedescendant'
		],
		idReferenceList: [
			'controls',
			'describedby',
			'flowto',
			'labelledby',
			'owns'
		],
		integer: [
			'level',
			'posinset',
			'setsize'
		],
		number: [
			'valuemax',
			'valuemin',
			'valuenow'
		],
		string: [
			'label',
			'valuetext'
		],
		token: [
			'autocomplete',
			'invalid',
			'live',
			'orientation'
		],
		tokenList: [
			'dropeffect',
			'relevant'
		]
	};

	var typeArguments = {
		autocomplete: [[ 'none', 'inline', 'list', 'both' ]],
		invalid: [[ 'false', 'true', 'grammar', 'spelling' ]],
		live: [[ 'off', 'polite', 'assertive' ]],
		orientation: [[ 'horizontal', 'vertical' ]],
		sort: [[ 'none', 'ascending', 'descending', 'other' ]],

		dropeffect: [
			[ 'copy', 'move', 'link', 'execute', 'popup', 'none' ],
			[ 'none' ]
		],
		relevant: [
			[ 'additions', 'removals', 'text', 'all' ],
			[ 'additions', 'text' ]
		]
	};

	aria.attributes = {};

	for (var typeName in attributesByType) {
		attributesByType[typeName].forEach(function (attributeName) {
			aria.attributes[attributeName] = aria.types[typeName].apply(null, typeArguments[attributeName] || []);
		});
	}

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

			var ariaInstance = Object.seal(Object.create(aria.prototype, propertiesObject));
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
				try {
					return valueConverter.get(element.getAttribute(prefixedAttributeName));
				} catch (error) {
					if (error instanceof TypeError) {
						return valueConverter.get(null); // return default value
					} else {
						throw error;
					}
				}
			},
			set: function (value) {
				if (value == null) {
					element.removeAttribute(prefixedAttributeName);
				} else {
					try {
						element.setAttribute(prefixedAttributeName, valueConverter.set(value));
					} catch (error) {
						if (error instanceof TypeError) {
							// ignore set
						} else {
							throw error;
						}
					}
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
