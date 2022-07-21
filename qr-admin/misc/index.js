import { useEffect, useReducer, useCallback, useMemo, useState, useRef } from "react";
import { render } from 'react-dom';

var origin = window.location.origin.replace(":3000", "");

class $Prom {
  constructor(a, b) {
    this.Arg = a;
    this.Cndt = b;
    this.Func(this.Arg);
  }
  then(a) {
    this.fulfiled = false;
    this.state = a;
  }
  async Func(a) {
    if (typeof a === "function") {
      a(await this);
      if (eval(this.Cndt)) this.Func(this.Arg);
      else this.fulfiled = true;
    }
  }
}
class $Queue {
  constructor() {
    this.fulfiled = true;
    this.state = () => {};
  }
  async then(invoke) {
    if (!this.queue) this.queue = new $Queue;
    if (this.fulfiled === true) this.fulfiled = false;
    else await this.queue;
    this.state = (a) => {
      if (this.queue.fulfiled === true) this.fulfiled = true; 
      else this.queue.state();
      invoke(a);
    };
  }
}
function $until(e) { 
  var prom = new $Prom();
  var interval = setInterval(function () {
    try {
      if (eval(e)) {
        prom.state();
        clearInterval(interval);
      } else {
      }
    } catch (er) {
    }
  });
  return prom;
}

