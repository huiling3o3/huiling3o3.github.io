
var apiKey = "5f2cbffc013b1c34acef74a0";
var myDB = "stepbystep-904d";
var myCollection = "people";

$(document).ready(function () {
    $('.toast').hide();
    Checkuser();
}); //end doc ready


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

$(".btn-redeem").click(function (e) {
    e.preventDefault();
    var voucherpts = parseInt($(this).attr("data-points"));
    var vouchername = $(this).attr("data-vname");
    var id = $(".logout-link").attr("data-id");

    redeemPoints(id, voucherpts, vouchername)
});


//FORMS-------------------------------------------------------------------------------------------------------------------------------------------------------------- 

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
///ALL The FUNCTIONS-----------------------------------------------------------------------------------------------------------------------------------------------------
///Login Logout Functions
function Checkuser() {
    //Needed to check user is currently login or not
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

///End Login Logout Functions

//Dates function----------------------------------------------------------------------------------------------------------------------------------------------------------
function getAge(datestring) {
    //var string = "1996-03-06T00:00:00.000Z"
    var date = new Date(datestring);
    var today = new Date();
    var todayyear = today.getFullYear();
    var dateyear = date.getFullYear();
    var age = todayyear - dateyear;

    return age;
}//end of age function

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
}//end of geting todays date function

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
}//end of format date function


//end of dates function--------------------------------------------------------------------------------------------------------------------------------------------------

//Display User details function-----------------------------------------------------------------------------------------------------------------------------------------

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
        //console.log("activitylvl " + activitylvl);
        // console.log("height " + height);
        // console.log("weight " + weight);

        //start of calculate exercise to recommend--------------------------------------------------------------------------------------------------------------------

        if (data.activitylvl == "mostlyseated") {
            console.log("USER IS MOSTLY SEATED");
            $("#exercise-low").show();
            $("#exercise-midlow").hide();
            $("#exercise-mid").hide();
            $("#exercise-midhigh").hide();
        }

        else if (data.activitylvl == "standinghalf") {
            console.log("USER IS STANDING HALF THE TIME");
            $("#exercise-low").hide();
            $("#exercise-midlow").show();
            $("#exercise-mid").hide();
            $("#exercise-midhigh").hide();
        }

        else if (data.activitylvl == "walkinghalf") {
            console.log("USER IS WALKING HALF THE TIME");
            $("#exercise-low").hide();
            $("#exercise-midlow").hide();
            $("#exercise-mid").show();
            $("#exercise-midhigh").hide();
        }

        else if (data.activitylvl == "movingconstantly") {
            console.log("USER IS CONSTANTLY ON THE MOVE");
            $("#exercise-low").hide();
            $("#exercise-midlow").hide();
            $("#exercise-mid").hide();
            $("#exercise-midhigh").show();
        }

        else {
            console.log("never fill in form, empty activity level");
            $("#exercise-low").hide();
            $("#exercise-midlow").hide();
            $("#exercise-mid").hide();
            $("#exercise-midhigh").hide();
        }

        //end of calculate exercise to recommend----------------------------------------------------------------------------------------------------------------------
    });

}//end of retrieveuserinfo function

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
}//end of calculate calories function
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
}//end of reset weightlog function

function checkOneWeek(firstdate, today) {
    //convert the string to a date
    var initial_date = new Date(firstdate);
    var one_week = initial_date.setDate(initial_date.getDate() + 7);
    //format date
    one_week = formatDate(one_week);

    //check if today is one week
    if (today === one_week) {
        return true
    }
    else { return false }
}//end of checkoneweek function

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
        var check_week = checkOneWeek(data[0].date, today);

        if (check_week === true) {
            //meaning today is the date one week has passed

            //check gaol
            checkGoal(data, id);

            //reset weightlog
            for (i = 0; i < data.length; i++) {
                //delete the data for that week that has passed
                resetWeightlog(data[i]._id);
            }

            //inform user to set new goal
            alert("One Week is up, Now its time to set a new goal with your new weight!!");
            $("#myplan-quiz").show();
            $("#user-details").hide();
        }
        else { //one week has not reached

            var todaylog = false;
            $.each(data, function (key, value) {
                var recordDate = formatDate(data[key].date);
                //console.log("record date: " + recordDate + " vs " + "todaydate: " + today);
                if (today === recordDate) {
                    todaylog = true;
                    return
                }
            });//end each loop        

            if (todaylog === true) {
                $("#weightlog-form").hide();
                $('#weightlog-message').text("Today's Weightlog was done :)")
            }
            else {
                $("#weightlog-form").show();
            }
        }

    });//end of ajax function
}//end of check weightlog function

////Display User details function----------------------------------------------------------------------------------------------------------------------------------------

//Display chart function
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
                borderColor: "#f78b11",
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
});//end chart variable

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


////Rewards Functions----------------------------------------------------------------------------------------------------------------------------------------------------
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

function addVoucher(id, vouchername) {
    let voucherDoc = {
        vouchername: vouchername
    };

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://" + myDB + ".restdb.io/rest/" + myCollection + "/" + id + "/voucher",
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
        "data": JSON.stringify(voucherDoc)
    }

    $.ajax(settings).done(function (response) {
        console.log(response);
        console.log("Voucher Added succesfully")
    });
}

function redeemPoints(id, points, vouchername) {
    console.log("redeeming user points");
    //get current points from rewardpts data atrribute
    var currentpoints = parseInt($("#rewardpts").attr("data-pts"));
    if (currentpoints >= points) {
        var newpoints = currentpoints - points;
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
            console.log("points updated successfully");
            console.log(data);
            //add voucher to the db
            addVoucher(id, vouchername);
            //display the number of points added to user
            alert("Congratulations🎉🎉🎉, You have redeemed " + vouchername + " Keep up the good work!")
            //refresh the points
            displaypoints(id);
        });
    }
    else {
        //display error message
        alert("Oh no...you don't have enough points");
    }
}

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
        console.log("goal reached!");
        alert("Congrats🎉🎉🎉, you have reached your goal!!! You have earned 20 more points");
    }
}//end of check goal function

//End of Rewards Functions-----------------------------------------------------------------------------------------------------------------------------------------------







