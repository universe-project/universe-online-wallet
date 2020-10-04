/**
 * Iridium Framework Core.
 * This file is part of Iridium Framework project.
 *
 * Iridium Framework is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Iridium Framework is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Iridium Framework. If not, see <http://www.gnu.org/licenses/>.
 *
 * @author rayleigh <rayleigh@protonmail.com>
 * @copyright 2017 Vladislav Pashaiev
 * @license LGPL-3.0+
 * @version 0.1-indev
 */

/**
 * Iridium Framework Core.
 * @namespace
 */
var Iridium = {
	/**
	 * Version of the Iridium Framework.
	 */
	version: '0.1.0-alpha'
};

/**
 * Generates random id.
 * @param {int} [length=5] Length.
 * @return {string} Generated id.
 */
Iridium.randomId = function(length)
{
	length = length || 5;

	var result = '',
		min = 33, max = 126; // Symbol codes range

	for(var i = 0; i < length; i++)
	{
		result += String.fromCharCode(Math.floor(Math.random() * (max - min + 1) + min));
	}

	return result;
};

/**
 * Check is string contains substring.
 * @param {string} needle Substring.
 * @param {string} haystack String.
 * @return {boolean} True if haystack contains needle.
 */
Iridium.stringContains = function(needle, haystack)
{
	return haystack.indexOf(needle) > -1;
};

/**
 * Checks if the element has specified class.
 * @param {HTMLElement} element Element.
 * @param {string} className Name of the class.
 * @return {boolean} True if element has specified class.
 */
Iridium.hasClass = function(element, className)
{
	if(!element.className) { return false; }
	return element.className.split(' ').indexOf(className) > -1;
};

/**
 * Adds class to the element.
 * @param {HTMLElement} element Element.
 * @param {string} className Name of the class.
 */
Iridium.addClass = function(element, className)
{
	if(!element.className)
	{
		element.className = className;
		return;
	}

	if(this.stringContains(className, element.className))
	{
		return;
	}

	element.className += ' ' + className;
};

/**
 * Removes class from the element.
 * @param {HTMLElement} element Element.
 * @param {string} className Name of the class.
 */
Iridium.removeClass = function(element, className)
{
	if(!element.className)
	{
		return;
	}

	var t = element.className.split(' '),
		i = t.indexOf(className);

	if(i < 0)
	{
		return;
	}

	t.splice(i, 1);
	element.className = t.join(' ');
};

/**
 * Toggles class on the element.
 * @param {HTMLElement} element Element.
 * @param {string} className Class name.
 */
Iridium.toggleClass = function(element, className)
{
	Iridium.hasClass(element, className) ? Iridium.removeClass(element, className) : Iridium.addClass(element, className);
};

/**
 * Returns value of the element style.
 * @param {HTMLElement} element Element.
 * @param {string} styleName Name of the style.
 * @return {string} Value of the style.
 */
Iridium.getStyle = function(element, styleName)
{
	if(!(element instanceof HTMLElement))
	{
		throw new Error('Element should be instance of HTMLElement.');
	}

	if(element.style[styleName]) // style="" (html)
	{
		return element.style[styleName];
	}
	else if(element.currentStyle) // IE css
	{
		return element.currentStyle[styleName];
	}
	else if(window.getComputedStyle) // css
	{
		return window.getComputedStyle(element).getPropertyValue(styleName);
	}

	throw new Error('Cannot get style from the element.');
};

/**
 * Checks if the object is empty.
 * @param {object} obj Object.
 * @return {boolean} Returns true if object is empty.
 */
Iridium.empty = function(obj)
{
	var hasOwnProperty = Object.prototype.hasOwnProperty;

	if(obj == null)
	{
		return true;
	}

	if(obj.length > 0)
	{
		return false;
	}

	if(obj.length === 0)
	{
		return true;
	}

	if(typeof obj === 'number')
	{
		return obj === 0;
	}

	if(typeof obj !== 'object')
	{
		return false;
	}

	for(var key in obj)
	{
		if(hasOwnProperty.call(obj, key))
		{
			return false;
		}
	}

	return true;
};

/**
 * Merges the target with the specified objects and returns new object with fields of all specified objects.
 * It also changes target object as the result object.
 * @param {object} target Target object.
 * @param {...object} sources Source objects.
 * @return {object} Result object.
 */
Iridium.merge = function(target, sources)
{
	'use strict';

	if(!target || typeof target !== 'object')
	{
		throw new TypeError('First argument must be passed and be an object.');
	}

	var result = Object(target);

	for(var i = 1; i < arguments.length; i++)
	{
		var source = arguments[i];

		// null and undefined
		if(source == null)
		{
			continue;
		}

		for(var key in source)
		{
			// null and undefined
			if(source[key] == null)
			{
				continue;
			}

			// Merge objects in object
			// Do not copy child properties of the Nodes, just copy the reference
			if(source[key] && target[key] && source[key] instanceof Object && target[key] instanceof Object && !(target[key] instanceof Node))
			{
				Iridium.merge(target[key], source[key]);
				continue;
			}

			target[key] = source[key];
		}
	}

	return result;
};

/**
 * Recursively clones object.
 * @param {object} obj Object.
 * @return {*} Cloned object.
 */
Iridium.clone = function(obj)
{
	var copy;

	if(obj === null || obj === undefined || typeof obj !== 'object')
	{
		return obj;
	}

	if(obj instanceof Date)
	{
		copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}

	if(obj instanceof Array)
	{
		copy = [];

		for(var i = 0, len = obj.length; i < len; i++)
		{
			copy[i] = Iridium.clone(obj[i]);
		}

		return copy;
	}

	// Do not clone Node, just copy the reference
	if(obj instanceof Node)
	{
		return obj;
	}

	if(obj instanceof Object)
	{
		copy = {};

		for(var attr in obj)
		{
			if(obj.hasOwnProperty(attr))
			{
				copy[attr] = Iridium.clone(obj[attr]);
			}
		}

		return copy;
	}

	throw new Error("Cannot clone the object. Unsupported type.");
};

/**
 * Returns array with numbers in [start; start + count * step] range.
 * If only one parameter specified function considers that parameter is count.
 * @param {number} start Range start.
 * @param {number} count Values count.
 * @param {number} step Range step.
 * @returns {Array} Array with numbers in specified range.
 */
Iridium.range = function(start, count, step)
{
	step = step || 1;
	start = start || 0;

	if(count === undefined)
	{
		count = start;
		start = 0;
	}
	
	return Array.apply(null, Array(count)).map(function(_, i)
	{
		return start + i * step;
	});
};

Object.defineProperty(
	Array.prototype,
	'pushArray',
	{
		value: function(array)
		{
			if(!Array.isArray(array))
			{
				throw new TypeError('Argument must be an array.');
			}

			for(var i = 0; i < array.length; i++)
			{
				this.push(array[i]);
			}
		},
		enumerable: false
	}
);

/**
 * Redirects to the specified URL.
 * @param {string} url URL.
 */
Iridium.goto = function(url)
{
	window.location.href = url;
};

if(!String.prototype.endsWith)
{
	String.prototype.endsWith = function(searchString, position)
	{
		var subjectString = this.toString();

		if(position === undefined || position > subjectString.length)
		{
			position = subjectString.length;
		}

		position -= searchString.length;
		var lastIndex = subjectString.indexOf(searchString, position);
		return lastIndex !== -1 && lastIndex === position;
	};
}

// Polyfill for the 'includes' method of the Array
if(!Array.prototype.includes)
{
	Array.prototype.includes = function(searchElement)
	{
		return this.indexOf(searchElement) !== -1;
	};
}
/**
 * Iridium Init.
 * Used for the modules initialization.
 *
 * This file is part of Iridium Framework project.
 *
 * Iridium Framework is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Iridium Framework is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Iridium Framework. If not, see <http://www.gnu.org/licenses/>.
 *
 * @author rayleigh <rayleigh@protonmail.com>
 * @copyright 2018 Vladislav Pashaiev
 * @license LGPL-3.0+
 * @module init
 * @requires Iridium
 */

/**
 * Callback function for the module initialization.
 * @param {HTMLElement} element Element for the initialization.
 * @callback InitCallback
 */

/**
 * Iridium Init.
 * @namespace
 */
Iridium.Init = {};

(function()
{
	/**
	 * List of the callback functions for the initialization.
	 */
	var list = {};

	/**
	 * Registers callback function for the initialization.
	 * @param {string} name Name of the module.
	 * @param {InitCallback} callback Callback function for the initialization.
	 */
	Iridium.Init.register = function(name, callback)
	{
		if(typeof name === 'string' && typeof callback === 'function')
		{
			if(list.hasOwnProperty(name))
			{
				throw new Error('Specified name is already in use.');
			}

			list[name] = callback;
		}
	};

	/**
	 * Clears initialization list.
	 */
	Iridium.Init.clear = function()
	{
		list = {};
	};

	/**
	 * Launch initialization for specified element for the registered modules.
	 * @param {HTMLElement} [element=document.body] Element for the initialization.
	 * @param {string[]} [names] Names of the modules to initialize. If not specified, initialize all registered modules.
	 */
	Iridium.Init.launch = function(element, names)
	{
		if(!(element instanceof HTMLElement))
		{
			element = document.body;
		}

		for(var name in list)
		{
			if(Array.isArray(names) && !names.includes(name))
			{
				continue;
			}

			list[name](element);
		}
	};
}());

window.addEventListener('load', function()
{
	Iridium.Init.launch();
});

/**
 * Iridium Breakpoints.
 * This file is part of Iridium Framework project.
 *
 * Iridium Framework is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Iridium Framework is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Iridium Framework. If not, see <http://www.gnu.org/licenses/>.
 *
 * @author rayleigh <rayleigh@protonmail.com>
 * @copyright 2018 Vladislav Pashaiev
 * @license LGPL-3.0+
 * @module breakpoints
 * @requires Iridium
 */


/**
 * Iridium Breakpoints.
 * @namespace
 */
Iridium.Breakpoints = {};

/**
 * List of the callback that called on breakpoint change.
 * @type {Array}
 * @private
 */
Iridium.Breakpoints._onChangeCallbacks = [];

/**
 * Last changed breakpoint.
 * @type {string}
 * @private
 */
Iridium.Breakpoints._lastBreakpoint = '';

/**
 * Responsive breakpoints.
 */
