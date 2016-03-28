(function () { 'use strict';

	function aria(element) {
		if (! (element instanceof HTMLElement)) {
			element = document.getElementById(element);
		}

		if (element) {
			var propertiesObject = {};
			for (var attributeName in aria.attributes) {
				propertiesObject[attributeName] = { set: function () { } };
			}

			return Object.seal(Object.create(Object.prototype, propertiesObject));
		} else {
			return null;
		}
	}

	aria.attributes = {};

	window.aria = aria;

})();
