
window.addEventListener('load', function () {
    addNavTab("Friends", manageUsers);
});

/* Users **********************************************************************/

function manageUsers() {
    clearDisplay();
    createNewUserContols();
    createUserTable();
    ajax("GET", "accounts/full", null, displayUsers);
}

function createNewUserContols() {

    var createControls = newElem('section', 'Controls');

    var newUserNameField = newElem('input', null, "Username");
    newUserNameField.type = 'text';
    newUserNameField.id = 'newUserNameField';
    createControls.appendChild(newUserNameField);

    createControls.appendChild(newBtn('Add', createUser));

    appendTo('Display', createControls);
}

/**
 * Creates a new user account with the username entered on the form, 
 * then reloads the displayed user list.
 * Usernames must be unique non empty strings.
 */
function createUser() {
    var username = getElem('newUserNameField').value;
    if (isSet(username)) {
        ajax("POST", "accounts", username, manageUsers);
    }
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
        ajax("DELETE", "accounts/" + username, null, manageUsers);
    }
}

/**
 * Draws the column headers for the user table.
 */
function createUserTable() {
    var header = newElem('tr');
    header.innerHTML = "                    \
            <th>Name</th>                   \
            <th>Email Address</th>          \
            <th>Phone Number</th>           \
            <th>UP Number</th>              \
            <th class=InvisibleCell></th>   ";
    return displayScrollTable("userTable", "friends", header);
}

/**
 * Displays a list of users in the user table.
 * 
 * @param {array(String)} users
 */
function displayUsers(users) {
    log("Displaying users");

    var table = getElem('friends');

    for (var i = 0; i < users.length; i++) {

        var user = users[i];
        var username = user.username;
        log("Displaying info for: " + user.username);

        var row = newElem('TR');

        // Display username
        appendCell(row, username);

        // Email field
        addField(row, "accounts", username,
                "email", "Email Address", user.email);

        // Phone number field
        addField(row, "accounts", username,
                "phone", "Phone Number", user.phone);

        // Student number field
        addField(row, "accounts", username,
                "studentNo", "Student Number", user.studentNo);

        // Delete button
        appendBtnCell(row, newIconBtn(
                icon('remove'), deleteUser.bind(null, username)));

        table.appendChild(row);
    }
}