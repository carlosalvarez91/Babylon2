var keystone = require('keystone'),
	Classified = keystone.list('Classified'),
	ClassifiedTag = keystone.list('ClassifiedTag');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;

	//if not User
	if(!locals.user) res.redirect('/');
	
	//if no Session
	if(!req.session.country){
		return res.redirect('/classifieds');
	};
	
	locals.section = 'me';
	locals.page.title = 'Create a Classified - Babylon';
	
	// Load ClassifiedTags
	view.on('init', function(next) {
		ClassifiedTag.model.find()
		.sort('name')		
		.exec(function(err, tagsList) {
			if (err) res.err(err);
			locals.tags = tagsList;
			next();
		});
	});

	view.on('post', { action: 'create-classified' }, function(next) {
		
		var session = req.session.country;
		// handle form
		var newClassified = new Classified.model({
				author: locals.user.id,
				publishedDate: new Date(),
				country: session
			}),

			updater = newClassified.getUpdateHandler(req, res, {
				errorMessage: 'There was an error creating your new classified:'
			});
		
		// automatically publish classifieds by admin users
		if (locals.user.isAdmin) {
			newClassified.state = 'published';
		}
		
		updater.process(req.body, {
			flashErrors: true,
			logErrors: true,
			fields: 'title, tag, image, content.extended'
		}, function(err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				newClassified.notifyAdmins();
				req.flash('success', 'Your classified has been added' + ((newClassified.state == 'draft') ? ' and will appear on the site once it\'s been approved' : '') + '.');
				return res.redirect('/classifieds/classified/' + newClassified.slug);
			}
			next();
		});

	});
	
	var lang = (req.session.languageselected ? req.session.languageselected.key : 'en');
	view.render(lang + '/site/createClassified');
	
}
