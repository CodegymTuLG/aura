<?php
// /public/api/region_master.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Cho frontend khác domain
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once "db.php";

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

// --- GET: lấy danh sách region ---
if ($method === 'GET') {
    $where = [];
    $params = [];

    if (isset($_GET['region_id'])) {
        $where[] = "region_id = :region_id";
        $params['region_id'] = (int)$_GET['region_id'];
    }

    $sql = "SELECT * FROM region_master";
    if ($where) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll());
    exit;
}

// --- POST: thêm region ---
if ($method === 'POST') {
    $sql = "INSERT INTO region_master (region_name) VALUES (:region_name)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'region_name' => $input['region_name'] ?? null
    ]);
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    exit;
}

// --- PUT: cập nhật region ---
if ($method === 'PUT') {
    if (!isset($input['region_id'])) {
        echo json_encode(['error' => 'region_id required']);
        exit;
    }
    $region_id = (int)$input['region_id'];

    $fields = [];
    $params = [];
    foreach ($input as $key => $value) {
        if ($key !== 'region_id') {
            $fields[] = "$key = :$key";
            $params[$key] = $value;
        }
    }
    $params['region_id'] = $region_id;

    $sql = "UPDATE region_master SET " . implode(", ", $fields) . " WHERE region_id = :region_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['success' => true]);
    exit;
}

// --- DELETE: xóa region ---
if ($method === 'DELETE') {
    if (!isset($input['region_id'])) {
        echo json_encode(['error' => 'region_id required']);
        exit;
    }
    $region_id = (int)$input['region_id'];
    $stmt = $pdo->prepare("DELETE FROM region_master WHERE region_id = :region_id");
    $stmt->execute(['region_id' => $region_id]);
    echo json_encode(['success' => true]);
    exit;
}

echo json_encode(['error' => 'Unsupported request method']);
?>
