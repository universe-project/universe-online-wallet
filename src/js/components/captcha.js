
var Captcha = {};

Captcha.set = function(imgElement, barElement)
{
	this._imgElement = imgElement;
	this._barElement = barElement;
};

Captcha._load = function(callback)
{
	Iridium.Net.post('?op=getCaptcha', null, function(result)
	{
		if(result.error)
		{
			console.error(result.error);
			displayError(lang.error, '<p>' + lang.captcha.loadErr + '</p>');
			return;
		}

		callback(result);
	});
};

Captcha.enable = function()
{
	var _ = this;

	if(!(_._imgElement && _._barElement))
	{
		throw Error('Captcha elements is required.');
	}

	// TODO: use captcha._load(...)
	(function load()
	{
		Iridium.Net.post('?op=getCaptcha', null, function(result)
		{
			if(result.error)
			{
				console.error(result.error);
				displayError(lang.error, '<p>' + lang.captcha.loadErr + '</p>');
				return;
			}

			_._imgElement.setAttribute('src', 'data:image/png;base64,' + result.pic);
			_._hash = result.hash;
			_._toId = setTimeout(load, result.alive * 1000);

			_._animation = new Iridium.Animation({
				element: _._barElement,
				animation: {
					start: { width: '100%' },
					end: { width: '0%' }
				},
				duration: result.alive * 1000
			});
		});
	})();
};

Captcha.disable = function()
{
	if(this._toId)
	{
		clearTimeout(this._toId);
	}

	if(this._animation)
	{
		this._animation.stop();
	}
};

Captcha.getHash = function() { return this._hash; };