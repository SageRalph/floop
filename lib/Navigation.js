
/* Navigation *****************************************************************/

window.addEventListener('load', function () {
    clearDisplay(); // Remove 'Enable JavaScript' place-holder
    displayNotification("Select a tab to get started.", 'header');
    getElem('tabs').innerHTML = ""; // Remove 'Loading...' place-holder
});


/**
 * Displays a notification with the given text and ID in the item browser.
 * If the ID is 'header' it will instead replace the current header.
 * 
 * @param {String} text
 * @param {String} id
 */
function displayNotification(text, id) {
    var note = document.createElement('section');
    note.className = 'Notification';
    note.innerHTML = text;
    if (id === 'header') {
        // Replace header
        var header = getElem('header');
        header.innerHTML = "";
        header.appendChild(note);
    }
    else {
        // Insert into Display
        note.id = id;
        appendTo('Display', note);
    }
}



/**
 * Creates a new tab and adds it to the navigation bar.
 * 
 * @param {String} name
 * @param {Function} action
 */
function addNavTab(name, action) {

    log('Adding navigation tab ' + name);

    var container = newElem('li');
    var tab = newElem('a');
    tab.id = name;
    tab.text = name;


    // Action on click
    tab.onclick = function () {
        selectTab(tab);

        if (isSet(action)) {
            displayNotification("Loading...", "header");
            action();
        }
    };

    container.appendChild(tab);
    appendTo('tabs', container);
}

/**
 * Makes the given tab the selected tab. The previous tab will no longer be 
 * selected.
 * 
 * @param {a} tab
 */
function selectTab(tab) {

    log("");
    log('Clicked on tab ' + tab.id);

    //deselect previous tab
    var currentTab = getElem('currentTab');
    if (currentTab !== null) {
        currentTab.id = null;
    }
    //set current tab to list item containing this
    tab.parentNode.id = "currentTab";
}

/**
 * Resets the display by removing all items from the Display and removing 
 * the footer.
 */
function clearDisplay() {
    getElem("header").innerHTML = "";
    getElem("footer").innerHTML = "";
    getElem('Display').innerHTML = "";
}