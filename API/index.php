<!doctype html>
<html>
    <head>
        <title>Floop - API</title>
        <meta charset="UTF-8">
        <link rel="shortcut icon" href="../favicon.ico" />
        <link rel="stylesheet" href="../CSS/Global.css">
        <link rel="stylesheet" href="../CSS/API.css">
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
            
            <!--
            <tr>
                <td>/films/genre/{condition}</td>
                <td class="ToDo">Gets all films with genres matching {condition}, which should be a list of genres separated by logical operators eg.'action&comedy'. Results are listed in descending order of total rating.</td> 
                <td></td>
                <td></td>
                <td></td>
            </tr>
            -->

            <tr>
                <td>/films/{filmID}</td>
                <td></td> 
                <td></td>
                <td>Edit details of film with {filmID}, request body should be a two element array of the property name and value.</td>
                <td>Removes all rating for and deletes film with {filmID}</td>
            </tr>

            <tr>
                <td>/films/{filmID}/{viewer}</td>
                <td></td> 
                <td></td>
                <td>Modifies the rating given for film {filmID} by {viewer}</td>
                <td>Deletes the rating given for film {filmID} by {viewer}</td>
            </tr>
            
            <tr>
                <td>/films/{filmID}/genre/{genreList}</td>
                <td></td> 
                <td class="ToDo">Adds all genres in {genreList} to film with {filmID}</td>
                <td></td>
                <td class="ToDo">Removes all genres in {genreList} from film with {filmID}</td>
            </tr>
            



            <tr>
                <td>/food</td>
                <td>List all foods currently in stock descending order of total stock</td> 
                <td>Add new food</td>
                <td></td>
                <td></td>
            </tr>

            <tr>
                <td>/food/search/{term}</td>
                <td>List all foods like {term} in descending order of total stock</td> 
                <td></td>
                <td></td>
                <td></td>
            </tr>

            <tr>
                <td>/food/viewers/{viewerList}</td>
                <td>List all foods in descending order of total stock by viewers in {viewerList}</td> 
                <td></td>
                <td></td>
                <td></td>
            </tr>

            <tr>
                <td>/food/search/{term}/viewers/{viewerList}</td>
                <td>List all foods like {term} in descending order of total stock by viewers in {viewerList}</td> 
                <td></td>
                <td></td>
                <td></td>
            </tr>

            <tr>
                <td>/food/{itemName}</td>
                <td></td> 
                <td></td>
                <td>Edit details of food with {itemName}, request body should be a two element array of the property name and value.</td>
                <td></td>
            </tr>

            <tr>
                <td>/food/{itemName}/{viewer}</td>
                <td></td> 
                <td></td>
                <td>Modifies the stock given for food {itemName} by {viewer}</td>
                <td>Deletes the stock given for food {itemName} by {viewer}</td>
            </tr>

        </table>

    </body>
</html>