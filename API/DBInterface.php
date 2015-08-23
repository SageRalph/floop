<?php

class DBConnection {

    // Settings
    const DBName = "floop";
    const DBServername = "127.0.0.1";
    const DBUsername = "root";
    const DBPassword = "";
    const UseTestData = true;

    private $db; // Database handle

    /**
     * Constructs a DBConnection object by establishing a database connection, 
     * or triggering the creation of a new database if none exists matching the 
     * database name specified above.
     */

    public function __construct() {
        // Establish connection
        $this->db = new PDO("mysql:host="
                . self::DBServername, self::DBUsername, self::DBPassword);

        // Create database if not exists
        if (!$this->dbExists()) {
            $this->createDB(self::UseTestData);
        }

        // Configure connection & select database for use
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false); // for LIMIT
        $this->db->exec("USE " . self::DBName . ";");
    }

    /**
     * Returns a boolean, whether a database matching the database name 
     * specified above exists.
     * 
     * @return boolean
     */
    public function dbExists() {
        $matches = $this->db->query("SHOW DATABASES LIKE '" . self::DBName . "';");
        return $matches->rowCount() > 1;
    }

    /**
     * Prepairs and executes a query on the database and returns the results as
     * an array of objects.
     * 
     * @param String $query
     * @param Array $vars
     * @return Array(Object)
     */
    public function select($query, $vars) {
        try {
            $result = $this->db->prepare($query);
            $result->execute($vars);
            return $result->fetchAll(PDO::FETCH_OBJ);
        } catch (PDOException $e) {
            return ("Failed to run query: " . $e->getMessage());
        }
    }

    /**
     * Prepairs and executes a query on the database and returns a message, 
     * either 'Success' or an error log as a string.
     * 
     * @param String $query
     * @param Array $vars
     * @return String
     */
    public function run($query, $vars) {
        try {
            $result = $this->db->prepare($query);
            $result->execute($vars);
            return "Success";
        } catch (PDOException $e) {
            return ("Failed to run query: " . $e->getMessage());
        }
    }

    /**
     * Returns the last ID inserted to the database
     * 
     * @return String
     */
    public function lastID() {
        return $this->db->lastInsertId();
    }

    /**
     * Creates a new database of the name specified above. Optionally test data
     * can be added to the database upon creation. If creation is unsucessful, 
     * an error report will be returned as a string.
     * 
     * @param boolean $useTestData
     * @return String
     */
    public function createDB($useTestData) {
        try {
            // Initialise database
            $this->db->exec("CREATE DATABASE " . self::DBName . ";");
            $this->db->exec("USE " . self::DBName . ";");

            // Setup tables
            $this->db->exec(file_get_contents('DB_setup/CreateTables.sql'));
            if ($useTestData) {
                // Insert test data if desired
                $this->db->exec(file_get_contents('DB_setup/TestData.sql'));
            }
        } catch (PDOException $e) {
            return("Failed to create database: " . $e->getMessage());
        }
    }

    /**
     * Terminates the database connection.
     */
    public function close() {
        $this->db = null;
    }

}
