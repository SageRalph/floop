
/**
 * Gets the value given by {user} from a  list of {values}, 
 * or the empty string if not found.
 * 
 * @param {String} user
 * @param {Array[Object]} values
 * @param {String} valueName
 * @returns {String}
 */
function valueFor(user, values, valueName) {
    for (var i = 0; i < values.length; i++) {
        if (values[i].username === user) {
            log("Found " + valueName + " of: " + values[i].stock + " for: " + user);
            return values[i][valueName];
        }
    }
    log("Found no " + valueName + " for: " + user);
    return "";
}


/**
 * Returns a bounded number input and loads {user}s value.
 * 
 * @param {String} user
 * @param {array(Object)} values
 * @param {String} valueName
 * @param {String} classname
 * @param {object} maxValue
 * @param {object} step
 * @param {boolean} enabled
 * @returns {'input'}
 */
function userValueField(user, values, valueName, classname, maxValue, step, enabled) {
    var value = valueFor(user, values, valueName);
    var field = newElem('input', classname, null, value);
    field.type = "number";
    field.min = "0";
    field.max = maxValue;
    field.step = step;
    highlightWhenModified(field);
    if (!enabled) {
        // Disable if user not selected
        field.disabled = true;
    }
    return field;
}


/**
 * Creates a scrollable table.
 * 
 * @param {String} tableID
 * @param {String} bodyID
 * @param {'TR'} thr
 * @returns {'table'}
 */
function scrollableTable(tableID, bodyID, thr) {

    log("Creating table: " + tableID);

    var table = newElem('table');
    var thead = newElem('thead');
    var tbody = newElem('tbody');

    table.thr = thr;
    thead.appendChild(thr);
    table.appendChild(thead);
    table.tbody = tbody;
    table.appendChild(tbody);

    table.id = tableID;
    tbody.id = bodyID;

    window.addEventListener('resize', function () {
        resizeTable(bodyID);
    });

    return table;
}


/**
 * Creates and displays a scrollable table.
 * 
 * @param {String} tableID
 * @param {String} bodyID
 * @param {'TR'} thr
 * @returns {'table'}
 */
function displayScrollTable(tableID, bodyID, thr) {
    var table = scrollableTable(tableID, bodyID, thr);
    appendTo('Display', table);
    resizeTable(bodyID);
    return table;
}


/**
 * Sets property of item with id to value of field, then calls callback.
 * 
 * @param {String} service
 * @param {String} id
 * @param {String} property
 * @param {String} field
 * @param {function} callback
 */
function updateProperty(service, id, property, field, callback) {

    // Don't bother if value is unchanged
    if (field.value !== field.initialValue) {

        var value = field.value !== "" ? field.value : null;
        ajax('PUT', 'floop/' + service + '/' + id, [property, value], callback);
    }
}


/**
 * Calculates and applies the apropriate height for scrollable table with {name}
 * 
 * @param {String} name
 */
function resizeTable(name) {
    var tbody = getElem(name);
    if (isSet(tbody)) {
        var clientHeight = document.documentElement.clientHeight;
        var top = tbody.getBoundingClientRect().top;
        var newHeight = clientHeight - top;

        log();
        log('RESIZING TABLE');
        log('clientHeight=' + clientHeight);
        log('top=' + top);
        log('newHeight=' + newHeight);

        tbody.style.height = newHeight + 'px';
    }
}


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
 * Returns a text input intended for use in tables, linked to automatically 
 * update the server with changes as defined by the parameters.
 * 
 * @param {String} service
 * @param {String} id
 * @param {String} property
 * @param {String} placeholder
 * @param {String} value
 * @returns {'input'}
 */
function tableInput(service, id, property, placeholder, value) {
    var input = newElem('input', "TableInput", placeholder, value);
    input.onblur = updateProperty.bind(null, service, id, property, input, null);
    highlightWhenModified(input);
    return input;
}

/**
 * Appends to row a cell containing a text input linked to automatically update 
 * the server with changes as defined by the parameters.
 * 
 * @param {'TR'} row
 * @param {String} service
 * @param {String} id
 * @param {String} property
 * @param {String} placeholder
 * @param {String} value
 * @param {String} classname
 */
function addField(row, service, id, property, placeholder, value, classname) {
    var input = tableInput(service, id, property, placeholder, value);
    appendCell(row, null, classname).appendChild(input);
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
 * @param {String} name
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




/////////////////////////// OO code - non-functional ///////////////////////////

//var scrollableTable = function (service, users) {
//    this.service = service;
//    this.users = users;
//    this.selectedUsers = users;
//
//    // Setup HTML for table
//    this.display = newElem('table');
//
//    var thead = newElem('thead');
//    this.thr = newElem('tr'); // Table header row
//
//    thead.appendChild(this.thr);
//    this.display.appendChild(thead);
//
//    this.tbody = newElem('tbody');
//    this.display.appendChild(tbody);
//    
//    
//    // Setup thr
//    this.displayUsers();
//
//    log("New table created!");
//};
//
//
//
///**
// * Sets property of item with id to value of field, then calls callback.
// * 
// * @param {String} id
// * @param {String} property
// * @param {String} field
// * @param {function} callback
// */
//scrollableTable.prototype.updateProperty =
//        function (id, property, field, callback) {
//
//            // Don't bother if value is unchanged
//            if (field.value !== field.initialValue) {
//
//                var value = field.value !== "" ? field.value : null;
//                ajax('PUT', 'floop/' + this.service + '/' + id, [property, value], callback);
//            }
//        };
//
//
///**
// * Returns whether all users are currently selected
// * 
// * @returns {Boolean}
// */
//scrollableTable.prototype.allUsersSelected =
//        function () {
//            return this.selectedUsers.length === this.users.length;
//        };
//
//
//
///**
// * Adds column headers for all users to row.
// * 
// * @param {array(String)} users
// * @param {'tr'} row
// * @param {function} cellClickAction
// */
//scrollableTable.prototype.displayUsers =
//        function (cellClickAction) {
//            
//            var table=this;
//
//            for (var i = 0; i < table.users.length; i++) {
//
//                log("Adding user to table: " + table.users[i]);
//
//                var cell = newElem('th', 'UserCell Checked');
//                cell.innerHTML = table.users[i];
//
//                cell.onclick = function () {
//
//                    var user = this.innerHTML;
//                    var selectedUsers = table.selectedUsers;
//
//                    if (inArray(selectedUsers, user)) {
//                        // Uncheck
//                        removeFromArray(selectedUsers, user);
//                        this.className = 'UserCell';
//                    } else {
//                        // Check
//                        selectedUsers.push(user);
//                        this.className = 'UserCell Checked';
//                    }
//
//
//                    if (isSet(cellClickAction)) {
//                        cellClickAction();
//                    }
//
//                };
//
//
//                this.thr.appendChild(cell);
//            }
//        };