
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
    ajax("GET", "accounts", null, function (users, status) {
        if (status >= 400){
            return console.log("Failed to get users");
        }
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

    // Create column headers

    var header = newElem('tr');

    header.innerHTML = "<th class='TitleCell'>Item Name</th>     \
                     <th class='NotesCell'>Notes</th>";

    // User name column headers
    addUsersToTable(users, header, foodSearch.bind(null, users));

    var totalCell = newElem('th', 'TotalCell');
    totalCell.innerHTML = 'Total';
    header.appendChild(totalCell);

    clearDisplay();
    drawFoodSearch(users);
    return displayScrollTable("foodTable", "foods", header);
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
    notesField.onblur = updateProperty.bind(null, 'food',
            food.itemName, "notes", notesField, null);
    appendCell(row, null, "NotesCell").appendChild(notesField);


    appendStocks(row, food, users);

    // Add to table
    table.appendChild(row);

    log(row);
    log("-----------------------------------------");
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

        var field = userValueField(user, food.stock, 'stock', 'StockField', 10, 'any', enabled);

        var action = editStock.bind(null, food.itemName, user, field);
        field.onchange = action;// For Chrome
        field.onkeyup = action;// For others

        var cell = appendCell(row);
        cell.className = 'UserCell';
        cell.appendChild(field);
    }
    appendCell(row, food.totalStock, "TotalCell");
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

    if (value.endsWith('.')) {
        stockField.className = "StockField InvalidInput";
        return;
    }
    else if (!isNumeric(value) || value > 10 || value < 0) {
        ajax("DELETE", "food/" + itemName + "/" + user);
        stockField.value = "";
        stockField.className = "StockField InvalidInput";
    }
    else {
        ajax("PUT", "food/" + itemName + "/" + user, stockField.value);
        stockField.className = "StockField";
    }
}


////////////////////////////////// Search //////////////////////////////////////

/**
 * Draws the food search bar and add button.
 * 
 * @param {array(string)} users
 */
function drawFoodSearch(users) {

    // Add Button
    var addButton = newBtn('Add', addFood.bind(null, users));
    addButton.disabled = true;
    addButton.id = 'addButton';

    // Search Bar
    var searchBar = newElem('input', null, 'Search');
    searchBar.type = 'text';
    searchBar.id = 'searchBar';
    searchBar.addEventListener("keyup", function(event){
        if(event.keyCode === 13 && addButton.disabled === false){
            // Add if enter key pressed and valid item name
            addButton.click();
        }else{
            // Otherwise search
            foodSearch(users);
        }
    },false);

    // Display
    var container = newElem('section', 'Controls');
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
    var url = "food";

    // Advanced searching criteria
    // Only applicable if interface has been drawn
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
function displayFoodSearchResults(term, users, results, status) {
    
    if (status >= 400){
        return console.log("Failed to get food");
    }

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
 * Determines whether results contains an exact match to the search term.
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
    ajax("POST", "food", term, foodSearch.bind(null, users));
}