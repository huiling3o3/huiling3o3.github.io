
//Meal Plan Functions

$("#mealplan-form").submit(function (e) {
    e.preventDefault();
    generate();
    $("#mealplan-form")[0].reset()
});//end of mealplan function

function generate() {
    var calories = $("#calories").val();
    var diet = $("#diet").val();
    var exclude = $("#exclude").val();

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/mealplans/generate?timeFrame=day&targetCalories=" + calories + "&diet=" + diet + "&exclude=" + exclude,
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
            "x-rapidapi-key": "113af93158msh484aa5872948d40p1da5dfjsn6795a9c84df3"
        },
        "error": function (jqXhr, textStatus, errorMessage) {
            console.log('Error: ' + errorMessage);
        }
    }

    $.ajax(settings).done(function (data) {
        var html = "";
        var start = "<div class='col-sm-4 my-2'><div class='card text-center p-4' ><div class='card-block'><h3 class='card-title'>";
        var end = "class='btn-recipe' target='_blank'>Recipe</a></div></div></div>";
        var myObj = data.meals;
        console.log(data);
        for (var i = 0; i < data.meals.length; i++) {
            var type = "";
            if (i === 0) {
                type = "Breakfast";
            }
            else if (i === 1) {
                type = "Lunch";
            }
            else if (i === 2) { type = "Dinner" }

            html += start + type + "</h3><p class='card-text'>" + myObj[i].title + "<br>Ready in " + myObj[i].readyInMinutes
                + " mins<br>Servings: " + myObj[i].servings + "</p><a href ='" + myObj[i].sourceUrl + "'" + end;
        };

        document.getElementById("mealplan-result").innerHTML = html;
    });
}


//For checking user status and Logout functions

var apiKey = "5f2cbffc013b1c34acef74a0";
var myDB = "stepbystep-904d";
var myCollection = "people";

$(document).ready(function () {
    Checkuser();
}); //end doc ready

$(".logout-link").click(function (e) {
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
            $(".logout-link").attr('data-id', id);
            //check user id
            console.log($(".logout-link").attr('data-id'));
        }
        else {
            //show signup and login, hide logout
            $(".login-link").show();
            $(".logout-link").hide();
            //  do something if user is not active...
            alert("Please Sign In first, to user this feature :)")
            window.location.href = "login.html";
        }
    });
}//end of checkuser function

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
