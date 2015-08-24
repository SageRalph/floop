
Main folder must be located in server root directory (eg. htdocs).

Dependencies
------------------------------------------------------------------
Google data API
https://github.com/google/google-api-php-client

Install /src/Google folder in floop/Vendor/Google

Folder structure should look like:      
{server root (eg. htdocs)}/floop/Vendor/Google/{contents of /src/Google}

Without this dependency, automatic trailer fetching will not function, but will fail gracefully.
No other components are affected.
