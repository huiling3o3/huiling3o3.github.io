var apiKey = "5f2cbffc013b1c34acef74a0";
var myDB = "stepbystep-904d";
var myCollection = "people";

//create listener for submit
var user = {
    email: "",
    password: "",
    fullname: "",
    gender: "",
    dob: ""
}
$(document).ready(function () {
    Checkuser();
}); //end doc ready

function validatePassword() {
    if ($("#user-psw").val() !== $("#confirm-psw").val()) {
        $('#passwordHelp').text('Password do not Match!');
        return false
    }
    else {
        $('#passwordHelp').text('');
        return true
    }
}

$("#signup-form").submit(function (e) {
    console.log("submitting form details");
    event.preventDefault();
    validatePassword()
    //retrieve form values
    user.email = $("#user-email").val();
    user.password = $("#user-psw").val();
    user.fullname = $("#user-name").val();
    user.gender = $('input[name="gender"]:checked').val();
    user.dob = $("#user-dob").val();


    if (validatePassword() == true) {
        //set contact format json data
        let userDocument = {
            email: user.email,
            password: user.password,
            fullname: user.fullname,
            gender: user.gender,
            dob: user.dob,
            active: true,
            weight: 0,
            height: 0,
            activitylvl: "",
            goal: 0,
            points: 0
        };

        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://" + myDB + ".restdb.io/rest/" + myCollection + "",
            "method": "POST",
            "headers": {
                "content-type": "application/json",
                "x-apikey": apiKey,
                "cache-control": "no-cache"
            },
            "error": function (jqXhr, textStatus, errorMessage) {
                console.log('Error: ' + errorMessage);
            },
            "processData": false,
            "data": JSON.stringify(userDocument)
        }

        $.ajax(settings).done(function (response) {
            console.log(response);
            console.log("form succesfully submited")
            alert("Sign Up successfully")
            Checkuser();
        });
    }
});// end of signup-form click

function Checkuser() {
    //hide everything first
    $(".login-link").hide();
    $(".logout-link").hide();
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
            $(".login-link").hide();
            $(".logout-link").show();
            // sets user id to logout data-id atrr
            $(".logout").attr('data-id', id);
            //check user id
            console.log($(".logout").attr('data-id'));
            window.location.href = "index.html";
        }
        else {
            //show signup and login, hide logout
            $(".login-link").show();
            $(".logout-link").hide();
            //  do something if user is not active...

        }
    });
}//end of checkuser function