Iridium.Breakpoints.list = {
	/**
	 * Small.
	 * 576px - 767px.
	 */
	sm: 576,

	/**
	 * Medium.
	 * 768px - 991px.
	 */
	md: 768,

	/**
	 * Large.
	 * 992px - 1199px.
	 */
	lg: 992,

	/**
	 * Extra large.
	 * 1200 - infinity.
	 */
	xl: 1200
};

/**
 * Returns list of the responsive breakpoints names.
 * @returns {string[]} List of the responsive breakpoints.
 */
Iridium.Breakpoints.getNames = function()
{
	return Object.keys(this.list);
};

/**
 * Returns current breakpoint that corresponds to the viewport width or empty string if vieport width smaller than
 * sm breakpoint.
 * @returns {string} Current breakpoint.
 */
Iridium.Breakpoints.getCurrent = function()
{
	var vieportWidth = window.innerWidth,
		breakpoints  = this.getNames().reverse();

	for(var i = 0; i < breakpoints.length; i++)
	{
		var bp = breakpoints[i];
		if(this.list[bp] <= vieportWidth)
		{
			return bp;
		}
	}

	return '';
};

/**
 * Adds callback function that will be called on breakpoint change.
 * @param {function} callback Callback function.
 */
Iridium.Breakpoints.addOnChange = function(callback)
{
	if(typeof callback === 'function')
	{
		this._onChangeCallbacks.push(callback);
	}
};

/**
 * Removes callback function.
 * @param {function} callback Callback function.
 */
Iridium.Breakpoints.removeOnChange = function(callback)
{
	if(typeof callback === 'function')
	{
		var i = this._onChangeCallbacks.indexOf(callback);
		if(i !== -1)
		{
			this._onChangeCallbacks.splice(i, 1);
		}
	}
};

// Update breakpoint on resize
window.addEventListener('resize', function()
{
	var _       = Iridium.Breakpoints;
	var current = _.getCurrent();

	if(current !== _._lastBreakpoint)
	{
		_._lastBreakpoint = current;

		for(var i = 0; i < _._onChangeCallbacks.length; i++)
		{
			_._onChangeCallbacks[i](current);
		}
	}
});

// Initialization
Iridium.Init.register('breakpoint', function()
{
	Iridium.Breakpoints._lastBreakpoint = Iridium.Breakpoints.getCurrent();
});
/**
 * Iridium Builder.
 * This file is part of Iridium Framework project.
 *
 * Iridium Framework is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Iridium Framework is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Iridium Framework. If not, see <http://www.gnu.org/licenses/>.
 *
 * @author rayleigh <rayleigh@protonmail.com>
 * @copyright 2018 Vladislav Pashaiev
 * @license LGPL-3.0+
 * @module builder
 * @requires Iridium
 */


/**
 * Iridium Builder.
 *
 * @param {object} data Element data.
 * @param {string} [data.tag = div] Element tag.
 * @param {string} [data.id] Element identifier.
 * @param {string|string[]} [data.class] Element class.
 * @param {string} [data.html] Element inner HTML.
 * @param {string|string[]} [data.bool] Boolean attributes.
 * @param {object.<function|function[]>} [data.on] Element events listeners.
 *
 * @param {object[]|Element[]} [data.childs] Child elements.
 *
 * @param {string} [data.method=post] Form method.
 * @param {string} [data.action] Form action.
 *
 * @param {string} [data.name] Input name.
 * @param {string} [data.type=text] Input type.
 * @param {*} [data.value] Input value.
 * @param {string} [data.pattern] Input pattern.
 * @param {string} [data.placeholder] Input placeholder.
 * @param {string} [data.title] Input title.
 * @param {number} [data.min] Input min number.
 * @param {number} [data.max] Input max number.
 * @param {number} [data.step] Input number change step.
 * @param {boolean} [data.checked] Checkbox checked state.
 *
 * @param {string} [data.for] Label 'for' attribute.
 *
 * @constructor
 */
Iridium.Builder = function(data)
{
	this.build = function()
	{
		function buildElement(elementData)
		{
			//Default tag - div
			elementData.tag = typeof elementData.tag === 'string' ? elementData.tag : 'div';
			var element     = document.createElement(elementData.tag);

			if(typeof elementData.id === 'string')
			{
				element.id = elementData.id;
			}

			if(elementData.class != null)
			{
				if(typeof elementData.class === 'string')
				{
					element.className = elementData.class;
				}

				if(Array.isArray(elementData.class))
				{
					element.className = elementData.class.join(' ');
				}
			}

			if(typeof elementData.html === 'string')
			{
				element.innerHTML = elementData.html;
			}

			// Boolean attributes
			if(typeof elementData.bool === 'string')
			{
				element.setAttribute(elementData.bool, elementData.bool);
			}
			else if(Array.isArray(elementData.bool))
			{
				elementData.bool.forEach(function(b)
				{
					if(typeof b === 'string')
					{
						element.setAttribute(b, b);
					}
				});
			}

			//Form attributes
			if(elementData.tag === 'form')
			{
				//Form method
				element.method = typeof elementData.method === 'string' ? elementData.method : 'post';

				//Form action
				if(typeof elementData.action === 'string')
				{
					element.action = elementData.action;
				}
			}

			//Input attributes
			if(elementData.tag === 'input')
			{
				if(typeof elementData.name === 'string')
				{
					element.name = elementData.name;
				}

				element.type = typeof elementData.type === 'string' ? elementData.type : 'text';

				if(elementData.value)
				{
					element.value = elementData.value;
				}

				if(typeof elementData.pattern === 'string')
				{
					element.pattern = elementData.pattern;
				}

				if(typeof elementData.placeholder === 'string')
				{
					element.placeholder = elementData.placeholder;
				}

				if(typeof elementData.title === 'string')
				{
					element.title = elementData.title;
				}

				if(typeof elementData.min === 'number')
				{
					element.min = elementData.min;
				}

				if(typeof elementData.max === 'number')
				{
					element.max = elementData.max;
				}

				if(typeof elementData.step === 'number')
				{
					element.step = elementData.step;
				}

				if(typeof elementData.checked === 'boolean')
				{
					element.checked = elementData.checked;
				}

				if(typeof elementData.size === 'number')
				{
					element.size = elementData.size;
				}

				if(typeof elementData.maxlength === 'number')
				{
					element.maxlength = elementData.maxlength;
				}
			}

			if(elementData.tag === 'label' && typeof elementData.for === 'string')
			{
				element.htmlFor = elementData.for;
			}

			//Event listeners (array of functions or function)
			if(typeof elementData.on === 'object')
			{
				for(var eventType in elementData.on)
				{
					var listener = elementData.on[eventType];

					if(typeof listener === 'function')
					{
						element.addEventListener(eventType, listener);
					}

					if(Array.isArray(listener))
					{
						listener.forEach(function(listenerItem)
						{
							if(typeof listenerItem !== 'function')
							{
								return;
							}

							element.addEventListener(eventType, listenerItem);
						});
					}
				}
			}

			//Element childs (recursive, object or Element)
			if(Array.isArray(elementData.childs))
			{
				elementData.childs.forEach(function(childData)
				{
					if(typeof childData !== 'object')
					{
						return;
					}

					element.appendChild(childData instanceof Element ? childData : buildElement(childData));
				});
			}

			return element;
		}

		return buildElement(data);
	};
};

/**
 * Iridium URL Data.
 * This file is part of Iridium Framework project.
 *
 * Iridium Framework is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Iridium Framework is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Iridium Framework. If not, see <http://www.gnu.org/licenses/>.
 *
 * @author rayleigh <rayleigh@protonmail.com>
 * @copyright 2018 Vladislav Pashaiev
 * @license LGPL-3.0+
 * @module url_data
 * @requires Iridium
 */


/**
 * Iridium URL Data.
 * @namespace
 */
Iridium.UrlData = {};

/**
 * Returns value by specified key.
 * @param {string|undefined} key Key.
 */
Iridium.UrlData.get = function(key)
{
	return this.getAll()[key];
};

/**
 * Returns all pairs of keys and values.
 * @returns {{}} Pairs.
 */
Iridium.UrlData.getAll = function()
{
	var hashPairs = window.location.hash.slice(1).split('&'),
		result    = {};

	hashPairs.forEach(function(pairStr)
	{
		var pair = pairStr.split('=');

		if(pair.length !== 2)
		{
			return;
		}

		result[pair[0].trim()] = pair[1].trim();
	});

	return result;
};

/**
 * Sets value by the key.
 * @param {string} key Key.
 * @param {string} value Value.
 */
Iridium.UrlData.set = function(key, value)
{
	var all  = this.getAll();
	all[key] = value;
	this.setAll(all);
};

/**
 * Sets all pairs of keys and values from the specified object.
 * @param all
 */
Iridium.UrlData.setAll = function(all)
{
	if(typeof all !== 'object')
	{
		return;
	}

	var pairs = [];

	for(var key in all)
	{
		pairs.push(key + '=' + all[key]);
	}

	window.location.hash = '#' + pairs.join('&');
};

/**
 * Returns true specified key exist.
 * @param {string} key Key.
 * @returns {boolean} True if specified key exist.
 */
Iridium.UrlData.has = function(key)
{
	return this.getAll().hasOwnProperty(key);
};

/**
 * Removes value by key.
 * @param key
 */
Iridium.UrlData.remove = function(key)
{
	var all = this.getAll();
	delete all[key];
	this.setAll(all);
};

/**
 * Removes all values.
 */
Iridium.UrlData.removeAll = function()
{
	window.location.hash = '';
};
/**
 * Iridium Net.
 * This file is part of Iridium Framework project.
 *
 * Iridium Framework is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Iridium Framework is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Iridium Framework. If not, see <http://www.gnu.org/licenses/>.
 *
 * @author rayleigh <rayleigh@protonmail.com>
 * @copyright 2018 Vladislav Pashaiev
 * @license LGPL-3.0+
 * @module net
 * @requires Iridium
 */

/**
 * Success request callback function.
 * @callback RequestSuccess
 * @param {*} data Result data.
 */

/**
 * Request error callback function.
 * @callback RequestError
 * @param {Iridium.Net.RequestErrorType} type Error type.
 * @param {object} [data] Error data.
 */


/**
 * Iridium Net.
 * Contains methods for working with the network.
 * @namespace
 */
Iridium.Net = {};

/**
 * Request method.
 */
Iridium.Net.Method = {
	POST: 'POST',
	GET: 'GET',
	//TRACE: 'TRACE',
	//DELETE: 'DELETE',
	//PUT: 'PUT'
};

Object.freeze(Iridium.Net.Method);

/**
 * Request result data type.
 */
