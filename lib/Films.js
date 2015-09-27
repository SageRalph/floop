var embedTrailers = false;
var alwaysEditingFilms = false;

window.addEventListener('load', function () {
    addNavTab("Films", manageFilms);
});

////////////////////////////////// Films ///////////////////////////////////////

function manageFilms() {

    createFilm(); // Always show new film controls

    // Get info for displaying films
    ajax("GET", "floop/accounts", null, function (users) {

        var url = "floop/films";

        // If film table has been drawn
        if (isSet(getElem('filmTable'))) {

            // Find selected users
            var selectedUsers = getSelectedUsers(users);
            // Append to url if not all selected
            if (selectedUsers.length < users.length) {
                url += "/viewers/" + selectedUsers.join();
            }
        }

        ajax("GET", url, null, drawFilmTable.bind(null, users));
    });
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
        if (getElem('RatingCell' + i).checked) {
            selectedUsers.push(users[i]);
        }
    }
    return selectedUsers;
}

/**
 * Creates a new film with the title "" then reloads the film table
 */
function createFilm() {
    ajax('POST', 'floop/films', "");
}

/**
 * Draws a table containing an ordered list of films with adding 
 * and editing controls.
 * 
 * @param {array(String)} users
 * @param {array(object)} films
 */
function drawFilmTable(users, films) {
    log();

    // Find or create table
    var table = getElem('filmTable');
    if (!isSet(table)) {
        table = createFilmTable(users);
    } else {

        // Clear table
        log("Clearing film table");
        var i = table.rows.length - 1;
        while (i > 0) {
            table.deleteRow(i);
            i--;
        }
    }


    // Fill table
    log("-----------------------------------------");
    for (var j = 0; j < films.length; j++) {
        displayFilm(films[j], users, table);
    }
}

/**
 * Draws the column headers for the film table.
 * 
 * @param {array(String)} users
 */
function createFilmTable(users) {
    log("Creating film table");

    // Create table and column headers

    var table = newElem('table');
    table.id = "filmTable";

    var row = newElem('tr');

    row.innerHTML = "<th class='TrailerCell'>Trailer</th> \
                     <th class='TitleCell'>Title</th>     \
                     <th class='ProgressCell'>Progress</th>";

    // User name column headers
    for (var i = 0; i < users.length; i++) {
        log("Adding user to table: " + users[i]);

        var ratingCell = newElem('th', 'RatingCell Checked');
        ratingCell.innerHTML = users[i];
        ratingCell.id = 'RatingCell' + i;
        ratingCell.checked = true;
        ratingCell.onclick = function () {
            this.checked = !this.checked;
            var state = this.checked ? " Checked" : "";
            this.className = 'RatingCell' + state;
            manageFilms();
        };
        row.appendChild(ratingCell);
    }

    var totalCell = newElem('th', 'TotalRatingCell');
    totalCell.innerHTML = 'Total';
    row.appendChild(totalCell);



    // Toggle embedded trailers button
    appendIconBtnCell(row, "./Res/playIcon.png", function () {
        embedTrailers = !embedTrailers;
        manageFilms();
    });

    // Toggle always editing button
    appendIconBtnCell(row, "./Res/editIcon.png", function () {
        alwaysEditingFilms = !alwaysEditingFilms;
        manageFilms();
    });


    // Display
    table.appendChild(row);
    clearDisplay();
    appendTo('Display', table);
    return table;
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
        editFilm(users, table.insertRow(1), film);
        return;
    }
    if (alwaysEditingFilms) {
        editFilm(users, table.insertRow(), film);
        return;
    }

    var row = newElem('TR');

    // Get trailer (use empty string if null)
    displayTrailerOrAuto(row, film);


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
 * @param {String} src
 * @returns {String}
 */
