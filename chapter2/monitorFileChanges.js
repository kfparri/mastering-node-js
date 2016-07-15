var fs = require('fs');
var http = require('http');

var theUser = null;
var userPos = 0;
var tweetFile = 'tweets.txt';

http.createServer(function( req, res ) { 
    res.writeHead( 200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
    });

    theUser = res;

    res.write(':' + Array(2049).join(' ') + '\n');
    res.write('retry: 2000\n');

    res.socket.on('close', function() {
        theUsers = null;
    });
}).listen(8080);

var sendNext = function( fd ) {
    var buffer = new Buffer(140);

    fs.read(fd, buffer, 0, 140, userPos * 140, function( err, num ) {
        if( !err && num > 0 && theUser ) {
            ++userPos;
            theUser.write('data: ', buffer,toString('utf-8', 0, num) + '\n\n');

            return process.nextTick(function () {
                sendNext(fd);
            })
        }
    });
};

function start() {
    fs.open(tweetFile, 'r', function( err, fd ) {
        if( err ) {
            return setTimeout( start, 1000 );
        }
        fs.watch( tweetFile, function( event, filename ) {
            if( event === "change" ) {
                sendNext( fd );
            }
        });
    });
};

start();