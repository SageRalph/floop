
var debug = false; // Whether debug information should be output to the console

/**
 * Outputs text to the console only if in debug mode.
 * @param {type} text
 * @returns {undefined}
 */
function log(text) {
    if (debug) {
        console.log(isSet(text) ? text : "");
    }
}

/**
 * Alius for docuemnt.getElementByID
 * 
 * @param {String} id
 * @returns {Element}
 */
function getElem(id) {
    return document.getElementById(id);
}

/**
 * Removes and returns element with {id} from the DOM.
 * 
 * @param {String} id
 * @returns {Element}
 */
function removeElem(id) {
    var elem = document.getElementById(id);
    if (isSet(elem)) {
        elem.parentNode.removeChild(elem);
    }
    return elem;
}

/**
 * Appends {element} as a child of element with {id}.
 * 
 * @param {String} id
 * @param {Element} element
 */
function appendTo(id, element) {
    getElem(id).appendChild(element);
}

/**
 * Appends a new cell to a table {row}, with {innerHTML} a handle on the 
 * new cell is returned. The cell may also be given optional {className}.
 * 
 * @param {Row} row
 * @param {String} innerHTML
 * @param {String} className
 * @returns {Element}
 */
function appendCell(row, innerHTML, className) {
    var cell = row.insertCell(-1);

    if (isSet(innerHTML)) {
        cell.innerHTML = innerHTML;
    }

    if (isSet(className)) {
        cell.className = className;
    }

    return cell;
}

function appendIconBtnCell(row, src, action) {
    var button = newIconBtn(src, action);
    var cell = newElem('th', 'FullInvisibleCell');
    cell.appendChild(button);
    row.appendChild(cell);
}

function appendBtnCell(row, button) {
    appendCell(row, "", 'InvisibleCell').appendChild(button);
}

/**
 * Creates a new DOM element with the given properties.
 * 
 * @param {String} type
 * @param {String} className
 * @param {String} placeholder
 * @param {String} value
 * @returns {Element}
 */
function newElem(type, className, placeholder, value, id) {
    var elem = document.createElement(type);

    if (isSet(className)) {
        elem.className = className;
    }

    if (isSet(placeholder)) {
        elem.placeholder = placeholder;
    }

    if (isSet(value)) {
        elem.value = value;
    }

    if (isSet(id)) {
        elem.id = id;
    }

    return elem;
}

/**
 * Creates a new input[type=submit] with the given display text and action.
 * 
 * @param {String} name
 * @param {function} action
 * @returns {input}
 */
function newBtn(name, action, className) {
    var button = document.createElement("input");
    button.type = "submit";
    button.value = name;
    button.onclick = action;
    if (isSet(className)) {
        button.className = className;
    }
    return button;
}

/**
 * Creates a new input[type=image] with the given icon and action.
 * 
 * @param {String} src
 * @param {function} action
 * @returns {input}
 */
function newIconBtn(src, action) {
    var button = document.createElement("input");
    button.type = "image";
    button.src = src;
    button.onclick = action;
    button.className = 'icon';
    return button;
}

/**
 * Determins whether a variable is both defined and not null.
 * 
 * @param {Object} variable
 * @returns {Boolean}
 */
function isSet(variable) {
    return 'undefined' !== typeof variable && variable !== null;
}

/**
 * Determins whether a variable is a natural number.
 * @param {Object} value
 * @returns {Boolean}
 */
function isNatural(value) {
    var pattern = /^(0|([1-9]\d*))$/;
    return pattern.test(value);
}

/**
 * Determins whether a variable is numeric.
 * @param {Object} value
 * @returns {Boolean}
 */
function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Sends an ajax request of type {mode} to {uri} with payload {data}, 
 * then calls {callback} with the response, request status and {parameters}.
 * If {data} is null or undefined, the request will be sent with no payload.
 * 
 * @param {String} mode
 * @param {String} uri
 * @param {Object} data
 * @param {Function} callback
 * @param {Object} parameters
 */
function ajax(mode, uri, data, callback) {
    log();
    log(mode + " " + uri);

    var request = new XMLHttpRequest();
    request.onload = function () {

        // log response
        log("Status: " + request.status);
        var response = request.responseText;

        if (response !== "") {
            try {
                response = JSON.parse(response);
            } catch (e) {
                log("Response was not JSON");
            }
            log("Recieved:");
            log(response);
        }

        // Perform callback
        if (isSet(callback)) {
            try {
                callback(response, request.status);
            } catch (e) {
                log();
                log("Threw error: ");
                log(e);
            }
        }
    };
    request.open(mode, uri, true);
    request.setRequestHeader('Content-Type', 'application/json');

    if (isSet(data)) {
        log("Payload:");
        log(data);
        request.send(JSON.stringify(data));
    } else {
        request.send();
    }
}