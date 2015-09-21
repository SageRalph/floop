<?php

/**
 * Gets an array of all foods in the database.
 * 
 * @param {String} $userList
 * @return {array(object)}
 */
function getFoods($userList) {
    $users = null;
    $sumString = "amount";

    // If a list of users is specified add filter
    if ($userList !== null) {
        $users = explode(",", $userList);
        $userString = "username = ? ";
        $i = 1;
        while ($i < count($users)) {
            $userString.= "OR username = ? ";
            $i++;
        }
        $sumString = "CASE WHEN $userString THEN amount ELSE 0 END";
    }

    $query = "SELECT Food.itemName, SUM($sumOf) AS totalStock FROM Food "
            . "LEFT JOIN Stock ON Food.itemName = Stock.itemName "
            . "GROUP BY Food.itemName "
            . "HAVING totalStock > 0 "
            . "ORDER BY totalStock DESC";

    $results = $GLOBALS['db']->select($query, $users);
    return(getFilmDetails($results));
}

/**
 * Gets the stock for an array of $items, (itemName, totalStock) pairs.
 * 
 * @param {array(object)} $items
 * @return {array(object)}
 */
function getFoodStock($items) {

    $query = "SELECT Stock.username, amount FROM Stock "
            . "INNER JOIN Account ON Stock.username = Account.username "
            . "WHERE itemName = ? ORDER BY regDate";

    foreach ($items as $item) {
        $item->stock = $GLOBALS['db']->select($query, array($item . itemName));
    }

    return($items);
}
