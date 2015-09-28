<?php

/* * ***************************************************************************
 * RETREIVING FOOD
 * ************************************************************************** */

/**
 * Gets an array of all foods in the database ordered by total stock.
 * Total stock is counted only for users in $userList, or all users if null.
 * If a search $term is provided, only results containing the term are returned,
 * otherwise, only items that are in stock (for selected users) are returned.
 * 
 * @param {array(String)} $userList
 * @param {String} $term
 * @return {array(object)}
 */
function getFoods($userList, $term) {
    $users = null;
    $sumString = "stock";

    // If a list of users is specified add filter
    if ($userList !== null) {
        $users = explode(",", $userList);
        $userString = "username = ? ";
        $i = 1;
        while ($i < count($users)) {
            $userString.= "OR username = ? ";
            $i++;
        }
        $sumString = "CASE WHEN $userString THEN stock ELSE 0 END";
    }

    // Filter by search term if specified, else only show items in stock.
    $condition = "HAVING totalStock > 0";
    if ($term !== null) {
        $condition = "HAVING Food.itemName LIKE '%$term%'";
    }

    $query = "SELECT Food.itemName, notes, SUM($sumString) AS totalStock "
            . "FROM Food LEFT JOIN Stock ON Food.itemName = Stock.itemName "
            . "GROUP BY Food.itemName "
            . "$condition "
            . "ORDER BY totalStock DESC, lastEdit DESC";

    $results = $GLOBALS['db']->select($query, $users);
    return(getFoodStock($results));
}

/**
 * Gets the stock for an array of $items, (itemName, totalStock) pairs.
 * 
 * @param {array(object)} $items
 * @return {array(object)}
 */
function getFoodStock($items) {

    $query = "SELECT Stock.username, stock FROM Stock "
            . "INNER JOIN Account ON Stock.username = Account.username "
            . "WHERE itemName = ? ORDER BY regDate";

    foreach ($items as $item) {
        $item->stock = $GLOBALS['db']->select($query, array($item->itemName));
    }

    return($items);
}

/* * ***************************************************************************
 * ADDING, EDITING & DELETING FOOD
 * ************************************************************************** */

/**
 * Creates a new food with $itemName provided.
 * 
 * @param {String} $itemName
 * @return {boolean}
 */
function addFood($itemName) {
    $query = "INSERT INTO Food (itemName) VALUES (?)";
    $result = $GLOBALS['db']->run($query, array($itemName));
    return reportStatus($result);
}

/**
 * Updates a property of food with $itemName
 * Input should be an array of 2 elements, the property to modify and the value.
 * 
 * @param {String} $itemName
 * @param {array} $input
 */
function editFood($itemName, $input) {

    $property = $input[0];
    $value = $input[1];

    $query = "UPDATE Food SET $property = ? WHERE itemName = ?";
    $result = $GLOBALS['db']->run($query, array($value, $itemName));
    return reportStatus($result);
}

/* * ***************************************************************************
 * STOCK
 * ************************************************************************** */

/**
 * Returns the stock of food with $itemName by $user.
 * 
 * @param {String} $user
 * @param {integer} $itemName
 * @return {integer}
 */
function getStockBy($user, $itemName) {
    $query = "SELECT stock FROM Stock WHERE itemName = ? AND username = ?";
    $results = $GLOBALS['db']->select($query, array($itemName, $user));

    if (sizeOf($results) === 0) {
        http_response_code(404); // Not Found
        return $results;
    }
    $result = $results[0]->stock;

    return $result;
}

/**
 * Returns whether $user has and existing stock for food with $itemName.
 * 
 * @param {integer} $itemName
 * @param {String} $user
 * @return {boolean}
 */
function hasStock($itemName, $user) {
    return sizeOf(getStockBy($user, $itemName)) !== 0;
}

/**
 * Creates or updates the stock of food with $itemName 
 * by user with $username to $value.
 * 
 * @param {String} $itemName
 * @param {String} $username
 * @param {integer} $value
 */
function stockFood($itemName, $username, $value) {

    setFoodLastModified($itemName);

    if (!hasStock($itemName, $username)) {
        $result = createFoodStock($itemName, $username, $value);
    } else {
        $result = modifyFoodStock($itemName, $username, $value);
    }

    return reportStatus($result);
}

/**
 * Creates a new stock of food with $itemName by user with $username of $value.
 * 
 * @param {integer} $itemName
 * @param {String} $username
 * @param {integer} $value
 */
function createFoodStock($itemName, $username, $value) {
    $query = "INSERT INTO Stock VALUES (?,?,?);";
    return $GLOBALS['db']->run($query, array($itemName, $username, $value));
}

/**
 * Updates the value of an existing stock of food 
 * with $itemName by user with $username to $value.
 * 
 * @param {integer} $itemName
 * @param {String} $username
 * @param {integer} $value
 */
function modifyFoodStock($itemName, $username, $value) {
    $query = "UPDATE Stock SET stock = ? WHERE itemName = ? AND username = ?";
    return $GLOBALS['db']->run($query, array($value, $itemName, $username));
}

/**
 * Deletes stock of food with $itemName by user with $username.
 * 
 * @param {String} $itemName
 * @param {String} $username
 */
function deleteFoodStock($itemName, $username) {
    $query = "DELETE FROM Stock WHERE itemName = ? AND username = ?";
    $result = $GLOBALS['db']->run($query, array($itemName, $username));
    return reportStatus($result);
}

/**
 * Sets the last modified date for food with $itemName 
 * to the current date & time.
 * 
 * @param {String} $itemName
 * @return {boolean}
 */
function setFoodLastModified($itemName) {
    $now = date("Y-m-d H:i:s");
    $query = "UPDATE Food SET lastEdit = ? WHERE itemName = ?";
    return $GLOBALS['db']->run($query, array($now, $itemName));
}
