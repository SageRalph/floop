<?php

/**
 * Gets an array of all films in the database.
 * 
 * @return {array(Film)}
 */
function getFilms() {
    $query = "SELECT Film.filmID, SUM(rating) AS totalRating FROM Film "
            . "LEFT JOIN Rating ON Film.filmID = Rating.filmID "
            . "GROUP BY Film.filmID ORDER BY watched, totalRating DESC";

    $results = $GLOBALS['db']->select($query, null);
    $filmIDs = [];
    foreach ($results as $result) {
        $filmIDs[] = $result->filmID;
    }
    return(getFilmDetails($filmIDs));
}

/**
 * Gets details for an array of $filmIDs.
 * 
 * @param {array(integer)} $filmIDs
 * @return {array(Film)}
 */
function getFilmDetails($filmIDs) {
    $films = [];

    $query = "SELECT title, trailer, watched FROM Film WHERE filmID = ?";

    $query2 = "SELECT Rating.username, rating FROM Rating "
            . "INNER JOIN Account ON Rating.username = Account.username "
            . "WHERE filmID = ? ORDER BY regDate";

    foreach ($filmIDs as $filmID) {
        $film = $GLOBALS['db']->select($query, array($filmID))[0];
        $film->ratings = $GLOBALS['db']->select($query2, array($filmID));
        $films[] = $film;
    }
    return($films);
}

/**
 * Returns the ID of film with $title.
 * 
 * @param {String} $title
 * @return {int}
 */
function getFilmID($title) {
    $query = "SELECT filmID FROM Film WHERE title = ?";
    $results = $GLOBALS['db']->select($query, array($title));

    if (sizeOf($results) === 0) {
        http_response_code(404); // Not Found
        return $results;
    }
    $result = $results[0]->filmID;

    return $result;
}

function filmExists($title) {
    return sizeOf(getFilmID($title)) !== 0;
}

/**
 * Creates a new film with $title provided.
 * 
 * @param {String} $title
 * @return {boolean}
 */
function addFilm($title) {

    // Check if already exists
    if (filmExists($title)) {
        http_response_code(500); // Internal Server Error
        return "Film already exists";
    } else {
        http_response_code(200); // OK
    }

    $query = "INSERT INTO Film (title) VALUES (?)";
    $result = $GLOBALS['db']->run($query, array($title));
}

/**
 * Removes all rating for and deletes film of $title.
 * 
 * @param {String} $title
 */
function deleteFilm($title) {
    $filmID = getFilmID($title);

    if (!is_numeric($filmID)) {
        return $filmID;
    }

    $query = "
        DELETE FROM Rating
        WHERE filmID = ?";
    $result = $GLOBALS['db']->run($query, array($filmID));

    $query = "
        DELETE FROM Film
        WHERE filmID = ?";
    $result = $GLOBALS['db']->run($query, array($filmID));

    return reportStatus($result);
}

/**
 * Sets the watched status of film with $title to $value. 
 * 
 * @param {String} $title
 * @param {boolean} $value
 */
function markWatched($title, $value) {
    $query = "UPDATE Film SET watched = ? WHERE title = ?";
    $result = $GLOBALS['db']->run($query, array($value, $title));
    return reportStatus($result);
}

/**
 * Converts a YouTube 'watch' uri into an embedable uri.
 * 
 * @param {String} $fullURI
 * @return {String}
 */
function embedableURL($fullURI) {

    // YouTube
    $uri = explode("v=", $fullURI);
    if (count($uri) === 2) {
        return ("https://www.youtube.com/embed/$uri[1]");
    }

    return $fullURI;
}

/* * ***************************************************************************
 * RATINGS
 * ************************************************************************** */

/**
 * Returns the rating of film with $filmID by $user.
 * 
 * @param {String} $user
 * @param {integer} $filmID
 * @return {integer}
 */
function getRatingBy($user, $filmID) {
    $query = "SELECT rating FROM Rating WHERE filmID = ? AND username = ?";
    $results = $GLOBALS['db']->select($query, array($filmID, $user));

    if (sizeOf($results) === 0) {
        http_response_code(404); // Not Found
        return $results;
    }
    $result = $results[0]->rating;

    return $result;
}

/**
 * Returns whether $user has and existing rating for film with $filmID.
 * 
 * @param {integer} $filmID
 * @param {String} $user
 * @return {boolean}
 */
function hasRated($filmID, $user) {
    return sizeOf(getRatingBy($user, $filmID)) !== 0;
}

/**
 * Creates or updates the rating of film with $title 
 * by user with $username to $value.
 * 
 * @param {String} $title
 * @param {String} $username
 * @param {integer} $value
 */
function rateFilm($title, $username, $value) {

    $filmID = getFilmID($title);

    if (!filmExists($title)) {
        http_response_code(404); // Not found
        return "Film not found";
    }

    if (!hasRated($filmID, $username)) {
        $result = createFilmRating($filmID, $username, $value);
    } else {
        $result = modifyFilmRating($filmID, $username, $value);
    }

    return reportStatus($result);
}

/**
 * Creates a new rating of film with $filmID by user with $username of $value.
 * 
 * @param {integer} $filmID
 * @param {String} $username
 * @param {integer} $value
 */
function createFilmRating($filmID, $username, $value) {
    $query = "INSERT INTO Rating VALUES (?,?,?);";
    return $GLOBALS['db']->run($query, array($filmID, $username, $value));
}

/**
 * Updates the value of an existing rating of film 
 * with $filmID by user with $username to $value.
 * 
 * @param {integer} $filmID
 * @param {String} $username
 * @param {integer} $value
 */
function modifyFilmRating($filmID, $username, $value) {
    $query = "UPDATE Rating SET rating = ? WHERE filmID = ? AND username = ?";
    return $GLOBALS['db']->run($query, array($value, $filmID, $username));
}

/**
 * Deletes rating of film with $title by user with $username.
 * 
 * @param {String} $title
 * @param {String} $username
 */
function deleteFilmRating($title, $username) {

    $filmID = getFilmID($title);

    $query = "DELETE FROM Rating WHERE filmID = ? AND username = ?";
    $result = $GLOBALS['db']->run($query, array($filmID, $username));

    return reportStatus($result);
}
