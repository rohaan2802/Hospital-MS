<?php
declare(strict_types=1);

/** Creates the MySQL connection used by all API endpoints. */
function getConnection(): PDO
{
    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $port = getenv('DB_PORT') ?: '3306';
    $database = getenv('DB_NAME') ?: 'hospitaldb';
    $username = getenv('DB_USER') ?: '';
    $password = getenv('DB_PASSWORD') ?: '';

    if ($username === '' || $password === '') {
        throw new RuntimeException('Database configuration is incomplete.');
    }

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    $sslCaContent = getenv('DB_SSL_CA_CONTENT') ?: '';
    $sslCa = getenv('DB_SSL_CA') ?: '';
    $bundledCa = dirname(__DIR__) . '/certs/aiven-ca.pem';
    if ($sslCaContent !== '') {
        $sslCa = sys_get_temp_dir() . '/aiven-ca.pem';
        file_put_contents($sslCa, $sslCaContent, LOCK_EX);
        chmod($sslCa, 0600);
    } elseif ($sslCa === '' && is_file($bundledCa)) {
        $sslCa = $bundledCa;
    } elseif ($sslCa !== '' && !preg_match('/^(?:[A-Za-z]:[\\\\\\/]|\\\\\\\\|\\/)/', $sslCa)) {
        $sslCa = dirname(__DIR__) . '/' . ltrim($sslCa, '\\/');
    }
    if ($sslCa !== '') {
        $options[PDO::MYSQL_ATTR_SSL_CA] = $sslCa;
        $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = true;
    }

    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $database);
    return new PDO($dsn, $username, $password, $options);
}
