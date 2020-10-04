/**
 * Menu control.
 */
var Menu = { };

Menu.setElement = function(element)
{
	this._element = element;
};

Menu.getElement = function()
{
	return this._element;
};

Menu.hide = function()
{
	if(!this._element)
	{
		return;
	}

	Iridium.addClass(this._element, 'mob-hidden');
};

Menu.show = function()
{
	if(!this._element)
	{
		return;
	}

	Iridium.removeClass(this._element, 'mob-hidden');
};

Menu.isVisible = function()
{
	return !!this._element && !Iridium.hasClass(this._element, 'mob-hidden');
};

Menu.toggle = function()
{
	if(this.isVisible())
	{
		this.hide();
	}
	else
	{
		this.show();
	}
};