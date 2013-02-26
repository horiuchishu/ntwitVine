
/*
 * GET home page.
 */
// db
var mongoose = require('mongoose');
// スクレイピング関係
var request = require('request');
var cheerio = require('cheerio');
// --------------------------------------------------
var pageTweets = 30;
// --------------------------------------------------
//
exports.index = function(req, res){
    //
    var tweetModel = mongoose.model("Tweet");
    //
    tweetModel.find().sort({created_at:-1}).limit(pageTweets).populate('user').exec(function(err, tweets){
        res.render('index', {
            title: 'Tweets',
            tweets:tweets
        });
    })
};
// --------------------------------------------------
//
exports.manage = function (req, res){
    //
    var tweetModel = mongoose.model("Tweet");
    //
    var skipTweet = 0;
    //
    if(req.query.skip){
        skipTweet = pageTweets * Number(req.query.skip);
    }
    //
    tweetModel.find().count(function (err, count){
        //
        tweetModel.find().sort({created_at:-1}).skip(skipTweet).limit(pageTweets).populate('user').exec(function(err, tweets){
            //
            res.render('manage',{
                tweets:tweets,
                count:Math.ceil(count / pageTweets),
                title:'Manage'
            });
        });
    });
}
// --------------------------------------------------
// 
exports.instagram = function (req, res){
    //
    var tweetModel = mongoose.model("Tweet");
    //
    tweetModel.find({source:/instagram/}).sort({created_at:-1}).limit(pageTweets).exec(function(err, tweets){
        //
        res.render('instagram',{
           title:"instagram view",
           tweets:tweets
        });
    });
}
// --------------------------------------------------
//
exports.vine = function (req, res){
    //
    var tweetModel = mongoose.model("Tweet");
    //
    tweetModel.find({source:/vine/}).sort({created_at:-1}).limit(pageTweets).exec(function(err, tweets){
        //
        res.render('vine',{
           title:"vine view",
           tweets:tweets
        });
    });
}