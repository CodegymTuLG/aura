<?php
// /public/api/tasks.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once "db.php"; // $pdo = new PDO(...)

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

// --- GET: Lấy tasks + thông tin liên quan + check-lists ---
if ($method === 'GET') {
    $where = [];
    $params = [];

    if (isset($_GET['status_id'])) {
        $where[] = "t.status_id = :status_id";
        $params['status_id'] = (int)$_GET['status_id'];
    }
    if (isset($_GET['dept_id'])) {
        $where[] = "t.dept_id = :dept_id";
        $params['dept_id'] = (int)$_GET['dept_id'];
    }
    if (isset($_GET['do_staff_id'])) {
        $where[] = "t.do_staff_id = :do_staff_id";
        $params['do_staff_id'] = (int)$_GET['do_staff_id'];
    }

    $sqlTasks = "
    SELECT 
        t.task_id,
        t.task_name,
        t.manual_id,
        t.re,
        t.task_type_id,
        ct.name AS task_type_name,
        t.response_type_id,
        rt.name AS response_type_name,
        t.response_num,
        t.comment,
        t.status_id,
        st.name AS status_name,
        t.dept_id,
        d.department_name,
        t.do_staff_id,
        s1.store_id,
        s1.staff_name AS do_staff_name,
        rm.region_name,
        sm.store_name AS do_staff_store_name,
        t.start_date,
        t.end_date,
        t.start_time,
        t.completed_time,
        t.created_staff_id,
        s2.staff_name AS created_staff_name,
        sm2.store_name AS created_staff_store_name
    FROM tasks t
    LEFT JOIN staff_master s1 ON t.do_staff_id = s1.staff_id
    LEFT JOIN store_master sm ON s1.store_id = sm.store_id
    LEFT JOIN region_master rm ON sm.region_id = rm.region_id
    LEFT JOIN staff_master s2 ON t.created_staff_id = s2.staff_id
    LEFT JOIN store_master sm2 ON s2.store_id = sm2.store_id
    LEFT JOIN departments d ON t.dept_id = d.department_id
    LEFT JOIN code_master ct ON t.task_type_id = ct.code_master_id
    LEFT JOIN code_master rt ON t.response_type_id = rt.code_master_id
    LEFT JOIN code_master st ON t.status_id = st.code_master_id
    ";
    if ($where) {
        $sqlTasks .= " WHERE " . implode(" AND ", $where);
    }
    $sqlTasks .= " ORDER BY t.task_id ASC";

    $stmtTasks = $pdo->prepare($sqlTasks);
    $stmtTasks->execute($params);
    $tasks = $stmtTasks->fetchAll(PDO::FETCH_ASSOC);

    // --- Lấy check-lists cho tasks ---
    if ($tasks) {
        $taskIds = array_column($tasks, 'task_id');
        $inQuery = implode(',', array_fill(0, count($taskIds), '?'));

        $sqlCheckLists = "
        SELECT tcl.task_id, cl.check_list_id, cl.check_list_name, cl.created_at
        FROM task_check_list tcl
        INNER JOIN check_lists cl ON tcl.check_list_id = cl.check_list_id
        WHERE tcl.task_id IN ($inQuery)
        ORDER BY cl.check_list_id ASC
        ";
        $stmtCheck = $pdo->prepare($sqlCheckLists);
        $stmtCheck->execute($taskIds);
        $checkListsRaw = $stmtCheck->fetchAll(PDO::FETCH_ASSOC);

        $checkListsByTask = [];
        foreach ($checkListsRaw as $cl) {
            $checkListsByTask[$cl['task_id']][] = [
                'check_list_id' => $cl['check_list_id'],
                'check_list_name' => $cl['check_list_name'],
                'created_at' => $cl['created_at']
            ];
        }

        foreach ($tasks as &$task) {
            $task['check_lists'] = $checkListsByTask[$task['task_id']] ?? [];
        }
        unset($task);
    }

    echo json_encode($tasks, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// --- POST ---
if ($method === 'POST') {
    $sql = "INSERT INTO tasks 
        (task_name, manual_id, re, task_type_id, response_type_id, response_num, comment, status_id, dept_id, do_staff_id, start_date, end_date, start_time, completed_time, created_staff_id)
        VALUES
        (:task_name, :manual_id, :re, :task_type_id, :response_type_id, :response_num, :comment, :status_id, :dept_id, :do_staff_id, :start_date, :end_date, :start_time, :completed_time, :created_staff_id)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'task_name' => $input['task_name'] ?? null,
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

// --- PUT ---
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

// --- DELETE ---
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
