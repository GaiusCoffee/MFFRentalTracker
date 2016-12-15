// Mobius Final Fantasy Rental Card Tracker
// http://gaius.coffee/MFFRentalTracker
$(document).ready(function(){
    // Google Firebase
    var config = {
        apiKey: "AIzaSyBipbrxZ0gQ2fN2vmzHDQYiZqDZDqNCjp0",
        authDomain: "mffrentaltracker.firebaseapp.com",
        databaseURL: "https://mffrentaltracker.firebaseio.com",
        storageBucket: "",
    };
    firebase.initializeApp(config);
    // Google Analytics
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    ga('create', 'UA-56797626-10', 'auto');
    ga('send', 'pageview');
    // DataTable
    var results = $("#results").DataTable({ columns: [
        { data: 'playername', width: '20%' },
        { data: 'playerid', width: '20%' },
        { data: 'rentalcard' },
        { data: 'cardrarity' },
        { data: 'cardlevel' },
        { data: 'cardskills' }
    ]});
    // Load New Data onValueChange
    firebase.database().ref('rentalCards').on("value", function(snapshot){
        results.clear();
        snapshot.forEach(function(child){ 
            results.row.add(child.val()).draw();
        });
    });
    // Show Login
    $("#forms").hide();
    $("#login").show();
    $("#recordRemoveCancel").hide();
});
$("#loginBtnFacebook").click(function(){
    auth(new firebase.auth.FacebookAuthProvider());
    return false;
});
$("#loginBtnTwitter").click(function(){
    auth(new firebase.auth.TwitterAuthProvider());
    return false;
});
$("#loginBtnGoogle").click(function(){
    auth(new firebase.auth.GoogleAuthProvider());
    return false;
});
var auth = function fAuth(provider){
    firebase.auth().signInWithPopup(provider).then(function(result) {
        reset();
        firebase.database()
            .ref('rentalCards/' + result.user.uid)
            .once('value')
            .then(function(snapshot) {
                $("#playername").val(snapshot.val().playername);
                $("#playerid").val(snapshot.val().playerid);
                $("#rentalcard").val(snapshot.val().rentalcard);
                $("#cardrarity").val(snapshot.val().cardrarity);
                $("#cardlevel").val(snapshot.val().cardlevel);
                $("#cardskills").val(snapshot.val().cardskills);
            });
        $("#forms").show();
        $("#login").hide();        
    }).catch(function(error) {
        console.log(error);
        alert("Login Failed :(\n\n" + error.message);
        $("#forms").hide();
        $("#login").show();
    });
};
$("#logoutBtn").click(function(){
    firebase.auth().signOut().then(function() {
        reset();
        $("#forms").hide();
        $("#login").show();
    }, function(error) {
        console.log(error);
        alert("Logout Failed :(");
        $("#forms").show();
        $("#login").hide();
    });
    return false;
});
$("#recordAddEdit").click(function(){
    var user = firebase.auth().currentUser;
    if (user) {
        var formData = validate();
        if (formData.valid) {
            alert(formData.valid);
            return false;
        };
        firebase.database()
            .ref('rentalCards/' + user.uid)
            .set(formData)
            .then(function(){
                alert("Rental Card Data Saved!");
            }, function(error){
                console.log(error);
                alert("Data Save Failed :(")
            });
    }
    return false;
});
$("#recordRemove").click(function(){
    if (!$("#recordRemoveCancel").is(":visible")) {
        $("#recordRemoveCancel").show();
        return false;
    }
    var user = firebase.auth().currentUser;
    if (user) {
        firebase.database()
            .ref('rentalCards/' + user.uid)
            .set(null)
            .then(function(){
                alert("Rental Card Data Saved!");
            }, function(error){
                console.log(error);
                alert("Data Removal Failed :(")
            });
        reset();
    }
    $("#recordRemoveCancel").hide();
    return false;
});
$("#recordRemoveCancel").click(function(){
    $("#recordRemoveCancel").hide();
    return false;
});
$("#playername").focusout(function(){
    $("#playername").val($("#playername").val().replace(/[^a-z0-9\]\[]/gi,''));
});
$("#rentalcard").focusout(function(){
    $("#rentalcard").val($("#rentalcard").val().replace(/[^a-z0-9]/gi,''));
});
var validate = function fValidate(){
    var isValid = "",
        fplayername = $("#playername").val().replace(/[^a-z0-9\]\[]/gi,''),
        fplayerid = $("#playerid").val(),
        frentalcard = $("#rentalcard").val().replace(/[^a-z0-9]/gi,''),
        fcardrarity = $("#cardrarity").val(),
        fcardlevel = $("#cardlevel").val(),
        fcardskills = $("#cardskills").val();
    if (fplayername.length < 2) {
        isValid = "Player Name too short.";
    }
    if (fplayername.length > 24) {
        isValid = "Player Name too long.";
    }
    if ((fplayerid.length !== 12) && (fplayerid.length !== 14)) {
        isValid = "Invalid Player ID.";
    }
    if (frentalcard.length < 4) {
        isValid = "Rental Card name too short.";
    }
    if (frentalcard.length > 24) {
        isValid = "Rental Card name too long.";
    }
    return {
        valid:isValid,
        playername:fplayername,
        playerid:fplayerid,
        rentalcard:frentalcard,
        cardrarity:fcardrarity,
        cardlevel:fcardlevel,
        cardskills:fcardskills
    };
};
var reset = function fReset(){
    $("#playername").val("");
	$("#playerid").val("");
	$("#rentalcard").val("");
	$("#cardrarity").val("4*");
	$("#cardlevel").val("Ability Lv. MAX");
	$("#cardskills").val("All Skills Unlocked");
};
