<?php
define("DATA_DIR", __DIR__ . '/../data/');
define("TMP_DIR", __DIR__ . '/../tmp/');

include_once "classes/Upload.php";

$upload = new Upload();

$upload->setData($_POST['bin'])->setFileInfo($_POST['fileInfo']);

echo json_encode([
    "success" => $upload->save(),
]);
exit();