Iridium.Net.DataType = {
	/** @type {Iridium.Net.DataType}*/
	JSON: /** @type {Iridium.Net.DataType}*/'json',
	/** @type {Iridium.Net.DataType}*/
	XML: /** @type {Iridium.Net.DataType}*/'xml',
	/** @type {Iridium.Net.DataType}*/
	TEXT: /** @type {Iridium.Net.DataType}*/'text'
};

Object.freeze(Iridium.Net.DataType);

/**
 * Type of the request error.
 */
Iridium.Net.RequestErrorType = {
	HTTP: 'http',
	TIMEOUT: 'timeout',
	PARSE: 'parse'
};

Object.freeze(Iridium.Net.RequestErrorType);

/**
 * Transforms object to the urlencoded string.
 * TODO: https://www.w3.org/TR/html5/forms.html#url-encoded-form-data
 * @param {object} obj Object.
 * @return {string} Urlencoded object.
 */
Iridium.Net.objectURLEncode = function(obj)
{
	var result = '';

	for(var k in obj)
	{
		if(Array.isArray(obj[k]))
		{
			obj[k].forEach(function(item, i)
			{
				result += encodeURIComponent(k) + '[' + encodeURIComponent(i.toString()) + ']=' + encodeURIComponent(item) + '&';
			});
		}
		else
		{
			result += encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]) + '&';
		}
	}

	return result.slice(0, -1);
};

/**
 * Sends request to the URL with specified parameters.
 * @param {string} url URL.
 * @param {object} [parameters] Request parameters.
 * @param {object} [parameters.data] Request data.
 * @param {Iridium.Net.Method} [parameters.method = POST] Request method.
 * @param {Iridium.Net.DataType} [parameters.dataType = JSON] Type of the response data.
 * @param {RequestSuccess} [parameters.success] Success request callback.
 * @param {RequestError} [parameters.error] Request error callback.
 * @param {string} [parameters.user]
 * @param {string} [parameters.password]
 * @param {int} [parameters.timeout = 0] Timeout of the request in milliseconds.
 */
Iridium.Net.request = function(url, parameters)
{
	if(Iridium.empty(url))
	{
		throw new Error('Argument "url" should not be empty.');
	}

	var _      = this,
		params = {
			method: this.Method.POST,
			dataType: this.DataType.JSON,
			user: '',
			password: '',
			timeout: 0
		};

	Iridium.merge(params, parameters);

	//urlencode data
	params.data = this.objectURLEncode(params.data);

	if(params.method === this.Method.GET)
	{
		url += (Iridium.stringContains('?', url) ? '&' : '?') + params.data;
	}

	var httpRequest = new XMLHttpRequest();
	httpRequest.open(params.method, url, true, params.user, params.password);
	httpRequest.timeout = params.timeout;

	httpRequest.onreadystatechange = function()
	{
		if(httpRequest.readyState === 4)
		{
			if(httpRequest.status === 200)
			{
				var response;

				switch(params.dataType)
				{
					case _.DataType.JSON:
						try
						{
							response = JSON.parse(httpRequest.responseText);
						}
						catch(e)
						{
							if(typeof params.error === 'function')
							{
								params.error(_.RequestErrorType.PARSE, e);
							}

							return;
						}
						break;
					case _.DataType.XML:
						response = httpRequest.responseXML;
						break;
					case _.DataType.TEXT:
						response = httpRequest.responseText;
						break;
				}

				if(typeof params.success === 'function')
				{
					params.success(response);
				}
			}
			else
			{
				if(typeof params.error === 'function')
				{
					params.error(
						_.RequestErrorType.HTTP,
						{
							statusCode: httpRequest.status,
							statusText: httpRequest.statusText
						}
					);
				}
			}
		}
	};

	httpRequest.ontimeout = function()
	{
		if(typeof params.error === 'function')
		{
			params.error(_.RequestErrorType.TIMEOUT);
		}
	};

	if(params.method === this.Method.POST)
	{
		httpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	}

	httpRequest.send(params.method === this.Method.POST ? params.data : null);
};

/**
 * Sends a POST request.
 * @param {string} url
 * @param {object} [data]
 * @param {RequestSuccess} [success]
 * @param {Iridium.Net.DataType} [dataType]
 * @param {RequestError} [error]
 */
Iridium.Net.post = function(url, data, success, dataType, error)
{
	this.request(url, {
		method: /**@type Iridium.Net.Method*/this.Method.POST,
		data: data,
		success: success,
		dataType: dataType,
		error: error
	});
};

/**
 * Sends a GET request.
 * @param {string} url
 * @param {object} [data]
 * @param {RequestSuccess} [success]
 * @param {Iridium.Net.DataType} [dataType]
 * @param {RequestError} [error]
 */
Iridium.Net.get = function(url, data, success, dataType, error)
{
	this.request(url, {
		method: /**@type Iridium.Net.Method*/this.Method.GET,
		data: data,
		success: success,
		dataType: dataType,
		error: error
	});
};

/**
 * Iridium Animation.
 * This file is part of Iridium Framework project.
 *
 * Iridium Framework is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Iridium Framework is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Iridium Framework. If not, see <http://www.gnu.org/licenses/>.
 *
 * @author rayleigh <rayleigh@protonmail.com>
 * @copyright 2018 Vladislav Pashaiev
 * @license LGPL-3.0+
 * @module animation
 * @requires Iridium
 */



Iridium.Animation = (function()
{
	/**
	 * Splits property value to the number and unit.
	 * @param {string|number} value Value.
	 * @return {{value: number, unit: string}} Number and unit of the value.
	 */
	function splitValue(value)
	{
		if(typeof value === 'number')
		{
			return {value: value, unit: ''};
		}

		// From end to start
		for(var i = value.length; i > 0; i--)
		{
			if(value[i] <= '9' && value[i] >= '0')
			{ break; }
		}

		return {
			value: parseFloat(value.substring(0, ++i)),
			unit: value.substring(i)
		};
	}

	/**
	 * Iridium Animation.
	 *
	 * @example
	 * var animation = new Iridium.Animation({
	 * 	element: document.getElementById('element-id')
	 * });
	 *
	 * @param {object} [parameters] Parameters of the animation.
	 * @param {HTMLElement} [parameters.element] Element.
	 *
	 * @param {object|('fadeIn'|'fadeOut')} [parameters.animation=fadeIn] Animation data or predefined animation.
	 * @param {object} [parameters.animation.start] Start parameters of the animation.
	 * @param {object} [parameters.animation.end] End parameters of the animation.
	 *
	 * @param {('in'|'out'|'inout')} [parameters.direction=in] Direction of the time function.
	 * @param {function|('linear'|'quad'|'sqrt')} [parameters.function] Function of the animation.
	 * @param {number} [parameters.duration=1000] Duration in milliseconds.
	 *
	 * @param {number|Infinity} [parameters.repeats=0] Number of the repeats.
	 * Can be set to Infinity for the endless cycle animation.
	 *
	 * @param {boolean} [parameters.autostart=true] Autostart animation after creation.
	 *
	 * @param {function} [parameters.onStop] Callback function, that called after the animation stop.
	 * @param {function} [parameters.onRepeat] Callback function, that called after the animation repeat.
	 *
	 * @constructor
	 */
	function Animation(parameters)
	{
		// TODO: move to private properties
		var params = {
			animation: 'fadeIn',
			direction: 'in',
			function: 'linear',
			duration: 1000,
			repeats: 0,
			autostart: true
		};

		Iridium.merge(params, parameters);

		this._element = params.element;

		if(typeof this.timeFunctions[params.function] === 'function')
		{
			this._timeFunction = this.timeFunctions[params.function];
		}
		else if(typeof params.function === 'function')
		{
			this._timeFunction = params.function;
		}

		if(!this._timeFunction)
		{
			throw new Error('Incorrect time function.');
		}

		if(typeof params.animation === 'object')
		{
			this._animation = params.animation;

			if(this._animation.start === undefined && this._animation.end === undefined)
			{
				throw new Error('Property "animation" should have "start" and/or "stop" property.');
			}
		}
		else if(typeof params.animation === 'string' && typeof this.animations[params.animation] === 'object')
		{
			this._animation = Iridium.clone(this.animations[params.animation]);
		}

		if(!this._animation)
		{
			throw new Error('Cannot obtain animation properties.');
		}

		this._direction = params.direction;

		if(this._direction !== 'in' && this._direction !== 'out' && this._direction !== 'inout')
		{
			throw new Error('Time direction should be "in" or "out" or "inout".');
		}

		this._duration = params.duration > 0 ? params.duration : 1000;

		if(typeof params.onStop === 'function')
		{
			this._onStop = params.onStop;
		}

		if(typeof params.onStop === 'function')
		{
			this._onStop = params.onStop;
		}

		if(typeof params.onRepeat === 'function')
		{
			this._onRepeat = params.onRepeat;
		}

		/**
		 * Is animation started.
		 * @type {boolean}
		 * @private
		 */
		this._started = false;

		/**
		 * Is need to stop animation in the next frame.
		 * @type {boolean}
		 * @private
		 */
		this._needStop = false;

		/**
		 * Number of the repeats.
		 * @type {boolean}
		 * @private
		 */
		this._repeats = params.repeats;

		if(params.autostart)
		{
			this.start();
		}
	}

	/**
	 * Standard time functions.
	 * f(0) = 0, f(1) = 1
	 */
	Animation.prototype.timeFunctions = {
		/**
		 * y = x
		 */
		linear: function(x) { return x; },

		/**
		 * y = x^2
		 */
		quad: function(x) { return Math.pow(x, 2); },

		/**
		 * y = sqrt(x)
		 */
		sqrt: function(x) { return Math.sqrt(x); }
	};

	/**
	 * Standart animations.
	 */
	Animation.prototype.animations = {
		fadeIn: {
			start: {opacity: 0},
			end: {opacity: 1}
		},
		fadeOut: {
			start: {opacity: 1},
			end: {opacity: 0}
		}
	};

	/**
	 * Starts the animation.
	 * @return {Iridium.Animation} Animation.
	 */
	Animation.prototype.start = function()
	{
		if(!(this._element instanceof HTMLElement))
		{
			throw new Error('Set element that is instance of HTMLElement.');
		}

		if(this._started)
		{
			this._repeats++;
			return this;
		}

		this._started   = true;
		this._needStop  = false;
		this._startTime = performance.now();

		if(!this._animation.difference)
		{
			// Create start or end if they does not exist
			this._animation.start = this._animation.start || {};
			this._animation.end   = this._animation.end || {};

			// Difference between start and end
			this._animation.difference = {};

			var prop;

			// Copy properties from end to start
			for(prop in this._animation.end)
			{
				if(!this._animation.start.hasOwnProperty(prop))
				{
					this._animation.start[prop] = Iridium.getStyle(this._element, prop);
				}
			}

			for(prop in this._animation.start)
			{
				// Copy properties from start to end
				if(!this._animation.end.hasOwnProperty(prop))
				{
					this._animation.end[prop] = Iridium.getStyle(this._element, prop);
				}

				this._animation.start[prop] = splitValue(this._animation.start[prop]);
				this._animation.end[prop]   = splitValue(this._animation.end[prop]);

				// Merge units
				if(this._animation.start[prop].unit !== this._animation.end[prop].unit)
				{
					if(!this._animation.start[prop].unit.length)
					{
						this._animation.start[prop].unit = this._animation.end[prop].unit;
					}
					else
					{
						this._animation.end[prop].unit = this._animation.start[prop].unit;
					}
				}

				// Find defference
				this._animation.difference[prop] = {
					value: this._animation.end[prop].value - this._animation.start[prop].value,
					unit: this._animation.start[prop].unit
				};
			}
		}

		var _ = this;

		requestAnimationFrame(function animationFrame(time)
		{
			// [0; 1]
			var fractionTime = (time - _._startTime) / _._duration;

			if(fractionTime > 1)
			{
				fractionTime = 1;
			}

			var progress;

			switch(_._direction)
			{
				case 'in':
					progress = _._timeFunction(fractionTime);
					break;
				case 'out':
					progress = 1 - _._timeFunction(1 - fractionTime);
					break;
				case 'inout':
					if(fractionTime < 0.5)
					{
						progress = _._timeFunction(fractionTime * 2) / 2;
					}
					else
					{
						progress = (2 - _._timeFunction((1 - fractionTime) * 2)) / 2;
					}
					break;
			}

			for(var prop in _._animation.start)
			{
				_._element.style[prop] = (_._animation.start[prop].value + _._animation.difference[prop].value * progress) + _._animation.start[prop].unit;
			}

			if(!_._needStop)
			{
				if(fractionTime < 1)
				{
					requestAnimationFrame(animationFrame);
					return;
				}
				else if(_._repeats > 0)
				{
					_._startTime = performance.now();
					_._repeats--;
					_._onRepeat && _._onRepeat();
					requestAnimationFrame(animationFrame);
					return;
				}
			}

			_._started = false;
			_._onStop && _._onStop();
		});

		return this;
	};

	/**
	 * Stops the animation.
	 * @return {Iridium.Animation} Animation.
	 */
	Animation.prototype.stop = function()
	{
		if(!this._started)
		{
			return this;
		}

		this._needStop = true;
		return this;
	};

	/**
	 * Returns state of the animation.
	 * @return {boolean} True, if animation is running.
	 */
	Animation.prototype.isRunning = function()
	{
		return this._started;
	};

	/**
	 * Sets element.
	 * @param {HTMLElement} element Element.
	 * @return {Iridium.Animation} Animation.
	 */
	Animation.prototype.setElement = function(element)
	{
		if(this._started)
		{
			throw new Error('Cannot set element while animation is running.');
		}

		this._element = element;
		return this;
	};

	return Animation;
}());

