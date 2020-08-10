// This javascript is shared with myplan page and mealplan page


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
    window.location.href = "index.html";

});

function Checkuser() {
    //hide everything first
    $(".login-link").hide();
    $(".logout-link").hide();
    $("#myplan-quiz").hide();
    $("#user-details").hide()
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
        var weight = 0;
        var height = 0;
        var activitylvl = "";
        var goal = 0;

        //get value using the key value function
        $.each(data, function (key, value) {
            if (data[key].active === true) {
                active = true;
                id = data[key]._id;
                weight = data[key].weight;
                height = data[key].height;
                activitylvl = data[key].activitylvl;
                goal = data[key].goal;
            }

        });//end each loop

        if (active === true) {
            //hide signup and login, show logout
            $(".login-link").hide();
            $(".logout-link").show();
            // sets user id to logout,weight-log form, myplan-form data-id atrr
            $(".logout-link").attr('data-id', id);
            $("#myplan-form").attr('data-id', id);
            $("#weightlog-form").attr('data-id', id);
            //check user id
            //console.log($(".logout-link").attr('data-id'));
            //console.log($("#myplan-form").attr('data-id'));

            //check if user is New
            if (weight == 0 || height == 0 || activitylvl == "" || goal == 0) {
                $("#myplan-quiz").show()
                $("#user-details").hide()
            }
            else {
                $("#myplan-quiz").hide()
                $("#user-details").show()
                RetrieveUserinfo(id);
            }
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
        //set welcome text
        $("#welcome").text("Welcome back, " + data.fullname);
        //display user's weekly goal
        $("#goal").html("This week's Goal:<span class='blue'> Lose " + data.goal + " Kg</span>");

        //Calculate and display user daily calorie intake
        var gender = data.gender;
        var datestring = data.dob;
        var activitylvl = data.activitylvl;
        var height = data.height;
        var weight = data.weight;

        var Calories = Cal_Calories(gender, datestring, activitylvl, height, weight);

        $("#cal-intake").html("Recommended calories intake: <span class='blue'>" + Calories + " kcal/day</span>");

        //Check if today's weight log have been recorded
        CheckWeightLog(id);

        // console.log("gender " + gender);
        // console.log("dob " + dob);
        // console.log("activitylvl " + activitylvl);
        // console.log("height " + height);
        // console.log("weight " + weight);
    });
}//end of retrieveuserinfo function

//forms
$("#mealplan-form").submit(function (e) {
    e.preventDefault();
    generate();
    $("#mealplan-form")[0].reset()
});

$("#weightlog-form").submit(function (e) {
    e.preventDefault();
    //retrieve form values
    var weight = $("#weightlog").val();
    let weightlogData = {
        "weight": weight,
        "date": Date()
    }
    var userid = $(this).attr("data-id");

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://" + myDB + ".restdb.io/rest/" + myCollection + "/" + userid + "/weightlog",
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
        "data": JSON.stringify(weightlogData)
    }

    $.ajax(settings).done(function (response) {
        console.log(response);
        console.log("daily weightlog added succesfully");
        $("this")[0].reset();
        //refresh the weightlog
        CheckWeightLog(userid);
    });

});

$("#myplan-form").submit(function (e) {
    e.preventDefault();
    //retrieve form values
    var weight = $("#user-weight").val();
    var height = $("#user-height").val();
    var activitylvl = $('input[name="activitylvl"]:checked').val();
    var goal = $('input[name="goal"]:checked').val();
    var userid = $(this).attr("data-id");

    //uncomment for debugging purpose
    // console.log("weight " + weight);
    // console.log("height " + height);
    // console.log("activitylvl " + activitylvl);
    // console.log("weekly goal " + goal);
    // console.log("userid " + weight);

    let userDocument = {
        weight: weight,
        height: height,
        activitylvl: activitylvl,
        goal: goal
    };

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://" + myDB + ".restdb.io/rest/" + myCollection + "/" + userid,
        "method": "PATCH",
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
        console.log("user details updated succesfully")
        $("#myplan-form")[0].reset()
        Checkuser();
    });

    //weightlog
    let userWeightlog = {
        weight: weight,
        date: Date()
    };

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://" + myDB + ".restdb.io/rest/" + myCollection + "/" + userid + "/weightlog",
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
        "data": JSON.stringify(userWeightlog)
    }

    $.ajax(settings).done(function (response) {
        console.log(response);
        console.log("weightlog added succesfully")
        Checkuser();
    });

});

function Cal_Calories(gender, datestring, activitylvl, height, weight) {
    //get user age
    var age = getAge(datestring);
    var cal = 0;
    if (gender === "female") {
        cal = (10 * weight / 1 + 6.25 * height / 1 - 5 * age / 1 - 161);
    }
    else {//Male
        cal = (10 * weight / 1 + 6.25 * height / 1 - 5 * age / 1 + 5);
    }

    if (activitylvl === "mostlyseated") {
        cal *= 1.2
    }
    else if (activitylvl === "standinghalf") {
        cal *= 1.4
    }
    else if (activitylvl === "walkinghalf") {
        cal *= 1.6
    }
    else {
        cal *= 1.75
    }

    return Math.round(cal);
}

function getAge(datestring) {
    //var string = "1996-03-06T00:00:00.000Z"
    var date = new Date(datestring);
    var today = new Date();
    var todayyear = today.getFullYear();
    var dateyear = date.getFullYear();
    var age = todayyear - dateyear;

    return age;
}
function getDate() {
    let date_ob = new Date();

    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    //  dd/mm/yyyy format
    var today = date + "-" + month + "-" + year;

    console.log(today);
    return today;
}

function formatDate(string) {
    var olddate = new Date(string);
    // adjust 0 before single digit date
    let day = ("0" + olddate.getDate()).slice(-2);

    // current month
    let month = ("0" + (olddate.getMonth() + 1)).slice(-2);

    // current year
    let year = olddate.getFullYear();

    //  dd/mm/yyyy format
    let newdate = day + "-" + month + "-" + year;

    return newdate;
}

function CheckWeightLog(id) {
    console.log("Checking user's weightlog")
    //check if today weight log record has been recorded
    var today = getDate();

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://" + myDB + ".restdb.io/rest/" + myCollection + "/" + id + "/weightlog",
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
        console.log("total weightlog: " + data.length);
        //do a jquery loop of json objects based on their keys(indexes)
        var todaylog = false;
        $.each(data, function (key, value) {
            var recordDate = formatDate(data[key].date);
            console.log("record date: " + recordDate + " vs " + "todaydate: " + today);
            if (today === recordDate) {
                todaylog = true;
                return
            }
        });//end each loop        

        if (todaylog == true) {
            $("#weightlog-form").hide();
            $('#weightlog-message').text("Today's Weightlog was done :)")
        }
        else {
            $("#weightlog-form").show();
        }
    });
}

//Meal Plan Functions
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



