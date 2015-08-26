var embedTrailers = false;

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
        if (getElem('nameCell' + i).checked) {
            selectedUsers.push(users[i]);
        }
    }
    return selectedUsers;
}

/**
 * Creates a new film with the title "Title" then reloads the film table
 */
function createFilm() {
    ajax('POST', 'floop/films', "Title");
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


    var html = "<th class='TrailerCell'>Trailer</th> <th>Title</th>";

    // User name column headers
    for (var i = 0; i < users.length; i++) {
        log("Adding user to table: " + users[i]);
        html += "<th class='nameCell'>" + users[i] +
                "<input type='checkbox' class='UserCheckbox' checked \
                onchange='manageFilms()' id='nameCell" + i + "'></input></th>";
    }

    html += "<th>Total</th></th>";


    row.innerHTML = html;


    // Toggle embedded trailers button
    var toggleEmbedBtn = newBtn(" Embed trailers ", function () {
        embedTrailers = !embedTrailers;
        toggleEmbedBtn.value = embedTrailers ? " Link trailers " : " Embed trailers ";
        manageFilms();
    });
    appendBtnCell(row, toggleEmbedBtn);


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
    if (film.title === "Title") {
        editFilm(users, table.insertRow(1), film);
        return;
    }

    var row = newElem('TR');

    // Get trailer (use empty string if null)
    appendCell(row, isSet(film.trailer) ? embedTrailer(film.trailer) : "", "TrailerCell");

    appendCell(row, film.title);

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
        return "<a href=" + src + ">Trailer</a>";
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


    // Trailer field

    var trailer = isSet(film.trailer) ? film.trailer : "";

    var trailerField = newElem('input', "TableInput", "Trailer", trailer);
    trailerField.onblur = updateFilm.bind(null, film.filmID, "trailer", trailerField);

    var autoTrailerBtn = newBtn("Auto", function () {
        trailerField.value = "AUTO";
        updateFilm(film.filmID, "trailer", trailerField);
    }, "Mini");

    var trailerCell = appendCell(row);
    trailerCell.appendChild(trailerField);
    trailerCell.appendChild(autoTrailerBtn);


    // Title field
    var titleField = newElem('input', "TableInput", "Title", film.title);
    titleField.onblur = updateFilm.bind(null, film.filmID, "title", titleField,
            function () { // TODO resolve timing race
                // Get new auto trailer if nessesary
                if (trailerField.value === "AUTO") {
                    updateFilm(film.filmID, "trailer", trailerField);
                }
            });
    appendCell(row).appendChild(titleField);


    appendRatings(row, film, users);

    appendFilmButtons(row, film, users, true);

    log(row);
    log("-----------------------------------------");
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

        var rating = ratingBy(user, film.ratings);
        var ratingField = newElem('input', 'RatingField', null, rating);
        ratingField.type = "number";
        ratingField.min = "0";
        ratingField.max = "5";
        ratingField.step = "1";

        // For Chrome
        ratingField.onchange = editRating.bind(null,
                film.filmID, user, ratingField);
        // For others
        ratingField.onkeyup = editRating.bind(null,
                film.filmID, user, ratingField);

        appendCell(row).appendChild(ratingField);
    }

    appendCell(row, film.totalRating);
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
    ratingField.parentNode.className += " ModifiedCell";

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
    var watchedBtnText = film.watched ? "Mark unwatched" : "Mark watched";
    var watchedBtn = newBtn(watchedBtnText, markWatched.bind(null,
            film.filmID, !film.watched));
    appendBtnCell(row, watchedBtn);

    // Highlight row based on watched status
    row.className = film.watched ? 'Watched' : 'Unwatched';

    if (editing) {
        // Done button
        appendBtnCell(row, newBtn("Done", manageFilms));
    } else {
        appendBtnCell(row, newBtn("Edit", editFilm.bind(null, users, row, film)));
    }

    // Remove button
    if (film.title !== "Title") {
        appendBtnCell(row, newBtn('Remove', removeFilm.bind(null, row, film.filmID)));
    }
}

/**
 * Sets the watched status of film with {filmID}, then reloads the film list.
 * 
 * @param {String} filmID
 * @param {Boolean} watched
 */
function markWatched(filmID, watched) {
    ajax("PUT", "floop/films/" + filmID + "/watched", watched, manageFilms);
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