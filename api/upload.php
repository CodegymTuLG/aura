<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Check if a file was uploaded
if (!isset($_FILES['manualFile'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No file uploaded.']);
    exit;
}

$file = $_FILES['manualFile'];

// Check for upload errors
if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(500);
    $errorMessages = [
        UPLOAD_ERR_INI_SIZE   => 'The uploaded file exceeds the upload_max_filesize directive in php.ini.',
        UPLOAD_ERR_FORM_SIZE  => 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form.',
        UPLOAD_ERR_PARTIAL    => 'The uploaded file was only partially uploaded.',
        UPLOAD_ERR_NO_FILE    => 'No file was uploaded.',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder.',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
        UPLOAD_ERR_EXTENSION  => 'A PHP extension stopped the file upload.',
    ];
    $errorMessage = $errorMessages[$file['error']] ?? 'Unknown upload error.';
    echo json_encode(['success' => false, 'error' => $errorMessage]);
    exit;
}

// Define the upload directory relative to the document root
$uploadDir = 'uploads/manuals/';
$absoluteUploadDir = $_SERVER['DOCUMENT_ROOT'] . '/auraProject/' . $uploadDir;

// Create the directory if it doesn't exist
if (!is_dir($absoluteUploadDir) && !mkdir($absoluteUploadDir, 0777, true)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to create upload directory.']);
    exit;
}

// Sanitize the filename and create a unique name
$pathinfo = pathinfo(basename($file['name']));
$filename = preg_replace('/[^a-zA-Z0-9_-]/', '_', $pathinfo['filename']);
$extension = $pathinfo['extension'];
$uniqueFilename = $filename . '_' . time() . '.' . $extension;
$destination = $absoluteUploadDir . $uniqueFilename;

// Move the file to the destination
if (move_uploaded_file($file['tmp_name'], $destination)) {
    // Return the relative path for the client to construct the URL
    $relativeFilePath = $uploadDir . $uniqueFilename;
    echo json_encode(['success' => true, 'filePath' => $relativeFilePath]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to move uploaded file. Check directory permissions.']);
}
?>