/**
 * Iridium Tooltip.
 * This file is part of Iridium Framework project.
 *
 * Iridium Framework is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Iridium Framework is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Iridium Framework. If not, see <http://www.gnu.org/licenses/>.
 *
 * @author rayleigh <rayleigh@protonmail.com>
 * @copyright 2018 Vladislav Pashaiev
 * @license LGPL-3.0+
 * @module tooltip
 * @requires Iridium
 * @requires Iridium.Init
 * @requires Iridium.Breakpoints
 */


Iridium.Tooltip = (function()
{
	/**
	 * List of the all tooltips.
	 * @type {Array}
	 * @private
	 */
	var list = [];

	/**
	 * Creates Iridium Tooltip.
	 *
	 * @example
	 * <span data-ir-tt="Tooltip content">Text</span>
	 *
	 * @param {object} params Tooltip parameters.
	 * @param {HTMLElement} params.element Element.
	 * @param {string} [params.content = 'Empty'] Tooltip content. Supports HTML.
	 * @param {('hover'|'focus')} [params.event = 'hover']
	 * @param {('top'|'right'|'bottom'|'left'|'mouse')} [params.position='mouse']
	 * @param {number|string} [params.margin = 10]
	 * @param {string} [params.tooltipClass] Additional class of the tooltip element.
	 * @param {number} [params.showDelay = 50] Tooltip show delay.
	 * @param {number} [params.hideDelay = 0] Tooltip hide delay.
	 * @param {boolean} [params.html = true] Enable html rendering of the content.
	 *
	 * @param {object} [params.responsive]
	 *
	 * @param {object} [params.responsive.sm]
	 * @param {('hover'|'focus')} [params.responsive.sm.event]
	 * @param {('top'|'right'|'bottom'|'left'|'mouse')} [params.responsive.sm.position]
	 * @param {number} [params.responsive.sm.margin]
	 *
	 * @param {object} [params.responsive.md]
	 * @param {('hover'|'focus')} [params.responsive.md.event]
	 * @param {('top'|'right'|'bottom'|'left'|'mouse')} [params.responsive.md.position]
	 * @param {number} [params.responsive.md.margin]
	 *
	 * @param {object} [params.responsive.lg]
	 * @param {('hover'|'focus')} [params.responsive.lg.event]
	 * @param {('top'|'right'|'bottom'|'left'|'mouse')} [params.responsive.lg.position]
	 * @param {number} [params.responsive.lg.margin]
	 *
	 * @param {object} [params.responsive.xs]
	 * @param {('hover'|'focus')} [params.responsive.xs.event]
	 * @param {('top'|'right'|'bottom'|'left'|'mouse')} [params.responsive.xs.position]
	 * @param {number} [params.responsive.xs.margin]
	 *
	 * @constructor
	 */
	function Tooltip(params)
	{
		var _ = this;

		if(!(params.element instanceof HTMLElement))
		{
			throw new Error('Parameter "element" should be instance of HTMLElement.');
		}

		if(params.element.irTooltip)
		{
			throw new Error('Specified element already has a tooltip.');
		}

		_._params = {
			content: 'Empty',
			event: 'hover',
			position: 'mouse',
			margin: 10,
			showDelay: 50, // For prevent showing tooltip while cursor moving fast above element
			hideDelay: 0,
			html: true
		};

		Iridium.merge(_._params, params);
		_._params.margin = parseInt(_._params.margin);
		this._currentParams = this._getCurrentParams();

		// Element creation
		_._element           = document.createElement('div');

		if(_._params.html)
		{
			_._element.innerHTML = _._params.content;
		}
		else
		{
			_._element.appendChild(document.createTextNode(_._params.content));
		}

		_._updateTooltipElement();
		_._updatePosition(); // Set default position

		_._element.addEventListener('click', function()
		{
			_.hide();
		});

		// Remember tooltip object
		_._params.element.irTooltip = _;

		_._params.element.addEventListener('mouseenter', function(e)
		{
			if(_._currentParams.event === 'hover')
			{
				_.show();
				_._updatePosition(e);
			}
		});

		_._params.element.addEventListener('mousemove', function(e)
		{
			if(_._currentParams.event === 'hover')
			{
				_._updatePosition(e);
			}
		});

		_._params.element.addEventListener('mouseleave', function()
		{
			if(_._currentParams.event === 'hover')
			{
				_.hide();
			}
		});

		_._params.element.addEventListener('click', function()
		{
			if(_._currentParams.event === 'hover')
			{
				_.hide();
			}
		});

		_._params.element.addEventListener('focus', function()
		{
			if(_._currentParams.event === 'focus')
			{
				_.show();
				_._updatePosition();
			}
		});

		_._params.element.addEventListener('blur', function()
		{
			if(_._currentParams.event === 'focus')
			{
				_.hide();
			}
		});

		list.push(_);
	}

	/**
	 * Updates current position of the tooltip object.
	 * @param {MouseEvent} [e] Mouse event.
	 * @private
	 */
	Tooltip.prototype._updatePosition = function(e)
	{
		var _           = this,
			params      = this._currentParams,
			elementRect = params.element.getBoundingClientRect(),
			top         = elementRect.top,
			left        = elementRect.left;

		function place(l, t)
		{
			_._element.style.left = l + 'px';
			_._element.style.top  = t + 'px';
		}

		// Position relative to the element
		if(params.position !== 'mouse' && !!params.position)
		{
			switch(params.position)
			{
				case 'top':
					top -= _._element.offsetHeight + params.margin;
					left += (params.element.offsetWidth - _._element.offsetWidth) / 2;
					break;
				case 'bottom':
					top += params.element.offsetHeight + params.margin;
					left += (params.element.offsetWidth - _._element.offsetWidth) / 2;
					break;
				case 'left':
					left -= _._element.offsetWidth + params.margin;
					top += (params.element.offsetHeight - _._element.offsetHeight) / 2;
					break;
				case 'right':
					left += params.element.offsetWidth + params.margin;
					top += (params.element.offsetHeight - _._element.offsetHeight) / 2;
					break;
			}

			place(Math.round(left), Math.round(top));
			return;
		}

		if(e)
		{
			place(e.clientX + params.margin, e.clientY + params.margin);
			return;
		}

		place(left, top);
	};

	/**
	 * Updates class of the tooltip element.
	 * @private
	 */
	Tooltip.prototype._updateTooltipElement = function()
	{
		this._element.className = 'ir-tooltip-obj'
			+ (this._currentParams.position ? ' ' + this._currentParams.position : '')
			+ (this._params.tooltipClass ? ' ' + this._params.tooltipClass : '');
	};

	/**
	 * Returns parameters for current responsive breakpoint.
	 * @returns {object} Parameters.
	 * @private
	 */
	Tooltip.prototype._getCurrentParams = function()
	{
		var params            = Iridium.clone(this._params),
			breakpoints       = Iridium.Breakpoints.getNames(),
			currentBreakpoint = Iridium.Breakpoints.getCurrent();

		delete params.responsive;

		if(currentBreakpoint && this._params.responsive)
		{
			for(var i = 0; i < breakpoints.length; i++)
			{
				var bp = breakpoints[i];
				Iridium.merge(params, this._params.responsive[bp]);

				if(bp === currentBreakpoint)
				{
					break;
				}
			}
		}

		return params;
	};

	/**
	 * Displays tooltip.
	 * @returns {Iridium.Tooltip} Tooltip.
	 */
	Tooltip.prototype.show = function()
	{
		var _ = this;

		/**
		 * Local show function.
		 */
		function show()
		{
			if(!document.body.contains(_._element))
			{
				document.body.appendChild(_._element);
			}

			_._showTimeoutId = null;
		}

		// Wait untill delay ends
		if(_._showTimeoutId)
		{
			return _;
		}

		if(_._currentParams.showDelay > 0)
		{
			_._showTimeoutId = setTimeout(function()
			{
				show();
				if(_._currentParams.position !== 'mouse')
				{
					_._updatePosition();
				}
			}, _._currentParams.showDelay);
			return _;
		}

		show();
		return _;
	};

	/**
	 * Hides tooltip.
	 * @returns {Iridium.Tooltip} Tooltip.
	 */
	Tooltip.prototype.hide = function()
	{
		var _ = this;

		// Remove show delay
		if(_._showTimeoutId)
		{
			clearTimeout(_._showTimeoutId);
			_._showTimeoutId = null;
		}

		function hide()
		{
			if(document.body.contains(_._element))
			{
				document.body.removeChild(_._element);
			}

			_._hideTimeoutId = null;
		}

		if(_._hideTimeoutId)
		{
			return _;
		}

		if(_._currentParams.hideDelay > 0)
		{
			_._hideTimeoutId = setTimeout(hide, _._currentParams.hideDelay);
			return _;
		}

		hide();
		return _;
	};

	/**
	 * @returns {boolean} True if tooltip is visible.
	 */
	Tooltip.prototype.isVisible = function()
	{
		return document.body.contains(this._element);
	};

	/**
	 * @returns {boolean} True if tooltip object has alive element.
	 * @private
	 */
	Tooltip.prototype._hasElement = function()
	{
		return !!this._currentParams.element.parentNode;
	};

	/**
	 * Called on window resize event.
	 * @private
	 */
	Tooltip.prototype._onWindowResize = function()
	{
		if(this._currentParams.event === 'focus')
		{
			this._updatePosition();
		}

		this._currentParams = this._getCurrentParams();
	};

	/**
	 * Called on window scroll event.
	 * @private
	 */
	Tooltip.prototype._onWindowScroll = function()
	{
		if(!this._hasElement())
		{
			list.splice(list.indexOf(this, 1));
			return;
		}

		if(this.isVisible() && (this._currentParams.event === 'focus' || this._currentParams.position !== 'mouse'))
		{
			this._updatePosition();
		}
	};

	/**
	 * Called on breakpoint change.
	 * @private
	 */
	Tooltip.prototype._onBreakpointChange = function()
	{
		this._currentParams = this._getCurrentParams();
		this._updateTooltipElement();
	};

	/**
	 * Return list of the initialized tooltips.
	 * @returns {Tooltip[]} List of the initialized tooltips.
	 * @static
	 */
	Tooltip.getList = function()
	{
		return list.slice();
	};

	/**
	 * Hides all tooltips on the page.
	 * @static
	 */
	Tooltip.hideAll = function()
	{
		for(var i = 0; i < list.length; i++)
		{
			list[i].hide();
		}
	};

	/**
	 * Removes tooltips without elements.
	 */
	Tooltip.removeElementless = function()
	{
		for(var i = 0; i < list.length; i++)
		{
			if(list[i]._hasElement())
			{
				list.splice(list.indexOf(list[i], 1));
			}
		}
	};

	window.addEventListener('scroll', function(e)
	{
		for(var i = 0; i < list.length; i++)
		{
			list[i]._onWindowScroll(e);
		}
	});

	window.addEventListener('resize', function(e)
	{
		for(var i = 0; i < list.length; i++)
		{
			list[i]._onWindowResize(e);
		}
	});

	Iridium.Breakpoints.addOnChange(function()
	{
		for(var i = 0; i < list.length; i++)
		{
			list[i]._onBreakpointChange();
		}
	});

	return Tooltip;
}());

