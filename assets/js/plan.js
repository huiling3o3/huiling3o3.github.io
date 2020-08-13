// This javascript is shared with myplan page and mealplan page


//For checking user status and Logout functions
var apiKey = "5f2cbffc013b1c34acef74a0";
var myDB = "stepbystep-904d";
var myCollection = "people";

$(document).ready(function () {
    $('.toast').hide();
    Checkuser();
}); //end doc ready

//Needed to check user is currently login or not
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
            //used to cal if user reached the goal
            $("#goal").attr('data-goal', goal);
            //check user id
            //console.log($(".logout-link").attr('data-id'));
            //console.log($("#myplan-form").attr('data-id'));

            //check if user is New
            if (weight == 0 || height == 0 || activitylvl == "" || goal == 0) {
                $("#myplan-quiz").show();
                $("#user-details").hide();
            }
            else {
                $("#myplan-quiz").hide();
                $("#user-details").show();
                DisplayChart(id);
                RetrieveUserinfo(id);
                displaypoints(id);
            }
        }
        else {
            //show signup and login, hide logout
            $(".login-link").show();
            $(".logout-link").hide();
            //  do something if user is not active...
            alert("Please Sign In first, to use this feature :)")
            window.location.href = "login.html";
        }
    });
}//end of checkuser function

$(".logout-link").click(function (e) {
    e.preventDefault();
    //alert($(this).attr("data-id"));
    var userid = $(this).attr("data-id");
    //set user as inactive
    logout(userid);
});

$(".btn-edit").click(function (e) {
    e.preventDefault();
    $("#myplan-quiz").show();
    $("#user-details").hide();
});



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
        window.location.href = "index.html";
    });
}//end of logout function




function displaypoints(id) {
    console.log("Retrieving User points");

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
        //display user's points
        $("#rewardpts").html("My Current Points:<span class='orange'> " + data.points + "</span>");
        $("#rewardpts").attr('data-pts', data.points);
        //console.log($("#rewardpts").attr('data-pts'));
    });

}//end of display points function

function addPoints(id, points) {
    console.log("adding user points");
    //get current points from rewardpts data atrribute
    var currentpoints = parseInt($("#rewardpts").attr("data-pts"));

    var newpoints = currentpoints + points;
    var pointsData = { "points": newpoints }
    //put new points into the database
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
            console.log('Error: ' + errorMessage);
        },
        "processData": false,
        "data": JSON.stringify(pointsData)
    }

    $.ajax(settings).done(function (data) {
        console.log("points added successfully");
        console.log(data);
        //display the number of points added to user
        $('.toast').show();
        $('#toast-title').text('Congratulations🎉');
        $('#toast-text').text('You have earned ' + points + " points!!" + " Keep up the good work!");
        $('.toast').toast('show');
        //refresh the points
        displaypoints(id);
    });

}
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
    var userweight = parseFloat($("#weightlog").val());
    let weightlogData = {
        "weight": userweight,
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
        //refresh the weightlog
        CheckWeightLog(userid);
        //refresh chart
        DisplayChart(userid);
        //Add points
        var points = 5;
        addPoints(userid, points);
        $("#weightlog-form")[0].reset();
        //Checkuser();       
    });

});

$("#myplan-form").submit(function (e) {
    e.preventDefault();
    //retrieve form values

    var weight = parseFloat($("#user-weight").val());
    var height = parseInt($("#user-height").val());
    var activitylvl = $('input[name="activitylvl"]:checked').val();
    var goal = parseFloat($('input[name="goal"]:checked').val());
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
//chart function

// create initial empty chart
var ctx = document.getElementById("mycanvas");
var myChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            {
                data: [],
                borderWidth: 1,
                borderColor: "#00c0ef",
                label: "Weight in KG"
            }
        ]
    },
    options: {
        responsive: true,
        animate: true,
        title: {
            display: true,
            text: "Your Weight Daily Progress"
        },
        legend: {
            display: false
        },
        scales: {
            xAxes: [
                {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "Date"
                    }
                }
            ],
            yAxes: [
                {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "Weight in KG"
                    }
                }
            ]
        }
    }
});

function DisplayChart(id) {
    //get user id to retrieve user weightlog details
    console.log("Retrieving User weightlog details");

    var settings = {
        async: true,
        crossDomain: true,
        url: "https://" + myDB + ".restdb.io/rest/" + myCollection + "/" + id + "/weightlog?sort=date",
        method: "GET",
        headers: {
            "content-type": "application/json",
            "x-apikey": apiKey,
            "cache-control": "no-cache"
        },
        error: function (jqXhr, textStatus, errorMessage) {
            console.log("Error: " + errorMessage);
        }
    };

    $.ajax(settings).done(function (data) {
        console.log("successfully log into db");
        console.log(data);
        console.log("total weightlog: " + data.length);

        let total = myChart.data.labels.length;

        if (total > 0) {
            //remove duplicated values when refreshed
            while (total >= 0) {
                myChart.data.labels.pop();
                myChart.data.datasets[0].data.pop();
                total--;
            }

            //add back the values
            $.each(data, function (key, value) {
                var recordDate = formatDate(data[key].date);
                myChart.data.labels.push(recordDate);
                myChart.data.datasets[0].data.push(data[key].weight);
            }); //end each loop
        }
        else {
            $.each(data, function (key, value) {
                var recordDate = formatDate(data[key].date);
                myChart.data.labels.push(recordDate);
                myChart.data.datasets[0].data.push(data[key].weight);
            }); //end each loop
        }
        // re-render the chart
        myChart.update();
    });
} //end of display chart function

function checkGoal(data, id) {
    console.log("checking goal")
    var first_weight = 0;
    var last_weight = 0;
    for (i = 0; i < data.length; i++) {
        first_weight = parseFloat(data[0].weight);
        last_weight = parseFloat(data[data.length - 1].weight);
    }

    var weightlost = first_weight - last_weight;
    var goal = parseFloat($("#goal").attr("data-goal"));
    console.log("weightlost: " + weightlost);
    console.log("goal: " + goal);
    if (weightlost >= goal) {
        var points = 20;
        addPoints(id, points);
        console.log("goal reached!")
    }
}

function resetWeightlog(weightlogid) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://" + myDB + ".restdb.io/rest/weightlog/" + weightlogid,
        "method": "DELETE",
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
        console.log(data);
        console.log(weightlogid + " data inside weightlog successfully deleted");
    });
}

function CheckWeightLog(id) {
    console.log("Checking user's weightlog")
    //check if today weight log record has been recorded
    var today = getDate();

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://" + myDB + ".restdb.io/rest/" + myCollection + "/" + id + "/weightlog?sort=date",
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

        //check week, if one week is up check goal, reset the weightlog and ask user to set a new goal
        if (data.length == 7) {
            checkGoal(data, id);
            for (i = 0; i < data.length; i++) {
                //delete the data for that week that has passed
                resetWeightlog(data[i]._id);
            }
            //inform user to set new goal
            alert("Congrats on completing your Goal🎉🎉🎉, Now its time to set a new goal with your new weight!!");
            $("#myplan-quiz").show();
            $("#user-details").hide();

        }
        else {
            //do a jquery loop of json objects based on their keys(indexes)
            var todaylog = false;
            $.each(data, function (key, value) {
                var recordDate = formatDate(data[key].date);
                //console.log("record date: " + recordDate + " vs " + "todaydate: " + today);
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
        }

    });//end of ajax function
}//end of check weightlog function

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
}//end of generate mealplan function



