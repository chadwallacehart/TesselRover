/**
 * Created by Chad on 4/25/2015.
 */

/*  Global vars */

//The Tessel's URL
var tesselUrl = "http://192.168.10.120:8080/";
//all valid commands
var commands = ['forward', 'backward', 'spinright', 'spinleft', 'f', 'b', 'r','l', 'rf', 'rb', 'lf', 'lb'];

$(document).ready(function(){

    var response = $('#response')[0],
        inputs =  $('#inputs')[0],
        checkBtn = $('#check'),
        runBtn = $('#run');

    //Button to check for syntax errors
    checkBtn.click(function(){
        response.value = syntaxCheck(inputs).output;
    });

    //Check for basic syntax errors
    function syntaxCheck(text){
        var lines = text.value.toLowerCase().split('\n');
        var output = "";
        var syntaxErrors=0;
        for (var x=0; x<lines.length; x++){
            var input = lines[x].split(' ');
            var time = Number(input[1]);

        //Check command
            //for debugging
            console.log("command: " + lines[x] + ": length: " + input.length
                + " valid: " + $.inArray(input[0], commands)
                + " time:" + time);
            //skip blank lines
            if (input[0] == ""){
                //do nothing
            }
            //Check to see if the command is in our array
            else if ($.inArray(input[0], commands)== -1){
                output += "ERROR - invalid command\n";
                syntaxErrors++;
            }
            //the 2nd token should be a number (not NaN)
            else if (input[1] && isNaN(time)){
                output += "ERROR - bad time information\n";
                syntaxErrors++;
            }
            //limit the timer to 5 seconds
            else if (time>5){
                output += "ERROR - time too long\n";
                syntaxErrors++;
            }
            //make sure there are only 2 tokens per line
            else if(input.length >2){
                output += "ERROR - extra information\n";
                syntaxErrors++;
            }
            else{
                output += "OK\n";
            }
        }
        //return false if any of the conditions above are met;
        return ({ok:(syntaxErrors == 0), output:output});
    }

    /*  use this to adapt any commands between the controller
        and the rest interface */
    function normalize(command){
        switch(command){
            case 'f':
                return "forward";
            case 'b':
                return "backward";
            case 'r':
                return "spinright";
            case 'l':
                return "spinleft";
            default:
                return command;
        }
    }

    runBtn.click(function(){

        //ToDo: doesn't appear to be working;
        runBtn.addClass("btn-disabled");

        //convert the input to lowercase and split on returns
        var lines = inputs.value.toLowerCase().split('\n');

        //clear out the response panel
        response.value = "";

        //run the syntax checker = if errors then display them
        if (syntaxCheck(inputs).ok == false){
            response.value = syntaxCheck(inputs).output;
            //ToDo: use CSS to indicate highlight problems
        }

        var urls = [];
        for (x=0; x<lines.length; x++){
            var input = lines[x].split(/\W/);
            var command = normalize(input[0]);

            //skip blank lines
            if (command == "")
                break;

            var time = Number(input[1]);
            if (time == 0 ||  isNaN(time)) time = 1; //default 1 second

            if (time>0) {
                urls[x] = tesselUrl + command + '/' + time;
            }
            else
                urls[x] = tesselUrl + command;
        }

        var count = 0;  //keep track of the # of commands we are running

        //Make the rest call
        //ToDo: Switch to WebSockets
        function restCall() {
            //stop if we ran all the commands
            if (count >= urls.length) {
                runBtn.removeClass("btn-disabled");
                console.log('done');
            }
            else {
                //use the timer so we don't send commands to quickly
                setTimeout(function () {
                    //ToDo: change this to $.ajax and set the timeout short
                    $.get(urls[count], function (data, status) {
                        response.value += data + '\n';
                        console.log(count + ": " + urls[count]);
                        restCall(count++);
                    })
                }, time * 1000);
            }
        }

        //start sending ajax GETs to the tessel
        restCall(count);
    });

    function ping(healthCheck) {
        setTimeout(function () {
            $.ajax({
                url: tesselUrl + 'ping',
                timeout: 3000 //3 second timeout
            })
                .done(function (data, status) {
                    if (data == "alive" && status == "OK") {
                        console.log(data + " " + status);
                        runBtn.disabled = false;
                        //ToDo: Not sure why these are giving me errors when I use runBtn
                        $('#runBtn').removeClass("btn-disabled btn-warning").addClass("btn-success");
                        console.log("ping OK");
                        ping(60);

                    }
                    else {
                        healthCheck = 10;
                        runBtn.disabled = true;
                        $('#runBtn').addClass("btn-disabled btn-warning").removeClass("btn-success");
                        console.log("Ping error");
                        ping(10);
                    }
                })
                .fail(function (jqXHR, textStatus) {
                    if (textStatus == 'timeout') {
                        runBtn.disabled = true;
                        $('#runBtn').removeClass("btn-success").addClass("btn-disabled btn-warning");
                        //do something. Try again perhaps?
                        console.log("Ping failed " + textStatus);

                        ping(10);
                    }
                });
        }, healthCheck * 1000)
    }

    //ToDo: check for connectivity
    //ping(5);

});