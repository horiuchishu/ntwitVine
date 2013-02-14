
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , twitter = require('ntwitter')
  , path = require('path')
  //
  , request = require('request')
  , cheerio = require('cheerio')
  //socket
  , socketIO = require("socket.io")
  //ntwitterの使う準備
  , twitter = require('ntwitter');
// --------------------------------------------------
//
var tw = new twitter({
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: ''
});
/*
tw.stream('statuses/sample', function(stream) {
  stream.on('data', function (data) {
    console.log(data);
  });
});
*/
//ストリームを使う
tw.stream('statuses/filter', {'track':'vine'}, function(stream){
    stream.on('data', function(data){
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
    });
});
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