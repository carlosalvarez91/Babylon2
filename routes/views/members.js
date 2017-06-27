var keystone = require('keystone'),
	_ = require('lodash');

var User = keystone.list('User');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	locals.section = 'members';
	locals.page.title = 'Members - SydJS';




	// Load Community

	view.on('init', function(next) {
		User.model.find()
		.where('isPublic', true)
		.where('_id').nin(locals.organiserIDs)
		.where('_id').nin(locals.speakerIDs)
		.exec(function(err, community) {
			if (err) res.err(err);
			locals.community = community;
			next();
		});
	});


	view.render('site/members');
}
