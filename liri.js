require("dotenv").config();
var fs = require("fs");
var inquirer = require("inquirer");

var spotify_id = process.env.SPOTIFY_ID;
var spotify_secret = process.env.SPOTIFY_SECRET;
var twitter_consumer_key = process.env.TWITTER_CONSUMER_KEY;
var twitter_consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
var twitter_access_token = process.env.TWITTER_ACCESS_TOKEN_KEY;
var twitter_access_token_secrect = process.env.TWITTER_ACCESS_TOKEN_SECRET;
var twilio_sid = process.env.TWILIO_SID;
var twilio_token = process.env.TWILIO_TOKEN;

const client = require('twilio')(twilio_sid, twilio_token);

var request = process.argv[2];
var textfile = "log.txt"

// If they pass an argument to lire, we'll process it.
// Otherwise, we'll prompt them
if (request)
    processIt(request, process.argv[3]);
else
{
    // Let's go interactive
    askIt();
}

// This function processes the requests
function processIt(request, arg1)
{
    switch (request)
    {
        case "my-tweets":
        {
            twittIt();
            break;
        }

        case "spotify-this-song":
        {
            spotIt(arg1);
            break;
        }

        case "movie-this":
        {
            omdbIt(arg1);
            break;
        }

        case "do-what-it-says":
        {
            var string = "node liri.js do-what-it-says ";
            appendIt(textfile, string);

            readIt();
            break;
        }

        default:
            console.log("'", request, "' is not one of my commands");
    }
}

/* Twitter section */
// This will process twitter requests and pull the last
// 20 tweets from our pre-defined user
function twittIt()
{
    var Twitter = require('twitter');
    
    // Put this in the logfile
    var string = "node liri.js my-tweets";
    appendIt(textfile, string);

    var client = new Twitter({
        consumer_key: twitter_consumer_key,
        consumer_secret: twitter_consumer_secret,
        access_token_key: twitter_access_token,
        access_token_secret: twitter_access_token_secrect
    });

    // Setting the twitter user to search
    var params = {
        screen_name: '@FridayTheDog1',
        count: 20
    };

    // Grab the twitter feed
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
        for (var i=0; i < tweets.length; i++)
        {
            appendIt(textfile, tweets[i].created_at + "-" + tweets[i].text);
        }
    }
    });
}

