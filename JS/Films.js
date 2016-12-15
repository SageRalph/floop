var embedTrailers = true;
var alwaysEditingFilms = true;

window.addEventListener('load', function () {
    addNavTab("Films", manageFilms);
});

////////////////////////////////// Films ///////////////////////////////////////

/**
 * Films program entry point.
 * Gets a list of users from the server, then runs the default search.
 */
function manageFilms() {
    // Get info for displaying films
    ajax("GET", "accounts", null, getFilms);
}

/**
 * Gets a list of films from the server.
 * If not all users are selected in the table, a list of selected users will
 * be included in the request.
 * 
 * @param {array(String)} users
 */
function getFilms(users, status) {
    
    if (status >= 400){
        return console.log("Failed to get users");
    }

    var url = "films";

    // If film table has been drawn
    if (isSet(getElem('filmTable'))) {
        url += userFilterString(users);
    }

    ajax("GET", url, null, drawFilmTable.bind(null, users));
}

/**
 * Creates a new film with the title ""
 */
function createFilm() {
    ajax('POST', 'films', "");
}

/**
 * Draws a table containing an ordered list of films with adding 
 * and editing controls.
 * 
 * @param {array(String)} users
 * @param {array(object)} films
 */
function drawFilmTable(users, films, status) {
    
    if (status >= 400){
        return console.log("Failed to get films");
    }
    
    log();

    // Find or create table
    var table = getElem('items');
    if (!isSet(table)) {
        createFilmTable(users);
        table = getElem('items');
    } else {
        log("Clearing film table");
        table.innerHTML = "";
    }


    // Fill table
    log("-----------------------------------------");
    var hasEditingRow = false;

    for (var j = 0; j < films.length; j++) {
        displayFilm(films[j], users, table);
        if (films[j].title === "") {
            hasEditingRow = true;
        }
    }

    // Create blank film and reload if non existent.
    if (!hasEditingRow) {
        createFilm();
        ajax("GET", "films", null, drawFilmTable.bind(null, users));
    }
}

/**
 * Draws the column headers for the film table.
 * 
 * @param {array(String)} users
 */
function createFilmTable(users) {

    // Create column headers

    var header = newElem('tr');

    header.innerHTML = "<th class='TrailerCell'>Trailer</th> \
                     <th class='TitleCell'>Title</th>     \
                     <th class='ProgressCell'>Progress</th>";

    // User name column headers
    addUsersToTable(users, header, getFilms.bind(null, users));

    // Total rating column header
    var totalCell = newElem('th', 'TotalCell');
    totalCell.innerHTML = 'Total';
    header.appendChild(totalCell);

    // Toggle embedded trailers button
    appendIconBtnCell(header, "./Res/playIcon.png", function () {
        embedTrailers = !embedTrailers;
        getFilms(users);
    });

    // Toggle always editing button
    appendIconBtnCell(header, "./Res/editIcon.png", function () {
        alwaysEditingFilms = !alwaysEditingFilms;
        getFilms(users);
    });

    clearDisplay();
    return displayScrollTable("filmTable", "items", header);
}

/**
 * Displays film in table.
 * Table is passed as a variable as it may not have been drawn to 
 * reduce DOM restructures.
 * 
 * @param {object} film
 * @param {array(String)} users
 * @param {'table'} table
 */
function displayFilm(film, users, table) {
    log("Displaying info for: " + film.title);

    // Edit film if has default values
    if (film.title === "") {
        editFilm(users, table.insertRow(0), film);
        return;
    }
    if (alwaysEditingFilms) {
        editFilm(users, table.insertRow(), film);
        return;
    }

    var row = newElem('TR');

    // Get trailer (use empty string if null)
    displayTrailerOrAuto(row, film, users);


    appendCell(row, film.title, "TitleCell");

    appendCell(row, film.progress, "ProgressCell");

    appendRatings(row, film, users);

    appendFilmButtons(row, film, users, false);

    // Add to table
    table.appendChild(row);

    log(row);
    log("-----------------------------------------");
}

/**
 * Returns HTML code for either a link to or embedded player for the video 
 * located at src URL, depending on global variable 'embedTrailers'.
 * 
 * @param {'TD'} cell
 * @param {String} src
 * @returns {String}
 */
function embedTrailer(cell, src) {
    if (embedTrailers) {
        // Links assumed to be suitable for embedding
        // Show in middle of screen when clicked
        var button = newIconBtn(icon("play"), function (click) {

            log('Displaying centered video');
            var frame = newElem('article');

            // Click away to close
            window.addEventListener('click', function () {
                log('Closing centered video');
                removeElem('CenteredVideoContainer');
            });
            // Prevent closing when clicking within frame
            frame.onClick = function (event) {
                event.stopPropagation();
            };
            // Or on button to open frame
            click.stopPropagation();

            frame.id = 'CenteredVideoContainer';
            frame.innerHTML = '<iframe src=' + src + ' controls=2></iframe>';
            appendTo('Display', frame);

        });
        cell.appendChild(button);
    } else {
        // Link to trailer
        cell.innerHTML = "\
                <a href=" + src + ">                                \
                    <img src='./Res/playIcon.png' class='icon'</img>\
                </a>";
    }
}


////////////////////////////// Editing Films ///////////////////////////////////

/**
 * Enbales edit controls for the film provided using the row provided 
 * in the film table.
 * 
 * @param {array(String)} users
 * @param {'tr'} row
 * @param {object} film
 */
