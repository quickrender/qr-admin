<?php 
$origin = dirname(__DIR__);
if ($_SERVER['REQUEST_METHOD'] === "GET") :
session_start();
if (isset($_SESSION["qr-admin"]) && $_SESSION["qr-admin"] === true) {?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <link rel="icon" href="misc/favicon.ico"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <meta name="theme-color" content="#000000"/>
    <meta name="description" content="Web site created using create-react-app"/>
    <title>Quick Render</title>
    <link rel="stylesheet" href="codemirror/doc/docs.css">
    <link rel="stylesheet" href="codemirror/lib/codemirror.css">
    <link rel="stylesheet" href="codemirror/addon/fold/foldgutter.css">
    <link rel="stylesheet" href="codemirror/addon/display/fullscreen.css">
    <link rel="stylesheet" href="codemirror/addon/dialog/dialog.css">
    <link rel="stylesheet" href="codemirror/addon/search/matchesonscrollbar.css">
    <link rel="stylesheet" href="codemirror/addon/scroll/simplescrollbars.css">
    <link rel="stylesheet" href="codemirror/theme/default.css">
    <link rel="stylesheet" href="codemirror/theme/satural.css">
    <link rel="stylesheet" href="codemirror/theme/emerald.css">
    <link rel="stylesheet" href="misc/dashicons.css">
    <style>
    .CodeMirror-linenumber{text-align:center}
    .breakpoints{width:6px;left:2px;position:relative}
    .breakpoint{color:#822}
    .CodeMirror-focused .cm-matchhighlight{background-image:url("");background-position:bottom;background-repeat:repeat-x}
    .cm-matchhighlight{background-color:hsl(calc(var(--theme-color) - 210 + 180),62%,24%)}
    .default .cm-matchhighlight{background-color:#e0e0e0}
    .CodeMirror-selection-highlight-scrollbar{background-color:hsla(0,0%,45%,.5)}
    .cm-mustache{color:#0ca}.CodeMirror pre.CodeMirror-placeholder{color:#999!important}
    .cm-trailingspace{background-image:url("");background-position:bottom left;background-repeat:repeat-x;border-bottom:#ccc solid 1px}
    .cm-tab{background:url("");background-position:right;background-repeat:no-repeat}
    .CodeMirror-dialog{position:absolute;left:0;right:0;background:inherit;z-index:0;padding:.1em .8em;overflow:hidden;color:inherit}
    .CodeMirror-overlayscroll-horizontal div,.CodeMirror-overlayscroll-vertical div{position:absolute;background:rgb(85 196 197 / 30%);border-radius:3px}
    div.CodeMirror-overlayscroll-vertical div{background-color:hsla(var(--theme-color),24%,62%,.5);border-radius:0}
    .default div.CodeMirror-overlayscroll-vertical div{background-color:hsla(0,0%,38%,.3);border-radius:0}
    .CodeMirror-foldmarker{color:#ff0;text-shadow:#b9f 1px 1px 2px,#b9f -1px -1px 2px,#b9f 1px -1px 2px,#b9f -1px 1px 2px;font-family:arial;line-height:.3;cursor:pointer}
    .default .CodeMirror-foldmarker{color:#000}
    .CodeMirror-matchingtag{background:hsl(calc(var(--theme-color) - 210 + 180),62%,24%)}
    .default .CodeMirror-matchingtag{background:#d4e0ec}
    .CodeMirror-code{outline:0;margin-bottom:calc(100vh - 60px - 24px)}
    .CodeMirror-lines{padding-top:0}
    </style>
    <script src="codemirror/lib/codemirror.js"></script>
    <script src="codemirror/mode/xml/xml.js"></script>
    <script src="codemirror/mode/meta.js"></script>
    <script src="codemirror/mode/javascript/javascript.js"></script>
    <script src="codemirror/mode/css/css.js"></script>
    <script src="codemirror/mode/htmlmixed/htmlmixed.js"></script>
    <script src="codemirror/mode/python/python.js"></script>
    <script src="codemirror/mode/markdown/markdown.js"></script>
    <script src="codemirror/mode/clike/clike.js"></script>
    <script src="codemirror/mode/php/php.js"></script>
    <script src="codemirror/mode/jsx/jsx.js"></script>
    <script src="codemirror/addon/selection/active-line.js"></script>
    <script src="codemirror/addon/mode/loadmode.js"></script>
    <script src="codemirror/addon/mode/overlay.js"></script>
    <script src="codemirror/addon/scroll/annotatescrollbar.js"></script>
    <script src="codemirror/addon/search/matchesonscrollbar.js"></script>
    <script src="codemirror/addon/search/searchcursor.js"></script>
    <script src="codemirror/addon/search/match-highlighter.js"></script>
    <script src="codemirror/addon/search/searchcursor.js"></script>
    <script src="codemirror/addon/scroll/simplescrollbars.js"></script>
    <script src="codemirror/addon/search/search.js"></script>
    <script src="codemirror/addon/fold/foldcode.js"></script>
    <script src="codemirror/addon/fold/foldgutter.js"></script>
    <script src="codemirror/addon/fold/brace-fold.js"></script>
    <script src="codemirror/addon/fold/xml-fold.js"></script>
    <script src="codemirror/addon/fold/indent-fold.js"></script>
    <script src="codemirror/addon/fold/markdown-fold.js"></script>
    <script src="codemirror/addon/fold/comment-fold.js"></script>
    <script src="codemirror/addon/edit/closebrackets.js"></script>
    <script src="codemirror/addon/edit/closetag.js"></script>
    <script src="codemirror/addon/edit/matchtags.js"></script>
    <script src="codemirror/addon/edit/matchbrackets.js"></script>
    <script src="codemirror/addon/edit/trailingspace.js"></script>
    <script src="codemirror/addon/display/fullscreen.js"></script>
    <script src="codemirror/addon/display/placeholder.js"></script>
    <script src="codemirror/addon/display/rulers.js"></script>
    <script src="codemirror/addon/dialog/dialog.js"></script>
    <script src="codemirror/addon/search/jump-to-line.js"></script>
    <link rel="stylesheet" href="misc/quickrender.css">
    <script defer src="misc/quickrender.js"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html><?php } else {?>
<!DOCTYPE html>
<html lang="en-US">
<head>
  <link rel="icon" href="misc/favicon.ico"/>
  <link rel="stylesheet" href="misc/dashicons.css">
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      background-color: hsl(0, 0%, 5%);
      font-family: sans-serif;
      font-size: 13px;
      line-height: 1.4;
      color: hsl(0, 0%, 88%);
    }
    a {
      color: hsl(0, 0%, 88%);
      text-decoration: none;
    }
    #login {
      width: 320px;
      padding: 5% 0 0;
      margin: auto;
      user-select: none;
    }
    #login h1 a {
      background-image: url(misc/logo.svg);
      background-size: 84px;
      background-position: center top;
      background-repeat: no-repeat;
      height: 84px;
      font-size: 20px;
      font-weight: 400;
      line-height: 1.3;
      margin: 0 auto 25px;
      padding: 0;
      text-decoration: none;
      width: 84px;
      text-indent: -9999px;
      outline: 0;
      overflow: hidden;
      display: block;
    }
    #login #message {
      border-left: 4px solid hsla(180, 62%, 38%);
      padding: 12px;
      margin-left: 0;
      margin-bottom: 20px;
      background-color: hsla(180, 88%, 50%, 0.38);
      word-wrap: break-word;
      display: none;
    }
    #message.error {
      display: block!important;
      background-color: hsla(330, 88%, 50%, 0.38)!important;
      border-left: 4px solid hsla(330, 62%, 38%)!important;
    }
    #message.success {
      display: block!important;
    }
    #login form {
      margin-top: 20px;
      margin-left: 0;
      padding: 26px 24px 34px;
      font-weight: 400;
      overflow: hidden;
      background: hsla(210, 88%, 50%, 0.38);
      border: 1px solid hsl(0, 0%, 62%);
      box-shadow: 0 1px 3px rgb(0 0 0 / 4%);
    }
    #login form p {
      margin-bottom: 0;
      line-height: 1.5;
    }
    #login label {
      font-size: 14px;
      line-height: 1.5;
      display: inline-block;
      margin-bottom: 3px;
      cursor: pointer;
    }
    #login form input {
      background: hsl(210, 62%, 88%);
      font-size: 16px;
      width: 100%;
      line-height: 1.33333333;
      border-width: .0625rem;
      padding: 4px 6px;
      box-shadow: 0 0 0 transparent;
      border-radius: 4px;
      border: 2px inset hsl(0, 0%, 62%);
      color: hsl(210, 62%, 12%);
      outline: none;
    }
    #login form .username, #login form .password {
      margin-bottom: 16px;
    }
    #login form input:focus {
      background-color: white;
      color: black;
      box-shadow: 0 0 0 1px #fff, 0 0 0 3px hsl(210, 68%, 38%);
    }
    #login #password {
      position: relative;
    }
    #user_pass {
      padding-right: 2.6rem!important;
    }
    #user_pass::-ms-reveal {
      display:none;
    }
    #login button {
      background: 0 0;
      border: 1px solid transparent;
      box-shadow: none;
      font-size: 14px;
      line-height: 1.8;
      width: 2.5rem;
      height: 100%;
      margin: 0;
      padding: 5px 9px;
      position: absolute;
      right: 0;
      top: 0;
      color: #2271b1;
      vertical-align: top;
      border-radius: 4px;
      background-repeat: no-repeat;
      background-origin: border-box;
    }
    #login button:focus {
      border: 2px inset hsl(0, 0%, 62%);
      background-color: white;
      box-shadow: 0 0 0 1px #fff;
    }
    #login button::before {
      font-family: dashicons;
      position: absolute;
      width: 100%;
      height: 100%;
      font-size: 17.5px;
      top: 0px;
      left: 0px;
    }
    #login button:focus::before {
      top: -1px;
    }
    #login button.visibility::before {
      content: "\f177";
    }
    #login button.hidden::before {
      content: "\f530";
    }
    #login .forgetmenot {
      font-weight: 400;
      margin-top: 0px;
      float: left;
      height: 28px;
    }
    #login .forgetmenot input:focus {
      box-shadow: none;
    }
    #login .forgetmenot label {
      line-height: 1.85;
      vertical-align: top;
      height: 100%;
    }
    #rememberme {
      border: 1px solid #8c8f94;
      border-radius: 4px;
      background: #fff;
      clear: none;
      cursor: pointer;
      display: inline-block;
      line-height: 0;
      height: 1rem;
      margin: 2px 3px 0 0;
      outline: 0;
      padding: 0!important;
      text-align: center;
      vertical-align: middle;
      width: 1rem!important;
      min-width: 1rem;
      -webkit-appearance: none;
      box-shadow: inset 0 1px 2px rgb(0 0 0 / 10%);
      transition: .05s border-color ease-in-out;
    }
    input[type=checkbox]:checked::before {
      content: url(data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2020%2020%27%3E%3Cpath%20d%3D%27M14.83%204.89l1.34.94-5.81%208.38H9.02L5.78%209.67l1.34-1.25%202.57%202.4z%27%20fill%3D%27%233582c4%27%2F%3E%3C%2Fsvg%3E);
      margin: -.25rem 0 0 -.315rem;
      display: inline-block;
      height: 100%;
      width: 20px;
    }
    #login .submit input {
      min-height: 32px;
      line-height: 2.30769231;
      font-size: 12px!important;
      padding: 0 12px;
      float: right;
      width: initial;
      background: hsl(210, 68%, 50%);
      border-color: hsl(210, 68%, 50%);
      color: hsl(0, 0%, 88%);
      display: inline-block;
      cursor: pointer;
      border-style: solid;
      border-radius: 4px;
    }
    #login .submit input:hover {
      background: hsl(210, 68%, 38%);
      border-color: hsl(210, 68%, 38%);
    }
    #login .submit input:focus {
      color: hsl(0, 0%, 88%);
      background-color: hsl(210, 68%, 38%);
    }
  </style>
