<?php

require_once 'Lib.php';
require_once 'DBInterface.php';
require_once 'Friends.php';
include_once 'Films.php';


// Removes URL encoding from string (eg. %20 for spaces)
$fullURI = urldecode(getenv('REQUEST_URI'));

//URI starts with /floop/floop/ so uri[0-2] can be discarded
$uri = array_slice(explode("/", $fullURI), 3); //array representing URI

$method = getenv('REQUEST_METHOD');
$response = null;
$requestBody;

if ($method === "POST" || $method === "PUT") {
    $requestBody = json_decode(file_get_contents('php://input'));
}

$db = new DBConnection;

if ($uri[0] === "accounts") {

    //URI format /accounts
    if (count($uri) === 1) {
        if ($method === "GET") {
            $response = getAccounts();
        } elseif ($method === "POST") {
            $response = addAccount($requestBody);
        }
    }

    //URI format /accounts/$username
    elseif (count($uri) === 2) {
        if ($method === "DELETE") {
            $response = deleteUser($uri[1]);
        }
    }
} elseif ($uri[0] === "films") {

    //URI format /films
    if (count($uri) === 1) {
        if ($method === "GET") {
            $response = getFilms();
        } elseif ($method === "POST") {
            $response = addFilm($requestBody);
        }
    }

    //URI format /films/$filmID
    elseif (count($uri) === 2) {
        if ($method === "DELETE") {
            $response = deleteFilm($uri[1]);
        } elseif ($method === "PUT") {
            $response = editFilm($uri[1], $requestBody);
        }
    } elseif (count($uri) === 3) {

        //URI format /films/$filmID/watched
        if ($uri[2] === "watched" && $method === "PUT") {
            $response = markWatched($uri[1], $requestBody);
        }

        //URI format /films/$filmID/$viewer
        elseif ($method === "PUT") {
            $response = rateFilm($uri[1], $uri[2], $requestBody);
        } elseif ($method === "DELETE") {
            $response = deleteFilmRating($uri[1], $uri[2]);
        }
    }
}


$db->close();


if ($response !== null) {
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode($response);
}    