
window.addEventListener('load', function () {
    addNavTab("Freezer", manageFoods);
});

//////////////////////////////// Freezer ///////////////////////////////////////

/**
 * Freezer program entry point.
 * Gets a list of users from the server, then runs the default search.
 */
function manageFoods() {
    // Get info for displaying foods
    ajax("GET", "floop/accounts", null, function (users) {
        foodSearch(users);
    });
}

/**
 * Draws a table containing an ordered list of foods.
 * 
 * @param {array(String)} users
 * @param {array(object)} foods
 */
function drawFoodTable(users, foods) {
    log();
    
    // Find or create table
    var table = getElem('foods');
    if (!isSet(table)) {
        createFoodTable(users);
        table = getElem('foods');
    } else {
        log("Clearing food table");
        table.innerHTML = "";
    }


    // Fill table
    log("-----------------------------------------");
    for (var j = 0; j < foods.length; j++) {
        displayFood(foods[j], users, table);
    }
}

/**
 * Draws the column headers for the food table.
 * 
 * @param {array(String)} users
 */
function createFoodTable(users) {
    log("Creating food table");

    // Create table and column headers

    var table = newElem('table');
    table.id = "foodTable";
    
    
    var thead = newElem('thead');


    var row = newElem('tr');

    row.innerHTML = "<th class='TitleCell'>Item Name</th>     \
                     <th class='NotesCell'>Notes</th>";

    // User name column headers
    addUsersToTable(users, row, foodSearch.bind(null, users));

    var totalCell = newElem('th', 'TotalCell');
    totalCell.innerHTML = 'Total';
    row.appendChild(totalCell);


    var tbody = newElem('tbody');
    tbody.id = 'foods';
    
    window.addEventListener('resize', function () {
        resizeTable('foods');
    });


    // Display
    thead.appendChild(row);
    table.appendChild(thead);
    table.appendChild(tbody);
    clearDisplay();
    drawFoodSearch(users);
    appendTo('Display', table);
    resizeTable('foods');
    return table;
}

/**
 * Displays food in table.
 * Table is passed as a variable as it may not have been drawn to 
 * reduce DOM restructures.
 * 
 * @param {object} food
 * @param {array(String)} users
 * @param {'table'} table
 */
function displayFood(food, users, table) {
    log("Displaying info for: " + food.itemName);

    var row = newElem('TR');

    appendCell(row, food.itemName, "TitleCell");


    // Notes field
    var notesField = newElem('textarea', "TableInput", "Notes", food.notes);
    highlightWhenModified(notesField);
    notesField.onblur = updateFood.bind(null,
            food.itemName, "notes", notesField, null);
    appendCell(row, null, "NotesCell").appendChild(notesField);


    appendStocks(row, food, users);

    // Add to table
    table.appendChild(row);

    log(row);
    log("-----------------------------------------");
}

/**
 * Sets property of food with itemName to value of field, then calls callback.
 * 
 * @param {String} itemName
 * @param {String} property
 * @param {String} field
 * @param {function} callback
 */
function updateFood(itemName, property, field, callback) {
    var value = field.value !== "" ? field.value : null;
    ajax('PUT', 'floop/food/' + itemName, [property, value], callback);
}


////////////////////////////// Food Stocks ////////////////////////////////////

/**
 * Processes and lists user stocks for food and appends them to row.
 * 
 * @param {'TR'} row
 * @param {object} food
 * @param {array{String}} users
 */
function appendStocks(row, food, users) {
    for (var j = 0; j < users.length; j++) {
        var user = users[j];

        var enabled = getElem('UserCell' + j).checked;

        var stock = stockBy(user, food.stock);
        var stockField = newElem('input', 'StockField', null, stock);
        stockField.type = "number";
        highlightWhenModified(stockField);

        if (enabled) {
            stockField.min = "0";
            stockField.max = "10";
            stockField.step = "any";

            // For Chrome
            stockField.onchange = editStock.bind(null,
                    food.itemName, user, stockField);
            // For others
            stockField.onkeyup = editStock.bind(null,
                    food.itemName, user, stockField);

        } else {
            // Disable if user not selected
            stockField.disabled = true;
        }
        var cell = appendCell(row);
        cell.className = 'UserCell';
        cell.appendChild(stockField);
    }

    appendCell(row, food.totalStock, "TotalCell");
}

