<?php
// /public/api/task_check_list.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once "db.php"; // $pdo

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

// --- GET: Lấy danh sách check-list theo task ---
if ($method === 'GET') {
    if (!isset($_GET['task_id'])) {
        echo json_encode([]);
        exit;
    }
    $task_id = (int)$_GET['task_id'];

    $stmt = $pdo->prepare("
        SELECT 
            tcl.task_check_list_id,
            tcl.task_id,
            tcl.check_list_id,
            tcl.check_status,
            tcl.completed_at,
            cl.check_list_name
        FROM task_check_list tcl
        INNER JOIN check_lists cl ON tcl.check_list_id = cl.check_list_id
        WHERE tcl.task_id = :task_id
        ORDER BY tcl.task_check_list_id ASC
    ");
    $stmt->execute(['task_id' => $task_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// --- POST: Thêm check-list vào task ---
if ($method === 'POST') {
    if (!isset($input['task_id'], $input['check_list_id'])) {
        echo json_encode(['error' => 'task_id and check_list_id required']);
        exit;
    }
    $stmt = $pdo->prepare("
        INSERT INTO task_check_list (task_id, check_list_id, check_status, completed_at)
        VALUES (:task_id, :check_list_id, 'Not Yet', NULL)
    ");
    $stmt->execute([
        'task_id' => (int)$input['task_id'],
        'check_list_id' => (int)$input['check_list_id']
    ]);
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    exit;
}

// --- PUT: Batch update check-lists ---
if ($method === 'PUT') {
    if (!isset($input['task_id']) || !isset($input['checks']) || !is_array($input['checks'])) {
        echo json_encode(['error' => 'task_id and checks array required']);
        exit;
    }
    $task_id = (int)$input['task_id'];
    $checks = $input['checks'];

    try {
        $pdo->beginTransaction();

        $sql = "
            UPDATE task_check_list
            SET check_status = :check_status,
                completed_at = CASE WHEN :check_status = 'Done' THEN NOW() ELSE NULL END
            WHERE task_id = :task_id AND check_list_id = :check_list_id
        ";
        $stmt = $pdo->prepare($sql);

        foreach ($checks as $c) {
            if (!isset($c['check_list_id'], $c['check_status'])) continue;
            $stmt->execute([
                'check_status' => $c['check_status'],
                'task_id' => $task_id,
                'check_list_id' => (int)$c['check_list_id']
            ]);
        }

        // Nếu tất cả check-lists đã Done → update task.status_id = 9
        $stmt2 = $pdo->prepare("
            SELECT COUNT(*) AS cnt_not_done
            FROM task_check_list
            WHERE task_id = :task_id AND check_status != 'Done'
        ");
        $stmt2->execute(['task_id' => $task_id]);
        $row = $stmt2->fetch(PDO::FETCH_ASSOC);

        if ((int)$row['cnt_not_done'] === 0) {
            $stmt3 = $pdo->prepare("UPDATE tasks SET status_id = 9 WHERE task_id = :task_id");
            $stmt3->execute(['task_id' => $task_id]);
        }

        $pdo->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// --- DELETE: Xóa check-list khỏi task ---
if ($method === 'DELETE') {
    if (!isset($input['task_id'], $input['check_list_id'])) {
        echo json_encode(['error' => 'task_id and check_list_id required']);
        exit;
    }
    $stmt = $pdo->prepare("
        DELETE FROM task_check_list
        WHERE task_id = :task_id AND check_list_id = :check_list_id
    ");
    $stmt->execute([
        'task_id' => (int)$input['task_id'],
        'check_list_id' => (int)$input['check_list_id']
    ]);
    echo json_encode(['success' => true]);
    exit;
}

echo json_encode(['error' => 'Unsupported method']);
