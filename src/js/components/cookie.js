/**
 * Methods for working with cookies.
 * @namespace
 * @todo Move to the Iridium Framework.
 * @see https://learn.javascript.ru/cookie
 */
var Cookie = {};

/**
 * Returns the cookie value by name.
 * @param {string} name Name of the cookie.
 * @returns {string|undefined} Value of the cookie.
 * @static
 */
Cookie.get = function(name)
{
	var matches = document.cookie.match(
		new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
	);
	return matches ? decodeURIComponent(matches[1]) : undefined;
};

/**
 * Sets the cookie.
 * @param {string} name Name of the cookie.
 * @param {string} value Value of the cookie.
 * @param {object} [options] Options of the cookie.
 * @param {number|Date} [options.expires=0] Time when the cookie is expires.
 * If number - seconds till expires, if 'Date' - date when cookie expires.
 * If 0, cookie will be alive till the end of the session.
 * @param {string} [options.path=/] Path of the cookie.
 * @param {string} [options.domain] Domain of the cookie.
 * @param {boolean} [options.secure=false] Send cookie over https only.
 * @static
 */
Cookie.set = function(name, value, options)
{
	options = options || {};
	var expires = options.expires;

	if(typeof expires === 'number' && expires)
	{
		var d = new Date();
		d.setTime(d.getTime() + expires * 1000);
		expires = options.expires = d;
	}

	if(expires && expires.toUTCString)
	{
		options.expires = /** @type {Date} */expires.toUTCString();
	}

	value = encodeURIComponent(value);
	var updatedCookie = name + '=' + value;

	for(var propName in options)
	{
		updatedCookie += '; ' + propName;
		var propValue = options[propName];

		if(propValue !== true)
		{
			updatedCookie += '=' + propValue;
		}
	}

	document.cookie = updatedCookie;
};

/**
 * Removes cookie with the specified name.
 * @param {string} name Name of the cookie.
 * @static
 */
Cookie.remove = function(name)
{
	this.set(name, '', {expires: -1});
};