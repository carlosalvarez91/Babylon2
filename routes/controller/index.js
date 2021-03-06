var keystone = require('keystone'),
	moment = require('moment')

var Post = keystone.list('Post')

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
	locals = res.locals;
	
	locals.section = 'home';
	locals.page.title = 'Welcome to Babylon';
	locals.country = req.session.country;

	locals.user = req.user;
	var cultureTag, newsTag, whatsonTag, lifestyleTag;

	// Decide which to render
	if(!locals.country || (locals.country == '')){
		req.flash('error', 'Search a country first please.');
	};

	/* load the culture tag */
	view.on('init', function(next) {
		keystone.list('PostTag').model.findOne({ key: "culture" }).exec(function(err, result) {
				cultureTag = result;
				next(err);
		});
	});

	/* Load the 4 latest culture posts */
	view.on('init', function(next) {
		//if no country
		if(!locals.country || (locals.country == '')){
			return next();
		};
		var q = keystone.list('Post').model.find().where({$and:[{'state':'published'}, {'country': locals.country._id}, {'tag' : cultureTag }]}).sort('-publishedDate').populate('author').limit(4);	

		q.exec(function(err, results) {
			locals.culturePosts = results;
			next(err);
		});
	});

	/* load the news tag */
	view.on('init', function(next) {
		keystone.list('PostTag').model.findOne({ key: "news" }).exec(function(err, result) {
				newsTag = result;
				next(err);
		});
	});

	/* Load the 4 latest news posts */
	view.on('init', function(next) {
		//if no country
		if(!locals.country || (locals.country == '')){
			return next();
		};
		var q = keystone.list('Post').model.find().where({$and:[{'state':'published'}, {'country': locals.country._id}, {'tag' : newsTag }]}).sort('-publishedDate').populate('author').limit(4);	

		q.exec(function(err, results) {
			locals.newsPosts = results;
			next(err);
		});
	});

	/* load the lifestyle tag */
	view.on('init', function(next) {
		keystone.list('PostTag').model.findOne({ key: "lifestyle" }).exec(function(err, result) {
				lifestyleTag = result;
				next(err);
		});
	});

	/* Load the 4 latest culture posts */
	view.on('init', function(next) {
		//if no country
		if(!locals.country || (locals.country == '')){
			return next();
		};
		var q = keystone.list('Post').model.find().where({$and:[{'state':'published'}, {'country': locals.country._id}, {'tag' : lifestyleTag }]}).sort('-publishedDate').populate('author').limit(4);	

		q.exec(function(err, results) {
			locals.lifestylePosts = results;
			next(err);
		});
	});

	/* load the lifestyle tag */
	view.on('init', function(next) {
		keystone.list('PostTag').model.findOne({ key: "lifestyle" }).exec(function(err, result) {
				lifestyleTag = result;
				next(err);
		});
	});

	/* Load the 4 latest culture posts */
	view.on('init', function(next) {
		//if no coountry
		if(!locals.country || (locals.country == '')){
			return next();
		};
		var q = keystone.list('Post').model.find().where({$and:[{'state':'published'}, {'country': locals.country._id}, {'tag' : lifestyleTag }]}).sort('-publishedDate').populate('author').limit(4);	

		q.exec(function(err, results) {
			locals.lifestylePosts = results;
			next(err);
		});
	});

	/* load the whatson tag */
	view.on('init', function(next) {
		keystone.list('PostTag').model.findOne({ key: "what-s-on" }).exec(function(err, result) {
				whatsonTag = result;
				next(err);
		});
	});

	/* Load the 4 latest whatson posts */
	view.on('init', function(next) {
		//if no country
		if(!locals.country || (locals.country == '')){
			return next();
		};
		var q = keystone.list('Post').model.find().where({$and:[{'state':'published'}, {'country': locals.country._id}, {'tag' : whatsonTag }]}).sort('-publishedDate').populate('author').limit(4);	

		q.exec(function(err, results) {
			locals.whatsonPosts = results;
			next(err);
		});
	});

	
	//view.render(keystone.lang + '/site/index');
	
	var lang = (req.session.languageselected ? req.session.languageselected.key : 'en');
	view.render( lang + '/site/index');

}
