Installation
------------------------------------------------------------------
Main folder must be located in server root directory (eg. htdocs).
Database will be created automatically upon first load.

The program is designed for and has been tested to work with servers running the following software of at least the version specified:
- Apache 2.4.4 
- MySQL 5.5.32 (Community Server) 
- PHP 5.4.2

Dependencies
------------------------------------------------------------------
Google data API
https://github.com/google/google-api-php-client

Install /src/Google folder in floop/Vendor/Google

Folder structure should look like:      
{server root (eg. htdocs)}/floop/Vendor/Google/{contents of /src/Google}

Without this dependency, automatic trailer fetching will not function, but will fail gracefully.
No other components are affected and trailer URLs can still be entered manually.
