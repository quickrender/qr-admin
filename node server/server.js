const {asyncCall} = require("./qr-admin/queue.js");
const fs = require("fs");
const path = require("path");
const url = require('url');
const express = require('express');
const AdmZip = require("adm-zip");
const cmd = require("node-cmd");
const formidable = require('formidable');
const ws = new require('ws');

function errorMessage(error) {
  return JSON.stringify({error});
}
function isIncludedFiles(location, inode) {
  var excludes = [];
  if (location === "./") {
    excludes = [
      fs.statSync("./node_modules").ino.toString(),
      fs.statSync("./package-lock.json").ino.toString(),
      fs.statSync("./package.json").ino.toString(),
      fs.statSync("./server.js").ino.toString(),
      fs.statSync("./qr-admin").ino.toString()
    ];
  }
  return (!excludes.length || !excludes.includes(inode))
}
function getFiles(origin, location) {
  var folders = [], files = [], length = origin.length - 1,
      fileArr = fs.readdirSync(location);
  for (let i = 0, fpath, stat, inode; i < fileArr.length; i++) {
    fpath = location + fileArr[i];
    stat = fs.statSync(fpath);
    inode = stat.ino.toString();
    if (isIncludedFiles(location, inode)) {
      if (stat.isDirectory()) {
        folders.push([fpath.slice(length) + "/", stat.ino.toString()]);
      } else {
        files.push([fpath.slice(length), stat.ino.toString()]);
      }
    }
  }
  return JSON.stringify({
    name: path.basename(fs.realpathSync(location)),
    body: folders.concat(files)
  }, null, 2);
}
function searchFiles(origin, location, fnum) {
  var fileArr = fs.readdirSync(location), length = origin.length - 1,
      fpath = "", stat, inode, result;
  for (let i = 0; i < fileArr.length; i++) {
    fpath = location + fileArr[i];
    stat = fs.statSync(fpath);
    inode = stat.ino.toString();
    if (isIncludedFiles(location, inode)) {
      if (inode === fnum) return fpath.slice(length);
      if (stat.isDirectory(fpath)) {
        result = searchFiles(origin, fpath + "/", fnum);
        if (result !== "-1") return result;
      }
    }
  }
  return "-1";
}
function deleteFolder(location) {
  var fileArr = fs.readdirSync(location),
      fpath, stat, inode;
  for (let i = 0; i < fileArr.length; i++) {
    fpath = location + "/" + fileArr[i];
    stat = fs.statSync(fpath);
    inode = stat.ino.toString();
    if (isIncludedFiles(location, inode)) {
      if (stat.isDirectory()) {
        deleteFolder(fpath);
      } else {
        fs.unlinkSync(fpath);
      }
    }
  }
  fs.rmdirSync(location);
}
function getCookie(cookie, name) {
  if (!cookie) return;
  let matches = cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
function isBinary(buf) {
  var str = buf.hexSlice(0, Math.min(buf.length, 100));
  for (let i = 0, chars; i < str.length / 2; i++) {
    chars = str.slice(i * 2, i * 2 + 2)
    if (chars[0] < 2) {
      if (chars[0] == 0) {
        if ("a9d".indexOf(chars[1]) === -1) {
          return true;
        }
      } else {
        return true;
      }
    }
  }
  return false;
}
function CLIResponse(res, text, isError) {
  var color = isError ? "hsl(330, 100%, 50%)" : "hsl(150, 100%, 50%)";
  res.writeHead(200, {
    'Content-Type': 'text/html',
  });
  res.write(`<body
  style='margin: 0px; padding: 16px; background: #0e0e0e; color: white;
  white-space: pre-wrap; font-family: monospace; border-left: ${color} solid 4px;
  line-height: 18px;
  '>`)
  res.write(text.toString().replace(/\n/g, "<br>"));
  res.end("</body>")
}
const app = express();
app.use(express.urlencoded());
app.get('*', (req, res) => {
  var username = getCookie(req.headers.cookie, "qr-folder"),
      origin = "./users/" + username + "/", path = decodeURIComponent(req.path),
      location = origin.slice(0, -1) + path;
  if (path.indexOf("/qr-admin/") === 0) {
    if (fs.existsSync(origin) || path !== "/qr-admin/") {
      res.sendFile(__dirname + path);
    } else {
      res.redirect("/");
    }
    return;
  } else if (path === "/") {
    res.sendFile(__dirname + path);
    return;
  }
  if (!username || !fs.existsSync(origin)) {
    res.redirect("/");
    return;
  }
  if (path === "/qr-admin") {
    res.redirect("/qr-admin/");
    return;
  }
  if (
    path == '/ws' && req.headers.upgrade &&
    req.headers.upgrade.toLowerCase() == 'websocket' &&
    // can be Connection: keep-alive, Upgrade
    req.headers.connection.match(/\bupgrade\b/i)
  ) {
    buildSocket(username, req);
  } else {
    var action = url.parse(req.url, true).query.action;
    if (action === "downloadFiles") {
      res.download(location);
    } else {
      if (fs.existsSync(location)) {
        var buf = fs.readFileSync(location);
      } else {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end("<h3>404 Not Found</h3>");
        return;
      }
      if (isBinary(buf)) {
        res.sendFile(__dirname + location.slice(1));
      } else {
        var arr = location.split("."), ext;
        if (!arr[1]) ext = "";
        else ext = arr.pop().toLowerCase();
        switch (ext) {
          case "html": case "htm": case "css": case "js":
            res.sendFile(__dirname + location.slice(1));
          break;
          case "njs":
            cmd.run(`node ${location.slice(2)}`, function (err, data, stderr) {
              if (err) {
                CLIResponse(res, err, true);
              } else {
                CLIResponse(res, data);
              }
            });
          break;
          case "nts":
            cmd.run(`ts-node ${location.slice(2)}`, function (err, data, stderr) {
              if (err) {
                CLIResponse(res, err, true);
              } else {
                CLIResponse(res, data);
              }
            });
          break;
          case "ts":
            cmd.run(`tsc`, function (err, data, stderr) {
              if (err) {
                CLIResponse(res, data, true);
              } else {
                CLIResponse(res, data);
              }
            });
          break;
          default:
            res.end(buf.toString());
        }
      }
    }
  }
});
app.post('/qr-admin/', (req, res) => {
  var username = getCookie(req.headers.cookie, "qr-folder");
  var origin = "./users/" + username + "/";
  var action = url.parse(req.url, true).query.action;
  var {location} = req.body;
  location = origin.slice(0, -1) + location;
  if (action === "login") {
    username = req.body.username;
    if (username && fs.existsSync("./users/" + username)) {
      res.end("true");
    } else {
      res.end("false");
    }
    return;
  }
  if (!username || !fs.existsSync(origin)) {
    res.end(errorMessage("Not logged in"));
    return;
  }
  if (action === "deleteFiles") {
    function deleteFiles(locations) {
      for (let i = 0; i < locations.length; i++) {
        var location = origin.slice(0, -1) + locations[i];
        if (fs.existsSync(location)) {
          var stat = fs.statSync(location);
          if (stat.isDirectory()) {
            deleteFolder(location);
          } else {
            fs.unlinkSync(location);
          }
        }
      }
    }
    var locations = JSON.parse(req.body.locations);
    deleteFiles(locations);
    res.end("");
  } else if (action === "uploadFiles") {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.filepath,
          location = origin.slice(0, -1) + req.query.location,
          newpath = location + files.filetoupload.originalFilename;
      fs.rename(oldpath, newpath, function (err) {
        res.end(getFiles(origin, location));
      });
    });
  } else if (action === "searchFiles") {
    var fnum = req.body.fnum;
    res.end(searchFiles(origin, origin, fnum));
  } else if (!fs.existsSync(location)) {
    res.end(errorMessage(`The file or folder (${location}) doesn't exist!`));
  } else {
    if (action === "getFiles") {
      res.end(getFiles(origin, location));
    } else if (action === "getContents") {
      var buf = fs.readFileSync(location);
      if (isBinary(buf)) {
        res.end("�f�f�f�d�");
      } else {
        res.end(buf.toString());
      }
    } else if (action === "putContents") {
      var contents = req.body.contents;
      var buf = fs.readFileSync(location);
      if (!isBinary(buf)) {
        fs.writeFile(location, contents, function (err) {
          if (err)
            res.end(errorMessage(err));
          else res.end();
        });
      } else {
        res.end(errorMessage("Cannot write into a binary file: " + location));
      }
    } else if (action === "renameFiles") {
      var fname = req.body.fname,
          dirpath = path.dirname(location) + "/",
          filepath = dirpath + fname;
      if (!fs.existsSync(filepath)) {
        fs.rename(location, filepath, function (err) {
          res.end(getFiles(origin, dirpath));
        });
      } else {
        var stat = fs.statSync(location),
            stat2 = fs.statSync(filepath);
        if (stat.ino === stat2.ino) {
          fs.rename(location, filepath, function (err) {
            res.end(getFiles(origin, dirpath));
          });
        } else {
          res.end(errorMessage(`There already exists a file or folder named ${fname}.`));
        }
      }
    } else if (action === "moveFiles") {
      var locations = JSON.parse(req.body.locations),
          fpath, destination, basename, errors = [];
      for (let i = 0; i < locations.length; i++) {
        fpath = origin.slice(0, -1) + locations[i];
        if (fs.existsSync(fpath)) {
          basename = path.basename(fpath);
          destination = location + basename;
          if (fs.existsSync(destination)) {
            errors.push(`A file or folder named ${basename} already exist in ${location}.`)
          }
        } else {
          errors.push(`The file or folder (${fpath}) doesn't exist.`);
        }
      }
      if (!errors.length) {
        for (let i = 0; i < locations.length; i++) {
          fpath = origin.slice(0, -1) + locations[i];
          basename = path.basename(fpath);
          destination = location + basename;
          fs.renameSync(fpath, destination);
        }
        res.end(getFiles(origin, location));
      } else {
        res.end(errorMessage(errors));
      }
    } else if (action === "createFiles") {
      var fname = req.body.fname,
          fpath = location + fname;
      if (!fs.existsSync(fpath)) {
        fs.writeFileSync(fpath, "");
        res.end(getFiles(origin, location));
      } else {
        res.end(errorMessage(`There already exists a file named ${fname}`));
      }
    } else if (action === "createFolders") {
      var fname = req.body.fname,
          fpath = location + fname;
      if (!fs.existsSync(fpath)) {
        fs.mkdirSync(fpath);
        res.end(getFiles(origin, location));
      } else {
        res.end(errorMessage(`There already exists a folder named ${fname}`));
      }
    } else if (action === "zipFiles") {
      var locations = JSON.parse(req.body.locations),
          folder = path.dirname(location) + "/",
          name = path.basename(location),
          zip = new AdmZip(), stat;
      for (let fpath of locations) {
        fpath = origin.slice(0, -1) + fpath;
        if (fs.existsSync(fpath)) {
          stat = fs.statSync(fpath);
          if (stat.isDirectory()) {
            zip.addLocalFolder(fpath, path.basename(fpath));
          } else {
            zip.addLocalFile(fpath);
          }
        }
      }
      zip.writeZip(folder + name + ".zip");
      res.end(getFiles(origin, folder));
    } else if (action === "extractFiles") {
      var folder = path.dirname(location) + "/";
          zip = new AdmZip(location);
      zip.extractAllTo(folder);
      res.end(getFiles(origin, folder));
    } else if (action === "test") {
      res.end("for test");
    } else {
      res.end(errorMessage("An unknow error occured."));
    }
  }
});
app.listen(80, () => {
});

