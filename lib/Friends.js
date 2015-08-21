
window.addEventListener('load', function () {
    addNavTab("Friends", manageUsers);
});

/* Users **********************************************************************/


function manageUsers() {
    clearDisplay();
    ajax("GET", "floop/accounts", null, listUsers);
}


/**
 * Displays a list of all users, with options for deleting and adding users.
 * 
 * @param {array[String]} users
 */
function listUsers(users) {

    displayNotification("Current users", "header");


    var list = newElem('ul', 'UserList');

    // List users
    for (var i = 0; i < users.length; i++) {

        // List user
        var row = newElem('li');
        row.innerHTML = users[i];

        // Add Delete button next to name
        row.appendChild(newBtn('Delete user', deleteUser.bind(null, users[i])));

        list.appendChild(row);
    }

    // Add new user controls
    var createControls = newElem('li');

    var newUserNameField = newElem('input', 'TwoButton', "Username");
    newUserNameField.id = 'newUserNameField';
    createControls.appendChild(newUserNameField);

    var createButton = newBtn('Add new user', createUser);
    createButton.className = 'TwoButton';
    createControls.appendChild(createButton);

    list.appendChild(createControls);

    appendTo('Display',list);
}


/**
 * Deletes user with {username}
 * 
 * @param {String} username
 */
function deleteUser(username) {
    log();
    log("Clicked delete " + username);

    if (true) { // TODO should ask for confirmation
        ajax("DELETE", "floop/accounts/" + username, null, manageUsers);
    }
}



/**
 * Creates a new user account with the username entered on the form, 
 * then reloads the displayed user list.
 * Usernames must be unique non empty strings.
 */
function createUser() {
    var username = getElem('newUserNameField').value;
    if (isSet(username)) {
        ajax("POST", "floop/accounts", username, manageUsers);
    }
}