/*  Spotify section */
// If the user wants a text preview of the song, they'll get the option
// Otherwise, the song information will be printed out
function spotIt(song)
{
    var Spotify = require('node-spotify-api');

    var spotify = new Spotify({
        id: spotify_id,
        secret: spotify_secret
    });

    // Default song
    if (song == null)
        song = 'The Sign Ace of Base';
    
    // Sting for the log file
    var string = "node liri.js spotify-this-song " + '"' + song + '"';

    // Log into log file
    appendIt(textfile, string);

    // Look in spotify for the song
    spotify.search({ type: 'track', query: song }, function(err, data) 
    {    
        if ( err ) {
            console.log('Error occurred: ' + err);
            return;
        }

        // console.log(data.tracks.items)
        var allsongs = [];
        var songStr =[];

        // We're going to ask if they're interested in getting a song preview
        // on their cell phone
        inquirer.prompt([
        {
            type: "confirm",
            message: "\nWould you like to receive a text of a song preview? ",
            name: "confirm",
            default: true
        }
        ]).then(function(answers) 
        {
            var textFlag = false;
            var numSongs = 0;

            // if they want to get a text, we'll remember and we'll
            // limit their choices to the first 5 songs
            if (answers.confirm)
            {
                textFlag = true;
                numSongs = 5;  // Limiting the number of songs available for preview
            }
            else
                numSongs = data.tracks.items.length;

            // Walking through the results.  If they don't want a text,
            // we'll print out the results.
            for (var i=0; i < numSongs; i++)
            {
                var song =
                {
                    artist: data.tracks.items[i].artists[0].name,
                    title: data.tracks.items[i].name,
                    preview: data.tracks.items[i].preview_url,
                    album: data.tracks.items[i].album.name
                }

                // If they don't want a text preview, just print it out
                if (!textFlag)
                {
                    appendIt(textfile, "Artist: " + data.tracks.items[i].artists[0].name);
                    
                    appendIt(textfile, "Song: " + data.tracks.items[i].name);
                    appendIt(textfile, "Preview: " + data.tracks.items[i].name);
                    appendIt(textfile, "Album: " + data.tracks.items[i].album.name);
                    appendIt(textfile, "-----------------------");
                }
                else
                {
                    // They do want a preview.  We need to build two arrays.
                    // One will hold the text string for inquirer 'choice' list
                    // The other will contain objects of that same string (in order to match) it
                    // and the preview URL

                    // This one stores inquirer string to match and the preview URL
                    var song =
                    {   
                        preview: data.tracks.items[i].preview_url,
                        ugly: i + ") Artist: " + data.tracks.items[i].artists[0].name + " - Song: " +
                        data.tracks.items[i].name +
                        " - Album: " + data.tracks.items[i].album.name
                    }
    
                    allsongs.push(song);
    
                    // This array used for inquirer choice list
                    songStr.push(i + ") Artist: " + data.tracks.items[i].artists[0].name + " - Song: " +
                    data.tracks.items[i].name +
                    " - Album: " + data.tracks.items[i].album.name);
                }
            }
            
            // *** BEATTY *** should figure out how to do the array with map
            // Now all songs loaded into array
            if (textFlag)
                textIt(allsongs, songStr);
        }); // End inquirer for song preview
    }); // End Spotify search
}

/*  OMDB section */
// This processes the movie requests.  It will return movie data for the 
// specified movie.
function omdbIt(movie)
{
    var request = require('request');

    if (movie == null)
        movie = '"Mr. Nobody"';
    
    // Log this 
    var string = "node liri.js movie-this " + '"' + movie + '"';
    appendIt(textfile, string);

    var queryUrl = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=trilogy";

    // Then run a request to the OMDB API with the movie specified
    request(queryUrl, function(error, response, body) {

        // If the request is successful (i.e. if the response status code is 200)
        if (!error && response.statusCode === 200) {
    
        if (JSON.parse(body).Response == "True")
        {
            // Parse the body of the site and recover just the imdbRating
            // (Note: The syntax below for parsing isn't obvious. Just spend a few moments dissecting it).
            // console.log(body);
            // console.log(body);
            appendIt(textfile, "The movie title is: " + JSON.parse(body).Title);
            appendIt(textfile, "The movie's year is: " + JSON.parse(body).Year);
            appendIt(textfile, "The movie's IMDB rating is: " + JSON.parse(body).imdbRating);

            var ratings = JSON.parse(body).Ratings

            // Look for the Rotten Tomatoes score
            for (var i=0; i < ratings.length; i++)
            {
                if (ratings[i].Source == "Rotten Tomatoes")
                    appendIt(textfile, ratings[i].Source + "Rating: " + ratings[i].Value);
            }
            appendIt(textfile, "The movie's country is: " + JSON.parse(body).Country);
            appendIt(textfile, "The movie's language is: " + JSON.parse(body).Language);
            appendIt(textfile, "Plot: " + JSON.parse(body).Plot);

            var actors = JSON.parse(body).Actors;
            appendIt(textfile, "Actors: " + actors);
            }
        else  
            console.log("Error - Movie: ", movie, " not found.");
        }
    });
}

