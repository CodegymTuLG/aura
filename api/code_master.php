<?php
// codes.php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Kết nối DB
require_once "db.php"; // file db.php chứa $pdo = new PDO(...);

$method = $_SERVER['REQUEST_METHOD'];

// Lấy dữ liệu JSON input
$input = json_decode(file_get_contents("php://input"), true);

switch ($method) {
    // Lấy toàn bộ hoặc lọc theo classification
    case "GET":
        $sql = "SELECT * FROM code_master";
        $params = [];
        if (isset($_GET['classification'])) {
            $sql .= " WHERE classification = ?";
            $params[] = $_GET['classification'];
        }
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    // Thêm mới
    case "POST":
        if (!isset($input['classification'], $input['code'], $input['name'], $input['display_order'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing fields"]);
            exit;
        }
        $stmt = $pdo->prepare("INSERT INTO code_master (classification, code, name, display_order) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $input['classification'],
            $input['code'],
            $input['name'],
            $input['display_order']
        ]);
        echo json_encode(["message" => "Inserted", "id" => $pdo->lastInsertId()]);
        break;

    // Sửa
    case "PUT":
        if (!isset($input['code_master_id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing code_master_id"]);
            exit;
        }
        $stmt = $pdo->prepare("UPDATE code_master SET classification=?, code=?, name=?, display_order=? WHERE code_master_id=?");
        $stmt->execute([
            $input['classification'],
            $input['code'],
            $input['name'],
            $input['display_order'],
            $input['code_master_id']
        ]);
        echo json_encode(["message" => "Updated"]);
        break;

    // Xóa
    case "DELETE":
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing id"]);
            exit;
        }
        $stmt = $pdo->prepare("DELETE FROM code_master WHERE code_master_id=?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(["message" => "Deleted"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