// Initialization
Iridium.Init.register('tooltip', function(element)
{
	var ttElements = element.querySelectorAll('[data-ir-tt]');

	for(var i = 0; i < ttElements.length; i++)
	{
		var tt     = ttElements[i],
			params = {
				element: tt,
				content: tt.dataset.irTt,
				event: tt.dataset.irTtEvent,
				position: tt.dataset.irTtPos,
				margin: tt.dataset.irTtMg,
				tooltipClass: tt.dataset.irTtClass,
				showDelay: tt.dataset.irTtSd,
				hideDelay: tt.dataset.irTtHd,
				responsive: {
					sm: {
						event: tt.dataset.irTtSmEvent,
						position: tt.dataset.irTtSmPos,
						margin: tt.dataset.irTtSmMg
					},
					md: {
						event: tt.dataset.irTtMdEvent,
						position: tt.dataset.irTtMdPos,
						margin: tt.dataset.irTtMdMg
					},
					lg: {
						event: tt.dataset.irTtLgEvent,
						position: tt.dataset.irTtLgPos,
						margin: tt.dataset.irTtLgMg
					},
					xl: {
						event: tt.dataset.irTtXlEvent,
						position: tt.dataset.irTtXlPos,
						margin: tt.dataset.irTtXlMg
					}
				}
			};

		new Iridium.Tooltip(params);
	}
});
/**
 * Iridium Popup.
 * This file is part of Iridium Framework project.
 *
 * Iridium Framework is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Iridium Framework is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Iridium Framework. If not, see <http://www.gnu.org/licenses/>.
 *
 * @author rayleigh <rayleigh@protonmail.com>
 * @copyright 2018 Vladislav Pashaiev
 * @license LGPL-3.0+
 * @module popup
 * @requires Iridium
 * @requires Iridium.Builder
 */


Iridium.Popup = (function()
{

	var
		/**
		 * List of the visible popup windows.
		 * @type {Iridium.Popup[]}
		 */
		list      = [],

		/**
		 * Name of the class that will be added to the body element if window is visible.
		 * @type {string}
		 */
		bodyClass = 'ir-pp-active';

	/**
	 * Iridium Popup.
	 *
	 * @param {object} [parameters] Parameters of the popup window.
	 *
	 * @param {boolean} [parameters.remove=true] Remove popup layout on close.
	 *
	 * @param {string} [parameters.windowClass] Class of the window element.
	 *
	 * @param {boolean} [parameters.overlay=true] Create overlay under the window.
	 *
	 * @param {boolean} [parameters.closeButton=false] Show close button.
	 * @param {string|Element} [parameters.closeButtonContent=X] Content of the close button.
	 *
	 * @param {string|Element} [parameters.header] Content of the window header.
	 * @param {string|Element} [parameters.content] Content of the window.
	 *
	 * @param {object[]} [parameters.buttons] Buttons data.
	 * @param {string|Element} [parameters.buttons[].content] Content of the button.
	 * @param {boolean} [parameters.buttons[].close=true] Close window on click.
	 * @param {function} [parameters.buttons[].action] Action that done on click.
	 * @param {string} [parameters.buttons[].class] Class of the button.
	 *
	 * @param {string} [parameters.buttonsClass] Common buttons class.
	 *
	 * @param {function} [parameters.onShow] Callback function that called on window show.
	 * @param {function} [parameters.onHide] Callback function that called on window hide.
	 *
	 * @constructor
	 */
	function Popup(parameters)
	{
		this._params = {
			remove: true,
			overlay: true,
			closeButton: false,
			closeButtonContent: 'X'
		};

		Iridium.merge(this._params, parameters);
	}

	/**
	 * Sets text of the header.
	 * @param {string|Element} header Text of the header.
	 * @return {Iridium.Popup} Popup.
	 */
	Popup.prototype.setHeader = function(header)
	{
		this._params.header = header;
		return this;
	};

	/**
	 * Sets content of the window.
	 * @param {string|Element} content Content.
	 * @returns {Iridium.Popup} Popup.
	 */
	Popup.prototype.setContent = function(content)
	{
		this._params.content = content;
		return this;
	};

	/**
	 * Adds button to the window.
	 * @param {string|Element} content Content of the button.
	 * @param {boolean} [close=true] Close window on click.
	 * @param {function} [action] Action that done on click.
	 * @param {string} [className] Class of the button.
	 * @returns {Iridium.Popup} Popup.
	 */
	Popup.prototype.addButton = function(content, close, action, className)
	{
		if(!Array.isArray(this._params.buttons))
		{
			this._params.buttons = [];
		}

		this._params.buttons.push({
			content: content,
			close: close,
			action: action,
			class: className
		});

		return this;
	};

	/**
	 * Builds window element.
	 * @returns {Iridium.Popup}
	 * @see Iridium.Popup.isBuilded
	 */
	Popup.prototype.build = function()
	{
		var _         = this,
			structure = {
				class: 'ir-popup',
				childs: []
			};

		if(this._params.overlay)
		{
			structure.childs.push({
				class: 'ir-pp-overlay',
				on: {click: function() { _.close(); }}
			});
		}

		var windowStructure = {
			class: 'ir-pp-window',
			childs: []
		};

		if(typeof this._params.windowClass === 'string')
		{
			windowStructure.class += ' ' + this._params.windowClass;
		}

		if(this._params.header)
		{
			var headerStruct = {
				class: 'ir-pp-header',
				childs: []
			};

			if(typeof this._params.header === 'string')
			{
				headerStruct.html = this._params.header;
			}

			if(this._params.header instanceof Element)
			{
				headerStruct.childs.push(this._params.header);
			}

			if(this._params.closeButton)
			{
				var closeButtonStruct = {
					tag: 'button',
					class: 'ir-pp-close-btn',
					on: {
						click: function()
						{
							_.close();
						}
					}
				};

				if(typeof this._params.closeButtonContent === 'string')
				{
					closeButtonStruct.html = this._params.closeButtonContent;
				}

				if(this._params.closeButtonContent instanceof Element)
				{
					closeButtonStruct.childs = [this._params.closeButtonContent];
				}

				headerStruct.childs.push(closeButtonStruct);
			}

			windowStructure.childs.push(headerStruct);
		}

		if(this._params.content)
		{
			var contentStructure = {class: 'ir-pp-content'};

			if(typeof this._params.content === 'string')
			{
				contentStructure.html = this._params.content;
			}

			if(this._params.content instanceof Element)
			{
				contentStructure.childs = [this._params.content];
			}

			windowStructure.childs.push(contentStructure);
		}

		if(Array.isArray(this._params.buttons))
		{
			var buttonsStructure = {
				class: 'ir-pp-buttons',
				childs: []
			};

			this._params.buttons.forEach(function(buttonData)
			{
				var buttonClass = 'ir-pp-btn';

				if(typeof _._params.buttonsClass === 'string')
				{
					buttonClass += ' ' + _._params.buttonsClass;
				}

				if(typeof buttonData.class === 'string')
				{
					buttonClass += ' ' + buttonData.class;
				}

				var buttonStruct = {
					tag: 'button',
					class: buttonClass,
					on: {
						click: function(e)
						{
							e.stopPropagation();
							e.preventDefault();

							if(typeof buttonData.action === 'function')
							{
								buttonData.action();
							}

							if(buttonData.close === undefined || buttonData.close)
							{
								_.close();
							}
						}
					}
				};

				if(typeof buttonData.content === 'string')
				{
					buttonStruct.html = buttonData.content;
				}
				else if(buttonData.content instanceof Element)
				{
					buttonStruct.childs.push(buttonData.content);
				}

				buttonsStructure.childs.push(buttonStruct);
			});

			windowStructure.childs.push(buttonsStructure);
		}

		structure.childs.push(windowStructure);

		this._element = new Iridium.Builder(structure).build();
		this._window  = this._element.getElementsByClassName('ir-pp-window')[0];

		return this;
	};

	/**
	 * Updates position of the window.
	 */
	Popup.prototype.updatePosition = function()
	{
		if(!this._element)
		{
			return;
		}

		this._window.style.top  = (this._element.offsetHeight / 2 - this._window.offsetHeight / 2) + 'px';
		this._window.style.left = (this._element.offsetWidth / 2 - this._window.offsetWidth / 2) + 'px';
	};

	/**
	 * Builds (if not builded) and appends window element to the body.
	 * @returns {Iridium.Popup} Popup.
	 * @see Iridium.Popup.build
	 */
	Popup.prototype.create = function()
	{
		if(!this._element)
		{
			this.build();
		}

		this._element.style.display = 'none';
		document.body.appendChild(this._element);

		return this;
	};

	/**
	 * Creates (if not created) and shows window.
	 * @returns {Iridium.Popup} Popup.
	 * @see Iridium.Popup.create
	 */
	Popup.prototype.show = function()
	{
		if(!this.isCreated())
		{
			this.create();
		}

		if(typeof this._params.onShow === 'function')
		{
			this._params.onShow();
		}

		Iridium.addClass(document.body, bodyClass);

		this._element.style.display = '';
		this.updatePosition();
		list.push(this);

		return this;
	};

	Popup.prototype._onHide = function()
	{
		if(typeof this._params.onHide === 'function')
		{
			this._params.onHide();
		}

		if(list.length === 1)
		{
			Iridium.removeClass(document.body, bodyClass);
		}

		var i = list.indexOf(this);
		if(i > -1)
		{
			list.splice(i, 1);
		}
	};

	/**
	 * Hides window if it visible.
	 * @returns {Iridium.Popup} Popup.
	 * @see Iridium.Popup.isVisible
	 */
	Popup.prototype.hide = function()
	{
		if(!this.isVisible())
		{
			return this;
		}

		this._element.style.display = 'none';
		this._onHide();

		return this;
	};

	/**
	 * Removes window (if it created) from the body of the document.
	 * @returns {Iridium.Popup} Popup.
	 * @see Iridium.Popup.isCreated
	 */
	Popup.prototype.remove = function()
	{
		if(!this.isCreated())
		{
			return this;
		}

		this._onHide();
		document.body.removeChild(this._element);

		return this;
	};

	/**
	 * Removes or hides window.
	 * @returns {Iridium.Popup} Popup.
	 */
	Popup.prototype.close = function()
	{
		return this._params.remove ? this.remove() : this.hide();
	};

	/**
	 * Returns true if window element builded.
	 * @returns {boolean} True if window element builded.
	 */
	Popup.prototype.isBuilded = function()
	{
		return !!this._element;
	};

	/**
	 * Returns true if window element builded and appended to the body.
	 * @returns {boolean} True if window element builded and appended to the body.
	 */
	Popup.prototype.isCreated = function()
	{
		return this.isBuilded() && document.body.contains(this._element);
	};

	/**
	 * Returns true if window is visible.
	 * @returns {boolean} True if window is visible.
	 */
	Popup.prototype.isVisible = function()
	{
		return this.isCreated() && this._element.style.display !== 'none';
	};

	/**
	 * Closes all visible popups.
	 */
	Popup.closeAll = function()
	{
		list.forEach(function(popup)
		{
			popup.close();
		});
	};

	window.addEventListener('resize', function()
	{
		list.forEach(function(popup)
		{
			popup.updatePosition();
		});
	});

	return Popup;
}());