/**
 * Gets the stock given by {user} froma  list of {stocks}, 
 * or the empty string if not found.
 * 
 * @param {String} user
 * @param {Array[Object]} stocks
 * @returns {String}
 */
function stockBy(user, stocks) {
    for (var i = 0; i < stocks.length; i++) {
        if (stocks[i].username === user) {
            log("Found stock of: " + stocks[i].stock + " by: " + user);
            return stocks[i].stock;
        }
    }
    log("Found no stock by: " + user);
    return "";
}

/**
 * Sets stock of food with {itemName} by {user} to value of {stockField}.
 * Valid values are 0<=N<=10.
 * Any invalid value will cause the stock to be reset.
 * The page will not be refreshed an no immediate reordering will take place.
 * 
 * @param {String} itemName
 * @param {String} user
 * @param {element} stockField
 */
function editStock(itemName, user, stockField) {
    var value = stockField.value;
    if (isNumeric(value) && value < 10 && value >= 0) {
        ajax("PUT", "floop/food/" + itemName + "/" + user, stockField.value);
        stockField.className = "StockField";
    } else {
        ajax("DELETE", "floop/food/" + itemName + "/" + user);
        stockField.value = "";
        stockField.className = "StockField InvalidInput";
    }
}


////////////////////////////////// Search //////////////////////////////////////

/**
 * Draws the food search bar and add button.
 * 
 * @param {array(string)} users
 */
function drawFoodSearch(users) {

    // Search Bar
    var searchBar = newElem('input', 'SearchBar', 'Search');
    searchBar.type = 'text';
    searchBar.id = 'searchBar';
    // For Chrome
    searchBar.onchange = foodSearch.bind(null, users);
    // For others
    searchBar.onkeyup = foodSearch.bind(null, users);


    // Add Button
    var addButton = newBtn('Add', addFood.bind(null, users));
    addButton.disabled = true;
    addButton.id = 'addButton';


    // Display
    var container = newElem('section', 'FoodSearch');
    container.appendChild(searchBar);
    container.appendChild(addButton);
    appendTo('Display', container);
}

/**
 * Returns the search bar's current value.
 * @returns {string}
 */
function searchBarValue() {
    return getElem('searchBar').value;
}

/**
 * Fetches then displays a list of food items from the server.
 * If a search term has been entered in the search bar, it will be included in
 * the query.
 * If not all users are selected in the table, a list of selected users will also
 * be included.
 * 
 * @param {array(string)} users
 */
function foodSearch(users) {
    var term = null;
    var url = "floop/food";

    // Advanced searching criteria
    // Only aplicable if interface has been drawn
    if (isSet(getElem('foodTable'))) {

        // Add search term if set
        term = searchBarValue();
        if (term !== null && term !== "") {
            url += "/search/" + term;
        } else {
            getElem('addButton').disabled = true;
        }

        url += userFilterString(users);
    }
    ajax("GET", url, null, displayFoodSearchResults.bind(null, term, users));
}

/**
 * Enables or disables the add new food button depending on whether an exact 
 * match to the search term was found, if one was provided, then displays the
 * search results.
 * 
 * @param {string} term
 * @param {array(string)} users
 * @param {array(object)} results
 */
function displayFoodSearchResults(term, users, results) {

    // Manage add food button
    // Only applicable if search bar was used
    if (term !== null && term !== "") {
        // Enable add button if no results, 
        // otherwise check if query exactly matches any results
        if (results.length === 0) {
            getElem('addButton').disabled = false;
        } else {
            getElem('addButton').disabled = exactTermFound(term, results);
        }
    }

    // Display results
    drawFoodTable(users, results);
}

/**
 * Determins whether results contains an exact match to the search term.
 * 
 * @param {string} term
 * @param {array(object)} results
 * @returns {Boolean}
 */
function exactTermFound(term, results) {
    for (var i = 0; i < results.length; i++) {
        if (results[i].itemName.toUpperCase() === term.toUpperCase()) {
            return true;
        }
    }
    return false;
}

/**
 * Creates a new food item with the name currently entered in the search bar.
 * @param {array(string)} users
 */
function addFood(users) {
    var term = searchBarValue();
    // Add & display
    ajax("POST", "floop/food", term, foodSearch.bind(null, users));
}