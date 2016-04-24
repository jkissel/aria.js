aria.js
=======

An [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) wrapper to make setting and evaluating [ARIA attributes](https://www.w3.org/TR/wai-aria/states_and_properties) easier.

Motivation
----------

ARIA attributes add semantics to HTML elements and thus improve interoperability with e.g. [screen readers](https://en.wikipedia.org/wiki/Screen_reader). This makes is possible (or at least easier) for blind people to use [Web Apps](https://en.wikipedia.org/wiki/Web_application).

Styling web applications for sighted people on the other hand is usually done with [CSS classes](https://developer.mozilla.org/en-US/docs/Web/CSS/Class_selectors). In contrast to ARIA attributes, they do *not* add semantics to the HTML elements.

As pointed out in the [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices/), "you should consider binding user interface changes directly to changes in WAI-ARIA states and properties, such as through the use of CSS attribute selectors." That means you can use ARIA attributes for both, semantics *and* styling. People actually do this, ebay developers for example based their CSS framework on this idea (see ["How Our CSS Framework Helps Enforce Accessibility"](http://www.ebaytechblog.com/2015/11/04/how-our-css-framework-helps-enforce-accessibility/), a great resource to read).

**And here is the point:** While [classList](https://developer.mozilla.org/en/docs/Web/API/Element/classList) made it super easy to deal with CSS classes, there is no supporting API for ARIA attributes.

A straight-forward approach would be to add properties to HTMLElement objects which correspond to the ARIA attributes, e.g.:

```javascript
element.ariaHidden = true; // sets the aria-hidden attribute to true
```

The _aria.js_ wrapper is as close as possible to this idea:

```javascript
aria(element).hidden = true;
```

In contrast to [`Element.getAttribute()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute)/[`setAttribute()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute), *aria.js* is typed:

```javascript
assert(element.getAttribute('hidden') === 'true');
assert(aria(element).hidden === true); // boolean

assert(element.getAttribute('activedescendant') === 'my-sub-element');
assert(aria(element).activedescendant === document.getElementById('my-sub-element')); // HTMLElement
```

All attributes in the [current specs](https://www.w3.org/TR/2014/REC-wai-aria-20140320/) are supported. Have a look at [the tests](index.html) for the details.

Usage
-----

```javascript
// get attribute aria-hidden
var hidden = aria(element).hidden;

// set attribute
aria(element).hidden = true;

// remove attribute by assigning null
aria(element).hidden = null;
```

Calling `aria()` all the time instead of storing the _aria_ instance somewhere is actually cheap: The instance is cached on the element object.

You can also call `aria()` with an element ID instead of the element itself:

```javascript
aria('my-element').hidden = true;
```

### Error handling

```javascript
aria(element).hidden = 'invalid value'; // is ignored

element.setAttribute('aria-hidden', 'invalid value');
hidden = aria(element).hidden; // returns false (the default value)
```

### Adapting attribute getter or setter, adding new attributes

If you want to adapt the getter or setter of a certain attribute or need to add a new one, you have to add a corresponding property on `aria.attributes`. An example:

```javascript
aria.attributes.hidden = { // definition of the "aria-hidden" getter and setter
    get: (attributeValue) => { // adjust the attribute value to the specific type
        if (attributeValue == 'true')
            return true;
        if (attributeValue == 'false' || attributeValue == null)
            return false; // Return the default value for null

        // throw a TypeError for an illegal value
        throw new TypeError('"' + attributeValue + '" is not true/false');
    },
    set: (value) => { // convert the value to a string which is set as attribute
        return Boolean(value).toString();
    }
};
```

TODOs
-----

* A strict mode for error handling
* An [npm](http://npmjs.org/) package