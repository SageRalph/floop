
window.addEventListener('load', function () {
    addNavTab("Freezer", manageFoods);
});

//////////////////////////////// Freezer ///////////////////////////////////////

function manageFoods() {

    // Get info for displaying foods
    ajax("GET", "floop/accounts", null, function (users) {

        var url = "floop/food";

        // If food table has been drawn
        if (isSet(getElem('foodTable'))) {

            // Find selected users
            var selectedUsers = getSelectedUsers(users);
            // Append to url if not all selected
            if (selectedUsers.length < users.length) {
                url += "/viewers/" + selectedUsers.join();
            }
        }

        ajax("GET", url, null, drawFoodTable.bind(null, users));
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
    var table = getElem('foodTable');
    if (!isSet(table)) {
        table = createFoodTable(users);
    } else {

        // Clear table
        log("Clearing food table");
        var i = table.rows.length - 1;
        while (i > 0) {
            table.deleteRow(i);
            i--;
        }
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

    var row = newElem('tr');

    row.innerHTML = "<th class='TitleCell'>Title</th>     \
                     <th class='NotesCell'>Notes</th>";

    // User name column headers
    for (var i = 0; i < users.length; i++) {
        log("Adding user to table: " + users[i]);

        var stockCell = newElem('th', 'RatingCell Checked');
        stockCell.innerHTML = users[i];
        stockCell.id = 'RatingCell' + i;
        stockCell.checked = true;
        stockCell.onclick = function () {
            this.checked = !this.checked;
            var state = this.checked ? " Checked" : "";
            this.className = 'RatingCell' + state;
            manageFoods();
        };
        row.appendChild(stockCell);
    }

    var totalCell = newElem('th', 'TotalRatingCell');
    totalCell.innerHTML = 'Total';
    row.appendChild(totalCell);


    // Display
    table.appendChild(row);
    clearDisplay();
    appendTo('Display', table);
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
    //var notes = !isSet(food.notes) ? food.notes : "";
    log("TTTTT " + food.notes);
    var notesField = newElem('input', "TableInput", "Notes", food.notes);
    notesField.onblur = updateFood.bind(null,
            food.itemName, "notes", notesField, null);
    appendCell(row, null, "TitleCell").appendChild(notesField);


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
    field.parentNode.className += " Modified";
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

        var enabled = getElem('RatingCell' + j).checked;

        var stock = stockBy(user, food.stock);
        var stockField = newElem('input', 'RatingField', null, stock);
        stockField.type = "number";

        if (enabled) {
            stockField.min = "0";
            stockField.max = "10";
            stockField.step = "1";

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

        appendCell(row, null, "RatingCell").appendChild(stockField);
    }

    appendCell(row, food.totalStock, "TotalRatingCell");
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
    if (isNumeric(value) && value <= 10 && value >= 0) {
        ajax("PUT", "floop/food/" + itemName + "/" + user, stockField.value);
        stockField.className = "RatingField";
    } else {
        ajax("DELETE", "floop/food/" + itemName + "/" + user);
        stockField.value = "";
        stockField.className = "RatingField InvalidInput";
    }
    stockField.parentNode.className += " Modified";

}