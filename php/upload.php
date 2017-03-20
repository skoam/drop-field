<?php

define('UPLOAD_DIR', './../uploads/');
define('TMP_DIR', './../tmp/');

$img = $_POST['file'];
$img = str_replace('data:image/png;base64,', '', $img);
$img = str_replace('data:image/jpg;base64,', '', $img);
$img = str_replace('data:image/jpeg;base64,', '', $img);
$img = str_replace('data:image/tif;base64,', '', $img);
$img = str_replace('data:image/tiff;base64,', '', $img);
$img = str_replace(' ', '+', $img);
$data = base64_decode($img);
$fileName = uniqid() . '.png';
$file = TMP_DIR . $fileName;

file_put_contents($file, $data);

while (!file_exists($file)) sleep(1);

rename($file, UPLOAD_DIR . $fileName);

echo json_encode($fileName);