function editFilm(users, row, film) {
    row.innerHTML = "";


    if (alwaysEditingFilms) {
        displayTrailerOrAuto(row, film, users);
    } else {
        // Trailer edit controls
        var trailer = isSet(film.trailer) ? film.trailer : "";

        var trailerField = tableInput(
                "films", film.filmID, "trailer", "Trailer", trailer);

        var autoTrailerBtn = newIconBtn(icon('search'), function () {
            trailerField.value = "AUTO";
            updateProperty('films', film.filmID, "trailer", trailerField);
        }, "Mini");

        var trailerCell = appendCell(row);
        trailerCell.appendChild(trailerField);
        trailerCell.appendChild(autoTrailerBtn);
    }


    // Title field
    var titleField = tableInput(
            "films", film.filmID, "title", "Title", film.title);
    titleField.addEventListener('blur',
            function () { // TODO resolve timing race
                if (film.title === "") {
                    createFilm(); // Always show new film controls
                }

                if (alwaysEditingFilms) {
                    getAutoTrailer(film.filmID);
                } else {
                    // Get new auto trailer if nessesary
                    if (trailerField.value === "AUTO") {
                        getAutoTrailer(film.filmID);
                    }
                }
            });
    appendCell(row, null, "TitleCell").appendChild(titleField);


    // Progress field
    addField(row, "films", film.filmID,
            "progress", "Progress", film.progress, "ProgressCell");


    appendRatings(row, film, users);

    appendFilmButtons(row, film, users, true);

    log(row);
    log("-----------------------------------------");
}

/**
 * Sets trailer for film with filmID to auto-find.
 * 
 * @param {String} filmID
 * @param {function} callback
 */
function getAutoTrailer(filmID, callback) {
    ajax('PUT', 'films/' + filmID, ["trailer", "AUTO"], callback);
}

/**
 * Appends a cell to row containing either the trailer for film 
 * or an auto find icon if not set.
 * 
 * @param {'tr'} row
 * @param {object} film
 * @param {array(String)} users
 */
function displayTrailerOrAuto(row, film, users) {
    if (isSet(film.trailer)) {
        // Show trailer
        var cell = appendCell(row, "", "TrailerCell");
        embedTrailer(cell, film.trailer);
    } else {
        // Auto find trailer button
        var trailerCell = appendCell(row);
        trailerCell.class = "TrailerCell";
        trailerCell.appendChild(newIconBtn(icon('search'), function () {
            getAutoTrailer(film.filmID, getFilms.bind(null, users));
        }));
    }
}


////////////////////////////// Film Ratings ////////////////////////////////////

/**
 * Processes and lists user ratings for film and appends them to row.
 * 
 * @param {'TR'} row
 * @param {object} film
 * @param {array{String}} users
 */
function appendRatings(row, film, users) {
    for (var j = 0; j < users.length; j++) {
        var user = users[j];

        var enabled = getElem('UserCell' + j).checked;

        var field = userValueField(user, film.ratings, 'rating', 'RatingField', 5, 1, enabled);

        var action = editRating.bind(null, film.filmID, user, field);
        field.onchange = action;// For Chrome
        field.onkeyup = action;// For others

        var cell = appendCell(row);
        cell.className = 'UserCell';
        cell.appendChild(field);
    }
    appendCell(row, film.totalRating, "TotalCell");
}


/**
 * Sets rating of film with {filmID} by {user} to value of {ratingField}.
 * Valid values are 0<=N<=5.
 * Any invalid value will cause the rating to be reset.
 * The page will not be refreshed an no immediate reordering will take place.
 * 
 * @param {String} filmID
 * @param {String} user
 * @param {element} ratingField
 */
function editRating(filmID, user, ratingField) {
    var value = ratingField.value;
    if (isNatural(value) && value <= 5) {
        ajax("PUT", "films/" + filmID + "/" + user, ratingField.value);
        ratingField.className = "RatingField";
    } else {
        ajax("DELETE", "films/" + filmID + "/" + user);
        ratingField.value = "";
        ratingField.className = "RatingField InvalidInput";
    }
}


////////////////////////////// Film Buttons ////////////////////////////////////

/**
 * Appends a 'Mark watched', 'Edit' and 'Remove' button for film to row.
 * 
 * @param {'TR'} row
 * @param {object} film
 * @param {array(String)} users
 * @param {boolean} editing
 */
function appendFilmButtons(row, film, users, editing) {

    // Watched button
    var watchedBtn = newIconBtn(icon('watch'), markWatched.bind(null,
            film.filmID, !film.watched, users));
    appendBtnCell(row, watchedBtn);

    // Highlight row based on watched status
    row.className = film.watched ? 'Watched' : 'Unwatched';

    if (!alwaysEditingFilms || film.title === "") {
        if (editing) {
            appendBtnCell(row, newIconBtn(icon('check'), getFilms.bind(null, users)));
        } else {
            appendBtnCell(row, newIconBtn(icon('edit'), editFilm.bind(null, users, row, film)));
        }
    }

    // Remove button
    if (film.title !== "") {
        appendBtnCell(row, newIconBtn(icon('remove'), removeFilm.bind(null, row, film)));
    }
}

/**
 * Sets the watched status of film with {filmID} to {value}, 
 * then reloads the film list.
 * 
 * @param {String} filmID
 * @param {Boolean} value
 * @param {array(String)} users
 *
 */
function markWatched(filmID, value, users) {
    ajax('PUT', 'films/' + filmID, ['watched', value], getFilms.bind(null, users));
}

/**
 * Deletes film and removes it from the film table.
 * 
 * @param {'tr'} row
 * @param {String} filmID
 */
function removeFilm(row, film) {
    log();
    log("Clicked delete " + film.title);

    var warning = "\
    Confirm deletion of " + film.title + "\n\
    This action is not reversible!";

    var confirmed = confirm(warning);
    log("Deletion confirmed: " + confirmed);

    if (confirmed) {
        ajax("DELETE", "films/" + film.filmID);
        row.parentNode.removeChild(row); // Remove the row rather than reloading
    }
}