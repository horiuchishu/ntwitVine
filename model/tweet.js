/* 
 * twitterのデータを保存するモデル
 */
var mongoose = require('mongoose');
//
var db = mongoose.connect('mongodb://localhost/twitter');
//
/**
 * tweet
 */
var tweet = new mongoose.Schema({
    created_at: {type:String},
    id: {type:Number},
    id_str: {type:String},
    text: {type:String},
    source: {type:String},
    truncated: {type:Boolean},
    in_reply_to_status_id: {type:Number},
    in_reply_to_status_id_str: {type:String},
    in_reply_to_user_id: {type:Number},
    in_reply_to_user_id_str: {type:String},
    in_reply_to_screen_name: {type:String},
    user:{type:mongoose.Schema.ObjectId, ref:'User'},
    geo: {type:String},
    coordinates: {type:String},
    place: {type:String},
    contributors: {type:String},
    retweet_count: {type:Number},
    entities: 
     { hashtags: [],
       urls: [],
       user_mentions: [] },
    favorited: {type:Boolean},
    retweeted: {type:Boolean},
    filter_level: {type:String}
});
/**
 * user
 */
var user = new mongoose.Schema({
    id: {type:Number},
    id_str:{type:String},
    name: {type:String},
    screen_name: {type:String},
    location: {type:String},
    url: {type:String},
    description: {type:String},
    protected: {type:Boolean},
    followers_count: {type:Number},
    friends_count: {type:Number},
    listed_count: {type:Number},
    created_at: {type:String},
    favourites_count: {type:Number},
    utc_offset: {type:Number},
    time_zone: {type:String},
    geo_enabled: {type:Boolean},
    verified: {type:Boolean},
    statuses_count: {type:Number},
    lang: {type:String},
    contributors_enabled: {type:Boolean},
    is_translator: {type:Boolean},
    profile_background_color: {type:String},
    profile_background_image_url: {type:String},
    profile_background_image_url_https: {type:String},
    profile_background_tile: {type:Boolean},
    profile_image_url: {type:String},
    profile_image_url_https: {type:String},
    profile_link_color: {type:String},
    profile_sidebar_border_color: {type:String},
    profile_sidebar_fill_color: {type:String},
    profile_text_color: {type:String},
    profile_use_background_image: {type:Boolean},
    default_profile: {type:Boolean},
    default_profile_image: {type:Boolean},
    following: {type:Number},
    follow_request_sent: {type:Number},
    notifications: {type:Number}
 })
/**
 * entites
 */

/**
 * 
 */
//モデルの設定？
mongoose.model('User', user);
mongoose.model('Tweet', tweet);
//モデルの書き出し？
exports.user = db.model('User', user);
exports.tweet = db.model('Tweet', tweet);
//