</head>
<body>
  <div id="login">
    <h1><a href="javascript:void(0);">Powered by QuickRender</a></h1>
    <p id="message"></p>
    <form name="loginform" id="loginform" action="javascript:void(0)" method="post">
      <p class="username">
        <label for="user_login">Username</label>
        <input type="text" name="log" id="user_login" autofocus/>
      </p>
      <div class="password">
        <label for="user_pass">Password</label>
        <div id="password">
          <input type="password" name="pwd" id="user_pass"/>
          <button type="button" class="hidden">
            <span></span>
          </button>
        </div>
      </div>
      <p class="forgetmenot">
        <input name="rememberme" type="checkbox" id="rememberme" value="forever"/>
        <label for="rememberme">Remember Me</label>
      </p>
      <p class="submit">
        <input type="submit" name="wp-submit" id="wp-submit" value="Log In"/>
      </p>
    </form>
    <p>
      <a href="javascript:void(0);">Lost your password?</a>
    </p>
    <script type="text/javascript">
      window.password.querySelector("button").addEventListener("click", function() {
        if (this.className !== "visibility") {
          this.previousElementSibling.type = "text";
          this.className = "visibility";
        } else {
          this.previousElementSibling.type = "password";
          this.className = "hidden";
        }
      });
      document.forms[0].addEventListener("submit", function () {
        var xhttp = new XMLHttpRequest();
        xhttp.onload = function () {
          var message;
          if (message = this.responseText)  {
            window.message.className = "message error";
            window.message.innerHTML = "Invalid credentials!";
          } else {
            window.message.className = "message success";
            window.message.innerHTML = "Login successfully!";
            location.assign("");
          }
        };
        xhttp.open("POST", "?action=login");
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("username=" + this["log"].value + "&password=" + this["pwd"].value);
      });
    </script>
    <p>
      <a href="javascript:void(0);">&larr; Go to qrickrender</a>		
    </p>
  </div>
