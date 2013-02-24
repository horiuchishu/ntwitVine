
/**
 * streaming apiを使って対象のタグをストックし続ける
 * 
 * exp：2.5D
 * ウオール用に取得とvine用に取得２つ取得する
 * 管理画面でのチェックを可能にする
 * 
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  //ツイッター
  , twitter = require('ntwitter')
  //DB関係
  , mongoose = require('mongoose')
  //スクレイピング関係
  , request = require('request')
  , cheerio = require('cheerio')
  //socket
  , socketIO = require("socket.io")
  , cron = require("cron").CronJob
  //ntwitterの使う準備
  , twitter = require('ntwitter');
// --------------------------------------------------
/**
 * ツイッター関係
 **/
//haraguchi account
var tw = new twitter({  
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: ''
});
//
var mongoUser = require('./model/tweet');
var userModel = mongoUser.user;
var tweetModel = mongoUser.tweet;
//
var htag = 'nhk';
//ストリームを使う
tw.stream('statuses/filter', {'track':htag}, function(stream){
//tw.stream('statuses/filter', {'track':'2_5_d'}, function(stream){
    //return;
    stream.on('data', function(data){
        //
        var isTag = false;
        //ハッシュタグにhtagが指定されているか検査
        for(var o in data.entities.hashtags){
            if(data.entities.hashtags[o]['text'] == htag){
                isTag = true;
                break;
            }
        }
        //
        if(isTag){
            //console.log(data);
            // - - - - - - - - - - - - - - - - - - - -
            //ユーザーの検索
            userModel.findOne({id:data.user.id}).exec(function(err, user){
                if(err){
                    
                }else{
                    if(user){
                        //登録済み
                    }else{
                        //未登録なので、ユーザーをDBに追加
                        user = new userModel(data.user);
                    }
                    //ユーザーをセーブ
                    user.save(function(err){
                       if(err){
                           console.log(err);
                       } else{
                           //ツイートの保存
                           var tweet = new tweetModel(data);
                           tweet.user = user;
                           tweet.save(function(err){
                               //エラー／上手く行った場合は何もしない
                               if(err){
                                   console.log(err);
                               }else{
                                   io.sockets.emit('message:tweet', {message:data})
                               }
                           })
                       }
                    });
                }
            });
            // - - - - - - - - - - - - - - - - - - - -
            //vineリンクを確認
            if(String(data.source).indexOf('vine.co') > -1){
                //urlを取得
                var url = data.entities.urls[0].expanded_url;
                //console.log(url);
                //スクレイピングする
                request(
                    {
                        uri: url
                    }, 
                    function(error, response, body) {
                        var $ = cheerio.load(body); //取得したページのbody部をパース
                        //console.log(body);
                        //videoタグの取得
                        var videoSrc = $("body .card .video-container video source").attr("src");
                        io.sockets.emit('message:receive', {message: videoSrc});
                        //var tag = '<video id="post_html5_api" class="v-clip" loop="" preload="auto" src="'+videoSrc+'" muted></video>';
                        //io.sockets.emit('message:receive', { message: tag });
                        //console.log(videoTag.toString());
                });
            };
        };
    });
});
// cronでdbを整理する
//ツイートの最大保存数
var maxTweets = 500;
//
var job = new cron({
    //実行したい日時 or crontab書式
    cronTime: "*/1 * * * *"
    //指定時に実行したい関数
    , onTick: function() {
        //ツイートを削除する
        tweetModel.find().count(function(err, cnt){
            console.log(cnt);
            //保存数が最大値を超えていたら削除する
            if(cnt > maxTweets){
                var len = cnt - maxTweets;
                //削除するツイートを取得
                tweetModel.find().sort({created_at:1}).limit(len).exec(function(err, tweets){
                    for(var o in tweets){
                        //削除
                        tweetModel.findByIdAndRemove(tweets[o]['_id']).exec(function(err){
                            if(err){
                                
                            }
                        });
                    }
                });
            }
        });
        // 余計なユーザーを削除する
        userModel.find().exec(function(err, users){
            for(var u in users){
                // Promiseオブジェクトを取得
                var pro = tweetModel.findOne({user:users[u]['_id']}).exec();
                // スコープがあるので、オブジェクトに入れる
                pro.userId = users[u]['_id'];
                // proにuserIdを指定したら読めた。スコープの関係クリア
                pro.on("complete", function(tweet){
                    if(!tweet){
                        userModel.findByIdAndRemove(this.userId).exec();
                    }
                });
            }
        })
    }
    //ジョブの完了または停止時に実行する関数 
    , onComplete: function() {
        console.log('onComplete!');
    }
    // コンストラクタを終する前にジョブを開始するかどうか
    , start: false
    //タイムゾーン
    , timeZone: "Japan/Tokyo"
})
 
//ジョブ開始
job.start();
//ジョブ停止
//job.stop();
// --------------------------------------------------
//
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});
//
app.get('/', routes.index);
//
app.get('/manage', routes.manage);
//
var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
// --------------------------------------------------
//
io = socketIO.listen(server);
//
io.sockets.on('connection', function(socket) {
  socket.on('message:send', function(data) {
    io.sockets.emit('message:receive', { message: data.message });
  });
});