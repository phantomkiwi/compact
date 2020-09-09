<?php
// store php in memory for eval
ob_start();

// start sessions used to tack ppl / devices for pages changes / differences
session_start();

// gzip ehco content
#ob_start('ob_gzhandler');

// store url history on client in order to compare now and past page historys
// could be changed to return data in the header stored client side in html5 storage or returned from js location
unset($_COOKIE['oldUrl']);
if (isset($_COOKIE['url'])) {
  setcookie('oldUrl',$_COOKIE['url'],0);
}
setcookie('url',$_SERVER['REQUEST_URI'],0);

// Very simple router function for demo purposes only
function router($path){
  $path = parse_url($path);
  switch($path['path']) {
      case '/':
        // model path
        #include('models/listview.php');
        // view path
        return evalpage('views/page1.php', $path['path']);
      break;
      case '/page2':
        // view path
        return evalpage('views/page2.php', $path['path']);
      break;
      case '/page3':
        // view path
        #include('models/page3.php');
        return evalpage('views/page3.php', $path['path']);
      break;
      case '/page4':
        // view path
        return evalpage('views/page4.php', $path['path']);
      break;
      default:
        return "opps error 404 page".$path['path'];
      break;
  }
}

// return view and run inside code and create a cached file
function evalpage($path, $route){
    ob_start();
    eval('?>'.file_get_contents($path));
    $page = ob_get_contents();
    ob_end_clean();
    file_put_contents('cache/'.session_id().'-'.base64_encode($route), $page);
    return $page;
}

// NOTE!!! need to add file exist check and error code
// return an old cached page to compare changes to new url
function compareold($path){
  $path = parse_url($path);
  return file_get_contents('cache/'.session_id().'-'.base64_encode($path['path']));
  exit;
}

/* URL is passed bootstrap router either server pushed or client pulled */
$path = parse_url($_SERVER['REQUEST_URI']);
if (isset($path['path'])) {
    // client is pulling a request via ajax
    if ($path['path']=='/ajax') {
      require_once 'system/classes/view.diff.php';
      header('Content-type: application/json');
      echo Diff::toJson(Diff::compare(compareold($_GET['old']), router($_GET['new'])));
    } else { // server is pushing a request
      echo router($_SERVER['REQUEST_URI']);
    }
}

// destory php in memory
ob_end_flush();
?>