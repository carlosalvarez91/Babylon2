var keystone = require('keystone');

var Classified = keystone.list('Classified');
var ClassifiedComment = keystone.list('ClassifiedComment');
var ClassifiedTag = keystone.list('ClassifiedTag');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res),
		locals = res.locals;

	// Init locals
	locals.section = 'classified';
	locals.filters = {
		classified: req.params.classified
	};

	view.on('init', function(next) {

		Classified.model.findOne()
			.where('slug', locals.filters.classified)
			.populate('author')
			.exec(function(err, classified) {

				if (err) return res.err(err);
				if (!classified) return res.notfound('Classified not found');

				// Allow admins or the author to see draft classifieds
				if (classified.state == 'published' || (req.user && req.user.isAdmin) || (req.user && classified.author && (req.user.id == classified.author.id))) {
					locals.classified = classified;
					locals.classified.populateRelated('comments[author]', next);
					locals.page.title = classified.title + ' - Classifieds - Babylon';
				} else {
					return res.notfound('Classified not found');
				}

			});

	});

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

	// Load recent classifieds
	view.query('data.classifieds',
		Classified.model.find()
			.where('state', 'published')
			.sort('-publishedDate')
			.populate('author')
			.limit('4')
	);

	//Create a comment
	view.on('post', { action: 'create-comment' }, function(next) {

		// handle form
		var newClassifiedComment = new ClassifiedComment.model({
				classified: locals.classified.id,
				author: locals.user.id
			}),
			updater = newClassifiedComment.getUpdateHandler(req, res, {
				errorMessage: 'There was an error creating your comment:'
			});

		updater.process(req.body, {
			flashErrors: true,
			logErrors: true,
			fields: 'content'
		}, function(err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				req.flash('success', 'Your comment has been added successfully.');
				return res.redirect('/classifieds/classified/' + locals.classified.slug);
			}
			next();
		});

	});

	// Delete Classified
	// inspired by: https://gist.github.com/wuhaixing/e90b8497f925ff9c7bfc
	view.on('get', { remove: 'classified' }, function(next) {
			if (!req.user) {
				req.flash('error', 'You must be signed in to delete a classified.');
				return next();
			}
		Classified.model.findOne({
				_id: req.query.classified
			})
			.exec(function(err, classified) {
				if (err) {
					if (err.name == 'CastError') {
						req.flash('error', 'The classified' + req.query.classified + ' could not be found.');
						return next();
					}
					return res.err(err);
				}
				if (!classified) {
					req.flash('error', 'The classified ' + req.query.classified + ' could not be found.');
					return next();
				}
				if (classified.author != req.user.id) {
					req.flash('error', 'Sorry, you must be the author of a classified to delete it.');
					return next();
				}
				classified.remove(function(err) {
					if (err) return res.err(err);
					req.flash('success', 'Your classified has been deleted.');
					return res.redirect('/classifieds');
				});
			});
	});

	//Update a Classified
	// why not using put request?
	view.on('post', { action: 'update-classified' }, function(next) {
		
		if(!req.body.title || !req.body.title.trim()){
			req.flash('error', 'You need to provide a title.');
			return res.redirect('/classifieds/classified/' + locals.classified.slug);
		}

		//Image issue fixed, see : https://stackoverflow.com/questions/4526273/what-does-enctype-multipart-form-data-mean
		//In pug : When you are writing client-side code, all you need to know is use multipart/form-data when your form includes any <input type="file"> elements.
		locals.classified.getUpdateHandler(req).process(req.body, {
			fields: 'title, tag, image, content.extended,',
			flashErrors: true
		}, function(err) {
		
			if (err) {
				return res.err(err);
			}

			req.flash('success', 'Your changes have been saved.');
			res.redirect('/classifieds/classified/' + locals.classified.slug);
		
		});

	});

	//Delete Comment
	view.on('get', { remove: 'comment' }, function(next) {

		if (!req.user) {
			req.flash('error', 'You must be signed in to delete a comment.');
			return next();
		}
		ClassifiedComment.model.findOne({
				_id: req.query.comment,
				classified: locals.classified.id
			})
			.exec(function(err, comment) {
				if (err) {
					return res.err(err);
				}
				if (!comment) {
					req.flash('error', 'The comment ' + req.query.comment + ' could not be found.');
					return next();
				}
				if (comment.author != req.user.id) {
					req.flash('error', 'Sorry, you must be the author of a comment to delete it.');
					return next();
				}
				comment.remove(function(err) {
					if (err) return res.err(err);
					req.flash('success', 'Your comment has been deleted.');
					return res.redirect('/classifieds/classified/' + locals.classified.slug);
				});
			});
	});

	//Update a Comment
	view.on('post', { action: 'update-comment' }, function(next) {

		var contentHtml = '<p>' + req.body.content + '</p>\n';
		
		ClassifiedComment.model.findOneAndUpdate(
			{_id: req.body.comment}, 
			{$set: {"content.md": req.body.content, "content.html": contentHtml}
		})
		.exec(function(err, comment) {
				if(err) {
					return res.err(err);
				}
				if(!comment){
					req.flash('error', 'The comment ' + req.query.comment + ' could not be found.');
					return next();
				}
				if (comment.author != req.user.id) {
					req.flash('error', 'Sorry, you must be the author of a comment to modify it.');
					return next();
				}
				req.flash('success', 'Your comment has been modified.');
				res.redirect('/classifieds/classified/' + locals.classified.slug);
		});

	});

	// Render the view
	var lang = (req.session.languageselected ? req.session.languageselected.key : 'en');
	view.render(lang + '/site/classified');

}