function embedTrailer(src) {
    if (embedTrailers) {
        // Database must process YouTube links for embedding
        return '<iframe src=' + src + ' controls=2></iframe>';
    } else {
        return "<a href=" + src + ">\
                <img src='./Res/playIcon.png' class='icon'</img></a>";
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
        displayTrailerOrAuto(row, film);
    } else {
        // Trailer edit controls
        var trailer = isSet(film.trailer) ? film.trailer : "";

        var trailerField = newElem('input', "TableInput", "Trailer", trailer);
        trailerField.onblur = updateFilm.bind(null, film.filmID, "trailer", trailerField);

        var autoTrailerBtn = newIconBtn(icon('search'), function () {
            trailerField.value = "AUTO";
            updateFilm(film.filmID, "trailer", trailerField);
        }, "Mini");

        var trailerCell = appendCell(row);
        trailerCell.appendChild(trailerField);
        trailerCell.appendChild(autoTrailerBtn);
    }


    // Title field
    var titleField = newElem('input', "TableInput", "Title", film.title);
    titleField.onblur = updateFilm.bind(null, film.filmID, "title", titleField,
            function () { // TODO resolve timing race

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
    var progressField = newElem('input', "TableInput", "Progress", film.progress);
    progressField.onblur = updateFilm.bind(null, film.filmID, "progress", progressField);
    appendCell(row, null, "ProgressCell").appendChild(progressField);


    appendRatings(row, film, users);

    appendFilmButtons(row, film, users, true);

    log(row);
    log("-----------------------------------------");
}

function getAutoTrailer(filmID, callback) {
    ajax('PUT', 'floop/films/' + filmID, ["trailer", "AUTO"], callback);
}

/**
 * Sets property of film with filmID to value of field, then calls callback.
 * 
 * @param {String} filmID
 * @param {String} property
 * @param {String} field
 * @param {function} callback
 */
function updateFilm(filmID, property, field, callback) {
    field.parentNode.className += " Modified";
    var value = field.value !== "" ? field.value : null;
    ajax('PUT', 'floop/films/' + filmID, [property, value], callback);
}

/**
 * Appends a cell to row containing either the trailer for film 
 * or an auto find icon if not set.
 * 
 * @param {'tr'} row
 * @param {object} film
 */
function displayTrailerOrAuto(row, film) {
    if (isSet(film.trailer)) {
        // Show trailer
        appendCell(row, embedTrailer(film.trailer), "TrailerCell");
    } else {
        // Auto find trailer button
        var trailerCell = appendCell(row);
        trailerCell.appendChild(newIconBtn(icon('search'), function () {
            getAutoTrailer(film.filmID, manageFilms);
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

        var enabled = getElem('RatingCell' + j).checked;

        var rating = ratingBy(user, film.ratings);
        var ratingField = newElem('input', 'RatingField', null, rating);
        ratingField.type = "number";

        if (enabled) {
            ratingField.min = "0";
            ratingField.max = "5";
            ratingField.step = "1";

            // For Chrome
            ratingField.onchange = editRating.bind(null,
                    film.filmID, user, ratingField);
            // For others
            ratingField.onkeyup = editRating.bind(null,
                    film.filmID, user, ratingField);

        } else {
            // Disable if user not selected
            ratingField.disabled = true;
        }
        appendCell(row, null, "RatingCell").appendChild(ratingField);
    }

    appendCell(row, film.totalRating, "TotalRatingCell");
}

/**
 * Gets the rating given by {user} froma  list of {ratings}, 
 * or the empty string if not found.
 * 
 * @param {String} user
 * @param {Array[Object]} ratings
 * @returns {String}
 */
function ratingBy(user, ratings) {
    for (var i = 0; i < ratings.length; i++) {
        if (ratings[i].username === user) {
            log("Found rating of: " + ratings[i].rating + " by: " + user);
            return ratings[i].rating;
        }
    }
    log("Found no ratings by: " + user);
    return "";
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
        ajax("PUT", "floop/films/" + filmID + "/" + user, ratingField.value);
        ratingField.className = "RatingField";
    } else {
        ajax("DELETE", "floop/films/" + filmID + "/" + user);
        ratingField.value = "";
        ratingField.className = "RatingField InvalidInput";
    }
    ratingField.parentNode.className += " Modified";

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
            film.filmID, !film.watched));
    appendBtnCell(row, watchedBtn);

    // Highlight row based on watched status
    row.className = film.watched ? 'Watched' : 'Unwatched';

    if (!alwaysEditingFilms || film.title === "") {
        if (editing) {
            appendBtnCell(row, newIconBtn(icon('check'), manageFilms));
        } else {
            appendBtnCell(row, newIconBtn(icon('edit'), editFilm.bind(null, users, row, film)));
        }
    }

    // Remove button
    if (film.title !== "") {
        appendBtnCell(row, newIconBtn(icon('remove'), removeFilm.bind(null, row, film.filmID)));
    }
}

/**
 * Sets the watched status of film with {filmID} to {value}, 
 * then reloads the film list.
 * 
 * @param {String} filmID
 * @param {Boolean} value
 */
function markWatched(filmID, value) {
    ajax('PUT', 'floop/films/' + filmID, ['watched', value], manageFilms);
}

/**
 * Deletes film with given filmID and removes it from the film table.
 * 
 * @param {'tr'} row
 * @param {String} filmID
 */
function removeFilm(row, filmID) {
    ajax("DELETE", "floop/films/" + filmID);
    row.parentNode.removeChild(row); // Remove the row rather than reloading
}



/**
 * Returns the full src for icon with name
 * @param {type} name
 * @returns {String}
 */
function icon(name) {
    return "./Res/" + name + "Icon.png";
}