/**
 * Iridium SVG.
 * TODO: cache
 *
 * This file is part of Iridium Framework project.
 *
 * Iridium Framework is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Iridium Framework is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Iridium Framework. If not, see <http://www.gnu.org/licenses/>.
 *
 * @author rayleigh <rayleigh@protonmail.com>
 * @copyright 2018 Vladislav Pashaiev
 * @license LGPL-3.0+
 * @module svg
 * @requires Iridium
 * @requires Iridium.Init
 * @requires Iridium.Net
 */

/**
 * SVG load result callback function.
 * @callback SVGLoad
 * @param {Node} svgNode Loaded svg.
 */


/**
 * Iridium SVG.
 * Contains helper methods for working with the svg.
 */
Iridium.SVG = {
	/**
	 * Array of the loaded svg's.
	 */
	loaded: []
};

/**
 * Returns loaded svg.
 * @param url URL of the loaded svg.
 * @returns {Node|null} Loaded svg.
 */
Iridium.SVG.getLoaded = function(url)
{
	for(var i = 0; i < Iridium.SVG.loaded.length; i++)
	{
		if(Iridium.SVG.loaded[i].link === url)
		{
			return Iridium.SVG.loaded[i].svg.cloneNode(true);
		}
	}

	return null;
};

/**
 * Loads svg file from url as <svg> tag.
 * @param url URL of the svg file.
 * @param {SVGLoad} [callback] Callback function that accepts loaded svg.
 */
Iridium.SVG.loadFromURL = function(url, callback)
{
	var loaded = this.getLoaded(url);

	if(loaded)
	{
		if(typeof callback === 'function')
		{
			callback(loaded.cloneNode(true));
		}

		return;
	}

	Iridium.Net.get(url, null, function(svgDoc)
	{
		var svgNodes = svgDoc.getElementsByTagName('svg');

		if(svgNodes.length < 1)
		{
			return;
		}

		var svgNode = svgNodes[0];

		//Store svg's per page load
		Iridium.SVG.loaded.push({
			link: url,
			svg: svgNode
		});

		if(typeof callback === 'function')
		{
			callback(svgNode.cloneNode(true));
		}

	}, Iridium.Net.DataType.XML);
};

/**
 * Replaces image with svg src by loaded inline svg.
 * @param {Image} img Image element.
 */
Iridium.SVG.replaceImgByInline = function(img)
{
	if(img.src.split('.').pop().toLowerCase() !== 'svg')
	{
		return;
	}

	Iridium.SVG.loadFromURL(img.src, function(s)
	{
		img.parentNode.replaceChild(s.cloneNode(true), img);
	});
};

Iridium.Init.register('inline-svg', function(element)
{
	var i,
		svgElements = element.querySelectorAll('[data-inline-svg]'),
		links       = []; // Links on svg's and corresponding elements

	for(i = 0; i < svgElements.length; i++)
	{
		(function(i)
		{
			var img  = svgElements[i],
				link = img.src,
				linkObj;

			for(var j = 0; j < links.length; j++)
			{
				if(links[j].link === link)
				{
					linkObj = links[j];
				}
			}

			if(linkObj)
			{
				linkObj.elements.push(img);
				return;
			}

			links.push({
				link: link,
				elements: [img]
			});

		})(i);
	}

	for(i = 0; i < links.length; i++)
	{
		Iridium.SVG.loadFromURL(links[i].link, function(svg)
		{
			for(var j = 0; j < this.elements.length; j++)
			{
				var img = this.elements[j];
				svg.setAttribute('class', img.className);
				img.parentNode.replaceChild(svg.cloneNode(true), img);
			}
		}.bind(links[i]));
	}
});
/**
 * Iridium Combobox.
 * This file is part of Iridium Framework project.
 *
 * Iridium Framework is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Iridium Framework is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Iridium Framework. If not, see <http://www.gnu.org/licenses/>.
 *
 * @author rayleigh <rayleigh@protonmail.com>
 * @copyright 2018 Vladislav Pashaiev
 * @license LGPL-3.0+
 * @module combobox
 * @requires Iridium
 */

/**
 * Callback function that returns view for the element.
 * @callback ElementViewCallback
 * @param {*} element Element.
 * @return {string} View of the element.
 */

/**
 * Callback function that returns value of the element.
 * @callback ElementValueCallback
 * @param {*} element Element.
 * @return {*} Value of the element.
 */


/**
 * Iridium Combobox.
 *
 * @example
 * var combobox = new Iridium.Combobox({
	 * 	data: ['first', 'second', 'third'],
	 * 	strict: true,
	 * 	hintsNumber: 0
	 * });
 * document.body.appendChild(combobox);
 *
 * @param {object} parameters Parameters.
 *
 * @param {string[]|object[]|Iridium.DataList} parameters.data Data to display as hints.
 *
 * @param {boolean} [parameters.strict=false] Strict mode.
 * User must select one of the proposed variants otherwise an empty string will be returned.
 *
 * @param {boolean} [parameters.select=false] Disable text input and allow only hint selection.
 * That generates hints from all specified data.
 * Also activates hints display on combobox click.
 *
 * @param {boolean} [parameters.button=false] Create button in combobox layout that shows hints on click.
 * @param {Element|string} [parameters.buttonContent] Content of the combobox button. Can be html element or
 * raw html text that will be placed in innerHTML of the button.
 *
 * @param {boolean} [parameters.emptyInputHints=false] Display all hints from data if no text in the input field.
 *
 * @param {number} [parameters.hintsNumber=5] Number of the hints to display. To display unlimited ammount, set to 0.
 *
 * @param {ElementViewCallback} [parameters.mapElementView] Callback function that returns view for the element.
 * @param {ElementValueCallback} [parameters.mapElementValue] Callback function that returns value of the element.
 *
 * @param {object} [parameters.dataListParams] Parameters for the DataList usage.
 * @param {boolean} [parameters.dataListParams.autoload=true] Load DataList during combobox creation.
 * @param {boolean} [parameters.dataListParams.autoreload=false] Autoload DataList on text input.
 * @param {string} [parameters.dataListParams.filterFieldName] Name of the parameter of filter for the elements.
 * @param {string} [parameters.dataListParams.numberFieldName] Name of the parameter of elements number to load.
 *
 * @return {HTMLElement} Combobox element.
 *
 * @constructor
 */
