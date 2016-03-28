(function () { 'use strict';

	function aria(element) {
		if (! (element instanceof HTMLElement)) {
			element = document.getElementById(element);
		}

		if (element) {
			return {};
		} else {
			return null;
		}
	}

	aria.attributes = {};

	window.aria = aria;

})();
