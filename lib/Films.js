var embedTrailers = false;

window.addEventListener('load', function () {
    addNavTab("Films", manageFilms);
});

/* Films **********************************************************************/

function manageFilms() {
    clearDisplay();
    displayNotification("Loading...", 'header');
    createFilm(); // Always show new film controls
    ajax("GET", "floop/accounts", null, getFilms);
}

function getFilms(users) {
    ajax("GET", "floop/films", null, drawFilmTable, users);
}

function drawFilmTable(films, status, users) {
    clearDisplay();
    log();

    // Create table and column headers

    var table = newElem('table');
    table.id = "filmTable";

    var row = newElem('tr');


    var html = "<th class='TrailerCell'>Trailer</th> <th>Title</th>";

    // User name column headers
    for (var i = 0; i < users.length; i++) {
        log("Adding user to table: " + users[i]);
        html += "<th class='nameCell'>" + users[i] + "</th> ";
    }

    html += "<th>Total</th></th>";


    row.innerHTML = html;


    // Toggle embedded trailers button
    var embBtnText = embedTrailers ? " Link trailers " : " Embed trailers ";
    var toggleEmbedBtn = newBtn(embBtnText, function () {
        embedTrailers = !embedTrailers;
        manageFilms();
    });
    appendBtnCell(row, toggleEmbedBtn);


    // New film button
    //appendBtnCell(row, newBtn("Add", createFilm));



    table.appendChild(row);


    // Fill table
    log("-----------------------------------------");
    for (var i = 0; i < films.length; i++) {
        displayInFilmTable(films[i], users, table);
    }


    // Display
    clearDisplay();
    appendTo('Display', table);
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
 * Creates a new film with the title "Title" then reloads the film table
 */
function createFilm() {
    ajax('POST', 'floop/films', "Title");
}


/**
 * Appends a cell with an editable text field to row, which when loses focus,
 * will update propertyName of film with it's current value.
 * The text field will have the placeholder and default value provided.
 * 
 * @param {'tr'} row
 * @param {object} film
 * @param {String} placeholder
 * @param {String} propertyName
 * @param {String} value
 */
function appendEditableCell(row, film, placeholder, propertyName, value) {
    if (!isSet(value)) {
        value = "";
    }
    var field = newElem('input', null, placeholder, value);
    field.onblur = updateFilm.bind(null, film.filmID, propertyName, field);
    appendCell(row).appendChild(field);
}


/**
 * Sets property of film with filmID to value of field.
 * 
 * @param {String} filmID
 * @param {String} property
 * @param {String} field
 */
function updateFilm(filmID, property, field) {
    field.parentNode.className += " ModifiedCell";
    var value = field.value !== "" ? field.value : null;
    ajax('PUT', 'floop/films/' + filmID, [property, value]);
}


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

    appendEditableCell(row, film, "Trailer", "trailer", film.trailer);

    appendEditableCell(row, film, "Title", "title", film.title);

    appendRatings(row, film, users);

    appendFilmButtons(row, film);
}


/**
 * Appends a 'Mark watched', 'Edit' and 'Remove' button for film to row.
 * @param {'TR'} row
 * @param {object} film
 */
function appendFilmButtons(row, film) {
    // Watched button
    var watchedBtnText = film.watched ? "Mark unwatched" : "Mark watched";
    var watchedBtn = newBtn(watchedBtnText, markWatched.bind(null,
            film.filmID, !film.watched));
    appendBtnCell(row, watchedBtn);

    // Highlight row based on watched status
    row.className = film.watched ? 'Watched' : 'Unwatched';

    // Done button
    appendBtnCell(row, newBtn("Done", manageFilms));

    // Remove button
    if (film.title !== "Title") {
        appendBtnCell(row, newBtn('Remove', removeFilm.bind(null, row, film.filmID)));
    }
}


// Table is passed as it hasen't been drawn to reduce DOM restructures.
function displayInFilmTable(film, users, table) {
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

    appendFilmButtons(row, film);

    // Add to table
    log();
    log(row);
    table.appendChild(row);
    log("-----------------------------------------");
}


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

    appendCell(row, totalRating(film.ratings));
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
    log();
    log("Looking for rating by: " + user);

    for (var i = 0; i < ratings.length; i++) {
        if (ratings[i].username === user) {
            log("Found rating of: " + ratings[i].rating);
            return ratings[i].rating;
        }
    }
    log("No Rating found");
    return "";
}


/**
 * Returns the sum of an array of {ratings}
 * 
 * @param {array[Object]} ratings
 * @returns {integer}
 */
function totalRating(ratings) {
    var total = 0;
    for (var i = 0; i < ratings.length; i++) {
        total += ratings[i].rating;
    }
    return total;
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