Iridium.Combobox = function(parameters)
{
	var params = {
		data: null,
		strict: false,
		select: false,
		button: false,
		buttonContent: null,
		emptyInputHints: false,
		hintsNumber: 5,
		mapElementView: null,
		mapElementValue: null,
		dataListParams: {
			autoload: true,
			autoreload: false,
			filterFieldName: '',
			numberFieldName: ''
		}
	};

	Iridium.merge(params, parameters);

	if(!params.data)
	{
		throw new Error("Parameter 'data' must be defined.");
	}

	var selHintIndex = -1,
		useDataList  = false,
		matchElement = null;

	// DataList support
	if(Iridium.DataList && params.data instanceof Iridium.DataList)
	{
		if(!params.mapElementView && !params.mapElementValue)
		{
			throw new Error("Parameters 'mapElementView' and 'mapElementValue' must be assigned to be able to use DataList as data array.");
		}

		useDataList = true;

		if(params.dataListParams.numberFieldName && params.hintsNumber > 0)
		{
			var loadData                                    = {};
			loadData[params.dataListParams.numberFieldName] = params.hintsNumber;
			params.data.setPostData(loadData);
		}

		if(params.dataListParams.autoload)
		{
			params.data.load();
		}
	}

	var combobox = document.createElement('combo-box'),
		field    = document.createElement('input'),
		hints    = document.createElement('div');

	hints.className = 'ir-cb-hints';
	field.type      = 'text';
	field.setAttribute('autocomplete', 'off');

	combobox.appendChild(field);
	combobox.appendChild(hints);

	if(params.button)
	{
		var button = document.createElement('button');

		if(params.buttonContent instanceof Element)
		{
			button.appendChild(params.buttonContent);
		}
		else if(typeof params.buttonContent === 'string')
		{
			button.innerHTML = params.buttonContent;
		}

		button.className = 'ir-cb-btn';
		button.addEventListener('click', function(e)
		{
			e.preventDefault();
			e.stopPropagation();
			updateHints(true);
			setHintsVisible(isHintsVisible() ? false : hints.children.length > 0);
		});

		combobox.appendChild(button);
	}

	if(params.emptyInputHints || params.select)
	{
		updateHints();
	}

	if(params.select)
	{
		field.disabled = true;
		combobox.addEventListener('click', function()
		{
			setHintsVisible(hints.children.length > 0);
		});
	}

	Object.defineProperties(combobox, {
		'value': {
			get: function()
			{
				var result;

				if(matchElement)
				{
					result = matchElement;

					if(typeof params.mapElementValue === 'function')
					{
						result = params.mapElementValue(result);
					}
				}
				else
				{
					if(params.strict)
					{
						return '';
					}

					result = field.value;
				}

				return result;
			},
			set: function(val)
			{
				field.value = val;
				onInput();
			}
		},
		'id': {
			get: function() { return field.id; },
			set: function(val) { field.id = val; }
		},
		'pattern': {
			get: function() { return field.pattern; },
			set: function(val) { field.pattern = val; }
		},
		'placeholder': {
			get: function() { return field.placeholder; },
			set: function(val) { field.placeholder = val; }
		},
		'title': {
			get: function() { return field.title; },
			set: function(val) { field.title = val; }
		},
		'required': {
			get: function() { return field.required; },
			set: function(val) { field.required = val; }
		},
		'inputElement': {
			get: function() { return field; }
		}
	});

	function setHintsVisible(visible)
	{
		hints.style.display = visible ? '' : 'none';
	}

	function isHintsVisible()
	{
		return hints.style.display !== 'none';
	}

	function hintSelected(val)
	{
		field.value = val;
		onInput();

		if(typeof params.onHintSelected === 'function')
		{
			params.onHintSelected();
		}

		updateHints();
	}

	function getDataArray()
	{
		return useDataList ? params.data.list : params.data;
	}

	function onInput()
	{
		updateHints();

		try
		{
			combobox.dispatchEvent(new Event('input'));
		}
		catch(e)
		{
			var event = document.createEvent('Event');
			event.initEvent('input', true, true);
			combobox.dispatchEvent(event);
		}

		setHintsVisible(hints.children.length > 0 && document.activeElement === field);
	}

	/**
	 * Updates hints.
	 * @param all Create all hints based on data.
	 */
	function updateHints(all)
	{
		//Remove hints
		while(hints.children.length > 0)
		{
			hints.removeChild(hints.children[0]);
		}

		function addHints()
		{
			var len        = getDataArray().length,
				exactMatch = null;

			for(var i = 0; i < len && (params.hintsNumber === 0 || i < params.hintsNumber); i++)
			{
				var element     = getDataArray()[i],
					elementView = element;

				if(typeof params.mapElementView === 'function')
				{
					elementView = params.mapElementView(elementView);
				}

				var lowcaseElementView = elementView.toLowerCase(),
					lowcaseFieldValue  = field.value.toLowerCase();

				// If select is defined, display all hints
				// If emptyInputHints is defined, display all hints if no input text
				// otherwise display only hints that contains input text
				if(all || params.select || params.emptyInputHints && !field.value || field.value && Iridium.stringContains(lowcaseFieldValue, lowcaseElementView))
				{
					var hintElement       = document.createElement('div');
					hintElement.className = 'ir-cb-hint';

					hintElement.addEventListener('mousedown', function()
					{
						hintSelected(this);
					}.bind(elementView));

					hintElement.appendChild(document.createTextNode(elementView));
					hints.appendChild(hintElement);
				}

				// Search for the first exact match
				if(lowcaseElementView === lowcaseFieldValue && !exactMatch)
				{
					exactMatch = element;
				}
			}

			matchElement = exactMatch;
		}

		if(useDataList && params.dataListParams.autoreload)
		{
			var loadData = {};

			if(params.dataListParams.filterFieldName && field.value)
			{
				loadData[params.dataListParams.filterFieldName] = field.value;
			}

			params.data.updatePostData(loadData);
			params.data.load(addHints);
		}
		else
		{
			addHints();
		}

		selHintIndex = -1;
	}

	setHintsVisible(false);

	field.addEventListener('input', function()
	{
		onInput();
	});

	field.addEventListener('keydown', function(e)
	{
		if(!hints.children.length)
		{
			return;
		}

		if(e.keyCode === 38 || e.keyCode === 40)
		{
			e.preventDefault();

			var currentHint = hints.children[selHintIndex];
			if(currentHint)
			{
				Iridium.removeClass(currentHint, 'selected');
			}

			if(e.keyCode === 38) // Up
			{ selHintIndex--; }
			else if(e.keyCode === 40) // Down
			{ selHintIndex++; }

			if(selHintIndex < 0)
			{
				selHintIndex = -1;
			}

			if(selHintIndex > hints.children.length - 1)
			{
				selHintIndex = hints.children.length - 1;
			}

			Iridium.addClass(hints.children[selHintIndex], 'selected');
		}
		else if(e.keyCode === 13) // Enter
		{
			e.preventDefault();

			if(selHintIndex >= 0)
			{
				hintSelected(hints.children[selHintIndex].innerHTML);
				matchElement = getDataArray()[selHintIndex];
				field.blur();
			}
		}
	});

	field.addEventListener('focus', function(e)
	{
		field.select();
		setHintsVisible(hints.children.length > 0);
	});

	field.addEventListener('blur', function()
	{
		setHintsVisible(false);
	});

	combobox.hideHints = function()
	{
		setHintsVisible(false);
	};

	Iridium.Combobox.list.push(combobox);

	return combobox;
}

Iridium.Combobox.list = [];

window.addEventListener('click', function(e)
{
	// Leave only comboboxes tha are in body
	Iridium.Combobox.list = Iridium.Combobox.list.filter(function(cb)
	{
		return document.body.contains(cb);
	});

	// Hide hints on all comboboxes except target one
	Iridium.Combobox.list.forEach(function(cb)
	{
		if(e.target !== cb && !cb.contains(e.target))
		{
			cb.hideHints();
		}
	});
});

/**
 * Iridium Tabs.
 * This file is part of Iridium Framework project.
 *
 * Iridium Framework is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Iridium Framework is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Iridium Framework. If not, see <http://www.gnu.org/licenses/>.
 *
 * @author rayleigh <rayleigh@protonmail.com>
 * @copyright 2018 Vladislav Pashaiev
 * @license LGPL-3.0+
 * @module tabs
 * @requires Iridium
 * @requires Iridium.Init
 * @requires Iridium.UrlData
 */


