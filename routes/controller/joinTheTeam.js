var keystone = require('keystone');
var Enquiry = keystone.list('Enquiry');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'jointheteam';
	
		var lang = (req.session.languageselected ? req.session.languageselected.key : 'en');

	view.render(lang + '/site/joinTheTeam');
};