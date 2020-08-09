var apiKey = "5f2cbffc013b1c34acef74a0";
var myDB = "stepbystep-904d";
var myCollection = "people";

$(document).ready(function () {
    Checkuser();
    $("#login-form").submit(function (e) {
        checkLogin();
    });//end of login function
}); //end doc ready

//functions
function checkLogin() {
    console.log("check login");
    event.preventDefault();

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
            Console.log('Error: ' + errorMessage);
        }
    }

    //retrieve form values
    var email = $("#user-email").val();
    var password = $("#user-password").val();

    $.ajax(settings).done(function (data) {
        console.log("successfully log into db");
        console.log(data);

        //do a jquery loop of json objects based on their keys(indexes)
        console.log("total users: " + data.length);
        var success = false;
        var id = "";
        $.each(data, function (key, value) {
            var loginDetails = {
                email: data[key].email,
                password: data[key].password
            }
            if (email === data[key].email && password === data[key].password) {
                success = true;
                id = data[key]._id;
            }

        });//end each loop

        if (success === true) {
            setActive(success, id);
            Checkuser();
            console.log(success + "\n" + id);
        }
        else {
            alert("wrong email or password");
            $("#login-form")[0].reset()
        }
    });//end of ajax
}

function setActive(success, id) {
    //set user as active to retrieve user details from another page
    console.log("Setting user staus as active");
    var activeData = { "active": success }
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
        alert("login successfuly");
        window.location.href = "index.html";
        console.log("User Status Updated: " + success);
    });
}//end of set active function

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
            $("#logout").attr('data-id', id);
            //check user id
            console.log($("#logout").attr('data-id'));
            window.location.href = "index.html";
        }
        else {
            //show signup and login, hide logout
            $("#login-link").show();
            $("#logout-link").hide();
            //  do something if user is not active...

        }
    });
}//end of checkuser function

