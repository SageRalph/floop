<?php

/**
 * Gets an array of all foods in the database.
 * 
 * @param {String} $userList
 * @return {array(object)}
 */
function getFoods($userList) {
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

    $query = "SELECT Food.itemName, notes, SUM($sumString) AS totalStock FROM Food "
            . "LEFT JOIN Stock ON Food.itemName = Stock.itemName "
            . "GROUP BY Food.itemName "
            . "HAVING totalStock > 0 "
            . "ORDER BY totalStock DESC";

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