var prom = new $Prom, queue = new $Queue, xhttp = new XMLHttpRequest();
xhttp.onload = function () {
  setTimeout(() => {queue.state();}, 64);
  prom.state(xhttp.responseText);
}
async function $fetch(a, b, c) {
  if (queue.fulfiled === true) setTimeout(() => {queue.state();}); await queue;
  if (a.toLowerCase() === "post") {
    xhttp.open("POST", b);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(c);
  } else {
    xhttp.open("GET", b + c);
    xhttp.send();
  }
  return prom;
}
async function appFunc(a, b) {
  return $fetch("post", origin + "/qr-admin/" + "?action=" + a, b);
}
Object.defineProperty(Array.prototype, "$asred", {value: async function (a, b) {
  for (let i = 0; i < this.length; i++) {
    var prom = new $Prom();
    a(prom, b, this[i], i, this);
    b = await prom;
  }
  return b;
}});
Object.defineProperty(Array.prototype, "forHttp", {value: async function (a) {
  var array = this, i = -1, queue = new $Queue, xhttp = new XMLHttpRequest();
  xhttp.addEventListener("load", function () {
    setTimeout(() => {queue.state();}, 64)
  });
  xhttp.timeout = 1600;
  setTimeout(() => {queue.state();});
  async function f(value, index) {
    await queue;
    a(xhttp, value, index, array);
  }
  while (true) {
    i++;
    if (i === array.length - 1) {
      await f(array[i], -1); 
      if (document.querySelector("#root.fullscreen")) {
        await qrApp.syncFiles;
        setTimeout(() => {queue.state();});
      }
      i = -1;
    } else {
      f(array[i], i);
    }
  }
}});
qrApp.filetomove = "";
qrApp.pagetomove = "";
qrApp.file = null;
qrApp.page = null;
qrApp.canDelete = false;
qrApp.folderState = new Map();
qrApp.dirProm = new Map();
qrApp.fileProm = new Map();
qrApp.codeMap = new Map();
qrApp.frameMap = new Map();
qrApp.fileRec = new Map();
qrApp.fileMap = new Map();
qrApp.iFile = new Map();
qrApp.fFile = new Map();
qrApp.folderContent = new Map();
qrApp.codeArr = JSON.parse(localStorage.getItem("qr-app-code")) ?? new Array();
qrApp.pageArr = JSON.parse(localStorage.getItem("qr-app-page")) ?? new Array();
qrApp.pendingDir = new Set();
qrApp.syncFiles = new $Prom();
qrApp.fileQueue = new $Queue;
qrApp.fileArr = function () {
  return Array.from(document.querySelectorAll(".selected-f")).map(function (a) {
    return a.getAttribute("href");
  });
};
Object.defineProperty(Array.prototype, "delete", {value: function (a) {
  var index = this.indexOf(a);
  if (index !== -1) return this.splice(index, 1)[0];
}});
Object.defineProperty(Array.prototype, "updateValue", {value: function (a, b) {
  var Obj = this;
  a.forEach(function (a2, b2) {
    var index = Obj.indexOf(a2);
    if (index !== -1) {
      Obj[index] = b[b2];
    }
  });
}});
function isDir(a) {
  return a[a.length-1] === "/";
}
function baseName(a) {
  var Arr = a.split("/");
  return Arr[Arr.length-1] || Arr[Arr.length-2];
}
function dirname(a, b) {
  if (b) a = a.slice(0, a.length - 1);
  var index = a.lastIndexOf("/");
  if (index === -1) return "./";
  return a.slice(null, index + 1);
}
function getExt(a) {
  return a.slice(a.lastIndexOf(".") + 1).toLowerCase();
}
function reverseMap(a) {
  return new Map(Array.from(a.entries()).map(function (a) {
    return a.reverse();
  }));
}
function able(a) {
  var now = (new Date).getTime();
  if (!a) {
    this.timestamp = now;
  } else {
    return (this.timestamp + a < now);
  }
}
function openFolder(a, b) {
  var title = a,
  body = title.nextElementSibling,
  location = title.getAttribute("href"),
  prom = qrApp.dirProm.get(location);
  selectF(location, b);
  if (!b) selectOne(location); else return;
  qrApp.file = window.sideNav.querySelector("[href=\"" + location + "\"]");
  if (title.isOpend) {
    body.style.display = "";
    title.isOpend = false;
    title.className = title.className.replace(" opened-fd", "");
  } else {
    body.style.display = "block";
    title.isOpend = true;
    title.className += " opened-fd";
  }
  window.sideNav.querySelector("nav > .fb").updateScrollPos();
  if (!prom.fulfiled) {
    prom.state({location: location, container: body});
  }
}
function openDirectories(a) {
  var location = a, index = 0, Str = "", Arr = [];
  while (index !== -1) {
    Str = location.substr(0, index + 1);
    Arr.push(Str);
    index = location.indexOf("/", index + 1);
  }
  Arr.$asred(function (a, b, c) {
    var title = window.sideNav.querySelector("[href=\"" + c + "\"]");
    if (!title)  {
      qrApp.updatePage((a2) => {
        a2.delete(location); return a2;
      });
      return;
    }
    var body = title.nextElementSibling;
    if (title.isOpend) {
    } else {
      body.style.display = "block";
      title.isOpend = true;
      title.className += " opened-fd";
    }
    if (!body.innerHTML) {
      qrApp.dirProm.get(c).state({
        location: c, 
        container: body,
        callback: () => {
          a.state();
        }
      });
    } else {
      setTimeout(() => {a.state();});
    }
  }).then(function () {
    if (window.sideNav.querySelector("[href=\"" + a + "\"]")) window.codeContainer.path = a;
    else qrApp.updatePage((a2) => {
      a2.delete(a); return a2;
    });
    window.sideNav.querySelector("nav > .fb").updateScrollPos();
  });
}
function openDirs(a) {
  var body = a.parentElement,
  title = body.previousElementSibling;
  if (title.getAttribute("href") !== "/") {
    if (!title.isOpend) {
      body.style.display = "block";
      title.isOpend = true;
      title.className += " opened-fd";
    }
    openDirs(title);
  }
}
function cssStyle(a, b) {
  var Str = a + ` {`;
  for (let key in b) {
    Str += `
  ` + key + `: ` + b[key] + `;`;
  }
  Str += `
}`;
  window.cssStyle.innerHTML = Str;
}
function updateCode(a, b) {
  if (b) {
    qrApp.codeArr.delete(a);
    if (qrApp.codeMap.has(a))
      qrApp.codeMap.get(a).display.wrapper.remove();
    if (qrApp.frameMap.has(a))
      qrApp.frameMap.get(a).remove();
  } else {
    var ifr = qrApp.frameMap.get(a);
    qrApp.codeArr.delete(a);
    qrApp.codeArr.push(a);
    window.codeContainer.appendChild(qrApp.codeMap.get(a).display.wrapper);
    if (window.iframeWrapper.contains(ifr)) {
    } else {
      window.iframeWrapper.appendChild(ifr);
      qrApp.run();
    }
    if (!window.lockURL.isLocked)
      cssStyle("iframe[location=\"" + a + "\"]", {"display": "block !important"});
  }
  qrApp.file = null;
  localStorage.setItem("qr-app-code", JSON.stringify(qrApp.codeArr));
}
function scrollIntoView() {
  var iPos = window.topNav.scrollLeft;
  qrApp.page.scrollIntoView();
  if (iPos < window.topNav.scrollLeft) {
    window.topNav.scrollBy(50, 0);
  } else if (iPos > window.topNav.scrollLeft) {
    window.topNav.scrollBy(-50, 0);
  }
}
function selectOne(a) {
  if (!a) return;
  window.sideNav.querySelectorAll(".selected-f").forEach(function (a2) {
    a2.className = a2.className.replace(" selected-f", "");
  });
  selectF(a);
}
function selectF(a, b) {
  var Obj = window.sideNav.querySelector("[href=\"" + a + "\"]");
  if (!Obj || a === "/") return;
  if (Obj.className.indexOf(" selected-f") === -1) {
    Obj.className += " selected-f";
  } else if (b) {
    Obj.className = Obj.className.replace(" selected-f", "");
  }
}
function openFile(a, b, c) {
  var location = a, nFile;
  if (qrApp.file) {
    if (qrApp.file.getAttribute("href") === location) {
      if (b) setTimeout(() => {qrApp.codeMap.get(location).focus()});
      else if (!c) selectOne(location);
      else selectF(location, c);
      return;
    }
  }
  nFile = window.sideNav.querySelector("[href=\"" + location + "\"]");
  if (nFile) {
    openDirs(nFile);
    selectF(location, c);
  }
  if (!c) selectOne(location); else return;
  if (!location) {
    if (window.codeContainer.innerHTML) {
      location = window.codeContainer.lastElementChild.getAttribute("location");
    } else {
      location = qrApp.codeArr[qrApp.codeArr.length-1];
    }
    if (!location) {
      window.codeContainer.setAttribute("path", "");
      if (!window.lockURL.isLocked) 
        window.searchbar.firstElementChild.value = "";
        localStorage.setItem("qr-app-openedpage", "");
      return;
    } else { 
      selectOne(location);
    }
  }
  qrApp.file = nFile;
  if (qrApp.page) qrApp.page.className = qrApp.page.className.replace(" opened-fp", "");
  qrApp.page = window.topNav.querySelector("[href=\"" + location + "\"]");
  if (qrApp.page) {
    qrApp.page.className += " opened-fp";
    scrollIntoView();
  }
  var codeEditor = qrApp.codeMap.get(location);  
  qrApp.prevLocation = window.codeContainer.path;
  window.codeContainer.setAttribute("path", location);
  if (!window.lockURL.isLocked) {
    window.searchbar.firstElementChild.value = origin + location;
    localStorage.setItem("qr-app-openedpage", location);
  }
  if (codeEditor) {
    if (window.codeContainer.contains(codeEditor.display.wrapper)) {
    } else  {
      qrApp.updatePage((a2) => {
        a2.splice(a2.indexOf(qrApp.prevLocation) + 1, 0, location);
        return a2;
      });
    }
    updateCode(location);
    if (b) setTimeout(() => {codeEditor.focus()});
    codeEditor.refresh();
    if (codeEditor.getOption("theme") !== window.codeTheme.value)
      codeEditor.setOption("theme", window.codeTheme.value);
  } else {
    if (qrApp.fileProm.has(location)) {
      qrApp.fileProm.get(location).state({location: location, focus: b});
    } else { 
      openDirectories(location);
    }
  }
}
function Page() {
  const reducer = (state, action) => {
    qrApp.prevLength = state.length;
    return action([...state]);
  }
  var [Arr, setArr] = useReducer(reducer, qrApp.pageArr), ele, length = Arr.length;
  if (!qrApp.updatePage)
    qrApp.updatePage = setArr; 
  if ((ele = window.topNav.querySelector(".unmounted")) && (qrApp.prevLength < length)) {
    var loc = ele.getAttribute("href");
    Arr.delete(loc);
    updateCode(loc, true);
  }
  qrApp.pageArr = Arr;
  localStorage.setItem("qr-app-page", JSON.stringify(qrApp.pageArr));
  useEffect(() => {
    if (window.codeContainer) {
      if (qrApp.page)
        qrApp.page.className = qrApp.page.className.replace(" opened-fp", "");
      qrApp.page = window.topNav.querySelector("[href=\"" + window.codeContainer.path + "\"]");
      if (qrApp.page) {
        if (qrApp.prevLength < length) {
          qrApp.page.className += " opened-fp unmounted";
          scrollIntoView();
        } else
          qrApp.page.className += " opened-fp";
        var ele;
        if (ele = qrApp.codeMap.get(window.codeContainer.path)) {
          var Doc = ele.getDoc(),
          Obj = qrApp.page,
          className = Obj.className;
        } else return;
        if (!Doc.isClean(Doc.generation)) {
          if (className.indexOf(" unsaved") === -1)
            Obj.className += " unsaved";
        } else {
          if (className.indexOf(" unsaved") !== -1)
            Obj.className = className.replace(" unsaved", "");
        }
      }
    }
    window.topNav.updateScrollPos();
  });
  return Arr.map(function (a, b) {
    return <a
      className="fp"
      key={a}
      href={a}
      title={a}
      onMouseDown={(e) => {
        qrApp.focusIn = false;
        window.codeContainer.path = a;
        var codeEditor = qrApp.codeMap.get(a);
        if (codeEditor)  {
          codeEditor.refresh();
        }
      }}
      onClick={(e) => {
        e.preventDefault();
      }}
      draggable="true"
      onDragStart={function (e) {
        e.dataTransfer.setData("location", a);
        qrApp.pagetomove = a;
      }}
      onDragEnter={function (e) {
        if (qrApp.pagetomove === "" ||
        qrApp.pagetomove === a) return;
        var Obj = e.currentTarget;
        Obj.className += " draggedOnElement";
      }}
      onDragLeave={function (e) {
        if (qrApp.pagetomove === "" ||
        qrApp.pagetomove === a) return;
        var Obj = e.currentTarget;
        Obj.className = Obj.className.replace(" draggedOnElement", "");
      }}
      onDragOver={function (e) {
        e.preventDefault();
      }}
      onDrop={function (e) {
        var location = e.dataTransfer.getData("location");
        if (location === "" ||
        location === a) return;
        var Obj = e.currentTarget;
        Obj.className = Obj.className.replace(" draggedOnElement", "");
        qrApp.updatePage((a2) => {
          var offset = 0,
          index1 = a2.indexOf(a),
          index2 = a2.indexOf(location);
          if (index2 < index1) offset = 1;
          a2.delete(location);
          a2.splice(a2.indexOf(a) + offset, 0, location);
          return a2;
        });
      }}
      onDragEnd={function (e) {
        qrApp.pagetomove = "";
      }}
    >{baseName(a)}<i
      onMouseDown={function (e) {
        e.stopPropagation();
      }}
      onClick={function (e) {
        e.stopPropagation();
        e.preventDefault();
        qrApp.closePage(a);
      }}
    >&times;</i></a>
  })
}
function Frame(a) {
  var ifr = document.createElement("iframe");
  ifr.setAttribute("location", a);
  return ifr;
}
function getMimetype(a) {
  var val = a, m, mode, spec;
  if (m = /.+\.([^.]+)$/.exec(val)) {
    var info = window.CodeMirror.findModeByExtension(m[1]);
    if (info) {
      mode = info.mode;
      spec = info.mime;
    }
  } else if (/\//.test(val)) {
    var info = window.CodeMirror.findModeByMIME(val);
    if (info) {
      mode = info.mode;
      spec = val;
    }
  } else {
    mode = spec = val;
  }
  if (mode) {
    if (spec === "text/javascript") spec = "text/jsx";
    if (spec === "text/x-php" || spec === "text/html") spec = "mustache";
    return spec; 
  } else {
    return "mustache";
  }
}
function mountPage() {
  var ele;
  if (ele = window.topNav.querySelector(".unmounted")) {
    if (ele.getAttribute("href") === window.codeContainer.path)
      ele.className = ele.className.replace(" unmounted", "");  
  }
}
function saveIndicate(e) { 
  var Doc = e.getDoc(),
  location = e.display.wrapper.getAttribute("location"),
  Obj = window.topNav.querySelector("[href=\"" + location + "\"]");
  if (!Obj) return;
  var className = Obj.className;
  if (!Doc.isClean(Doc.generation)) {
    if (className.indexOf(" unsaved") === -1)
      Obj.className += " unsaved";
  } else {
    if (className.indexOf(" unsaved") !== -1)
      Obj.className = className.replace(" unsaved", "");
  }
}
function replaceFile(a, b) {
  var file = b, location = a;
  if (!isDir(file)) {
    var codeEditor = qrApp.codeMap.get(location),
    ifr = qrApp.frameMap.get(location),
    fileProm = qrApp.fileProm.get(location);
    setTimeout(() => {
      qrApp.updatePage((a) => {
        a.updateValue([location], [file]); return a;
      });
    });
    qrApp.codeArr.delete(location);
    if (qrApp.page)
      if (qrApp.page.getAttribute("href").indexOf(location) === 0)
        window.codeContainer.path = file;
    if (fileProm) {
      qrApp.fileProm.delete(location);
      qrApp.fileProm.set(file, fileProm);
      if (codeEditor) {
        qrApp.codeMap.delete(location);
        qrApp.frameMap.delete(location);
        qrApp.codeMap.set(file, codeEditor);
        qrApp.frameMap.set(file, ifr);
        codeEditor.setOption("mode", getMimetype(file));
        codeEditor.display.wrapper.setAttribute("location", file);
        ifr.setAttribute("location", file);
      }
    }
  } else {
    Array.from(qrApp.folderState.keys()).forEach(function (a) {
      if (a.indexOf(location) === 0) {
        var newFile = a.replace(location, file),
        state = qrApp.folderState.get(a);
        qrApp.dirProm.delete(a);
        qrApp.folderState.delete(a);
        qrApp.folderState.set(newFile, state);
        qrApp.refreshDir(newFile);
      }
    });
  }
}
function deleteFile(a) {
  var location = a;
  if (isDir(location)) {
    Array.from(qrApp.pageArr).forEach((a) => {
      if (a.indexOf(location) === 0) {
        qrApp.closePage(a);
        qrApp.codeMap.delete(a);
        qrApp.frameMap.delete(a);
        qrApp.fileProm.delete(a); 
      }
    });
    Array.from(qrApp.dirProm.keys()).forEach(function (a) {
      if (a.indexOf(location) === 0) {
        qrApp.dirProm.delete(a);
        qrApp.folderState.delete(a);
      }
    });
  } else {
    qrApp.closePage(location);
    qrApp.codeMap.delete(location);
    qrApp.frameMap.delete(location);
    qrApp.fileProm.delete(location);
  }
}
function canDrop(a, b) {
  var filetomove = a, location = b,
  Arr = qrApp.fileArr();
  if (
    filetomove === "" || dirname(filetomove, true) === location ||
    isDir(filetomove) && location.indexOf(filetomove) === 0
  ) return false;
  if (Arr.length !== 1 && Arr.includes(filetomove)) {
    if (Arr.find(function (a) {
      return (dirname(a, true) === location || isDir(a) && location.indexOf(a) === 0);
    }) !== undefined) return false;
  }
  return true;
}
async function moveFile(a, b) {
  await qrApp.fileQueue;
  var filetomove = a, location = b, message = 
  await appFunc("moveFiles", "location=" + filetomove + "&fname=" + location + baseName(filetomove));
  setTimeout(() => {qrApp.fileQueue.state()}, 8);
  if (message) {
    window.alert(message);
  } else {
    filetomove = filetomove.slice(0, filetomove.length - 1);
  }
}
function dragComplete(a, e) {
  e.stopPropagation();
  var filetomove = qrApp.filetomove, location = a;
  if (!canDrop(filetomove, location)) return;
  var Obj = e.currentTarget, className = Obj.className;
  Obj.className = className.replace(" draggedOnElement", "");
  if (className.indexOf("fd") !== -1)
    Obj.nextElementSibling.className = Obj.nextElementSibling.className.replace(" draggedOnElement", "");
  else
    Obj.previousElementSibling.className = Obj.previousElementSibling.className.replace(" draggedOnElement", "");
  if (e.type === "drop") {
    var Arr = qrApp.fileArr();
    setTimeout(() => {qrApp.fileQueue.state();});
    if (Arr.length > 1 && Arr.includes(filetomove)) {
      var Arr = qrApp.sortOutFiles(Arr);
      Arr.forEach(function (a) {
        moveFile(a, location);
      });
    } else {
      moveFile(filetomove, location);
    }
  }
}
async function qrApp(a, b, c=0) {
  if (b === "invoke") {
    render(<Page/>, window.topNav);
    render(<div id="codeContainer"></div>, window.codeWrapper);
    Object.defineProperty(window.codeContainer, "path", {set: function (a) {
      openFile(a, true); 
      selectOne(a);
    }, get: function () {
      return this.getAttribute("path");
    }});
    [...qrApp.codeArr].forEach(function (a) {
      if (!qrApp.pageArr.includes(a)) qrApp.codeArr.delete(a);
    });
    [...qrApp.pageArr].forEach(function (a) {
      if (!qrApp.codeArr.includes(a)) qrApp.pageArr.delete(a);
    });
    var Str = localStorage.getItem("qr-app-openedpage") ?? "";
    if (!qrApp.pageArr.includes(Str)) Str = "";
    setTimeout(async () => {
      await $until("document.querySelector(\".fd\")");
      openDirectories(Str);
      Array.from(document.querySelectorAll(".fd")).forHttp(function (xhttp, a, b, c) {
        var Arr = Array.from(document.querySelectorAll(".fd")), location = a.getAttribute("href");
        xhttp.onload = function () {
          if (qrApp.folderContent.has(location)) {
            var iContent = qrApp.folderContent.get(location),
            iFiles = JSON.parse(iContent),
            fFiles = JSON.parse(xhttp.responseText),
            fContent = JSON.stringify(fFiles);
            if (qrApp.pendingDir.has(location)) {
              qrApp.refreshDir(location);
              qrApp.pendingDir.delete(location);
              qrApp.canDelete = false;
            } else if (iFiles.length > fFiles.length) {
              qrApp.refreshDir(location);
            } else if (iFiles.length < fFiles.length) {
              qrApp.pendingDir.add(location);
            } else if (iContent !== fContent) {
              qrApp.refreshDir(location);
            }
            if (b === -1) {
              if (qrApp.canDelete === true) {
                qrApp.iFile.forEach(function (a) {
                  deleteFile(a);
                });
                qrApp.iFile.clear(); 
                qrApp.fFile.clear();
              } else {
                qrApp.canDelete = true;
              }
            };
          }
        };
        xhttp.open("POST", origin + "/qr-admin/?action=checkFiles");
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("location=" + location);
        Arr.forEach(function (a) {
          var location = a.getAttribute("href");
          if (!c.includes(a) && qrApp.dirProm.has(location) 
          && qrApp.dirProm.get(location).fulfiled === true) c.push(a);
        });
        c.forEach(function (a) {
          if (!Arr.includes(a)) c.delete(a);
        });
      });
    });/*
    setInterval(async () => {
      var location = window.codeContainer.path;
      if (location && qrApp.codeMap.has(location)) {
        var codeEditor = qrApp.codeMap.get(location),
        Doc = codeEditor.getDoc();
        if (Doc.isClean(Doc.generation)) {
          var cursorPos = Doc.getCursor(),
          scrollTop = codeEditor.getScrollInfo().top,
          code = await appFunc("getContents", "location=" + location);
          if (code !== Doc.getValue() && code !== "404 NOT FOUND") {
            Doc.setValue(code);
            Doc.setCursor(cursorPos);
            codeEditor.scrollTo(null, scrollTop);
            Doc.generation = Doc.changeGeneration();
            saveIndicate(codeEditor);
          }
        }
      }
    }, 250);*/
  }
  qrApp.fileMap = new Map(JSON.parse(await appFunc("getFiles", "location=" + a)));
  qrApp.fileRec.set(a, reverseMap(qrApp.fileMap));
  var files = Array.from(qrApp.fileMap.keys()),
  prom = new $Prom(function (a2) {
    qrApp.folderState.set(a, a2);
  }),
  num = a.match(/\//g) === null ? 0 : a.match(/\//g).length;
  function Directory() {
    const reducer = useCallback((state, action) => {
      var files = Array.from(action.keys()),
      fkeys = Array.from(action.values()),
      fileRec = qrApp.fileRec.get(a),
      ikeys = Array.from(fileRec.keys());
      action.forEach(function (inode, fFile) {
        if (ikeys.includes(inode)) {
          var iFile;
          if (fFile !== (iFile = fileRec.get(inode))) {
            replaceFile(iFile, fFile);
          }
        } else {
          if (qrApp.iFile.has(inode)) {
            replaceFile(qrApp.iFile.get(inode), fFile);
            qrApp.iFile.delete(inode);
          } else {
            qrApp.fFile.set(inode, fFile);
            qrApp.canDelete = false;
          }
        }
      });
      fileRec.forEach(function (iFile, inode) {
        if (!fkeys.includes(inode)) { 
          if (qrApp.fFile.has(inode)) {
            replaceFile(iFile, qrApp.fFile.get(inode));
          } else {
            qrApp.iFile.set(inode, iFile);
            qrApp.canDelete = false;
          }
        }
      });
      qrApp.fileRec.set(a, reverseMap(action));
      return files;
    });
    var [Arr, setArr] = useReducer(reducer, files);
    qrApp.folderContent.set(a, JSON.stringify(Arr));
    prom.state(setArr); 
    useMemo(function () {
      Arr.forEach(function (a) {
        var location = a;
        if (a[a.length-1] === "/" && !qrApp.dirProm.has(location)) {
          qrApp.dirProm.set(location, new $Prom(async function (a) {
            render(await qrApp(a.location, null, c+1), a.container);
            window.sideNav.querySelector("nav > .fb").updateScrollPos();
            if (a.callback) a.callback();
          }));
        } else if (!qrApp.fileProm.has(location)) {
          qrApp.fileProm.set(location, new $Prom(async function (a) {
            var code = await appFunc("getContents", "location=" + a.location);
            window.codeArea.value = code;
            var canEdit = (await appFunc("checkContents", "location=" + a.location) !== "-1");
            var colors = ["#fcc", "#f5f577", "#cfc", "#aff", "#ccf", "#fcf"];
            var rulers = [];
            for (var i = 1; i <= 6; i++) {
              rulers.push({color: colors[i], column: i * 10, lineStyle: "dashed"});
            }
            var codeEditor = window.CodeMirror.fromTextArea(window.codeArea, {
              mode: getMimetype(a.location),
              styleActiveLine: true,
              lineNumbers: true,
              lineWrapping: true,
              gutters: ["breakpoints", "CodeMirror-linenumbers", "CodeMirror-foldgutter"],
              autoCloseBrackets: true,
              autoCloseTags: true,
              highlightSelectionMatches: {showToken: /""/, annotateScrollbar: true},
              matchTags: {bothTags: true},
              matchBrackets: true,
              readOnly: canEdit ? false : true,
              cursorBlinkRate: canEdit ? 530 : -1,
              extraKeys: {
                "Ctrl-J": "toMatchingTag",
                "F11": function(cm) {
                  cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                  if (cm.getOption("fullScreen"))
                    window.content.style.zIndex = "3";
                  else 
                    window.content.style.zIndex = "";
                },
                "Esc": function(cm) {
                  if (cm.getOption("fullScreen")) { 
                    cm.setOption("fullScreen", false);
                    window.content.style.zIndex = "";
                  }
                },
                "Alt-F": "findPersistent"
              },
              foldGutter: true,
              theme: window.codeTheme.value,
              scrollbarStyle: "overlay",
              tabSize: 2
            });
            codeEditor.on("gutterClick", function(cm, n, o) {
              if (o === "breakpoints") {
                var info = cm.lineInfo(n), isOk;
                if (info.gutterMarkers && info.gutterMarkers.breakpoints) isOk = true;
                cm.setGutterMarker(n, "breakpoints", isOk ? null : makeMarker());
              }
            });
            function makeMarker() {
              var marker = document.createElement("div");
              marker.style.color = "red";
              marker.innerHTML = "●";
              return marker;
            }
            codeEditor.display.wrapper.setAttribute("location", a.location);
            qrApp.codeMap.set(a.location, codeEditor);
            qrApp.frameMap.set(a.location, Frame(a.location));
            if (!qrApp.pageArr.includes(a.location)) {
              qrApp.updatePage((a2) => {
                a2.splice(a2.indexOf(qrApp.prevLocation) + 1, 0, a.location);
                return a2;
              });
            }
            updateCode(a.location);
            if (qrApp.prevLocation !== a.location) qrApp.run();
            if (a.focus) codeEditor.focus();
            codeEditor.on("change", saveIndicate);
            codeEditor.on("change", mountPage);
            codeEditor.able = able;
            codeEditor.able();
          }));
        }
      });
    }, [Arr]);
    return Arr.reduce((a, b) => {
      var items = [], location = b;
      if (b[b.length-1] === "/") {
        items = [<a
          className="fd"
          key={qrApp.fileMap.get(b)} 
          href={location}
          title={location}
          onClick={(e) => {
            e.preventDefault();
            if (e.currentTarget.className.indexOf(" renameItem") === -1)
              openFolder(e.currentTarget, e.getModifierState("Control"));
          }}
          onKeyDown={function (e) {
            var Obj = e.currentTarget;
            if ("\\/:*?\"<>|".indexOf(e.key) !== -1) {
              e.preventDefault();
            }
            if (e.keyCode === 13) {
              e.preventDefault();
              Obj.blur();
            }
          }}
          onBlur={async function (e) {
            var Obj = e.currentTarget,
            location = Obj.getAttribute("href"),
            message;
            if (Obj.className.indexOf(" renameItem") !== -1) {
              Obj.className = Obj.className.replace(" renameItem", "");
              Obj.contentEditable = false;
              if (Obj.iniText === Obj.innerText) return;
              if (message = await appFunc("renameFiles", "location=" + location + "&fname=" + Obj.innerText)) {
                Obj.innerText = Obj.iniText;
                window.alert(message);
              } else {
                qrApp.refreshDir(location.slice(0, location.length - 1));
              }
            }
          }}
          onContextMenu={function (e) {
            e.preventDefault();
            var Obj = window.contextMenu;
            Obj.style.top = e.clientY + "px";
            Obj.style.left = e.clientX + "px";
            Obj.targetEle = e.currentTarget;
            if (location === "/") Obj.className = "rootContextMenu";
            else Obj.className = "fdContextMenu";
          }}
          onDragStart={function (e) {
            qrApp.filetomove = location;
          }}
          onDragStartCapture={function (e) {
            var Arr = qrApp.fileArr();
            if (!Arr.includes(location)) return;
            var Obj = e.currentTarget,
            text = Obj.innerText;
            Obj.className += " dragged-f";
            if (Arr.length !== 1) Obj.innerHTML = Arr.length + " seleced";
            setTimeout(() => {
              Obj.innerText = text;
              Obj.className = Obj.className.replace(" dragged-f", "");
            });
          }}
          onDragEnd={function (e) {
            qrApp.filetomove = "";
          }}
          onDragEnter={function (e) {
            e.stopPropagation();
            var filetomove = qrApp.filetomove;
            if (!canDrop(filetomove, location)) return;
            var Obj = e.currentTarget;
            Obj.className += " draggedOnElement";
            Obj.nextElementSibling.className += " draggedOnElement";
            if (!Obj.able) Obj.able = able;
            Obj.able();
            var title = Obj,
            body = title.nextElementSibling, 
            prom = qrApp.dirProm.get(location);
            if (!prom.fulfiled) {
              prom.state({
                location: location, 
                container: body
              });
            }
            Obj.prom = new $Prom(function (a) {
              if (!title.isOpend) {
                body.style.display = "block";
                title.isOpend = true;
                title.className += " opened-fd";
              }
            });
          }}
          onDragOver={function (e) {
            e.stopPropagation();
            e.preventDefault();
            var filetomove = qrApp.filetomove;
            if (!canDrop(filetomove, location)) return;
            var Obj = e.currentTarget;
            if (Obj.able(800)) {
              Obj.prom.state();
            };
          }}
          onDragLeave={dragComplete.bind(null, location)}
          onDrop={dragComplete.bind(null, location)}
          style={{paddingLeft: num * 12 + 12 + "px", "--signLeft": num * 12 + "px"}}
          draggable="true"
          spellCheck="false"
        >{baseName(b) || "htdocs"}</a>,
        <div 
          className="fb" 
          key={"fb-" + qrApp.fileMap.get(b)}
          onDragEnter={function (e) {
            e.stopPropagation();
            var filetomove = qrApp.filetomove;
            if (!canDrop(filetomove, location)) return;
            var Obj = e.currentTarget;
            Obj.className += " draggedOnElement";
            Obj.previousElementSibling.className += " draggedOnElement";
          }}
          onDragOver={function (e) {
            e.stopPropagation();
            e.preventDefault();
          }}
          onDragLeave={dragComplete.bind(null, location)}
          onDrop={dragComplete.bind(null, location)}
          onKeyDown={function (e) {
            if (e.getModifierState("Control")) {
              var cmd = e.key.toLowerCase();
              if ("a".indexOf(cmd) !== -1) {
                e.stopPropagation();
                var Obj = e.currentTarget,
                Arr = qrApp.fileArr();
                selectOne();
                Obj.querySelectorAll("a").forEach(function (a) {
                  var location = a.getAttribute("href");
                  if (!Arr.includes(location)) {
                    selectF(location);
                  }
                });
              } else {}
            } else {}
          }}
        ></div>];
      } else { 
        items.push(<a 
          className="fl"
          key={qrApp.fileMap.get(b)} 
          href={location}
          title={location}
          onClick={(e) => {
            e.preventDefault();
            if (e.currentTarget.className.indexOf(" renameItem") === -1)
              openFile(location, null, e.getModifierState("Control"));
          }}
          onKeyDown={function (e) {
            var Obj = e.currentTarget;
            if ("\\/:*?\"<>|".indexOf(e.key) !== -1) {
              e.preventDefault();
            }
            if (e.keyCode === 13) {
              e.preventDefault();
              Obj.blur();
            }
          }}
          onBlur={async function (e) {
            var Obj = e.currentTarget,
            location = Obj.getAttribute("href"),
            message;
            if (Obj.className.indexOf(" renameItem") !== -1) {
              Obj.className = Obj.className.replace(" renameItem", "");
              Obj.contentEditable = false;
              if (Obj.iniText === Obj.innerText) return;
              if (message = await appFunc("renameFiles", "location=" + location + "&fname=" + Obj.innerText)) {
                Obj.innerText = Obj.iniText;
                window.alert(message);
              } else {
                qrApp.refreshDir(location);
              }
            }
          }}
          onContextMenu={function (e) {
            e.preventDefault();
            var Obj = window.contextMenu, fileExtention = getExt(location);
            Obj.style.top = e.clientY + "px";
            Obj.style.left = e.clientX + "px";
            Obj.targetEle = e.currentTarget;
            if (fileExtention === "zip" || fileExtention === "gz" || fileExtention === "rar")
            Obj.className = "zipContextMenu";
            else Obj.className = "flContextMenu";
          }}
          onDragStart={function (e) {
            qrApp.filetomove = location;
          }}
          onDragStartCapture={function (e) {
            var Arr = qrApp.fileArr();
            if (!Arr.includes(location)) return;
            var Obj = e.currentTarget,
            text = Obj.innerText;
            Obj.className += " dragged-f";
            if (Arr.length !== 1) Obj.innerHTML = Arr.length + " seleced";
            setTimeout(() => {
              Obj.innerText = text;
              Obj.className = Obj.className.replace(" dragged-f", "");
            });
          }}
          onDragEnd={function (e) {
            qrApp.filetomove = "";
          }}
          style={{paddingLeft: num * 12 + "px"}}
          draggable="true"
          spellCheck="false"
        >{baseName(b)}</a>);
      }
      return a.concat(items); 
    }, []);
  }
  return <Directory/>;
}
qrApp.save = async function () {
  var location = window.codeContainer.path, editor, message;
  if (editor = qrApp.codeMap.get(location)) {
    editor.save();
    editor.able();
    var Doc = editor.getDoc();
    Doc.generation = Doc.changeGeneration();
    saveIndicate(editor);
  } else return;
  mountPage();
  if (!editor.getOption("readOnly"))
  if (message = await appFunc("saveFiles", "location=" + window.codeContainer.path + "&code=" + encodeURIComponent(window.codeArea.value)))
  window.alert(message);
  else qrApp.run();
}
qrApp.run = async function (a) {
  var location = window.codeContainer.path, editor, ifr;
  location = window.searchbar.firstElementChild.value.replace(origin, "");
  localStorage.setItem("qr-app-openedpage", location);
  if (editor = qrApp.codeMap.get(location))
    editor.save();
  else return;
  if (ifr = qrApp.frameMap.get(location)) {
    if (location.search(/zip$/) !== -1) ifr.src = "";
    else ifr.src = origin + location;
  }
}
qrApp.open = function (a) {
  var location = window.codeContainer.path, editor;
  location = window.searchbar.firstElementChild.value.replace(origin, "");
  localStorage.setItem("qr-app-openedpage", location);
  if (editor = qrApp.codeMap.get(location))
    editor.save();
  else return;
  window.openLink.href = origin + location;
  window.openLink.click();
}
qrApp.closePage = function (a) {
  if (!a) a = window.codeContainer.path;
  qrApp.updatePage((a2) => {
    a2.delete(a); return a2;
  });
  if (qrApp.codeMap.has(a)) {
    qrApp.codeMap.get(a).display.wrapper.remove();
  }
  if (qrApp.frameMap.has(a)) {
    qrApp.frameMap.get(a).remove();
  }
  updateCode(a, true);
  window.codeContainer.path = void(0);
}
qrApp.refreshDir = async function (a) {
  var location = dirname(a), state, content = await appFunc("getFiles", "location=" + location);
  if (content === "-1") return;
  qrApp.fileMap = new Map(JSON.parse(content));
  state = qrApp.folderState.get(location);
  if (state) state(qrApp.fileMap);
}
qrApp.sortOutFiles = function (a) {
  var Arr = [...a];
  a.filter(function (a) {
    return a[a.length-1] === "/";
  }).forEach(function (a2) {
    a.forEach(function (a3) {
      if ( a3 !== a2 && a3.indexOf(a2) === 0) {
        Arr.splice(Arr.indexOf(a3), 1);
      }
    })
  });
  return Arr;
}
qrApp.scrollbar = function (a, b, c) {
  var dimension, Dimension, position, Position, orientation;
  if (c === "horizontal") {
    dimension = "width";
    Dimension = "Width";
    position = "left";
    Position = "Left";
    orientation = "X";
  } else {
    dimension = "height";
    Dimension = "Height";
    position = "top";
    Position = "Top";
    orientation = "Y";
  }
  var barTrack = document.createElement("div"),
  scrollBar = document.createElement("div"),
  mousemove = function (e) {
    var disPos = e["client"+orientation] - b.iniPos,
    maxHeight = getPxValue(barTrack, dimension),
    minHeight = getPxValue(scrollBar, dimension),
    disTop = disPos / maxHeight,
    offsetTop = b.iniTop + disTop, length;
    if (offsetTop < 0) offsetTop = 0;
    if (offsetTop > (length = (maxHeight - minHeight) / maxHeight)) offsetTop = length;
    scrollBar.style[position] = offsetTop * 100 + "%";
    b["scroll" + Position] = offsetTop * b["scroll" + Dimension];
  }, mouseup = function (e) {
    /*customize*/window.overlay.style.display = "";/*customize*/
    b.addEventListener("scroll", updateScrollPos);
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("mouseup", mouseup);
  }, mousedown = function (e) {
    e.stopPropagation();
    /*customize*/window.overlay.style.display = "block";/*customize*/
    b.iniPos = e["client"+orientation];
    b.iniTop = Number(scrollBar.style[position].replace("%", "")) / 100;
    b.removeEventListener("scroll", updateScrollPos);
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  };
  function getPxValue(a, b) {
    return Number(getComputedStyle(a).getPropertyValue(b).replace("px", ""));
  }
  function updateScrollPos() {
    if (b["client"+Dimension] === b["scroll"+Dimension]) {
      if (barTrack.style.display !== "none") {
        barTrack.style.display = "none";
      }
    } else {
      if (barTrack.style.display !== "") {
        barTrack.style.display = "";
      }
    }
    var height, offsetTop;
    height = (b["scroll"+Dimension] === 0) ? 1 : b["client"+Dimension] / b["scroll"+Dimension];
    offsetTop = (b["scroll"+Dimension] === 0) ? 0 : b["scroll"+Position] / b["scroll"+Dimension];
    scrollBar.style[dimension] = height * 100 + "%";
    scrollBar.style[position]= offsetTop * 100 + "%";
  }
  barTrack.className = "barTrack" + orientation;
  barTrack.style.display = "none";
  barTrack.addEventListener("mousedown", function (e) {
    var maxHeight = getPxValue(barTrack, dimension),
    minHeight = getPxValue(scrollBar, dimension),
    offsetTop = (e["offset"+orientation] - minHeight / 2) / maxHeight, length;
    if (offsetTop < 0) offsetTop = 0;
    if (offsetTop > (length = (maxHeight - minHeight) / maxHeight)) offsetTop = length;
    scrollBar.style[position] = offsetTop * 100 + "%";
    b.removeEventListener("scroll", updateScrollPos);
    b["scroll"+Position] = offsetTop * b["scroll"+Dimension];
    mousedown(e);
  });
  scrollBar.className = "scrollBar" + orientation;
  scrollBar.addEventListener("mousedown", mousedown);
  barTrack.appendChild(scrollBar);
  a.appendChild(barTrack);
  b.updateScrollPos = updateScrollPos;
  b.addEventListener("scroll", updateScrollPos);
  window.addEventListener("resize", updateScrollPos);
}
qrApp.isDir = isDir;
qrApp.baseName = baseName;
qrApp.getExt = getExt;
qrApp.selectOne = selectOne;

window.addEventListener("resize", function () {
  var location = window.codeContainer.path, editor;
  if (editor = qrApp.codeMap.get(location)) editor.refresh();
});
window.addEventListener("keydown", function (e) {
  if (e.getModifierState("Control")) {
    var cmd = e.key.toLowerCase();
    if ("srqk".indexOf(cmd) !== -1) {
      e.preventDefault();
      if (cmd === "s") qrApp.save();
      if (cmd === "r") return;//qrApp.run();
      if (cmd === "q") qrApp.open();
      if (cmd === "k") {
        appFunc("logout").then(function () {
          window.location.assign("");
        });
      }
    }
  }
}); 
document.addEventListener("mousedown", function (e) {
  var Obj = window.contextMenu;
  if (Obj.className !== "") Obj.className = "";
});
window.CodeMirror.defineMode("mustache", function(config, parserConfig) {
  var mustacheOverlay = {
    token: function(stream, state) {
      var ch;
      if (stream.match("{{")) {
        while ((ch = stream.next()) != null)
          if (ch == "}" && stream.next() == "}") {
            stream.eat("}");
            return "mustache";
          }
      }
      while (stream.next() != null && !stream.match("{{", false)) {}
      return null;
    }
  };
  return window.CodeMirror.overlayMode(window.CodeMirror.getMode(config, parserConfig.backdrop || "application/x-httpd-php"), mustacheOverlay);
});

(async function (a) {
  a.className += (localStorage.getItem("qr-app-mode") ?? "") + " " + (window.localStorage.getItem("qr-app-theme") ?? "default");
  function Theme() {
    const [theme, setTheme] = useState(window.localStorage.getItem("qr-app-theme") ?? "default");
    const handleChange = (event) => {
      setTheme((e) => {
        var theme = event.target.value,
        location = window.codeContainer.path, editor;
        if (editor = qrApp.codeMap.get(location))
          editor.setOption("theme", theme);
        window.localStorage.setItem("qr-app-theme", theme);
        a.className = a.className.replace(" " + e, " " + theme);
        return theme;
      });
    }
    return <select 
      id="codeTheme"
      value={theme}
      onChange={handleChange}
    >
      <option>default</option>
      <option>satural</option>
      <option>emerald</option>
      <option>ruby</option>
    </select>
  }
  function Setup() {
    var dragbar = useRef();
    useEffect(() => {
      dragbar.current.mousemove = function (e) {
        var Obj = dragbar.current,
        dx = e.clientX - Obj.xi,
        maxWidth = Number(getComputedStyle(window.content).getPropertyValue("width").replace("px", "")),
        toWidth = (Obj.widthi) + dx / maxWidth * 100;
        if (toWidth < 8 / maxWidth * 100) {
          toWidth = 8;
          window.content.style.setProperty("--areaWidth", toWidth + "px");
        } else {
          if (toWidth > 100) {
            toWidth = 100;
          }
          window.content.style.setProperty("--areaWidth", toWidth + "%");
        }
        localStorage.setItem("qr-app-width", window.content.style.getPropertyValue("--areaWidth"));
        var location = window.codeContainer.path, editor;
        if (editor = qrApp.codeMap.get(location))  {
          editor.refresh();
        }
      };
      dragbar.current.mouseup = function (e) {
        var Obj = dragbar.current;
        window.overlay.style.display = "";
        var location = window.codeContainer.path, editor;
        if (editor = qrApp.codeMap.get(location))  {
          editor.refresh();
        }
        window.removeEventListener("mousemove", Obj.mousemove);
        window.removeEventListener("mouseup", Obj.mouseup);
      };
    });
    return <>
      <div id="sideNav" key="sideNav"
        onFocus={function () {
          window.sideNav.className = "sideNavOnFocus"
        }}
        onBlur={function () {
          window.sideNav.className = "";
        }}
      ></div>
      <div id="topNav" key="topNav"></div>
      <div id="content" key="content" style={{"--areaWidth": localStorage.getItem("qr-app-width")}}>
        <div id="panel">
          <Theme/>
        </div>
        <div id="codeWrapper"></div>
        <a id="dragbar"
          ref={dragbar}
          onMouseDown={function (e) {
            e.preventDefault();
            var Obj = dragbar.current,
            width = getComputedStyle(window.content).getPropertyValue("--areaWidth").replace("%", "");
            window.overlay.style.display = "block";
            Obj.xi = e.clientX;
            if (width.search("px") === -1) {
              Obj.widthi = Number(width);
            } else {
              var maxWidth = Number(getComputedStyle(window.content).getPropertyValue("width").replace("px", ""));
              width = Number(width.replace("px", ""));
              Obj.widthi = Number(width / maxWidth * 100);
            }
            window.addEventListener("mousemove", Obj.mousemove);
            window.addEventListener("mouseup", Obj.mouseup);
          }}
        ><span></span></a>
        <div id="searchbar">
          <input disabled></input>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
            id="lockURL"
            onClick={function (e) {
              var Obj = window.lockURL;
              Obj.isLocked = !Obj.isLocked;
              if (Obj.isLocked) {
                e.currentTarget.innerHTML = `
                  <path fill="currentColor" d="M80 192V144C80 64.47 144.5 0 224 0C303.5 0 368 64.47 
                  368 144V192H384C419.3 192 448 220.7 448 256V448C448 483.3 419.3 
                  512 384 512H64C28.65 512 0 483.3 0 448V256C0 220.7 28.65 192 64 
                  192H80zM144 192H304V144C304 99.82 268.2 64 224 64C179.8 64 144 
                  99.82 144 144V192z"/>
                `;
              } else {
                var location = window.codeContainer.path;
                e.currentTarget.innerHTML = `
                  <path fill="currentColor" d="M352 192H384C419.3 192 448 220.7 448 256V448C448 
                  483.3 419.3 512 384 512H64C28.65 512 0 483.3 0 448V256C0 
                  220.7 28.65 192 64 192H288V144C288 64.47 352.5 0 432 
                  0C511.5 0 576 64.47 576 144V192C576 209.7 561.7 224 544 
                  224C526.3 224 512 209.7 512 192V144C512 99.82 476.2 64 
                  432 64C387.8 64 352 99.82 352 144V192z"/>
                `;
                if (window.searchbar.firstElementChild.value !== origin + location) {
                  if (location) {
                    window.searchbar.firstElementChild.value = origin + location;
                    window.cssStyle.innerHTML = "iframe[location=\"" + location + "\"]" + " {display: block !important;}";
                    qrApp.run();
                  } else {
                    window.searchbar.firstElementChild.value = "";
                  }
                }
              }
            }}
          ><path fill="currentColor" d="M352 192H384C419.3 192 448 220.7 448 256V448C448 
            483.3 419.3 512 384 512H64C28.65 512 0 483.3 0 448V256C0 
            220.7 28.65 192 64 192H288V144C288 64.47 352.5 0 432 
            0C511.5 0 576 64.47 576 144V192C576 209.7 561.7 224 544 
            224C526.3 224 512 209.7 512 192V144C512 99.82 476.2 64 
            432 64C387.8 64 352 99.82 352 144V192z"/>
          </svg>
        </div>
        <div id="iframeWrapper"></div>
        <div id="overlay"></div>
      </div>
      <div id="misc">
        <textarea style={{display: "none"}} id="codeArea" placeholder="Code goes here..."></textarea>
        <a id="openLink" target="_blank" style={{display: "none"}}></a>
        <a id="downloadFile" download></a>
        <input id="uploadFile" type="file" name="filetoupload"
          onChange={function (e) {
            var target = e.currentTarget,
            location = window.contextMenu.targetEle.getAttribute("href"),
            xhttp = new XMLHttpRequest(),
            fileData = new FormData(),
            message;
            fileData.set("filetoupload", target.files[0]);
            fileData.set("location", location);
            xhttp.open("post", origin + "/qr-admin/?action=uploadFiles&location=" + location);
            xhttp.send(fileData);
            xhttp.onload = function () {
              if (message = xhttp.responseText) alert(message);
            };
            target.value = null;
          }}
        />
        <div id="reset"
          onClick={function () {
            if (a.className.indexOf(" fullscreen") === -1) {
              a.className += " fullscreen";
              localStorage.setItem("qr-app-mode", " fullscreen");
            } else {
              a.className = a.className.replace(" fullscreen", "");
              localStorage.removeItem("qr-app-mode");
              qrApp.syncFiles.state();
            }
          }}
        ><button><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <path fill="currentColor" d="
          M0 0 h4 v1 h-3 v3 h-1 z 
          M16 0 v4 h-1 v-3 h-3 v-1 z
          M16 16 h-4 v-1 h3 v-3 h1 z
          M0 16 v-4 h1 v3 h3 v1 z
          M3 3 v-1 h3 v1 h1 v3 h-1 v1 h1 v1 h-1 v-2 h-2 v-2 h1 v3 h1 v-4 z
          v4 h2 v1 h-2 v-1 h-1 v-4 z
          M14 2 v5 h-1 v-1 h-1 v1 h-2 v-1 h2 v-1 h-2 v-1 h2 v1 h1 v-2 h-4 v4 h-1 v-5 z
          M14 14 h-1 v-1 h-1 v-1 h1 v-1 h1 z
          m-3 0 v-1 h1 v1 z
          m-2 0 v-1 h2 v-2 h2 v-2 h1 v1 h-2 v2 h-2 v2 z
          m0 -2 v-1 h2 v-2 h2 v-1 h-1 v2 h-2 v2 z
          m0 -2 v-1 h1 v-1 h1 v1 h1 v1 z
          M2 14 v-5 h6 v5 h-5 v-1 h4 v-3 h-4 v4 z m2 -2 v-1 h2 v1 z
        "/>
        </svg></button>Quick Render</div>
        <style id="cssStyle"></style>
        <div id="contextMenu">
          <span id="rename"
            onClick={function () {
              var Obj = window.contextMenu,
              location = Obj.targetEle.getAttribute("href");
              Obj.className = "";
              if (location === "/") return;
              Obj.targetEle.className += " renameItem";
              Obj.targetEle.iniText = Obj.targetEle.innerText;
              Obj.targetEle.contentEditable = true;
              var sel = window.getSelection();
              var range = document.createRange();
              range.selectNodeContents(Obj.targetEle)
              sel.removeAllRanges();
              sel.addRange(range);
            }}
            onMouseDown={function (e) {
              e.stopPropagation();
            }}
          >Rename</span>
          <span id="nFile"
            onClick={function () {
              var Obj = window.contextMenu, 
              title = Obj.targetEle, 
              body = title.nextElementSibling, 
              location = title.getAttribute("href"),
              prom = qrApp.dirProm.get(location),
              file;
              Obj.className = "";
              if (!prom) return;
              file = document.createElement("a");
              file.spellcheck = false;
              file.style.paddingLeft = Number(title.style.paddingLeft.replace("px", "")) + "px";
              file.onkeydown = function (e) {
                var Obj = e.currentTarget;
                if ("\\/:*?\"<>|".indexOf(e.key) !== -1) {
                  e.preventDefault();
                }
                if (e.keyCode === 13) {
                  e.preventDefault();
                  Obj.blur();
                }
              };
              file.onblur = async function () {
                this.className = this.className.replace(" renameItem", "");
                this.contentEditable = false;
                if (!this.innerText) return this.remove();
                var message;
                if (message = await appFunc("createFiles", "location=" + location + "&fname=" + this.innerText)) {
                  window.alert(message);
                } else {
                  qrApp.refreshDir(location);
                }
                this.remove();
              };
              function callback() {
                body.insertAdjacentElement("afterbegin", file);
                file.contentEditable = true;
                file.className += " renameItem";
                file.focus();
              }
              if (!title.isOpend) {
                body.style.display = "block";
                title.isOpend = true;
                title.className += " opened-fd";
              }
              if (!prom.fulfiled) {
                prom.state({
                  location: location, 
                  container: body,
                  callback: callback
                });
              } else {
                callback();
              }
            }}
            onMouseDown={function (e) {
              e.stopPropagation();
            }}
          >New File</span>
          <span id="nFolder"
            onClick={function () {
              var Obj = window.contextMenu, 
              title = Obj.targetEle, 
              body = title.nextElementSibling, 
              location = title.getAttribute("href"),
              prom = qrApp.dirProm.get(location),
              offset = Number(title.style.paddingLeft.replace("px", "")),
              file;
              Obj.className = "";
              if (!prom) return;
              file = document.createElement("a");
              file.className = "fd";
              file.innerText = "";
              file.spellcheck = false;
              file.style.paddingLeft = offset + 12 + "px";
              file.style.setProperty("--signLeft", offset + "px");
              file.onkeydown = function (e) {
                var Obj = e.currentTarget;
                if ("\\/:*?\"<>|".indexOf(e.key) !== -1) {
                  e.preventDefault();
                }
                if (e.keyCode === 13) {
                  e.preventDefault();
                  Obj.blur();
                }
              };
              file.onblur = async function () {
                this.className = this.className.replace(" renameItem", "");
                this.contentEditable = false;
                if (!this.innerText) return this.remove();
                var location = title.getAttribute("href"),
                message;
                if (message = await appFunc("createFolders", "location=" + location + "&fname=" + this.innerText)) {
                  window.alert(message);
                } else {
                  qrApp.refreshDir(location);
                }
                this.remove();
              };
              function callback() {
                body.insertAdjacentElement("afterbegin", file);
                file.contentEditable = true;
                file.className += " renameItem";
                var sel = window.getSelection();
                var range = document.createRange();
                range.selectNodeContents(file)
                sel.removeAllRanges();
                sel.addRange(range);
              }
              if (!title.isOpend) {
                body.style.display = "block";
                title.isOpend = true;
                title.className += " selected-fd";
              }
              if (!prom.fulfiled) {
                prom.state({
                  location: location, 
                  container: body,
                  callback: callback
                });
              } else {
                callback();
              }
            }}
            onMouseDown={function (e) {
              e.stopPropagation();
            }}
          >New Folder</span>
          <span id="zFile"
            onClick={async function () {
              var Obj = window.contextMenu,
              Arr = qrApp.fileArr(),
              location = Obj.targetEle.getAttribute("href"),
              files = location,
              message;
              Obj.className = "";
              if (location === "/") return;
              if (Arr.length > 1 && Arr.includes(location)) {
                Arr.delete(location);
                Arr.unshift(location);
                Arr = qrApp.sortOutFiles(Arr);
                files = JSON.stringify(Arr);
              }
              if (message = await appFunc("zipFiles", "location=" + files)){
                window.alert(message);
              } else {
                qrApp.refreshDir(location.slice(0, location.length - 1));
                var path = window.codeContainer.path;
                if (path) qrApp.selectOne(path);
                else qrApp.selectOne(location);
              }
            }}
            onMouseDown={function (e) {
              e.stopPropagation();
            }}
          >Compress to zip</span>
          <span id="eFile"
            onClick={async function () {
              var Obj = window.contextMenu,
              location = Obj.targetEle.getAttribute("href"),
              message, fileExtention = qrApp.getExt(location);
              Obj.className = "";
              if (Obj.targetEle.className.indexOf("fl") === -1) return;
              if (fileExtention === "zip" || fileExtention === "gz" || fileExtention === "rar") {
                if (message = await appFunc("extractFiles", "location=" + location)) {
                  window.alert(message);
                } else {
                  qrApp.refreshDir(location.slice(0, location.length - 1));   
                }
              }
            }}
            onMouseDown={function (e) {
              e.stopPropagation();
            }}
          >Extract All</span>
          <span id="ulFile"
            onClick={function () {
              var Obj = window.contextMenu,
              location = Obj.targetEle.getAttribute("href"),
              uploader = window.uploadFile;
              Obj.className = "";
              if (qrApp.isDir(location)) {
                uploader.click();
              }
            }}
            onMouseDown={function (e) {
              e.stopPropagation();
            }}
          >Upload</span>
          <span id="dlFile"
            onClick={async function () {
              var Obj = window.contextMenu,
              location = Obj.targetEle.getAttribute("href"),
              downloader = window.downloadFile,
              message;
              Obj.className = "";
              if (location === "/") return;
              if (qrApp.isDir(location)) {
                if (message = await appFunc("downloadFolders", "location=" + location)) {
                  window.alert(message);
                } else {
                  downloader.href = origin + "/qr-admin/misc/" + qrApp.baseName(location) + ".zip";
                  downloader.click();
                }
              } else {
                downloader.href = location;
                downloader.click();
              }
            }}
            onMouseDown={function (e) {
              e.stopPropagation();
            }}
          >Download</span>
          <span id="dFile"
            onClick={async function () {
              var Obj = window.contextMenu,
              Arr = qrApp.fileArr(),
              location = Obj.targetEle.getAttribute("href"),
              message;
              Obj.className = "";
              if (location === "/") return;
              if (Arr.length > 1 && Arr.includes(location)) {
                qrApp.sortOutFiles(Arr).forEach(async function (a) {
                  if (message = await appFunc("deleteFiles", "location=" + a)) {
                    window.alert(message);
                  } else {
                    qrApp.refreshDir(a.slice(0, a.length - 1));   
                  }
                });
              } else {
                if (message = await appFunc("deleteFiles", "location=" + location)){
                  window.alert(message);
                } else {
                  qrApp.refreshDir(location.slice(0, location.length - 1));   
                }
              }
            }}
            onMouseDown={function (e) {
              e.stopPropagation();
            }}
          >Delete</span>
        </div>
      </div>
    </>;
  }
  render(<Setup/>, a);
  qrApp.scrollbar(a, window.topNav, "horizontal");
  render(<nav>{await qrApp("", "invoke")}</nav>, window.sideNav);
  qrApp.scrollbar(window.sideNav.querySelector("nav"), window.sideNav.querySelector("nav > .fb"));
})(window.root);