/* Random section */
/* Reads through the random.txt file and randomly selects */
/* One action to complete */
function readIt()
{
    // fs is a core Node package for reading and writing files
    var fs = require("fs");

    // This block of code will read from the "random.txt" file
    fs.readFile("random.txt", "utf8", function(error, data) {

        // If the code experiences any errors it will log the error to the console.
        if (error) {
            return console.log(error);
        }
    
        // We will then print the contents of data
        // console.log(data);
    
        // Remove newlines
        data = data.replace(/(\r\n|\n|\r)/gm,"");

        // Then split it by commas (to make it more readable)
        var dataArr = data.split(",");

        // console.log("length", dataArr.length);
    
        // Return a random number to give us an event to process
        var index = Math.floor(Math.random() * (dataArr.length/2));

        // Index is the number of processable events we have in the random
        // file.  We'll need to adjust that number based on the fact that 
        // the array has 2 elements per processable event
        if (index > 0)
            index = index * 2;

        processIt(dataArr[index], dataArr[index+1]);
  });
}

// This function just appends to the log.txt file
function appendIt(textFile, string)
{
    var date = new Date();
    var n = date.toDateString();
    var time = date.toLocaleTimeString();

    // Shows user the output
    console.log(string);

    // Build the string to log.  Prepend with date/time
    // so we know when this command was run in case we need to
    // use the log.txt file for debugging
    string = n + " " + time + " - " + string + "\n";

    fs.appendFile(textFile, string, function(err) {

        // If an error was experienced we say it.
        if (err) {
            console.log(err);
        }
    
    });
}

// This fucntion is run if liri is given no parameters.  It will
// interactively prompt the user for a command to run.
function askIt()
{
    inquirer.prompt([
        {
          type: "list",
          name: "liriCommand",
          message: "Which liri command to run?",
          choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"]
        }
      ]).then(function(answers) {
        // Need to ask for which one
        // console.log("askQuestion", answers.liriCommand);

        if (answers.liriCommand == "my-tweets" || answers.liriCommand == "do-what-it-says")
            processIt(answers.liriCommand, null)   // These commands don't pass parameters
        else
        {
            // Prompt for song or movie to search
            inquirer.prompt([
            {
                name: "param",
                message: "Which one?",
            }
            ]).then(function(nextAns) 
            {
                // console.log("param ", nextAns.param);

                // Pass the command with the parameter
                processIt(answers.liriCommand, nextAns.param)
            });
        }
    });
}

// This function will send the preview URL to your phone as a text message
function textIt(allsongs, songStr)
{
    //console.log(allsongs);
    //console.log(songStr);
    //console.log("Send text");

    // Give the users a choice from the array we stashed
    inquirer.prompt([
    {
        type: "list",
        name: "pickedSong",
        message: "Which song to text preview to your phone? \n",
        choices: songStr
    },    // Here we ask the user to confirm.
    {
        validate: validatePhone,
        message: "\nEnter cell number (use format - 8582221111): ",
        name: "cell",
    },
    {
        type: "confirm",
        message: "\nAre you sure: ",
        name: "confirm",
        default: true
    }
    ]).then(function(answers) 
    {
        // If they really want the text sent, process it here
        if (answers.confirm)
        {
            // We need to re-match the one they selected by
            // searching the sister array that has the preview URL
            for (var i=0; i < allsongs.length; i++)
            {
                if (allsongs[i].ugly == answers.pickedSong)
                {
                    if (allsongs[i].preview != null)
                    {
                        // console.log("match ", allsongs[i].preview);
                        var msg = allsongs[i].preview;

                        // Send a text
                        client.messages.create({
                            body: msg,
                            from: '+18582951090',
                            to: '+1' + answers.cell
                        })
                        .then(message => console.log(message.sid))
                        .done();
                    }
                    else  
                        console.log("Preview unavailable for this song.  Try picking another song.");
                }
            }
        }
    });
}

// This is used to validate the phone number is 10-digit number
function validatePhone(phone)
{
    // console.log("Phone = ", phone);
    phone = phone.replace(/[^0-9]/g, '');

    if(phone.length != 10) { 
        return "Invalid phone number";
    } else {
        return true;
    }
}