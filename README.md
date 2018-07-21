# liri

This is a Language Interpretation and Recognition Interface.  It will process 4 types of events (Twitter, Spotify, OMDB, random) and return data to the user.

## Description 

This application will return data based on requests from the user.  The user can receive information about songs, movies or tweets.

### Usage instructions

Users can interact with Liri one of two different ways:

1)  They pass Liri the action they would like Liri to take.
    * `my-tweets`
    * `spotify-this-song`
    * `movie-this`
    * `do-what-it-says`

    For Spotify and Movie requests, the user can specify which song/movie they would like.  If no song/movie is indicated, they will receive inforamtion on a default value.

2)  If the user does NOT pass an action, Liri will go into an interactive mode to find out what action is desired.

If the user requests Tweets, they will receive the last 20 tweets from the pre-defined user.

If the user requests Spotify data, they will have the option to have the music preview URL texted to their cell phone.  If they opt not to get a text, they will receive all Spotify data returned on the song the requested.
    Example: 
        Artist:  Aerosmith
        Song:  Walk This Way
        Preview:  Walk This Way
        Album:  Toys In The Attic

If the user requests movie data, the will receive OMDB data.
    Example:
        The movie title is:  Ant-Man
        The movie's year is: 2015
        The movie's IMDB rating is: 7.3
        Rotten Tomatoes Rating:  82%
        The movie's country is: USA
        The movie's language is: English
        Plot:  Armed with a super-suit with the astonishing ability to shrink in scale but increase in strength, cat burglar Scott Lang must embrace his inner hero and help his mentor, Dr. Hank Pym, plan and pull off a heist that will save the world.
        Actors:  Paul Rudd, Michael Douglas, Evangeline Lilly, Corey Stoll

If the user requests 'do-what-it-says', the application will read from the random.txt file and randomly chose one action to execute (example: movie-this,Star Wars).