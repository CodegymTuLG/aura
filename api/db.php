<?php
// /public/api/db.php
// Tự động xác định environment dựa trên host
$server_host = $_SERVER['HTTP_HOST']; // ví dụ: localhost hoặc auraorientalis.vn

if (strpos($server_host, 'localhost') !== false) {
    // ===== Local config =====
    $host = 'localhost';
    $db   = 'auraorie68aa_auraProject';
    $user = 'root';
    $pass = '';
    $charset = 'utf8mb4';
} else {
    // ===== Hosting config =====
    $host = 'localhost'; // hoặc tên host DB hosting
    $db   = 'auraorie68aa_auraProject';
    $user = 'auraorie68aa_admin';
    $pass = 'legiatuan';
    $charset = 'utf8mb3';
}

// ===== PDO Connection =====
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}
?>
