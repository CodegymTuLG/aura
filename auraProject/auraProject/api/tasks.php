<?php
// /public/api/tasks.php
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

    if (isset($_GET['status_id'])) {
        $where[] = "status_id = :status_id";
        $params['status_id'] = (int)$_GET['status_id'];
    }
    if (isset($_GET['dept_id'])) {
        $where[] = "dept_id = :dept_id";
        $params['dept_id'] = (int)$_GET['dept_id'];
    }
    if (isset($_GET['store_id'])) {
        $where[] = "store_id = :store_id";
        $params['store_id'] = (int)$_GET['store_id'];
    }

    $sql = "SELECT * FROM tasks";
    if ($where) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll());
    exit;
}

// --- POST: Thêm task ---
if ($method === 'POST') {
    $sql = "INSERT INTO tasks 
        (task_name, store_id, manual_id, re, task_type_id, response_type_id, response_num, comment, status_id, dept_id, do_staff_id, start_date, end_date, start_time, completed_time, created_staff_id)
        VALUES
        (:task_name, :store_id, :manual_id, :re, :task_type_id, :response_type_id, :response_num, :comment, :status_id, :dept_id, :do_staff_id, :start_date, :end_date, :start_time, :completed_time, :created_staff_id)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'task_name' => $input['task_name'] ?? null,
        'store_id' => $input['store_id'] ?? null,
        'manual_id' => $input['manual_id'] ?? null,
        're' => $input['re'] ?? 0,
        'task_type_id' => $input['task_type_id'] ?? null,
        'response_type_id' => $input['response_type_id'] ?? null,
        'response_num' => $input['response_num'] ?? 0,
        'comment' => $input['comment'] ?? '',
        'status_id' => $input['status_id'] ?? null,
        'dept_id' => $input['dept_id'] ?? null,
        'do_staff_id' => $input['do_staff_id'] ?? null,
        'start_date' => $input['start_date'] ?? null,
        'end_date' => $input['end_date'] ?? null,
        'start_time' => $input['start_time'] ?? null,
        'completed_time' => $input['completed_time'] ?? null,
        'created_staff_id' => $input['created_staff_id'] ?? null
    ]);
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    exit;
}

// --- PUT: Sửa task ---
if ($method === 'PUT') {
    if (!isset($input['task_id'])) {
        echo json_encode(['error' => 'task_id required']);
        exit;
    }
    $task_id = (int)$input['task_id'];

    $fields = [];
    $params = [];
    foreach ($input as $key => $value) {
        if ($key !== 'task_id') {
            $fields[] = "$key = :$key";
            $params[$key] = $value;
        }
    }
    $params['task_id'] = $task_id;

    $sql = "UPDATE tasks SET " . implode(", ", $fields) . " WHERE task_id = :task_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['success' => true]);
    exit;
}

// --- DELETE: Xóa task ---
if ($method === 'DELETE') {
    if (!isset($input['task_id'])) {
        echo json_encode(['error' => 'task_id required']);
        exit;
    }
    $task_id = (int)$input['task_id'];
    $stmt = $pdo->prepare("DELETE FROM tasks WHERE task_id = :task_id");
    $stmt->execute(['task_id' => $task_id]);
    echo json_encode(['success' => true]);
    exit;
}

?>
