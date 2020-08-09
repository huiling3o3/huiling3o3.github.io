var apiKey = "5f2cbffc013b1c34acef74a0";
var myDB = "stepbystep-904d";
var myCollection = "people";

$(document).ready(function () {
    Checkuser();
}); //end doc ready

$("#logout-link").click(function (e) {
    e.preventDefault();
    //alert($(this).attr("data-id"));
    var userid = $(this).attr("data-id");
    //set user as inactive
    logout(userid);
    //check user
    Checkuser();
    //Clear welcome message
    //$("#welcome").hide();
});

//functions
function Checkuser() {
    //hide everything first
    $("#login-link").hide();
    $("#logout-link").hide();
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://" + myDB + ".restdb.io/rest/" + myCollection + "",
        "method": "GET",
        "headers": {
            "content-type": "application/json",
            "x-apikey": apiKey,
            "cache-control": "no-cache"
        },
        "error": function (jqXhr, textStatus, errorMessage) {
            console.log('Error: ' + errorMessage);
        }
    }

    $.ajax(settings).done(function (data) {
        console.log("successfully log into db");
        console.log(data);

        //do a jquery loop of json objects based on their keys(indexes)
        console.log("total users: " + data.length);
        var active = false;
        var id = "";
        $.each(data, function (key, value) {
            if (data[key].active === true) {
                active = true;
                id = data[key]._id;
            }

        });//end each loop

        if (active === true) {
            //hide signup and login, show logout
            $("#login-link").hide();
            $("#logout-link").show();
            // sets user id to logout data-id atrr
            $("#logout-link").attr('data-id', id);
            //check user id
            console.log($("#logout-link").attr('data-id'));

            //Comment this if it is on index.html
            //window.location.href = "index.html";

            //retrieve user info
            //RetrieveUserinfo(id);
        }
        else {
            //show signup and login, hide logout
            $("#login-link").show();
            $("#logout-link").hide();
            //  do something if user is not active...

        }
    });
}//end of checkuser function

function RetrieveUserinfo(id) {
    //get user id to retrieve user details 
    console.log("Retrieving User details");

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://" + myDB + ".restdb.io/rest/" + myCollection + "/" + id,
        "method": "GET",
        "headers": {
            "content-type": "application/json",
            "x-apikey": apiKey,
            "cache-control": "no-cache"
        },
        "error": function (jqXhr, textStatus, errorMessage) {
            console.log('Error: ' + errorMessage);
        }
    }

    $.ajax(settings).done(function (data) {
        console.log("successfully log into db");
        console.log(data);
        //set wlecome text
        $("#welcome").text("Welcome back, " + data.fullname);
    });
}//end of retrieveuserinfo function

function logout(id) {
    //set user as inactive
    console.log("Setting user staus as inactive");
    var activeData = { "active": "false" }
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://" + myDB + ".restdb.io/rest/" + myCollection + "/" + id,
        "method": "PATCH",
        "headers": {
            "content-type": "application/json",
            "x-apikey": apiKey,
            "cache-control": "no-cache"
        },
        "error": function (jqXhr, textStatus, errorMessage) {
            Console.log('Error: ' + errorMessage);
        },
        "processData": false,
        "data": JSON.stringify(activeData)
    }

    $.ajax(settings).done(function (response) {
        console.log("User Status Updated as inactive");
    });
}//end of logout function