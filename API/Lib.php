<?php

/**
 * Returns HTTP200 if $result is "Success", 
 * otherwise returns $result with HTTP500.
 *
 * @param {String} $result
 */
function reportStatus($result) {
    if ($result !== "Success") {
        http_response_code(500); // Internal Server Error
        return $result;
    } else {
        http_response_code(204); // No Content
    }
}

//function log($text) {
//    $logger = new Logger("log.txt");
//    $logger->put($text);
//}

class Logger {

    private $path;

    public function __construct($path) {
        $this->path = $path;
    }

    public function put($text) {
        $current = file_get_contents($this->path);
        $current .= "$text\n";
        file_put_contents($this->path, $current);
    }

}

class Stopwatch {

    private $startTime;

    public function __construct() {
        $this->startTime = microtime(true);
    }

    public function timeFromStart() {
        $timeDiff = microtime(true) - $this->startTime;
        return "Time taken: $timeDiff microseconds";
    }

}