const wss = new ws.Server({noServer: true});
const users = {};
function buildSocket(username, req) {
  var clients = users[username]?.sockets;
  if (!clients) {
    var origin = "./users/" + username + "/",
        renamedFiles = [], changedFiles = [],
        logChange = asyncCall(function (eventType, filename, lastCall) {
          if (eventType === "rename") {
            if (!renamedFiles.includes(filename)) {
              renamedFiles.push(filename);
            }
          } else if (eventType === "change") {
            if (!changedFiles.includes(filename)) {
              changedFiles.push(filename);
            }
          }
          lastCall();
        }, function () {
          var file1 = renamedFiles[0], file2 = renamedFiles[1], toDelete = true, toAdd = "",
              exists = fs.existsSync(origin + file1), location, stat, basename, 
              clients = users[username]?.sockets || [];
          if (renamedFiles.length) {
            if (
              renamedFiles.length === 2 && 
              path.dirname(file1) === path.dirname(file2) &&
              exists === !fs.existsSync(origin + file2)
            ) {
              toDelete = false;
              toAdd = path.dirname(file1);
            } else {
              if (exists) {
                toDelete = false;
                toAdd = path.dirname(file1);
              } else {
                basename = path.basename(file1);
                for (let fpath of renamedFiles) {
                  if (basename === path.basename(fpath)) {
                    if (fs.existsSync(origin + fpath)) {
                      toDelete = false;
                      toAdd = path.dirname(fpath);
                      break;
                    }
                  }
                }
              }
            }
            if (toDelete) {
              while (location = renamedFiles.pop()) {
                for (let client of clients) {
                  client.send("deleted /" + location.replaceAll("\\", "/"));
                }
              }
            } else {
              for (let client of clients) {
                client.send("added /" + toAdd.replaceAll("\\", "/"));
              }
              while (location = renamedFiles.pop()) {}
            }
            while (location = changedFiles.pop()) {}
          } else {
            while (location = changedFiles.pop()) {
              stat = fs.statSync(origin + location);
              if (!stat.isDirectory()) {
                for(let client of clients) {
                  client.send("changed /" + location.replaceAll("\\", "/"));
                }
              }
            }
          }
        }, 5);
    watcher = fs.watch(origin, {recursive: true}, logChange);
    users[username] = {};
    users[username].sockets = new Set();
    users[username].watcher = watcher;
    buildSocket(username, req);
  } else {
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
      clients.add(ws);
      ws.on('close', function() {
        clients.delete(ws);
        if (!clients.keys().next().value) {
          users[username].watcher.close();
          delete users[username];
        }
      });
    });
  }
}
