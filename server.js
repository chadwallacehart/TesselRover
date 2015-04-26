/**
 * Created by chad on 8/30/2014.
 */
var router = require('tiny-router'),
    fs = require('fs'),
    tessel = require('tessel'),
    gpio = tessel.port['GPIO'];

router
    .use('static', {path: './static'})
    // Use the onboard file system (as opposed to microsd)
    .use('fs', fs);



var lights = {
    green: tessel.led[0],
    blue: tessel.led[1],
    red: tessel.led[2],
    amber: tessel.led[3]
};

//setup the gpio pins
var gpo = {
    rf:  gpio.digital[0],   //RF : G1 pin 15, green wire
    rb:  gpio.digital[1],   //RB : G2 pin 17, red wire
    lf:  gpio.digital[2],   //LF : G3 pin 19, white wire
    lb:  gpio.digital[3]    //LB : G4 pin 20, yellow wire
};

router
    .get('/', function(req, res){
        res.send('./static/index.html');
        console.log('home page');
    })

    .get('/ping', function(req, res){
        res.end('OK');
        console.log('ping');
    }

    .get('/rest', function(req, res) {
        res.send(   '<h1>Simple tessel REST API for Elenco Rover</h1>' +
                    '<p><h3>Commands</h3></p>' +
                    '<ul>' +
                    '<li><a href="/forward">/forward</a> - move forward for 1 second</li>' +
                    '<li><a href="/backward">/backward</a> - move backward for 1 second</li>' +
                    '<li><a href="/spinright">/spinright</a> - spin to the right for 1 second</li>' +
                    '<li><a href="/spinleft">/spinleft</a> - spin to the left for 1 second</li>' +
                    '<li>/rf/t - right forward for t seconds</li>' +
                    '<li>/rb/t - right backward for t seconds</li>' +
                    '<li>/lf/t - left forward for t seconds</li>' +
                    '<li>/lb/t - left backward for t seconds</li>' +
                    '</ul>');
        console.log("home");
    })

    .get('/forward/{t}', function(req, res){
        var t = parseInt(req.body.t);
        if (isNaN(t)) t = 1;
        res.send("Moving forward");
        console.log("Toggling rf & lf for " + t + " seconds");
        gpo.rf.output(1);
        gpo.lf.output(1);
        lights.blue.write(1);
        setTimeout(function(){
                gpo.rf.output(0);
                gpo.lf.output(0);
                lights.blue.write(0);
            }
            , t * 1000);
    })

    .get('/backward/{t}', function(req, res){
        var t = parseInt(req.body.t);
        if (isNaN(t)) t = 1;
        res.send("Moving backward");
        console.log("Toggling rb & lb for " + t + " seconds");
        gpo.rb.output(1);
        gpo.lb.output(1);
        lights.blue.write(1);
        setTimeout(function(){
                gpo.rb.output(0);
                gpo.lb.output(0);
                lights.blue.write(0);
            }
            , 1000);
    })

    .get('/spinright/{t}', function(req, res){
        var t = parseInt(req.body.t);
        if (isNaN(t)) t = 1;
        res.send("Spinning right");
        console.log("Toggling rf & lb for " + t + " seconds");
        gpo.lf.output(1);
        gpo.rb.output(1);
        lights.blue.write(1);
        setTimeout(function(){
                gpo.lf.output(0);
                gpo.rb.output(0);
                lights.blue.write(0);
            }
            , 1000);
    })
    .get('/spinleft/{t}', function(req, res){
        var t = parseInt(req.body.t);
        if (isNaN(t)) t = 1;
        res.send("Spinning left");
        console.log("Toggling rf & lb for " + t + " seconds");
        gpo.rf.output(1);
        gpo.lb.output(1);
        lights.blue.write(1);
        setTimeout(function(){
                gpo.rf.output(0);
                gpo.lb.output(0);
                lights.blue.write(0);
            }
            , 1000);
    })

    .get('/rf/{t}', function(req, res){
        var t = parseInt(req.body.t);
        if (isNaN(t)) t = 1;
        res.send("Toggling G1 for " + t);
        console.log("Toggling G1 on for " + t + " seconds");
        gpo.rf.output(1);
        lights.blue.write(1);
        setTimeout(function(){
                gpo.rf.output(0);
                lights.blue.write(0);
            }
            , t * 1000);
    })

    .get('/rf/{t}', function(req, res){
        var t = parseInt(req.body.t);
        if (isNaN(t)) t=1;
        res.send("Toggling G1 for " + t);
        console.log("Toggling G1 on for " + t + " seconds");
        gpo.rf.output(1);
        lights.blue.write(1);
        setTimeout(function(){
                gpo.rf.output(0);
                lights.blue.write(0);
            }
            , t * 1000);
    })

    .get('/rb/{t}', function(req, res){
        var t = parseInt(req.body.t);
        if (isNaN(t)) t = 1;
        res.send("Toggling G2 for " + t);
        console.log("Toggling G2 on for " + t + " seconds");
        gpo.rb.output(1);
        lights.blue.write(1);
        setTimeout(function(){
                gpo.rb.output(0);
                lights.blue.write(0);
            }
            , t * 1000);
    })

    .get('/lf/{t}', function(req, res){
        var t = parseInt(req.body.t);
        if (isNaN(t)) t = 1;
        res.send("Toggling G3 for " + t);
        console.log("Toggling G3 on for " + t + " seconds");
        gpo.lf.output(1);
        lights.blue.write(1);
        setTimeout(function(){
                gpo.lf.output(0);
                lights.blue.write(0);
            }
            , t * 1000);
    })

    .get('/lb/{t}', function(req, res){
        var t = parseInt(req.body.t);
        if (isNaN(t)) t = 1;
        res.send("Toggling G4 for " + t);
        console.log("Toggling G4 on for " + t + " seconds");
        gpo.lb.output(1);
        lights.blue.write(1);
        setTimeout(function(){
                gpo.lb.output(0);
                lights.blue.write(0);
            }
            , t * 1000);
    })
;

function start(){

    //turn the GPIO off
    gpo.rf.output(0);
    gpo.rb.output(0);
    gpo.lf.output(0);
    gpo.lb.output(0);

//Delay 8 seconds to give WiFi to start
//To do: Look for wifi acquired event
    setTimeout(function(){
        router.listen(8080);
        console.log("listening on port 8080");
        lights.green.write(1);
    },8000);
}

start();