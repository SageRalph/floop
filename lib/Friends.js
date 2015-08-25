
window.addEventListener('load', function () {
    addNavTab("Friends", manageUsers);
});

/* Users **********************************************************************/


function manageUsers() {
    clearDisplay();
    ajax("GET", "floop/accounts/full", null, listUsers);
}


/**
 * Displays a list of all users, with options for deleting and adding users.
 * 
 * @param {array[String]} users
 */
function listUsers(users) {

    displayNotification("Current users", "header");


    var list = newElem('ol', 'UserList');

    // List users
    for (var i = 0; i < users.length; i++) {
        var user = users[i];

        // List user
        var row = newElem('li');

        // User details
        var detailList = newElem('ol', 'DetailList');
        detailList.innerHTML += listIfSet(user.username);
        detailList.innerHTML += listIfSet(user.email);
        detailList.innerHTML += listIfSet(user.phone, "Phone");
        detailList.innerHTML += listIfSet(user.studentNo, "StudentID");
        

        // Add Delete button next to name
        detailList.appendChild(newBtn('Delete user', deleteUser.bind(null, user)));
        row.appendChild(detailList);
        list.appendChild(row);
    }

    // Add new user controls
    var createControls = newElem('li');

    var newUserNameField = newElem('input', 'TwoButton', "Username");
    newUserNameField.id = 'newUserNameField';
    createControls.appendChild(newUserNameField);

    createControls.appendChild(newBtn('Add new user', createUser, 'TwoButton'));

    list.appendChild(createControls);

    appendTo('Display', list);
}


function listIfSet(property, label) {

    var fullLabel = isSet(label) ? label + ": " : "";

    if (isSet(property)) {
        return "<li>" + fullLabel + property + "</li>";
    }
    return "";
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