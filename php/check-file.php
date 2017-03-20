<?php
define('UPLOAD_DIR', './../uploads/');

$file = UPLOAD_DIR . $_POST["name"];

if (file_exists($file) && isset($_POST["name"]) && $file != null) {
  echo json_encode("true");
} else {
  echo json_encode("false");
}