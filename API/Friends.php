<?php

/**
 * Gets an array of all account names in the database.
 * 
 * @return {array(String)}
 */
function getAccounts() {
    $query = "SELECT username FROM Account ORDER BY regDate";
    $results = $GLOBALS['db']->select($query, null);

    $usernames = [];
    foreach ($results as $result) {
        $usernames[] = $result->username;
    }
    return($usernames);
}

/**
 * Creates a new user account with the username provided.
 * 
 * @param {String} $username
 * @return {boolean}
 */
function addAccount($username) {

    //  TODO  Check if already exists

    $query = "INSERT INTO Account (username) VALUES (?)";
    $result = $GLOBALS['db']->run($query, array($username));
    return $result;
}

/**
 * Deletes user with $username and all associated records from all tables.
 * 
 * @param {String} $username
 */
function deleteUser($username) {

    $query = "DELETE FROM Rating WHERE username = ?";
    $result = $GLOBALS['db']->run($query, array($username));

    $query = "DELETE FROM Account WHERE username = ?";
    $result = $GLOBALS['db']->run($query, array($username));

    return reportStatus($result);
}
