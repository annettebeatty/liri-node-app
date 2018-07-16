require("dotenv").config();

var spotify_id = process.env.SPOTIFY_ID;
var spotify_secret = process.env.SPOTIFY_SECRET;
var twitter_consumer_key = process.env.TWITTER_CONSUMER_KEY;
var twitter_consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
var twitter_access_token = process.env.TWITTER_ACCESS_TOKEN_KEY;
var twitter_access_token_secrect = process.env.TWITTER_ACCESS_TOKEN_SECRET;

var request = process.argv[2];

processIt(request), process.argv[3];

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
            readIt();
            break;
        }

        default:
            console.log("'", request, "' is not one of my commands");
    }
}

/*  Twitter section */
function twittIt()
{
    var Twitter = require('twitter');
    
    var client = new Twitter({
    consumer_key: twitter_consumer_key,
    consumer_secret: twitter_consumer_secret,
    access_token_key: twitter_access_token,
    access_token_secret: twitter_access_token_secrect
    });

    var params = {
        screen_name: '@FridayTheDog1',
        count: 20
    };

    client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
        for (var i=0; i < tweets.length; i++)
        {
            console.log(tweets[i].created_at, "-", tweets[i].text);
        }
    }
    });
}

/*  Spotify section */
function spotIt(song)
{
    var Spotify = require('node-spotify-api');

    var spotify = new Spotify({
        id: spotify_id,
        secret: spotify_secret
    });

    if (song == null)
        song = "The Sign Ace of Base"

    spotify.search({ type: 'track', query: song }, function(err, data) {    
        if ( err ) {
            console.log('Error occurred: ' + err);
            return;
        }

        for (var i=0; i < data.tracks.items.length; i++)
        {
            console.log("Artist: ", data.tracks.items[i].artists[0].name);
            console.log("Song: ", data.tracks.items[i].name);
            console.log("Preview: ", data.tracks.items[i].preview_url);
            console.log("Album: ", data.tracks.items[i].album.name);
            console.log("-----------------------");
        }
    });
}

/*  OMDB section */
function omdbIt(movie)
{
    var request = require('request');

    if (movie == null)
        movie = "Mr. Nobody";

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
            console.log("The movie title is: ", JSON.parse(body).Title);
            console.log("The movie's year is: " + JSON.parse(body).Year);
            console.log("The movie's IMDB rating is: " + JSON.parse(body).imdbRating);

            var ratings = JSON.parse(body).Ratings

            for (var i=0; i < ratings.length; i++)
            {
                if (ratings[i].Source == "Rotten Tomatoes")
                    console.log(ratings[i].Source, "Rating: ", ratings[i].Value);
            }
            console.log("The movie's country is: " + JSON.parse(body).Country);
            console.log("The movie's language is: " + JSON.parse(body).Language);
            console.log("Plot: ", JSON.parse(body).Plot);

            var actors = JSON.parse(body).Actors;
            console.log("Actors: ", actors);
            }
        else  
            console.log("Error - Movie: ", movie, " not found.");
        }
    });
}

/* Random section */
function readIt()
{
    // fs is a core Node package for reading and writing files
    var fs = require("fs");

    // This block of code will read from the "movies.txt" file
    fs.readFile("random.txt", "utf8", function(error, data) {

        // If the code experiences any errors it will log the error to the console.
        if (error) {
        return console.log(error);
        }
    
        // We will then print the contents of data
        console.log(data);
    
        // Then split it by commas (to make it more readable)
        var dataArr = data.split(",");
    
        // We will then re-display the content as an array for later use.
        for (var i=0; i < dataArr.length; i++)
        {
            console.log(dataArr[i], dataArr[i+1]);
            processIt(dataArr[i], dataArr[i+1]);
            i++;
        }
  
  });
}


