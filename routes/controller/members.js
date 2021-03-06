var keystone = require('keystone'),
	_ = require('lodash');

var User = keystone.list('User');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	locals.section = 'members';
	locals.page.title = 'Members - Babylon';



	// Load Community

	view.on('init', function(next) {
		User.model.find()
		//.sort('name')
		.where('isPublic', true)
		.exec(function(err, community) {
			if (err) res.err(err);
			locals.community = community;
			next();
		});
	});

	var lang = (req.session.languageselected ? req.session.languageselected.key : 'en');

	view.render(lang +  '/site/members');
}