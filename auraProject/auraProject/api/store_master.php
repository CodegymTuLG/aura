<?php
// /public/api/store_master.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once "db.php";

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

// --- GET: Lấy danh sách store ---
if ($method === 'GET') {
    $where = [];
    $params = [];

    if (isset($_GET['store_id'])) {
        $where[] = "store_id = :store_id";
        $params['store_id'] = (int)$_GET['store_id'];
    }
    if (isset($_GET['region_id'])) {
        $where[] = "region_id = :region_id";
        $params['region_id'] = (int)$_GET['region_id'];
    }

    $sql = "SELECT * FROM store_master";
    if ($where) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll());
    exit;
}

// --- POST: Thêm store ---
if ($method === 'POST') {
    $sql = "INSERT INTO store_master 
        (store_code, store_name, region_id, phone_number, fax_number)
        VALUES 
        (:store_code, :store_name, :region_id, :phone_number, :fax_number)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'store_code' => $input['store_code'] ?? null,
        'store_name' => $input['store_name'] ?? null,
        'region_id' => $input['region_id'] ?? null,
        'phone_number' => $input['phone_number'] ?? null,
        'fax_number' => $input['fax_number'] ?? null,
    ]);
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    exit;
}

// --- PUT: Sửa store ---
if ($method === 'PUT') {
    if (!isset($input['store_id'])) {
        echo json_encode(['error' => 'store_id required']);
        exit;
    }
    $store_id = (int)$input['store_id'];

    $fields = [];
    $params = [];
    foreach ($input as $key => $value) {
        if ($key !== 'store_id') {
            $fields[] = "$key = :$key";
            $params[$key] = $value;
        }
    }
    $params['store_id'] = $store_id;

    $sql = "UPDATE store_master SET " . implode(", ", $fields) . " WHERE store_id = :store_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['success' => true]);
    exit;
}

// --- DELETE: Xóa store ---
if ($method === 'DELETE') {
    if (!isset($input['store_id'])) {
        echo json_encode(['error' => 'store_id required']);
        exit;
    }
    $store_id = (int)$input['store_id'];
    $stmt = $pdo->prepare("DELETE FROM store_master WHERE store_id = :store_id");
    $stmt->execute(['store_id' => $store_id]);
    echo json_encode(['success' => true]);
    exit;
}
?>
