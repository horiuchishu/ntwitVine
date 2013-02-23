
/*
 * GET home page.
 */
//
var mongoose = require('mongoose')
//
exports.index = function(req, res){
    //
    var tweetModel = mongoose.model("Tweet");
    //
    tweetModel.find().sort({created_at:-1}).limit(10).populate('user').exec(function(err, tweets){
        res.render('index', {
            title: 'Tweets',
            tweets:tweets
        });
    })
};