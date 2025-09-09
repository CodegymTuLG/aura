<?php
// /public/api/template_tasks.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Cho frontend khác domain
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once "db.php";

// Lấy method request
$method = $_SERVER['REQUEST_METHOD'];

// Lấy input JSON
$input = json_decode(file_get_contents("php://input"), true);

// --- GET: Lấy dữ liệu, có thể filter ---
if ($method === 'GET') {
    $where = [];
    $params = [];

    if (isset($_GET['template_task_id'])) {
        $where[] = "template_task_id = :template_task_id";
        $params['template_task_id'] = (int)$_GET['template_task_id'];
    }
    if (isset($_GET['store_check_id'])) {
        $where[] = "store_check_id = :store_check_id";
        $params['store_check_id'] = (int)$_GET['store_check_id'];
    }
    if (isset($_GET['task_type_id'])) {
        $where[] = "task_type_id = :task_type_id";
        $params['task_type_id'] = (int)$_GET['task_type_id'];
    }

    $sql = "SELECT * FROM template_tasks";
    if ($where) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll());
    exit;
}

// --- POST: Thêm template task ---
if ($method === 'POST') {
    $sql = "INSERT INTO template_tasks 
        (task_name, key_work, store_check_id, manual_id, re, task_type_id, response_type_id, response_num, comment, is_plan)
        VALUES
        (:task_name, :key_work, :store_check_id, :manual_id, :re, :task_type_id, :response_type_id, :response_num, :comment, :is_plan)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'task_name' => $input['task_name'] ?? null,
        'key_work' => $input['key_work'] ?? null,
        'store_check_id' => $input['store_check_id'] ?? null,
        'manual_id' => $input['manual_id'] ?? null,
        're' => $input['re'] ?? 0,
        'task_type_id' => $input['task_type_id'] ?? null,
        'response_type_id' => $input['response_type_id'] ?? null,
        'response_num' => $input['response_num'] ?? 0,
        'comment' => $input['comment'] ?? '',
        'is_plan' => $input['is_plan'] ?? 0
    ]);
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    exit;
}

// --- PUT: Sửa template task ---
if ($method === 'PUT') {
    if (!isset($input['template_task_id'])) {
        echo json_encode(['error' => 'template_task_id required']);
        exit;
    }
    $template_task_id = (int)$input['template_task_id'];

    $fields = [];
    $params = [];
    foreach ($input as $key => $value) {
        if ($key !== 'template_task_id') {
            $fields[] = "$key = :$key";
            $params[$key] = $value;
        }
    }
    $params['template_task_id'] = $template_task_id;

    $sql = "UPDATE template_tasks SET " . implode(", ", $fields) . " WHERE template_task_id = :template_task_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['success' => true]);
    exit;
}

// --- DELETE: Xóa template task ---
if ($method === 'DELETE') {
    if (!isset($input['template_task_id'])) {
        echo json_encode(['error' => 'template_task_id required']);
        exit;
    }
    $template_task_id = (int)$input['template_task_id'];
    $stmt = $pdo->prepare("DELETE FROM template_tasks WHERE template_task_id = :template_task_id");
    $stmt->execute(['template_task_id' => $template_task_id]);
    echo json_encode(['success' => true]);
    exit;
}

?>
