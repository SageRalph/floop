<?php

function findTrailer($title) {

    $searchTerm = urlencode($title . ' trailer');

    $query = array(
        'q' => $searchTerm,
        'maxResults' => 1,
        'type' => 'video',
        'videoEmbeddable' => 'true',
    );


/////////////////////////////// From Google's API //////////////////////////////
    // Call set_include_path() as needed to point to your client library.
    require_once '../Vendor/Google/autoload.php';
    require_once '../Vendor/Google/Client.php';
    require_once '../Vendor/Google/Service/YouTube.php';

    /*
     * Set $DEVELOPER_KEY to the "API key" value from the "Access" tab of the
     * Google Developers Console <https://console.developers.google.com/>
     * Please ensure that you have enabled the YouTube Data API for your project.
     */
    $DEVELOPER_KEY = 'AIzaSyAfLKKkwBNFHBHyS8vBdagqrfU_YOWUs70';

    $client = new Google_Client();
    $client->setDeveloperKey($DEVELOPER_KEY);

    // Define an object that will be used to make all API requests.
    $youtube = new Google_Service_YouTube($client);

    try {
        // Call the search.list method to retrieve results matching the specified
        // query term.
        $searchResponse = $youtube->search->listSearch('id,snippet', $query);


        foreach ($searchResponse['items'] as $searchResult) {
            $id = $searchResult['id']['videoId'];
            return "https://www.youtube.com/embed/$id";
        }
        /////////////////////
    } catch (Google_Service_Exception $e) {
        return $e->getMessage();
    } catch (Google_Exception $e) {
        return $e->getMessage();
    }
}
