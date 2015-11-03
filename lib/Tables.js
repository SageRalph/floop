
/**
 * Returns an array of the currently selected users
 * 
 * @param {array(String)} users
 * @returns {array(String)}
 */
function getSelectedUsers(users) {
    var selectedUsers = [];
    for (var i = 0; i < users.length; i++) {
        if (getElem('UserCell' + i).checked) {
            selectedUsers.push(users[i]);
        }
    }
    return selectedUsers;
}

/**
 * Adds column headers for all users to row.
 * 
 * @param {array(String)} users
 * @param {'tr'} row
 * @param {function} cellClickAction
 */
function addUsersToTable(users, row, cellClickAction) {
    for (var i = 0; i < users.length; i++) {
        log("Adding user to table: " + users[i]);

        var ratingCell = newElem('th', 'UserCell Checked');
        ratingCell.innerHTML = users[i];
        ratingCell.id = 'UserCell' + i;
        ratingCell.checked = true;
        ratingCell.onclick = function () {

            if (!shouldSelectOnly(users, this)) {
                // Normal behaviour
                this.checked = !this.checked;
                var state = this.checked ? " Checked" : "";
                this.className = 'UserCell' + state;
            }

            if (isSet(cellClickAction)) {
                cellClickAction();
            }

        };
        row.appendChild(ratingCell);
    }
}

/**
 * If all users are selected, select only the target.
 * Returns whether all targets were selected.
 * 
 * @param {array(String)} users
 * @param {'td'} target
 * @returns {Boolean}
 */
function shouldSelectOnly(users, target) {

    var cells = [];

    // Build cell list and confirm all are selected
    for (var i = 0; i < users.length; i++) {
        var cell = getElem('UserCell' + i);
        if (cell.checked) {
            cells.push(cell);
        } else {
            // Abort if any cells are unchecked
            return false;
        }
    }

    // Uncheck all cells except target
    for (var i = 0; i < cells.length; i++) {
        cells[i].checked = false;
        cells[i].className = 'UserCell';
    }
    target.checked = true;
    target.className = 'UserCell Checked';

    return true;
}

/**
 * Returns a text input intended for use in tables, with placeholder and value.
 * 
 * @param {String} placeholder
 * @param {String} value
 * @returns {'input'}
 */
function tableInput(placeholder, value) {
    var input = newElem('input', "TableInput", placeholder, value);
    highlightWhenModified(input);
    return input;
}

/**
 * Sets input to be marked as modified whenever its value is differs from its 
 * current value when this function is applied.
 * 
 * @param {'input'} input
 */
function highlightWhenModified(input) {
    input.initialValue = input.value;
    input.oninput = function () {
        if (input.value !== input.initialValue) {
            input.parentNode.className += " Modified";
        } else {
            input.parentNode.className -= " Modified";
        }
    };
}

/**
 * Returns the full src for icon with name
 * @param {type} name
 * @returns {String}
 */
function icon(name) {
    return "./Res/" + name + "Icon.png";
}

/**
 * Returns a filter string for querying the server respecting selected users.
 * @param {array(String)} users
 * @returns {String}
 */
function userFilterString(users) {
    // Find selected users
    var selectedUsers = getSelectedUsers(users);
    // Add user list if not all but at least one selected
    var selectedUsers = getSelectedUsers(users);
    if (selectedUsers.length < users.length && selectedUsers.length !== 0) {
        return "/viewers/" + selectedUsers.join();
    }
    return "";
}


////////////////////// Potential refactorable code /////////////////////////////

///**
// * Sets property of film with filmID to value of field, then calls callback.
// * 
// * @param {String} filmID
// * @param {String} property
// * @param {String} field
// * @param {function} callback
// */
//function updateFilm(filmID, property, field, callback) {
//    // Don't bother if value is unchanged
//    if (field.value !== field.initialValue) {
//
//        var value = field.value !== "" ? field.value : null;
//        ajax('PUT', 'floop/films/' + filmID, [property, value], callback);
//    } else {
//
//    }
//}
//
//
//////////////////////////////// Film Ratings ////////////////////////////////////
//
///**
// * Processes and lists user ratings for film and appends them to row.
// * 
// * @param {'TR'} row
// * @param {object} film
// * @param {array{String}} users
// */
//function appendRatings(row, film, users) {
//    for (var j = 0; j < users.length; j++) {
//        var user = users[j];
//
//        var enabled = getElem('UserCell' + j).checked;
//
//        var rating = ratingBy(user, film.ratings);
//        var ratingField = newElem('input', 'RatingField', null, rating);
//        ratingField.type = "number";
//
//        if (enabled) {
//            ratingField.min = "0";
//            ratingField.max = "5";
//            ratingField.step = "1";
//
//            // For Chrome
//            ratingField.onchange = editRating.bind(null,
//                    film.filmID, user, ratingField);
//            // For others
//            ratingField.onkeyup = editRating.bind(null,
//                    film.filmID, user, ratingField);
//
//        } else {
//            // Disable if user not selected
//            ratingField.disabled = true;
//        }
//        appendCell(row).appendChild(ratingField);
//    }
//
//    appendCell(row, film.totalRating, "TotalCell");
//}
//
///**
// * Gets the rating given by {user} froma  list of {ratings}, 
// * or the empty string if not found.
// * 
// * @param {String} user
// * @param {Array[Object]} ratings
// * @returns {String}
// */
//function ratingBy(user, ratings) {
//    for (var i = 0; i < ratings.length; i++) {
//        if (ratings[i].username === user) {
//            log("Found rating of: " + ratings[i].rating + " by: " + user);
//            return ratings[i].rating;
//        }
//    }
//    log("Found no ratings by: " + user);
//    return "";
//}
//
///**
// * Sets rating of film with {filmID} by {user} to value of {ratingField}.
// * Valid values are 0<=N<=5.
// * Any invalid value will cause the rating to be reset.
// * The page will not be refreshed an no immediate reordering will take place.
// * 
// * @param {String} filmID
// * @param {String} user
// * @param {element} ratingField
// */
//function editRating(filmID, user, ratingField) {
//    var value = ratingField.value;
//    if (isNatural(value) && value <= 5) {
//        ajax("PUT", "floop/films/" + filmID + "/" + user, ratingField.value);
//        ratingField.className = "RatingField";
//    } else {
//        ajax("DELETE", "floop/films/" + filmID + "/" + user);
//        ratingField.value = "";
//        ratingField.className = "RatingField InvalidInput";
//    }
//    ratingField.parentNode.className += " Modified";
//
//}