<?php
declare(strict_types=1);

// Creates a SQL Server connection used by all API endpoints.
function getSqlServerConnection()
{
    $serverName = 'localhost';
    $connectionInfo = [
        'Database' => 'HospitalDB',
        'UID' => 'scott',
        'PWD' => 'tiger1234',
        'CharacterSet' => 'UTF-8',
        'TrustServerCertificate' => true
    ];

    $conn = sqlsrv_connect($serverName, $connectionInfo);
    if ($conn === false) {
        $errors = sqlsrv_errors(SQLSRV_ERR_ERRORS);
        $message = 'Database connection failed.';
        if (is_array($errors) && isset($errors[0]['message'])) {
            $message .= ' ' . $errors[0]['message'];
        }
        throw new RuntimeException($message);
    }

    return $conn;
}
