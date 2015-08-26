
window.addEventListener('load', function () {
    addNavTab("Friends", manageUsers);
});

var alwaysEditing = true;

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
        var row = newElem('li');
        list.appendChild(userDetailsRow(row, users[i], false));
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


function userDetailsRow(row, user, editing) {
    row.innerHTML = "";

    // User details
    var details = newElem('ol', 'DetailList');
    details.innerHTML = "<li>" + user.username + "</li>";

    if (editing || alwaysEditing) {
        // Editable detail fields
        details.appendChild(editableDetail(user.username,
                'email', 'Email Address', user.email, null, 'EmailField'));
        details.appendChild(editableDetail(user.username,
                'phone', 'Phone Number', user.phone, 'Phone: ', 'PhoneField'));
        details.appendChild(editableDetail(user.username,
                'studentNo', null, user.studentNo, 'StudentID: ', 'SIDField'));
    } else {
        // Static detail fields
        details.innerHTML += listIfSet(user.email);
        details.innerHTML += listIfSet(user.phone, "Phone");
        details.innerHTML += listIfSet(user.studentNo, "StudentID");
    }

    // Delete button
    details.appendChild(
            newBtn('Delete', deleteUser.bind(null, user.username)));
    row.appendChild(details);


    if (!alwaysEditing) {
        // Edit button
        var editBtnText = editing ? "Done" : "Edit";
        details.appendChild(newBtn(editBtnText, function () {
            if (editing) {
                manageUsers();
            } else {
                row = userDetailsRow(row, user, !editing);
            }
        }));
    }

    return row;
}


function editableDetail(username, property, placeholder, initialValue, text, fieldClass) {
    var item = newElem('li');

    // Label text
    if (isSet(text)) {
        item.innerHTML = text;
    }

    // Text field
    var field = newElem('input', fieldClass, placeholder, initialValue);
    field.onblur = function () {

        field.className += " Modified";

        // Inform server of change
        var value = field.value !== "" ? field.value : null;
        ajax('PUT', 'floop/accounts/' + username, [property, value]);
    };
    item.appendChild(field);
    return item;
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