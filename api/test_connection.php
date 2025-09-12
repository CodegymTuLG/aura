<?php
$host = "localhost";
$db   = "auraorie68aa_auraProject";
$user = "auraorie68aa_admin";
$pass = "legiatuan";
$charset = "utf8mb4";

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
try {
    $pdo = new PDO($dsn, $user, $pass);
    echo "✅ Kết nối thành công!";
} catch (PDOException $e) {
    echo "❌ Lỗi: " . $e->getMessage();
}