</body>
</html><?php }
elseif ($_SERVER['REQUEST_METHOD'] === "POST") :

function getMimeType($r, $t='file') {
  $finfo = new finfo(FILEINFO_MIME_TYPE);
  return ($t =='str') ? $finfo->buffer($r) : $finfo->file($r);
}
function getFileType($r, $t='file') {
  $finfo = new finfo(FILEINFO_MIME_TYPE);
  return strstr(($t =='str') ? $finfo->buffer($r) : $finfo->file($r), "/", true);
}
function canEdit($location) {
  $mimeType = getMimeType($location);
  $type = getFileType($location);
  if ($type === "text" || $mimeType === "image/svg+xml" ||
  $mimeType === "application/json" || $mimeType === "application/x-empty") {
    return true;
  } else {
    return false;
  }
}
$action = $_GET["action"];
if ($action === "login") {
  if (isset($_POST["password"]) && isset($_POST["username"]) && 
  $_POST["password"] === "admin" && $_POST["username"] === "admin") {
    session_start();
    $_SESSION["qr-admin"] = true;
  } else {
    echo "Invalid credentials!";
  }
} else if ($action === "logout") {
  session_start();
  $_SESSION["qr-admin"] = false;
} else if ($action === "getFiles") {
  if (isset($_POST["location"]) && file_exists($origin ."/" . $_POST["location"])) {
    $location = $origin . $_POST["location"];
    $folders = []; $files = [];
    foreach (glob($location . "*") as $a) {
      if (is_dir($a) && basename($a) !== "qr-admin") {Array_push($folders, [str_replace($origin, "", $a) . "/", fileinode($a)]);}
      if (is_file($a) && basename($a) !== "qr-index.php") {Array_push($files, [str_replace($origin, "", $a), fileinode($a)]);}
    }
    echo json_encode(Array_merge($folders, $files));
  } else {
    echo "-1";
  }
} else if ($action === "checkFiles") {
  if (isset($_POST["location"]) && file_exists($origin ."/" . $_POST["location"])) {
    $location = $origin . $_POST["location"];
    $folders = []; $files = [];
    foreach (glob($location . "*") as $a) {
      if (is_dir($a) && basename($a) !== "qr-admin") {Array_push($folders, str_replace($origin, "", $a) . "/");}
      if (is_file($a) && basename($a) !== "qr-index.php") {Array_push($files, str_replace($origin, "", $a));}
    }
    echo json_encode(Array_merge($folders, $files));
  } else {
    echo "-1";
  }
} else if ($action === "getContents") {
  if (isset($_POST["location"])) {
    $location = $origin . $_POST["location"];
    if (file_exists($location) && is_file($location)) {
      $mimeType = getMimeType($location);
      $type = getFileType($location);
      if (canEdit($location)) {
        echo file_get_contents($location);
      } else {
        echo "The file type: " . $mimeType . " is not supported for edit.";
      }
    } else { 
      echo "404 NOT FOUND";
    }
  } else {
    echo "The file location is not specified.";
  }
} else if ($action === "checkContents") {
  if (isset($_POST["location"])) {
    $location = $origin . $_POST["location"];
    if (file_exists($location) && is_file($location)) {
      $mimeType = getMimeType($location);
      $type = getFileType($location);
      if (canEdit($location)) {
        echo 1;
      } else {
        echo -1;
      }
    } else { 
      echo "404 NOT FOUND";
    }
  } else {
    echo "The file location is not specified.";
  }
} else if ($action === "saveFiles") {
  if (isset($_POST["location"])) {
    $location = $origin . $_POST["location"];
    if (file_exists($location) && is_file($location)) {
      $mimeType = getMimeType($location);
      $type = getFileType($location);
      if (canEdit($location)) {
        $myfile = fopen($location, "w") or die("Unable to open file!");
        $code = $_POST["code"];
        fwrite($myfile, $code);
        fclose($myfile);
      } else {
        echo "The file type: " . $type . " is not supported for save.";
      }
    } else { 
      echo "404 NOT FOUND";
    }
  } else {
    echo "The file location is not specified.";
  }
} else if ($action === "renameFiles") {
  if (isset($_POST["location"])) {
    $location = $origin . $_POST["location"];
    $fname = pathinfo($location, PATHINFO_DIRNAME) . "/" . $_POST["fname"];
    if (file_exists($location)) {
      if (!file_exists($fname) || strtolower($location) === strtolower($location)) {
        rename($location, $fname);
      } else {
        echo "A file or folder {$_POST["fname"]} already exists in the location.";
      }
    } else { 
      echo "The file does not exist.";
    }
  } else {
    echo "The file location is not specified.";
  }
} else if ($action === "moveFiles") {
  if (isset($_POST["location"])) {
    $location = $origin . $_POST["location"];
    $destination = $origin . $_POST["fname"];
    if (file_exists($location)) {
      if (!file_exists($destination)) {
        rename($location, $destination);
      } else {
        echo "A file or folder {$_POST["fname"]} already exists in the location.";
      }
    } else { 
      echo "The file does not exist.";
    }
  } else {
    echo "The file location is not specified.";
  }
} else if ($action === "createFiles") {
  if (isset($_POST["location"])) {
    $location = $origin . $_POST["location"] . $_POST["fname"];
    if (!file_exists($location)) {
      $myfile = fopen($location, "w") or die("Unable to create file!");
      fclose($myfile);
    } else { 
      echo "A file or folder {$_POST["fname"]} already exists in the location.";
    }
  } else {
    echo "The file location is not specified.";
  }
} else if ($action === "createFolders") {
  if (isset($_POST["location"])) {
    $location = $origin . $_POST["location"] . $_POST["fname"];
    if (!file_exists($location)) {
      mkdir($location);
    } else { 
      echo "A file or folder {$_POST["fname"]} already exists in the location.";
    }
  } else {
    echo "The file location is not specified.";
  }
} else if ($action === "deleteFiles") {
  if (isset($_POST["location"])) {
    $location = $origin . $_POST["location"];
    if (file_exists($location)) {
      if (is_file($location))
        unlink($location);
      else if (is_dir($location)) {
        function deleteFolder($a) {
          foreach (glob($a . "*") as $x) {
            if (is_dir($x)) {
              deleteFolder($x . "/");
            } elseif (is_file($x)) {
              unlink($x);
            }
          }
          rmdir($a);
        }
        deleteFolder($location);
      }
    } else { 
      echo "The file or folder does not exist in the location.";
    }
  } else {
    echo "The file location is not specified.";
  }
} else if ($action === "zipFiles" || $action === "downloadFolders") {
  Class ZipArchiver {
    public static function zipFiles($files, $zipPath=null) {
      if (empty($zipPath)) {
        if (is_array($files)) $location = $files[0];
        else $location = $files;
        $name = basename($location);
        if (is_file($location)) $name = pathinfo($name, PATHINFO_FILENAME);
        $zipPath = dirname($location) . "/" . $name . ".zip";
        if (file_exists($zipPath)) unlink($zipPath);
      }
      if (is_array($files)) foreach ($files as $a) self::zipF($a, $zipPath);
      else if (is_string($files)) return self::zipF($files, $zipPath);
    }
    private static function zipF($sourcePath, $outZipPath) {
      $pathInfo = pathinfo($sourcePath);
      $parentPath = $pathInfo['dirname'];
      $dirName = $pathInfo['basename'];
      $z = new ZipArchive();
      $z->open($outZipPath, ZipArchive::CREATE);
      if (is_dir($sourcePath)) {
        $z->addEmptyDir("$dirName");
        if ($sourcePath == $dirName) self::dirToZip($sourcePath, $z, 0);
        else self::dirToZip($sourcePath, $z, strlen("$parentPath/"));
      } else if (is_file($sourcePath)) $z->addFile($sourcePath, basename($sourcePath));
      $z->close();
      return true;
    }
    private static function dirToZip($folder, &$zipFile, $exclusiveLength){
      $handle = opendir($folder);
      while (FALSE !== $f = readdir($handle)) {
        // Check for local/parent path or zipping file itself and skip
        if ($f != '.' && $f != '..') {
          $filePath = "$folder/$f";
          // Remove prefix from file path before add to zip
          $localPath = substr($filePath, $exclusiveLength);
          if (is_file($filePath)) $zipFile->addFile($filePath, $localPath);
          elseif (is_dir($filePath)) {
            // Add sub-directory
            $zipFile->addEmptyDir($localPath);
            self::dirToZip($filePath, $zipFile, $exclusiveLength);
          }
        }
      }
      closedir($handle);
    }
  }
  if (isset($_POST["location"])) {
    $zipper = new ZipArchiver;
    function mapDir($a) {
      global $origin;
      $a = $origin . $a;
      if (is_dir($a)) return dirname($a . "*");
      else if (is_file($a)) return $a;
      else return null;
    }
    if ($_GET["action"] === "zipFiles") {
      $dirPath = json_decode($_POST["location"]);
      if ($dirPath === null) $dirPath = mapDir($_POST["location"]);
      else if (is_array($dirPath)) $dirPath = array_map("mapDir", $dirPath);
      $zipper->zipFiles($dirPath);
    } else {
      $dirPath = mapDir($_POST["location"]);
      $zipPath = $origin . "/qr-admin/misc/" . basename($dirPath) . ".zip";
      forEach (glob($origin . "/qr-admin/misc/*.zip") as $a) unlink($a);
      $zip = $zipper->zipFiles($dirPath, $zipPath);
      if (!$zip) {
        echo "Failed to zip the folder: " . basename($dirPath) . ".";
      }
    }
  } else {
    echo "The file location is not specified.";
  }
} else if ($action === "extractFiles") {
  class Extractor {
    public static function extract($archive, $destination) {
      $ext = pathinfo($archive, PATHINFO_EXTENSION);
      switch ($ext) {
      case 'zip':
        $res = self::extractZipArchive($archive, $destination);
        break;
      case 'gz':
        $res = self::extractGzipFile($archive, $destination);
        break;
      case 'rar':
        $res = self::extractRarArchive($archive, $destination);
        break;
      }
      return $res;
    }
    public static function extractZipArchive($archive, $destination) {
      // Check if webserver supports unzipping.
      if (!class_exists('ZipArchive')) {
        $GLOBALS['status'] = array('error' => 'Your PHP version does not support unzip functionality.');
        return false;
      }
      $zip = new ZipArchive;
      // Check if archive is readable.
      if ($zip->open($archive) === TRUE) {
        // Check if destination is writable
        if (is_writeable($destination . '/')) {
          $zip->extractTo($destination);
          $zip->close();
          $GLOBALS['status'] = array('success' => 'Files unzipped successfully');
          return true;
        } else {
          $GLOBALS['status'] = array('error' => 'Directory not writeable by webserver.');
          return false;
        }
      } else {
        $GLOBALS['status'] = array('error' => 'Cannot read .zip archive.');
        return false;
      }
    }
    public static function extractGzipFile($archive, $destination) {
      // Check if zlib is enabled
      if (!function_exists('gzopen')) {
        $GLOBALS['status'] = array('error' => 'Error: Your PHP has no zlib support enabled.');
        return false;
      }
      $filename = pathinfo($archive, PATHINFO_FILENAME);
      $gzipped = gzopen($archive, "rb");
      $file = fopen($filename, "w");
      while ($string = gzread($gzipped, 4096)) {
        fwrite($file, $string, strlen($string));
      }
      gzclose($gzipped);
      fclose($file);
      // Check if file was extracted.
      if (file_exists($destination.'/'.$filename)) {
        $GLOBALS['status'] = array('success' => 'File unzipped successfully.');
        return true;
      } else {
        $GLOBALS['status'] = array('error' => 'Error unzipping file.');
        return false;
      }
    }
    public static function extractRarArchive($archive, $destination) {/*
      // Check if webserver supports unzipping.
      if (!class_exists('RarArchive')) {
        $GLOBALS['status'] = array('error' => 'Your PHP version does not support .rar archive functionality.');
        return false;
      }
      // Check if archive is readable.
      if ($rar = RarArchive::open($archive)) {
        // Check if destination is writable
        if (is_writeable($destination . '/')) {
          $entries = $rar->getEntries();
          foreach ($entries as $entry) {
            $entry->extract($destination);
          }
          $rar->close();
          $GLOBALS['status'] = array('success' => 'File extracted successfully.');
          return true;
        } else {
          $GLOBALS['status'] = array('error' => 'Directory not writeable by webserver.');
          return false;
        }
      } else {
        $GLOBALS['status'] = array('error' => 'Cannot read .rar archive.');
        return false;
      }*/
    }
  }
  if (isset($_POST["location"])) {
    $extractor = new Extractor;
    $archivePath = $origin . $_POST["location"];
    $destPath = dirname($archivePath);
    $extract = $extractor->extract($archivePath, $destPath);
    if (!$extract) {
      echo "Failed to extract the archive file.";
    }
  } else {
    echo "The file location is not specified.";
  }
} else if ($action === "uploadFiles") {
  if (isset($_GET["location"])) {
    $location = $origin . $_GET["location"];
    $destination = $location . "/{$_FILES["filetoupload"]["name"]}";
    if (file_exists($destination)) die ("A file named " . basename($destination) . " already exits in the location.");
    if (file_exists($location) && is_dir($location)) {
      move_uploaded_file($_FILES["filetoupload"]["tmp_name"], $destination);
    } else {
      echo "The folder does not exist in the location.";
    }
  } else {
    echo "The file location is not specified.";
  }
}
endif;
?>
