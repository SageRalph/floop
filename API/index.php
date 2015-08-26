<!doctype html>
<html>
    <head>
        <title>Floop - API</title>
        <meta charset="UTF-8">
        <link rel="shortcut icon" href="../favicon.ico" />
        <link rel="stylesheet" href="../CSS/Global.css">
        <link rel="stylesheet" href="../CSS/Tables.css">
    </head>

    <body>

        <p class='Notification'>
            Below is the full RESTful server API.<br>
            Cells highlighted in yellow are incomplete and will return 501 not 
            implemented, these are intended as points for further expansion.
        </p>

        <table>

            <tr>
                <th>Path</th>
                <th>GET</th>
                <th>POST</th>
                <th>PUT</th>
                <th>DELETE</th>
            </tr>

            <tr>
                <td>/accounts</td>
                <td>List all user account names in order of creation</td> 
                <td>Add new user account</td>
                <td></td>
                <td></td>
            </tr>
            
            <tr>
                <td>/accounts/full</td>
                <td>List all accounts in the database with full user details</td> 
                <td></td>
                <td></td>
                <td></td>
            </tr>

            <tr>
                <td>/accounts/{username}</td>
                <td></td> 
                <td></td>
                <td>Edit details of user with {username}, request body should be a two element array of the property name and value.</td>
                <td>Deletes user with {username} and all associated records</td>
            </tr>

            <tr>
                <td>/films</td>
                <td>List all films in descending order of total rating</td> 
                <td>Add new film</td>
                <td></td>
                <td></td>
            </tr>

            <tr>
                <td>/films/viewers/{viewerList}</td>
                <td>List all films in descending order of total rating by viewers in {viewerList}</td> 
                <td></td>
                <td></td>
                <td></td>
            </tr>

            <tr>
                <td>/films/{filmID}</td>
                <td></td> 
                <td></td>
                <td>Edit details of film with {filmID}, request body should be a two element array of the property name and value.</td>
                <td>Removes all rating for and deletes film of {filmID}</td>
            </tr>

            <tr>
                <td>/films/{filmID}/{viewer}</td>
                <td></td> 
                <td></td>
                <td>Modifies the rating given for film {filmID} by {viewer}</td>
                <td>Deletes the rating given for film {filmID} by {viewer}</td>
            </tr>

            <tr>
                <td>/films/{title}/watched</td>
                <td></td> 
                <td></td>
                <td>Sets whether the film has been watched</td>
                <td></td>
            </tr>

        </table>

    </body>
</html>