Iridium.Tabs = (function()
{

	var
		/**
		 * Counter for the tabs elements on the page.
		 * @type {number}
		 */
		tabsCount = 0,

		/**
		 * List of the initialized tabs.
		 * @type {Array}
		 */
		tabs      = [],

		/**
		 * Unique tabs names.
		 * @type {Array}
		 */
		names     = [];

	/**
	 * Iridium Tabs.
	 *
	 * @param {object} params Tabs parameters.
	 * @param {HTMLElement[]} params.buttons Array with buttons.
	 * @param {HTMLElement[]} params.tabs Array with tabs.
	 * @param {int} [params.defaultTab=0] Number of the default tab.
	 * @param {boolean} [params.useUrl=true] Use URL to save number of the active tab.
	 * @param {string} [params.urlKeyName=tab_] Name of the key that is used to store number of the active tab in the url.
	 * @param {string} [params.name] Unique name of the tabs that is used to store number of the active tab in the url. It will replace urlKeyName parameter.
	 *
	 * @constructor
	 */
	function Tabs(params)
	{
		var _ = this;

		_._params = {
			defaultTab: 0,
			useUrl: true,
			urlKeyName: 'tab_'
		};

		Iridium.merge(_._params, params);

		if(!(Array.isArray(_._params.buttons) && _._params.buttons.length))
		{
			throw new Error('Parameter "buttons" should be an array with elements.');
		}

		if(!(Array.isArray(_._params.tabs) && _._params.tabs.length))
		{
			throw new Error('Parameter "tabs" should be an array with elements.');
		}

		if(_._params.name)
		{
			if(names.indexOf(_._params.name) !== -1)
			{
				throw new Error('Tabs name already taken by another tabs.');
			}

			names.push(_._params.name);
		}

		/**
		 * Number of the tabs element on the page.
		 * @type {number}
		 * @private
		 */
		_._tabsNum = tabsCount++;

		/**
		 * Unique name of the tabs.
		 * @type {string}
		 * @private
		 */
		_._tabsName = _._params.name ? _._params.name : _._params.urlKeyName + _._tabsNum;

		if(_._params.useUrl && Iridium.UrlData.has(_._tabsName))
		{
			_.show(parseInt(Iridium.UrlData.get(_._tabsName)));
		}
		else
		{
			_.show(_._params.defaultTab);
		}

		// Click event listeners for the buttons
		var buttons = _._params.buttons;
		for(var i = 0; i < buttons.length; i++)
		{
			if(buttons[i] instanceof HTMLElement)
			{
				buttons[i].addEventListener('click', function(i)
				{
					return function(e)
					{
						e.preventDefault();
						_.show(i);
					};
				}(i));
			}
		}

		tabs.push(_);
	}

	/**
	 * Shows tab with the specified number.
	 * @param tabNumber Number of the tab.
	 */
	Tabs.prototype.show = function(tabNumber)
	{
		var tabs    = this._params.tabs,
			buttons = this._params.buttons,
			opened  = false;

		buttons.forEach(function(btn)
		{
			if(btn instanceof HTMLElement)
			{
				Iridium.removeClass(btn, 'active');
			}
		});

		if(buttons[tabNumber] instanceof HTMLElement)
		{
			Iridium.addClass(buttons[tabNumber], 'active');
		}

		for(var i = 0; i < tabs.length; i++)
		{
			var tab = tabs[i];

			if(!(tab instanceof HTMLElement))
			{
				continue;
			}

			if(i === tabNumber)
			{
				tab.style.display = '';

				if(typeof this._params.onShow === 'function')
				{
					this._params.onShow(i);
				}

				if(this._params.useUrl)
				{
					Iridium.UrlData.set(this._tabsName, i + '');
				}

				opened = true;
			}
			else
			{
				tab.style.display = 'none';
			}
		}

		return opened;
	};

	/**
	 * Updates current tab to correspond specified index in the url (uses UrlData module).
	 */
	Tabs.prototype.update = function()
	{
		if(Iridium.UrlData.has(this._tabsName))
		{
			this.show(parseInt(Iridium.UrlData.get(this._tabsName)));
		}
	};

	/**
	 * List of the initialized tabs.
	 * @property {Tabs[]} list
	 * @memberOf Tabs
	 * @readonly
	 * @static
	 */
	Object.defineProperty(Tabs, 'list', {
		enumerable: false,
		get: function()
		{
			// Return copy
			return tabs.slice();
		}
	});

	/**
	 * Finds and returns tabs by the unique name.
	 * @param {string} name Name of the tabs.
	 * @returns {Tabs|null}
	 * @static
	 */
	Tabs.getByName = function(name)
	{
		for(var i = 0; i < tabs.length; i++)
		{
			if(tabs[i]._tabsName && tabs[i]._tabsName === name)
			{
				return tabs[i];
			}
		}

		return null;
	};

	/**
	 * Updates all tabs to correspond specified index in the url (uses UrlData module).
	 * @static
	 */
	Tabs.update = function()
	{
		this.list.forEach(function(t) { t.update(); });
	};

	// Initialization
	Iridium.Init.register('ir-tabs', function(element)
	{
		tabsCount    = 0;
		tabs.length  = 0;
		names.length = 0;

		var tabsElements = element.querySelectorAll('[data-ir-tabs]');

		for(var i = 0; i < tabsElements.length; i++)
		{
			var te = tabsElements[i];

			var buttons   = te.querySelectorAll('[data-ir-tabs-btn]'),
				container = document.getElementById(te.dataset.irTabs);

			if(!(buttons.length && container))
			{
				continue;
			}

			new Tabs({
				buttons: Array.prototype.slice.call(buttons),
				tabs: Array.prototype.slice.call(container.children),
				name: te.dataset.irTabsName
			});
		}
	});

	return Tabs;
}());
/**
 * Touchable elements.
 * When touchable element lost focus, class 'touched' added to it.
 * To set element touchable add 'data-touchable' attribute (without parameters) to the element.
 *
 * This file is part of Iridium Framework project.
 *
 * Iridium Framework is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Iridium Framework is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Iridium Framework. If not, see <http://www.gnu.org/licenses/>.
 *
 * @author rayleigh <rayleigh@protonmail.com>
 * @copyright 2018 Vladislav Pashaiev
 * @license LGPL-3.0+
 * @module touchable
 * @requires Iridium
 * @requires Iridium.Init
 */


Iridium.Init.register('touchable', function(element)
{
	var elements = element.querySelectorAll('[data-touchable]');
	for(var i = 0; i < elements.length; i++)
	{
		elements[i].addEventListener('blur', function()
		{
			Iridium.addClass(this, 'touched');
		});
	}
});

/**
 * Iridium DataList.
 * This file is part of Iridium Framework project.
 *
 * Iridium Framework is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Iridium Framework is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Iridium Framework. If not, see <http://www.gnu.org/licenses/>.
 *
 * @author rayleigh <rayleigh@protonmail.com>
 * @copyright 2018 Vladislav Pashaiev
 * @license LGPL-3.0+
 * @module data_list
 * @requires Iridium
 * @requires Iridium.Net
 */

/**
 * List load callback function.
 * @callback ListLoadCallback
 * @param {Array} list List.
 */

/**
 * Callback function that caled before list load.
 * @callback ListLoadBeginCallback
 * @param {object} postData Data that will be sended with request of the list.
 */


/**
 * Creates new DataList.
 * Used to obtain lists from the server.
 * Supports page navigation and livereload.
 *
 * @param {object} [parameters] Parameters.
 * @param {string} [parameters.url] URL of the list.
 * @param {boolean} [parameters.pageNav=false] Use page navigation.
 * @param {object} [parameters.postData] Data that will be sended with request of the list.
 *
 * @param {object} [parameters.resultMap] Contains names of the parameters for obtain result data.
 * @param {string} [parameters.resultMap.pages=pages] Name of the parameter of total pages number.
 * @param {string} [parameters.resultMap.page=page] Name of the parameter of current page number.
 * @param {string} [parameters.resultMap.list=list] Name of the parameter of list.
 *
 * @param {object} [parameters.pageNavMap] Contains names of the parameters for page navigation.
 * @param {string} [parameters.pageNavMap.page=page] Name of the parameter of page number to go to.
 * @param {string} [parameters.pageNavMap.move=move] Name of the parameter of move direction.
 * DataList sends -1 to go backward and 1 to go forward.
 *
 * @param {ListLoadBeginCallback} [parameters.onLoadBegin] Callback function that called before every list load.
 * @param {ListLoadCallback} [parameters.onLoad] Callback function that called after every list load.
 *
 * @constructor
 */
Iridium.DataList = function(parameters)
{
	var _              = this,
		params         = {
			url: '',
			pageNav: false,
			postData: {},
			resultMap: {
				pages: 'pages',
				page: 'page',
				list: 'list',
			},
			pageNavMap: {
				page: 'page',
				move: 'move'
			}
		},
		data           = [],
		page           = 0,
		pages          = 0,
		move           = 0,
		reloadIntervId = 0;

	Iridium.merge(params, parameters);

	Object.defineProperties(_, {
		'list': {
			get: function() { return data; }
		},
		'url': {
			get: function() { return params.url; },
			set: function(val) { params.url = val; }
		},
		'page': {
			get: function() { return page; }
		},
		'pages': {
			get: function() { return pages; }
		},
		'length': {
			get: function() { return data.length; }
		}
	});

	/**
	 * Loads list.
	 * @param {ListLoadCallback} [callback] Callback that will be called after list load.
	 */
	this.load = function(callback)
	{
		if(Iridium.empty(params.url))
		{
			throw new Error('URL must be defined.');
		}

		var postData = Iridium.clone(params.postData);

		if(params.pageNav)
		{
			var pgData                     = {};
			pgData[params.pageNavMap.page] = page;
			pgData[params.pageNavMap.move] = move;
			Iridium.merge(postData, pgData);
		}

		if(typeof params.onLoadBegin === 'function')
		{
			params.onLoadBegin(postData);
		}

		Iridium.Net.post(params.url, postData, function(resultData)
			{
				// Retrieve page navigation data
				if(params.pageNav)
				{
					page  = resultData[params.resultMap.page];
					pages = resultData[params.resultMap.pages];
					move  = 0;
				}

				if(resultData.hasOwnProperty(params.resultMap.list))
				{
					data = resultData[params.resultMap.list];
				}
				else
				{
					data = resultData;
				}

				// Array only!
				if(!Array.isArray(data))
				{
					data = [];
				}

				if(typeof params.onLoad === 'function')
				{
					params.onLoad(data);
				}

				if(typeof callback === 'function')
				{
					callback(data);
				}
			},
			Iridium.Net.DataType.JSON);
	};

	/**
	 * Sets post data that will be sended along with request.
	 * @param data Post data.
	 */
	this.setPostData = function(data)
	{
		params.postData = data;
	};

	/**
	 * Updates post data that will be sended along with request by the data that was passed as argument.
	 * @param data Post data.
	 */
	this.updatePostData = function(data)
	{
		Iridium.merge(params.postData, data);
	}

	/**
	 * Enables live reload.
	 * When enabled, reloads list every interval.
	 * @param {int} [interval=1000] Interval in milliseconds.
	 */
	this.liveReload = function(interval)
	{
		interval       = interval || 1000;
		reloadIntervId = setInterval(_.load, interval);
	};

	/**
	 * Stops live reload.
	 */
	this.stopLiveReload = function()
	{
		clearInterval(reloadIntervId);
	};

	/**
	 * Moves one page forward on next list load.
	 */
	this.nextPage = function()
	{
		move = 1;
	};

	/**
	 * Moves one page backward on next list load.
	 */
	this.prevPage = function()
	{
		move = -1;
	};

	/**
	 * Moves to the first page on next list load.
	 */
	this.firstPage = function()
	{
		page = 0;
		move = 0;
	};

	/**
	 * Move to the last page on next list load.
	 */
	this.lastPage = function()
	{
		page = pages;
		move = 0;
	};

	/**
	 * Moves to the specified page on next list load.
	 * @param {int} pageNum Number of the page.
	 */
	this.toPage = function(pageNum)
	{
		move = 0;
		page = pageNum;
	};

	/**
	 * Clears list.
	 */
	this.clearData = function()
	{
		if(data)
		{
			data.length = 0;
		}
	};
}
