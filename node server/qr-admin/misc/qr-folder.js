window.folderOrigin = origin;
class qrFolder extends HTMLElement {
  connectedCallback() {
    if (!this.rendered) {
      if (!this.parentNode.matches("qr-folder > .dir-body")) qrFolder.setUp.call(this);
      this.root = qrFolder.rootFolders.find((root) => {
        return root.contains(this);
      });
      this.root.request("getFiles", "json", {location: this.src}).then((response) => {
        if (!response?.name) throw response;
        var head = this.head;
        head.href = this.src;
        head.innerText = response.name;
        this.refresh(response);
        head.addEventListener("click", event => {
          this.root.resizeEvent();
          head.after(this.body);
          head.addEventListener("click", event => {
            if (event.ctrlKey || head.contentEditable === "plaintext-only") return;
            this.root.resizeEvent();
            head.parentNode.classList.toggle("opened");
          });
          this.setedUp = true;
          this.dispatchEvent(new CustomEvent("setedUp"));
          if (!(event.ctrlKey || head.contentEditable === "plaintext-only"))
            head.parentNode.classList.toggle("opened");
        }, {once: true});
        this.initiated = true;
        this.dispatchEvent(new CustomEvent("initiated"));
      }, (err) => {
        console.log(err);
      }).catch((err) => {
        console.log(err);
      });
      this.append(this.head);
      this.rendered = true;
    }
  }
  refresh(response) {
    if (!arguments.length) {
      if (!this.refreshed) {
        this.root.request("getFiles", "json", {location: this.src}).then((response) => {
          this.refresh(response);
        }, err => console.log(err)).catch(err => console.log(err));
      }
    } else {
      if (!response?.name) throw response;
      var items = response.body,
          children = this.body.children;
      for (let i = 0, fileToRemove = [];; i++) {
        if (i < items.length && i < children.length) {
          var elem = this.root.setQrFile(items[i][0], items[i][1]);
          if (children[i] !== elem) {
            this.root.resizeEvent();
            children[i].before(elem); 
          }
        } else if (i < items.length) {
          this.root.resizeEvent();
          this.body.append(this.root.setQrFile(items[i][0], items[i][1]));
        } else if (i < children.length) {
          this.root.fileGarbage.push(children[i]);
          fileToRemove.push(children[i]);
        } else {
          for (let i = 0; i < fileToRemove.length; i++) {
            this.root.resizeEvent();
            fileToRemove[i].remove();
          }
          break;
        };
      }
      this.refreshed = true;
      setTimeout(() => {this.refreshed = false}, 50);
    }
  }
  set src(value) {this.setAttribute("src", value)}
  get src() {return this.getAttribute("src")}
  attributeChangedCallback() {}
  disconnectedCallback() {}
  adoptedCallback() {}
  head = qrFolder.createElement("a", {class: "dir-title"}, "...");
  body = qrFolder.createElement("div", {class: "dir-body"});
  rendered = false;
  initiated = false;
  setedUp = false;
  refreshed = false;
  static get observedAttributes() {
    return ["src"];
  }
  static setUp() {
    qrFolder.rootFolders.push(this);
    var fileGallery = new Map, fileReference = new Map, fileGarbage = [], request = qrFolder.request();
    fileReference.set = function (prop, value) {
      for (let item of this) if (value === item[1]) this.delete(item[0]);
      Map.prototype.set.call(this, prop, value);
    };
    var nestLevel = (location) => {
          if (!qrFolder.isDir(location)) location += "/";
          var rootSrc = this.src, arr = location.replace(rootSrc, "/").match(/\//g);
          return arr.length;
        }
    var createQrFolder = (location, fnum) => {
        var folder = qrFolder.createElement("qr-folder", {
          src: location,
          class: "sub-folder",
          style: `--nest-level: ${nestLevel(location)}`
        });
        folder.fnum = fnum;
        fileGallery.set(fnum, folder);
        fileReference.set(location, fnum);
        return folder;
      }, createQrFile = (location, fnum) => {
        var qrFile = qrFolder.createElement("a", {
          href: location,
          class: "qr-file"
        }, qrFolder.baseName(location));
        qrFile.fnum = fnum;
        fileGallery.set(fnum, qrFile);
        fileReference.set(location, fnum);
        return qrFile;
      }, updateFile = (fileElem, location) => {
        if (fileElem.innerText !== qrFolder.baseName(location))
          fileElem.innerText = qrFolder.baseName(location);
        var prevLocation = fileElem.getAttribute("href");
        fileElem.href = location;
        this.dispatchEvent(new CustomEvent("filerenamed", {
          detail: {
            fileElem: fileElem,
            oldHref: prevLocation,
            newHref: location
          }
        }));
        fileElem.classList.remove("selected");
        fileReference.set(location, fileElem.fnum);
      }, updateFolder = (folderElem, location) => {
        var oldSrc = folderElem.src;
        folderElem.src = location;
        folderElem.style.setProperty("--nest-level", nestLevel(location));
        fileReference.set(location, folderElem.fnum);
        if (!folderElem.rendered) return;
        if (folderElem.head.innerText !== qrFolder.baseName(location))
          folderElem.head.innerText = qrFolder.baseName(location);
        folderElem.head.href = location;
        folderElem.head.classList.remove("selected");
        var children = folderElem.body.children;
        for (let i = 0; i < children.length; i++) {
          var child = children[i];
          if (children[i].tagName === "QR-FOLDER") 
            updateFolder(child, child.src.replace(oldSrc, location));
          else
            updateFile(child, child.getAttribute("href").replace(oldSrc, location));
        }
      }, setQrFile = (location, fnum) => {
        var qrFile = fileGallery.get(fnum);
        if (qrFolder.isDir(location)) {
          if(!qrFile) return createQrFolder(location, fnum);
          if (qrFile.src !== location)
            updateFolder(qrFile, location)
        } else {
          if(!qrFile) return createQrFile(location, fnum);
          if (qrFile.getAttribute("href") !== location) 
            updateFile(qrFile, location)
        }
        var index = fileGarbage.indexOf(qrFile);
        if (index !== -1) fileGarbage.splice(index, 1);
        return qrFile;
      }
    this.request = request; this.fileGarbage = fileGarbage; this.setQrFile = setQrFile;
    this.body.tabIndex = -1;
    this.resizeEvent = qrFolder.asyncCall((a) => {
      a(this.body.scrollHeight);
    }, (b) => {
      if (this.body.scrollHeight !== b)
        this.dispatchEvent(new CustomEvent("resize"));
    });
    var focusHandler = qrFolder.lastCall((eventName) => {
          if (eventName === "focusin") {
            this.classList.add("focused");
          } else if (eventName === "focusout") {
            this.classList.remove("focused");
          }
        }, 0);
    this.addEventListener("focusin", () => {
      focusHandler("focusin");
    });
    this.addEventListener("focusout", () => {
      focusHandler("focusout");
    });
    var selectedFiles = this.getElementsByClassName("selected"),
        isFileElem = (elem) => {
          if (!elem.getAttribute("href")) return;
          return (
            elem.classList.contains("dir-title") ||
            elem.classList.contains("qr-file")
          );
        }
    var toggleSelect = (elem) => {
          if (elem !== this.head)
            elem.classList.toggle('selected');
        }
    var singleSelect = (elem) => {
          while (selectedFiles[0]) {
            selectedFiles[0].classList.remove('selected');
          }
          if (elem !== this.head) {
            elem.classList.add('selected');
            var location = elem.getAttribute("href");
            if (!qrFolder.isDir(location)) {
              this.dispatchEvent(new CustomEvent("fileselected", {
                detail: {
                  fileElem: elem
                }
              }));
            }
            var {top, bottom} = elem.getBoundingClientRect();
            if (top < 0 || innerHeight - bottom < 0) elem.scrollIntoView();
          }
        }
    this.addEventListener("click", event => {
      var target = event.target;
      if (!isFileElem(target)) return;
      if (event.ctrlKey || event.metaKey) {
        toggleSelect(target);
      } else {
        singleSelect(target);
      }
    });
    var deepIntoFile = async (location, toOpen) => {
          var dirs = qrFolder.dirArr(location),
              setUpEvent = new CustomEvent("click"),
              queue = new qrFolder.Queue;
          setUpEvent.ctrlKey = !toOpen;
          for (let i = 0; i < dirs.length; i++) {
            var fnum, folder;
            fnum = fileReference.get(dirs[i]),
            folder = fileGallery.get(fnum);
            if (i === 0) folder = this;
            if (!folder) return;
            if (folder.setedUp !== true) {
              folder.addEventListener("setedUp", () => {
                queue.resolve();
              });
              if (folder.initiated !== true) {
                folder.addEventListener("initiated", () => {
                  folder.head.dispatchEvent(setUpEvent);
                });
              } else {
                folder.head.dispatchEvent(setUpEvent);
              }
              await queue;
            } else if (toOpen) {
              if (!folder.classList.contains("opened")) {
                folder.head.dispatchEvent(setUpEvent);
              }
            }
          }
          queue.resolve(fileGallery.get(fileReference.get(location)));
          return queue;
        };
    this.deepIntoFile = deepIntoFile;
    this.selectFile = (fnum, location) => {
      var file = fileGallery.get(fnum);
      if (file && this.contains(file)) {
        var folder = file.closest("qr-folder");
        while (folder !== this) {
          if (!folder.classList.contains("opened")) folder.head.click();
          folder = folder.parentNode.closest("qr-folder");
        }
        deepIntoFile(location, true);
        singleSelect(file);
      } else if (location) {
        deepIntoFile(location, true).then(file => {
          singleSelect(file);
        }).catch(error => console.log(error));
      }
    };
    var dragbox = qrFolder.createElement("div", {
          class: "qr-dragbox",
          draggable: "true"
        }), dragItem = qrFolder.createElement("div", {
          class: "qr-dragItem"
        }), isSingleFile = (elem) => {
          return (
            !elem.classList.contains("selected") ||
            selectedFiles.length === 1 && selectedFiles[0] === elem
          );
        }
    dragbox.appendChild(dragItem);
    dragbox.addEventListener("dragstart", event => {
      var target = document.activeElement;
      if (isFileElem(target) && target.contentEditable !== "plaintext-only") {
        if (isSingleFile(target)) {
          dragItem.innerText = target.innerText;
          event.dataTransfer.setData("text", target.href);
        } else {remove()
          dragItem.innerText = selectedFiles.length + " items";
          var data = "";
          for (let elem of selectedFiles)
            data += elem.href +  "\n";
          event.dataTransfer.setData("text", data.trim());
        }
        dragbox.style.opacity = 1;
        setTimeout(() => {
          dragbox.remove();
          dragbox.style.opacity = 0;
        });
      } else {
        dragbox.remove();
        dragbox.style.opacity = 0;
      }
    });
    this.addEventListener("click", event => {
      event.preventDefault();
    }, true);
    this.addEventListener("pointerdown", event => {
      var target = event.target
      if (!isFileElem(target)) return;
      target.setPointerCapture(event.pointerId);
      target.onlostpointercapture = () => {
        dragbox.remove();
        dragbox.style.opacity = 0;
      };
      this.prepend(dragbox);
      dragbox.style.left = event.clientX - 2 + "px";
      dragbox.style.top = event.clientY - 2 + "px";
    });
    var dragOnElement, openCanceled = false, openDragOn = qrFolder.lastCall(() => {
          if (
            dragOnElement?.classList.contains("dir-title") && !openCanceled &&
            !dragOnElement.parentNode.classList.contains("opened")
          ) dragOnElement.click();
        }, 800);
    var sortedOutSrc = () => {
          var fileElem = document.activeElement,
              locations, filesToHandle;
          if (!isFileElem(fileElem)) return false;
          if (isSingleFile(fileElem)) filesToHandle = [fileElem];
          else filesToHandle = [...selectedFiles];
          for (let i = 0; i < filesToHandle.length; i++)
            filesToHandle[i].classList.remove("selected");
          locations = filesToHandle.map(elem => elem.getAttribute("href"));
          var folderSrcs = locations.filter((location) => {
                return qrFolder.isDir(location);
              }), locations2 = [...locations];
          for (let i = 0, folderSrc; i < folderSrcs.length; i++) {
            folderSrc = folderSrcs[i];
            for (let ii = 0, location; ii < locations.length; ii++) {
              location = locations[ii];
              if (folderSrc !== location && location.indexOf(folderSrc) === 0) {
                var index = locations2.indexOf(location);
                if (index !== -1) locations2.splice(index, 1);
              }
            }
          }
          return JSON.stringify(locations2);
        }
    var canDrop = (elems, elem2) => {
          if (!isFileElem(elems)) return false;
          if (elem2.classList.contains("dir-body")) {
            elem2 = elem2.parentNode.head;
          } else if (!isFileElem(elem2)) return false;
          var newLocation = qrFolder.dirname(elem2.getAttribute("href"));
          if (isSingleFile(elems)) elems = [elems];
          else elems = [...selectedFiles];
          var locations = elems.map((elem) => {
                return elem.getAttribute("href");
              });
          for (let i = 0, location; i < locations.length; i++) {
            location = locations[i];
            if (
              qrFolder.dirname(location, true) === newLocation || 
              qrFolder.isDir(location) && newLocation.indexOf(location) === 0
            ) return false;
          }
          return true;
        }
    this.addEventListener("dragover", event => {
      event.preventDefault();
    });
    this.addEventListener("dragenter", event => {
      var target = event.target, filestomove = document.activeElement;
      event.preventDefault();
      dragOnElement = target;
      if (canDrop(filestomove, target)) {
        target.closest("qr-folder").classList.add("draggedOn");
        openCanceled = false;
        openDragOn();
      }
    });
    this.addEventListener("dragleave", event => {
      var target = event.target;
      dragOnElement = event.relatedTarget;
      if (!dragOnElement || dragOnElement.closest("qr-folder") !==
          target.closest("qr-folder")) {
        target.closest("qr-folder").classList.remove("draggedOn")
      }
    });
    this.addEventListener("drop", event => {
      var target = event.target, folderToDropIn, newLocation;
      openCanceled = true;
      if (!canDrop(document.activeElement, target)) return;
      if (folderToDropIn = target.closest("qr-folder")) {
        folderToDropIn.classList.remove("draggedOn");
        request("moveFiles", "json", {
          locations: sortedOutSrc(), 
          location: folderToDropIn.src
        }).then((response) => {
          folderToDropIn.refresh(response);
        }, (error) => {
          console.log(error);
        }).catch((error) => {
          console.log(error);
        });
      }
    });
    var contextMenu = qrFolder.createElement("div", {
          class: "context-menu"
        }), rename = qrFolder.createElement("a", {
          class: "rename"
        }, "Rename"), refresh = qrFolder.createElement("a", {
          class: "refresh"
        }, "Refresh"), nFile = qrFolder.createElement("a", {
          class: "nFile"
        }, "New File"), nFolder = qrFolder.createElement("a", {
          class: "nFolder"
        }, "New Folder"), zFile = qrFolder.createElement("a", {
          class: "zFile"
        }, "Compress to zip"), eFile = qrFolder.createElement("a", {
          class: "eFile"
        }, "Extract All"), ulFile = qrFolder.createElement("a", {
          class: "ulFile"
        }, "Upload"), dlFile = qrFolder.createElement("a", {
          class: "dlFile"
        }, "Download"), dFile = qrFolder.createElement("a", {
          class: "dFile"
        }, "Delete"), removeContextMenu = () => {
          if (this.contains(contextMenu)) {
            contextMenu.innerHTML = "";
            contextMenu.remove();
          }
        }
/*-------------refresh------------------*/
    var refreshRequest = qrFolder.request(),
        cleanGarbage = (file) => {
          while (file = fileGarbage.pop()) {
            let curFile = file;
            var fnum = curFile.fnum;
            refreshRequest("searchFiles", "text", {fnum}).then(response => {
              if (response === "-1") {
                if (curFile.tagName === "QR-FOLDER") {
                  this.dispatchEvent(new CustomEvent("folderdeleted", {
                    detail: {
                      fileElem: curFile
                    }
                  }));
                } else {
                  this.dispatchEvent(new CustomEvent("filedeleted", {
                    detail: {
                      fileElem: curFile
                    }
                  }));
                }
              } else {
                deepIntoFile(response).then((a) => {
                }).catch(error => console.log(error));
              }
            }).catch(error => console.log(error));
          }
          if (!isOnSynchronization) {
            synchronizeFolder();
          }
        }, updateHandler = (subFolders) => {
          for (let i = 0; i < subFolders.length - 1; i++) {
            refreshRequest("getFiles", "json", {location: subFolders[i].src}).then((response) => {
              subFolders[i].refresh(response);
            }).catch(() => {});
          }
          refreshRequest("getFiles", "json", {location: subFolders[subFolders.length - 1].src}).then((response) => {
            subFolders[subFolders.length - 1].refresh(response);
          }).then(() => {
            cleanGarbage();
          }, () => {
            cleanGarbage();
          });
        }, refreshFolder = () => {
          var subFolders = this.querySelectorAll("qr-folder");
          refreshRequest("getFiles", "json", {location: this.src}).then((response) => {
            this.refresh(response);
          }).then(() => {
            if (subFolders.length > 0) {
              updateHandler(subFolders);
            } else {
              cleanGarbage();
            }
          }).catch(() => {});
        };
/*-------------synchronization------------------*/
    var isOnSynchronization = false,
    synchronizeFolder = () => {
      var socket = new WebSocket(folderOrigin.replace(/.*?(?=:)/, "ws") + "/ws");
      socket.onopen = () => {
        isOnSynchronization = true;
      };
      socket.onmessage = event => {
        let incomingMessage = event.data;
        var did = incomingMessage.match(/.*?(?= )/)[0],
            message = incomingMessage.slice(did.length + 1),
            inode, file, folder;
        if (did === "deleted") {
          inode = fileReference.get(message);
          file = fileGallery.get(inode);
          this.resizeEvent();
          if (file) {
            file.remove();
            this.dispatchEvent(new CustomEvent("filedeleted", {
              detail: {
                fileElem: file
              }
            }));
          } else {
            inode = fileReference.get(message + "/");
            folder = fileGallery.get(inode);
            if (folder) {
              folder.remove();
              this.dispatchEvent(new CustomEvent("folderdeleted", {
                detail: {
                  fileElem: folder
                }
              }));
            }
          }
        } else if (did === "added") {
          inode = fileReference.get(message + "/");
          folder = fileGallery.get(inode);
          if (folder?.rendered) {
            folder.refresh();
          } else {
            if (message === "/.") {
              this.refresh();
            } else {
              deepIntoFile(message + "/");
            }
          }
        } else if (did === "changed") {
          inode = fileReference.get(message);
          file = fileGallery.get(inode);
          if (file) {
            this.dispatchEvent(new CustomEvent("filechanged", {
              detail: {
                fileElem: file
              }
            }));
          }
        }
      };
      socket.onclose = event => {
        isOnSynchronization = false;
      }
    }
    synchronizeFolder();
/*-------------synchronization------------------*/
    var renameKeydown = function (event) {
          var key = event.key;
          if ("\\/:*?\"<>|".indexOf(key) !== -1) event.preventDefault();
          if (key === "Enter") {
            event.preventDefault();
            this.blur();
          }
        }, renameBlur = function blur() {
          var location = this.getAttribute("href"), fname = this.innerText.trim();
          if (!fname) fname = this.innerText = qrFolder.baseName(this.getAttribute("href"));
          else if (fname !== qrFolder.baseName(location))
            request("renameFiles", "json", {location, fname}).then((response) => {
              if (!response?.name) throw response;
              if (qrFolder.isDir(location)) {
                this.parentNode.parentNode.parentNode.refresh(response);
              } else {
                this.parentNode.parentNode.refresh(response);
              }
            }).catch((error) => {
              this.innerText = qrFolder.baseName(this.getAttribute("href"));
              console.log(error);
            });
          this.removeAttribute("contenteditable")
          this.removeEventListener("keydown", renameKeydown);
          this.removeEventListener("blur", blur);
        }, renameFile = () => {
          var fileElem = document.activeElement,
              selection = document.getSelection(),
              fileName = fileElem.innerText,
              index = fileName.lastIndexOf(".");
          if (fileElem.classList.contains("dir-title") || index === -1) index = fileName.length;
          selection.empty();
          selection.setBaseAndExtent(fileElem.childNodes[0], 0, fileElem.childNodes[0], index);
          fileElem.addEventListener("keydown", renameKeydown);
          fileElem.addEventListener("blur", renameBlur);
          fileElem.contentEditable = "plaintext-only";
        }, fileTemplate = qrFolder.createElement("a", {
          class: "qr-file",
          contentEditable: "plaintext-only"
        });
    var createNewFile = () => {
          var fileElem = document.activeElement,
              folder = fileElem.parentNode,
              body = folder.body;
          if(!folder.classList.contains("opened")) fileElem.click();
          var anchor = [...body.children].find(child => child.classList.contains("qr-file"));
          if (anchor) anchor.before(fileTemplate);
          else body.append(fileTemplate);
          fileTemplate.innerHTML = "";
          fileTemplate.contentEditable = "plaintext-only";
          fileTemplate.focus();
        }, folderTemplate = qrFolder.createElement("a", {
          class: "dir-title",
          contentEditable: "plaintext-only"
        });
    var createNewFolder = () => {
          var fileElem = document.activeElement,
              folder = fileElem.parentNode,
              body = folder.body;
          if(!folder.classList.contains("opened")) fileElem.click();
          folderTemplate.innerHTML = "";
          folderTemplate.contentEditable = "plaintext-only";
          body.prepend(folderTemplate);
          folderTemplate.focus();
        };
    var deleteFiles = () => {
          var fileElem = document.activeElement, locations = sortedOutSrc();
          request("deleteFiles", "json", {locations}).then((res) => {
          }).catch((err) => {
            console.log(err);
          });
        };
    var zipFiles = () => {
          var fileElem = document.activeElement, location = fileElem.getAttribute("href");
          request("zipFiles", "json", {locations: sortedOutSrc(), location}).then(response => {
            if (!response?.name) throw response;
            if (qrFolder.isDir(location)) {
              fileElem.parentNode.parentNode.parentNode.refresh(response);
            } else {
              fileElem.parentNode.parentNode.refresh(response);
            }
          }).catch(error => console.log(error));
        };
    var extractFiles = () => {
          var fileElem = document.activeElement, location = fileElem.getAttribute("href");
          request("extractFiles", "json", {location}).then(response => {
            if (!response?.name) throw response;
            fileElem.closest("qr-folder").refresh(response);
          }).catch(error => console.log(error));
        };
    var fileData = new FormData(),
        uploader = qrFolder.createElement("input", {type: "file"}),
        uploadFiles = () => {
          uploader.click();
        };
    var downloader = qrFolder.createElement("a", {download: ""}),
        downloadFiles = () => {
          var fileElem = document.activeElement,
              location = fileElem.getAttribute("href");
          if (qrFolder.isDir(location)) {} else {
            downloader.href = folderOrigin + location + "?action=downloadFiles";
            downloader.click();
          }
        }
    fileTemplate.addEventListener("keydown", renameKeydown);
    fileTemplate.addEventListener("blur", () => {
      var folder = fileTemplate.closest("qr-folder"),
          location = folder.src,
          fname = fileTemplate.innerText.trim();
      if (fname) {
        request("createFiles", "json", {location, fname}).then((response) => {
          if (!response?.name) throw response;
          folder.refresh(response);
        }).catch((error) => {
          fileTemplate.remove();
          console.log(error);
        });
        fileTemplate.removeAttribute("contenteditable");
        fileTemplate.innerText += "...";
      } else {
        fileTemplate.innerHTML = "";
        fileTemplate.remove();
      }
    });
    folderTemplate.addEventListener("keydown", renameKeydown);
    folderTemplate.addEventListener("blur", () => {
      var folder = folderTemplate.closest("qr-folder"),
          location = folder.src,
          fname = folderTemplate.innerText.trim();
      if (fname) {
        request("createFolders", "json", {location, fname}).then((response) => {
          if (!response?.name) throw response;
          folder.refresh(response);
        }).catch((error) => {
          folderTemplate.remove();
          console.log(error);
        });
        folderTemplate.removeAttribute("contenteditable");
        folderTemplate.innerText += "...";
      } else {
        folderTemplate.remove();
      }
    });
    uploader.addEventListener("change", () => {
      var fileElem = document.activeElement;
      fileData.set("filetoupload", uploader.files[0])
      qrFolder.fetch("action=uploadFiles&location=" + 
      fileElem.getAttribute("href"), fileData).then((response) => {
        if (!response?.name) throw response;
        fileElem.closest("qr-folder").refresh(response);
      }).catch(error => console.log(error));
      uploader.value = null;
    });
    contextMenu.addEventListener("pointerdown", event => {
      event.preventDefault();
    });
    contextMenu.addEventListener("click", event => {
      var target = event.target;
      switch (target) {
        case rename: renameFile(); break;
        case refresh: refreshFolder(this); break;
        case nFile: createNewFile(); break;
        case nFolder: createNewFolder(); break;
        case zFile: zipFiles(); break;
        case eFile: extractFiles(); break;
        case ulFile: uploadFiles(); break;
        case dlFile: downloadFiles(); break;
        case dFile: deleteFiles(); break;
      }
      removeContextMenu();
    });
    this.addEventListener("contextmenu", event => {
      event.preventDefault();
      var target = event.target, classList = target?.classList;
      if (!classList || !target.getAttribute("href") || target === fileTemplate || target === folderTemplate) return;
      if (classList.contains("dir-title") && target !== this.head) {
        contextMenu.append(rename, nFile, nFolder, zFile, ulFile, dFile);
        this.prepend(contextMenu);
      } else if (classList.contains("qr-file")) {
        if (qrFolder.getExtention(target.getAttribute("href")) === "zip")
          contextMenu.append(rename, eFile, dlFile, dFile);
        else
          contextMenu.append(rename, zFile, dlFile, dFile);
        this.prepend(contextMenu);
      } else if (classList.contains("dir-body") || target === this.head) {
        contextMenu.append(refresh, nFile, nFolder, ulFile);
        this.prepend(contextMenu);
      }
      var newTop = event.clientY, newLeft = event.clientX, 
          height = contextMenu.offsetHeight, width = contextMenu.offsetWidth;
      if (innerHeight - (newTop + height) < 0) newTop = newTop - height;
      if (innerWidth - (newLeft + width) < 0) newLeft = newLeft - width;
      contextMenu.style.left = newLeft + "px";
      contextMenu.style.top = newTop + "px";
    });
    this.addEventListener("focusout", removeContextMenu);
    this.addEventListener("pointerdown", event => {
      if (this.contains(contextMenu) && event.button === 0) {
        if (!contextMenu.contains(event.target)) {
          this.addEventListener("click", event => {
            event.stopPropagation();
          }, {once: true, capture: true});
          removeContextMenu();
        }
      }
    });
    var searchRequest = qrFolder.request();
    this.getFileLocationByFnum = (fnum) => searchRequest("searchFiles", "text", {fnum});
  }
  static Queue = class {
    constructor(callback) {
      var queue = Object.create(null);
      queue.then = (resolve, reject) => {
        var value = this.values.shift(),
        error = this.errors.shift();
        if (error === this.empty) resolve(value);
        else if (value === this.empty) reject(error);
        else {
          this.resolves.push(resolve);  
          this.rejects.push(reject);
        }
      }
      this.then = async (resolve, reject) => {
        if (this.canceled) return;
        try {
          return resolve?.(await queue);
        } catch (error) {
          return reject?.(error);
        } finally { callback?.(this); }
      };
      this.invoke = () => {
        if (this.canceled) {
          this.canceled = false;
          callback?.(this);
        }
      };
      this.invoke();
    }
    values = []; errors = []; 
    resolves = []; rejects = [];
    empty = Symbol(); canceled = true;
    resolve(value) {
      var resolve = this.resolves.shift(),
          reject = this.rejects.shift();
      if (resolve) resolve(value);
      else {
        this.values.push(value);
        this.errors.push(this.empty);
      }
    }
    reject(error) {
      var resolve = this.resolves.shift(),
          reject = this.rejects.shift();
      if (reject) reject(error);
      else {
        this.values.push(this.empty);
        this.errors.push(error);
      }
    }
    cancel() {
      this.values.splice(0, Infinity);
      this.errors.splice(0, Infinity);
      this.resolves.splice(0, Infinity);
      this.rejects.splice(0, Infinity);
      this.canceled = true;
    }
  }
  static request() {
    var xhttp = new XMLHttpRequest(), url = new URL(folderOrigin),
    get = qrFolder.syncCall((action, responseType, body, queue) => {
      xhttp.onload = () => {
        var response = xhttp.response, status = xhttp.status;
        if (status === 200) queue.resolve(response); 
        else queue.reject(status + " " + xhttp.statusText);
      };
      xhttp.onerror = (error) => queue.reject(error);
      xhttp.open("POST", folderOrigin + "/qr-admin/?action=" + action);
      xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      for (let item in body) url.searchParams.set(item, body[item]);
      xhttp.responseType = responseType; 
      xhttp.send(url.search.slice(1));
    });
    return get;
  }
  static fetch(urlParam, body) {
    var url = new URL("/qr-admin/?" + urlParam, folderOrigin);
    return fetch(url, {
      method: "POST",
      body: body
    }).then(function (header) {
      return header.json();
    });
  }
  static getContents(location) {
    var url = new URL("/qr-admin/?action=getContents", folderOrigin);
    url.searchParams.set("location", location);
    return fetch(url, {
      method: "POST",
      body: url.searchParams
    }).then(function (header) {
      return header.text();
    });
  }
  static putContents(location, contents) {
    var urlStr = folderOrigin + "/qr-admin/?action=putContents",
        url = new URL(folderOrigin);
    url.searchParams.set("location", location);
    url.searchParams.set("contents", contents);
    return fetch(urlStr, {
      method: "POST",
      body: url.searchParams
    }).then(function (header) {
      return header.text();
    });
  }
  static firstCall(func, delay) {
    if (delay === undefined) {
      var queue = new this.Queue(function (a) {
        var init = !a.values.length;
        a.then(function (value) {
          if (init) func(value);
        });
      });
      return queue.resolve.bind(queue);
    } else {
      var timeout, init = true;
      return function () {
        if (init) {
          func(...arguments);
          init = false;
        }
        clearTimeout(timeout);
        timeout = setTimeout(() => init = true, +delay || 0);
      }
    }
  }
  static lastCall(func, delay) {
    if (delay === undefined) {
      var queue = new this.Queue(function (a) {
        a.then(function (value) {
          if (!a.values.length) func(value);
        });
      });
      return queue.resolve.bind(queue);
    } else {
      var timeout;
      return function () {
        clearTimeout(timeout);
        timeout = setTimeout(func.bind(null, ...arguments), +delay || 0);
      }
    }
  }
  static syncCall(func) {
    var queue = new this.Queue,
    rtn = new this.Queue(() => queue.resolve());
    return async function () {
      await queue;
      func(...arguments, rtn);
      return rtn;
    }
  }
  static asyncCall(a, b, delay) {
    var func = this.lastCall(b, delay);
    return function () {
      a(...arguments, func);
    }
  }
  static isDir(a) {
    if (!a?.length) return;
    return a[a.length-1] === "/";
  }
  static baseName(a) {
    var Arr = a.split("/");
    return Arr[Arr.length-1] || Arr[Arr.length-2];
  }
  static dirname(a, b) {
    if (b) a = a.slice(0, a.length - 1);
    var index = a.lastIndexOf("/");
    if (index === -1) return "./";
    return a.slice(null, index + 1);
  }
  static getExtention(a) {
    var index = a.lastIndexOf(".");
    if (index === -1) return "";
    return a.slice(index + 1).toLowerCase();
  }
  static dirArr(dir) {
    var location = dir, index = 0, Arr = [];
    while (index !== -1) {
      Arr.push(location.substr(0, index + 1));
      index = location.indexOf("/", index + 1);
    }
    return Arr;
  }
  static createElement(tagName, attribute={}, text="") {
    var elem = document.createElement(tagName);
    for (let attr in attribute) {
      elem.setAttribute(attr, attribute[attr]);
    }
    elem.innerHTML = text;
    return elem;
  }
  static rootFolders = [];
}
customElements.define("qr-folder", qrFolder);
customElements.define("qr-slidery", class extends HTMLElement {
  connectedCallback() {
    if (this.rendered) return;
    var slider = this.slider,
        thumb = this.thumb,
        shiftY, slideStart = event => {
          event.preventDefault();
          shiftY = event.clientY - thumb.getBoundingClientRect().top;
          thumb.setPointerCapture(event.pointerId);
          thumb.onpointermove = slide;
          this.dispatchEvent(new CustomEvent("slideStart"));
        }, slide = event => {
          let newTop = event.clientY - shiftY - slider.getBoundingClientRect().top,
              bottomEdge = slider.offsetHeight - thumb.offsetHeight;
          if (newTop < 0) {
            newTop = 0;
          } else if (newTop > bottomEdge) {
            newTop = bottomEdge;
          }
          thumb.style.top = newTop + 'px';
          this.scrolling = true;
          this.dispatchEvent(new CustomEvent("slide", {
            detail: {
              slidedPortion: newTop / bottomEdge
            }
          }));
        };
    slider.className = "slider-trackY";
    slider.addEventListener("pointerdown", event => {
      let heigth = thumb.offsetHeight, bottomEdge = slider.offsetHeight - heigth,
          newTop = event.clientY - slider.getBoundingClientRect().top - heigth / 2;
      if (newTop < 0) {
        newTop = 0;
      } else if (newTop > bottomEdge) {
        newTop = bottomEdge;
      }
      thumb.style.top = newTop + 'px';
      slideStart(event);
      this.dispatchEvent(new CustomEvent("slide", {
        detail: {
          slidedPortion: newTop / bottomEdge
        }
      }));
    });
    thumb.className = "slider-thumbY";
    thumb.onlostpointercapture = event => {
      thumb.onpointermove = null;
      this.scrolling = false;
      this.dispatchEvent(new CustomEvent("slideEnd"));
    };
    thumb.addEventListener("pointerdown", slideStart);
    thumb.ondragstart = () => false;
    slider.append(thumb);
    this.append(slider);
    this.addEventListener("update", event => {
      var portion = event.detail.slidedPortion, length = event.detail.length,
          maxHeight = slider.offsetHeight;
      if (portion > 1) portion = 1;
      else if (portion < 0) portion = 0;
      if (length < maxHeight) {
        if (length > 24)
          thumb.style.height = length + "px";
        else {
          thumb.style.height = Math.min(maxHeight / 2, 24) + "px";
        }
      } else {
        thumb.style.height = 0 + "px";
        this.hidden = true;
      }
      var newTop = portion * (maxHeight - thumb.offsetHeight);
      thumb.style.top = newTop + "px";
    });
    this.scrolling = false;
    this.rendered = true;
    this.linkElement = (elem) => {
      elem.updateScroll = () => {
        this.hidden = false;
        this.dispatchEvent(new CustomEvent("update", {
          detail: {
            slidedPortion: elem.scrollTop / (elem.scrollHeight - elem.clientHeight),
            length: elem.clientHeight / elem.scrollHeight * slider.offsetHeight
          }
        }));
      };
      elem.addEventListener("scroll", elem.updateScroll);
      this.addEventListener("slide", (e) => {
        elem.scrollTop = e.detail.slidedPortion * (elem.scrollHeight - elem.clientHeight);
      });
      window.addEventListener("resize", elem.updateScroll);
    };
  }
  slider = document.createElement("div");
  thumb = document.createElement("div");
  rendered = false;
});
customElements.define("qr-sliderx", class extends HTMLElement {
  connectedCallback() {
    if (this.rendered) return;
    var slider = this.slider,
        thumb = this.thumb,
        shiftX, slideStart = event => {
          event.preventDefault();
          shiftX = event.clientX - thumb.getBoundingClientRect().left;
          thumb.setPointerCapture(event.pointerId);
          thumb.onpointermove = slide;
          this.dispatchEvent(new CustomEvent("slideStart"));
        }, slide = event => {
          let newLeft = event.clientX - shiftX - slider.getBoundingClientRect().left,
              rightEdge = slider.offsetWidth - thumb.offsetWidth;
          if (newLeft < 0) {
            newLeft = 0;
          } else if (newLeft > rightEdge) {
            newLeft = rightEdge;
          }
          thumb.style.left = newLeft + 'px';
          this.scrolling = true;
          this.dispatchEvent(new CustomEvent("slide", {
            detail: {
              slidedPortion: newLeft / rightEdge
            }
          }));
        };
    slider.className = "slider-trackX";
    slider.addEventListener("pointerdown", event => {
      let heigth = thumb.offsetWidth, rightEdge = slider.offsetWidth - heigth,
          newLeft = event.clientX - slider.getBoundingClientRect().left - heigth / 2;
      if (newLeft < 0) {
        newLeft = 0;
      } else if (newLeft > rightEdge) {
        newLeft = rightEdge;
      }
      thumb.style.left = newLeft + 'px';
      slideStart(event);
      this.dispatchEvent(new CustomEvent("slide", {
        detail: {
          slidedPortion: newLeft / rightEdge
        }
      }));
    });
    thumb.className = "slider-thumbX";
    thumb.onlostpointercapture = event => {
      thumb.onpointermove = null;
      this.scrolling = false;
      this.dispatchEvent(new CustomEvent("slideEnd"));
    };
    thumb.addEventListener("pointerdown", slideStart);
    thumb.ondragstart = () => false;
    slider.append(thumb);
    this.append(slider);
    this.addEventListener("update", event => {
      var portion = event.detail.slidedPortion, length = event.detail.length,
          maxWidth = slider.offsetWidth;
      if (portion > 1) portion = 1;
      else if (portion < 0) portion = 0;
      if (length < maxWidth) {
        if (length > 24)
          thumb.style.width = length + "px";
        else {
          thumb.style.width = Math.min(maxWidth / 2, 24) + "px";
        }
      } else {
        thumb.style.width = 0 + "px";
        this.hidden = true;
      }
      var newLeft = portion * (maxWidth - thumb.offsetWidth);
      thumb.style.left = newLeft + "px";
    });
    this.scrolling = false;
    this.rendered = true;
    this.linkElement = (elem) => {
      elem.updateScroll = () => {
        this.hidden = false;
        this.dispatchEvent(new CustomEvent("update", {
          detail: {
            slidedPortion: elem.scrollLeft / (elem.scrollWidth - elem.clientWidth),
            length: elem.clientWidth / elem.scrollWidth * slider.offsetWidth
          }
        }));
      };
      elem.addEventListener("scroll", elem.updateScroll);
      this.addEventListener("slide", (e) => {
        elem.scrollLeft = e.detail.slidedPortion * (elem.scrollWidth - elem.clientWidth);
      });
      window.addEventListener("resize", elem.updateScroll);
    };
  }
  slider = document.createElement("div");
  thumb = document.createElement("div");
  rendered = false;
});
customElements.define("qr-resizerx", class extends HTMLElement {
  connectedCallback() {
    if (this.rendered) return;
    var initX, pointermove = event => {
          this.dispatchEvent(new CustomEvent("resize", {
            detail: event.clientX - initX
          }));
        };
    this.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      this.setPointerCapture(event.pointerId);
      this.addEventListener("pointermove", pointermove);
      this.dispatchEvent(new CustomEvent("resizeStart"));
    });
    this.addEventListener("gotpointercapture", event => {
      initX = event.clientX;
    });
    this.addEventListener("lostpointercapture", () => {
      this.removeEventListener("pointermove", pointermove);
      this.dispatchEvent(new CustomEvent("resizeEnd"));
    });
    this.rendered = true;
  }
  rendered = false;
});
class Mapper {
  constructor(entries=[]) {
    var deleteProp = prop => {
      var entries = this.entries;
      for (let i = 0; i < entries.length; i++) {
        if (entries[i][0] === prop) {
          var prev = entries[i][1];
          entries.splice(i, 1);
          return prev;
        }
      }
    };
    this.deleteValue = value => {
      var entries = this.entries;
      for (let i = 0; i < entries.length; i++) {
        if (entries[i][1] === value) {
          var prev = entries[i][0];
          entries.splice(i, 1);
          return prev;
        }
      }
    };
    this.getValue = prop => {
      var entries = this.entries;
      for (let i = 0; i < entries.length; i++) {
        if (entries[i][0] === prop) {
          return entries[i][1];
        }
      }
    };
    this.getProp = value => {
      var entries = this.entries;
      for (let i = 0; i < entries.length; i++) {
        if (entries[i][1] === value) {
          return entries[i][0];
        }
      }
    };
    this.setProp = (value, prop) => {
      var entries = this.entries;
      for (let i = 0; i < entries.length; i++) {
        if (entries[i][1] === value) {
          var prev = entries[i][0];
          entries[i][0] = prop;
          return prev;
        }
      }
    }
    this.setValue = (prop, value) => {
      var entries = this.entries;
      for (let i = 0; i < entries.length; i++) {
        if (entries[i][0] === prop) {
          var prev = entries[i][1];
          entries[i][1] = value;
          return prev;
        }
      }
    }
    this.replaceByProp = (prop, prop2, value) => {
      var entries = this.entries;
      for (let i = 0; i < entries.length; i++) {
        if (entries[i][0] === prop) {
          entries[i][0] = prop2;
          var prev = entries[i][1];
          entries[i][1] = value;
          return prev;
        }
      }
    };
    this.replaceByValue = (value, prop, value2) => {
      var entries = this.entries;
      for (let i = 0; i < entries.length; i++) {
        if (entries[i][1] === value) {
          entries[i][1] = value2;
          var prev = entries[i][0];
          entries[i][0] = prop;
          return prev;
        }
      }
    };
    this.append = (prop, value) => {
      var entries = this.entries;
      deleteProp(prop);
      entries.push([prop, value]);
    };
    this.prepend = (prop, value) => {
      var entries = this.entries;
      deleteProp(prop);
      entries.unshift([prop, value]);
    };
    this.after = (prop, prop2, value) => {
      var entries = this.entries;
      deleteProp(prop2);
      var index = entries.length;
      for (let i = 0; i < entries.length; i++) {
        if (entries[i][0] === prop) {
          index = i + 1; break;
        }
      }
      entries.splice(index, 0, [prop2, value]);
    };
    this.before = (prop, prop2, value) => {
      var entries = this.entries;
      deleteProp(prop2);
      var index = 0;
      for (let i = 0; i < entries.length; i++) {
        if (entries[i][0] === prop) {
          index = i; break;
        }
      }
      entries.splice(index, 0, [prop2, value]);
    }
    this.propIndexOf = (prop) => {
      for (let i = 0; i < entries.length; i++) {
        if (entries[i][0] === prop) {
          return i;
        }
      }
      return -1;
    }
    this.valueIndexOf = (value) => {
      for (let i = 0; i < entries.length; i++) {
        if (entries[i][1] === value) {
          return i;
        }
      }
      return -1;
    }
    this.props = () => {
      var rtn = [];
      for (let i = 0; i < entries.length; i++) {
        rtn.push(entries[i][0]);
      }
      return rtn;
    };
    this.values = () => {
      var rtn = [];
      for (let i = 0; i < entries.length; i++) {
        rtn.push(entries[i][1]);
      }
      return rtn;
    };
    this.entries = entries;
    this.deleteProp = deleteProp;
  }
}
document.addEventListener("DOMContentLoaded", () => {
!function () {
  var sideNav = window.sideNav,
      resizer = sideNav.querySelector("qr-resizerx"),
      topNav = window.topNav,
      logo = window.logo,
      logoIcon = window.icon,
      sideWidth = 0;
  function collapseMenu() {
    sideWidth = sideNav.offsetWidth;
    topNav.style.paddingLeft = "48px";
    logo.classList.add("closed");
    document.body.style.setProperty("--side-width", 0 + "px");
    localStorage.setItem("side-width",  0);
  }
  function expandMenu() {
    topNav.style.paddingLeft = "";
    logo.classList.remove("closed");
    document.body.style.setProperty("--side-width", sideWidth + "px");
    localStorage.setItem("side-width",  sideWidth);
    sideWidth = 0;
  }
  function resize(newWidth) {
    if (newWidth > 600) {
      newWidth = 600;
      if (sideWidth) expandMenu();
    } else if (newWidth > 225) {
      if (sideWidth) expandMenu();
    } else if (newWidth < 225 && newWidth > 100)  {
      newWidth = 225;
      if (sideWidth) expandMenu();
    } else if (newWidth < 100) {
      newWidth = 0;
      if (!sideWidth) collapseMenu();
    }
    document.body.style.setProperty("--side-width", newWidth + "px");
    localStorage.setItem("side-width",  newWidth);
    window.dispatchEvent(new CustomEvent("resize"));
  }
  !function () {
    var sideWidth = +localStorage.getItem("side-width");
    if (sideWidth || sideWidth === 0) resize(sideWidth);
  }();
  sideNav.addEventListener("click", (e) => {
    e.preventDefault();
  });
  sideNav.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
  resizer.addEventListener("resizeStart", function () {
    resizer.startWidth = sideNav.offsetWidth;
  });
  resizer.addEventListener("resize", function (event) {
    var newWidth = resizer.startWidth + event.detail;
    resize(newWidth);
  });
  resizer.addEventListener("resizeEnd", function () {
  });
  logoIcon.addEventListener("click", function () {
    if (sideWidth) expandMenu();
    else collapseMenu();
    window.dispatchEvent(new CustomEvent("resize"));
  });
  var themeOption = window.panel.firstElementChild;
  var codeWrapper = window.codeWrapper;
  themeOption.addEventListener("click", function () {
    var editor = codeWrapper.getActiveEditor(),
        isDayTheme = document.body.classList.toggle("day");
    if (editor) {
      var theme = editor.getOption("theme");
      if (theme === "night" && isDayTheme) {
        editor.setOption("theme", "day");
      } else if (theme === "day" && !isDayTheme) {
        editor.setOption("theme", "night");
      }
    }
    if (isDayTheme) {
      localStorage.setItem("theme-option", "day");
      themeOption.theme = "day";
    } else {
      localStorage.removeItem("theme-option");
      themeOption.theme = "night";
    }
  });
  if (localStorage.getItem("theme-option") === "day") {
    themeOption.theme = "day";
    document.body.classList.add("day");
  } else {
    themeOption.theme = "night";
  }
  var content = window.content,
      codeContainer = window.codeContainer,
      searchBar = window.searchBar,
      lock = searchBar.querySelector("div"), 
      areaResizer = codeContainer.querySelector("qr-resizerx");
  areaResizer.addEventListener("resizeStart", function () {
    areaResizer.startWidth = codeContainer.offsetWidth;
  });
  areaResizer.addEventListener("resize", function (event) {
    var newWidth = areaResizer.startWidth + event.detail,
        maxWidth = content.offsetWidth;
    if (newWidth >= maxWidth) newWidth = "100%";
    else if (newWidth <= 8) {
      newWidth = "8px";
    } else newWidth = newWidth / maxWidth * 100 + "%";
    document.body.style.setProperty("--area-width", newWidth);
    localStorage.setItem("area-width", parseFloat(newWidth));
    window.dispatchEvent(new CustomEvent("resize"));
  });
  !function () {
    var areaWidth = +localStorage.getItem("area-width");
    if (areaWidth || areaWidth === 0) {
      if (areaWidth === 8) areaWidth = "8px";
      else areaWidth = areaWidth + "%";
      document.body.style.setProperty("--area-width", areaWidth);
    }
  }();
  lock.addEventListener("click", function () {
    this.locked = searchBar.classList.toggle("locked");
    if (this.locked) {
      localStorage.setItem("locked-url", this.previousElementSibling.value);
    } else {
      localStorage.removeItem("locked-url");
      lock.dispatchEvent(new CustomEvent("unlock"));
    }
  });
  !function () {
    var lockedUrl = localStorage.getItem("locked-url");
    if (lockedUrl) {
      lock.locked = true;
      searchBar.classList.add("locked");
    }
  }();
}();
!function () {
  var rootFolder = qrFolder.rootFolders[0], 
      navBar = window.navBar, pageMapper = new Mapper, 
      pageOrder = new Mapper, pageGallery = new Map;
  navBar.addEventListener("wheel", function (event) {
    if (navBar.offsetWidth === navBar.scrollWidth) return;
    event.preventDefault();
    var delta = event.deltaY || event.deltaX;
    if (Math.abs(delta) >= 100) delta *= 0.2;
    this.scrollLeft += delta;
  });
  navBar.nextElementSibling.linkElement(navBar);
  rootFolder.addEventListener("setedUp", function () {
    var scrollBar = qrFolder.createElement("qr-slidery");
    this.append(scrollBar);
    scrollBar.linkElement(rootFolder.body);
  });
  rootFolder.addEventListener("resize", function () {
    rootFolder.body.updateScroll();
  });
  var recordPages = qrFolder.lastCall(() => {
        localStorage.setItem("page-mapper", JSON.stringify(pageMapper.values()));
        localStorage.setItem("page-order", JSON.stringify(pageOrder.props()));
        navBar.updateScroll();
      }, 0);
  var updatePage = (page, location) => {
    page.href = location;
    page.firstChild.innerText = qrFolder.baseName(location);
    if (page.classList.contains("active")) rootFolder.selectFile(page.fnum, location);
    navBar.dispatchEvent(new CustomEvent("pageUpdate", {
      detail: page
    }));
  };
  var createPage = (location, fnum) => {
    var page = qrFolder.createElement("a", {
      class: "qr-page",
      draggable: true
    }), pageText = qrFolder.createElement("span", {
      class: "page-text"
    }), delIcon = qrFolder.createElement("span", {
      class: "del-icon"
    });
    page.fnum = fnum;
    page.getContents = function () {
      return qrFolder.getContents(this.getAttribute("href"));
    };
    page.putContents = function (contents) {
      return qrFolder.putContents(this.getAttribute("href"), contents);
    };
    page.append(pageText, delIcon);
    updatePage(page, location);
    pageGallery.set(fnum, page);
    return page;
  }
  var getPage = (location, fnum) => {
    var page = pageGallery.get(fnum);
    if (!page) return createPage(location, fnum);
    if (page.getAttribute("href") !== location) {
      updatePage(page, location);
    }
    return page;
  };
  var openPage = (file) => {
    var location = file.getAttribute("href"), fnum = file.fnum;
    if (!pageMapper.getValue(location)) {
      var currentPage = pageOrder.entries[0]?.[1],
          location2 = currentPage?.getAttribute("href"),
          unpinedPage = navBar.querySelector(".unpined");
      pageMapper.after(location2, location, fnum);
      if (unpinedPage) closePage(unpinedPage, false);
      navBar.refresh();
      pageGallery.get(fnum).classList.add("unpined");
    }
    var fileRef = pageOrder.entries[0],
        prevPage = fileRef?.[1],
        prevFnum = fileRef?.[0];
    if (prevFnum !== fnum) {
      var currentPage = pageGallery.get(fnum);
      if (prevPage) prevPage.classList.remove("active");
      currentPage.classList.add("active");
      currentPage.scrollIntoView();
      pageOrder.prepend(fnum, currentPage);
      recordPages();
      rootFolder.selectFile(fnum, location);
      navBar.dispatchEvent(new CustomEvent("pageOpen", {
        detail: currentPage
      }));
    } else if (prevPage && !prevPage.classList.contains("active")) {
      prevPage.classList.add("active");
      rootFolder.selectFile(fnum, location);
      navBar.dispatchEvent(new CustomEvent("pageOpen", {
        detail: prevPage
      }));
    }
  };
  var closePage = (page, toOpen=true) => {
    var currentPage = pageOrder.entries[0][1];
    if (page === currentPage) {
      page.classList.remove("active");
    }
    var location = page.getAttribute("href"), fileRef;
    pageMapper.deleteProp(location);
    pageOrder.deleteValue(page);
    if ((fileRef = pageOrder.entries[0]) && toOpen) {
      openPage(fileRef[1]);
    }
    navBar.refresh();
    navBar.dispatchEvent(new CustomEvent("pageClose", {
      detail: page
    }));
  };
  navBar.addEventListener("pointerdown", function (event) {
    var target = event.target, page;
    if (target.classList.contains("del-icon")) {
      event.preventDefault();
    } else {
      page = target.closest(".qr-page");
      if (page) {
        openPage(page);
      }
    }
  });
  navBar.addEventListener("click", function (event) {
    event.preventDefault();
    var target = event.target,
        page = target.parentNode;
    if (target.classList.contains("del-icon")) {
      closePage(page);
    }
  });
  var canHighlight = (page) => {
    var draggedOnPage = pageOrder.entries?.[0][1];
    if (page && draggedOnPage && page !== draggedOnPage
        && !page.classList.contains("draggedOn")) {
      return true;
    } else return false;
  };
  navBar.addEventListener("dragstart", event => {
    navBar.pageDragged = event.target;
  });
  navBar.addEventListener("dragend", () => {
    navBar.pageDragged = null;
    var pageUnderDrag;
    while (pageUnderDrag = navBar.querySelector(".draggedOn")) {
      pageUnderDrag.classList.remove("draggedOn");
    }
  });
  navBar.addEventListener("dragenter", event => {
    if (!navBar.pageDragged) return;
    var target = event.target;
    page = target.closest(".qr-page")
    if (canHighlight(page)) {
      page.classList.add("draggedOn");
    }
  });
  navBar.addEventListener("dragleave", event => {
    if (!navBar.pageDragged) return;
    var target = event.target,
        relatedTarget = event.relatedTarget;
    if (relatedTarget?.closest(".qr-page") !== target.closest(".qr-page")) {
      target.classList.remove("draggedOn");
    }
  });
  navBar.addEventListener("drop", event => {
    if (!navBar.pageDragged) return;
    var target = event.target;
    page = target.closest(".qr-page");
    if (page && page.classList.contains("draggedOn")) {
      page.classList.remove("draggedOn");
      var currentPage = navBar.querySelector(".active"),
          locationA = page.getAttribute("href"),
          locationB = currentPage.getAttribute("href"),
          indexA = pageMapper.propIndexOf(locationA),
          indexB = pageMapper.propIndexOf(locationB);
      if (indexA < indexB) {
        pageMapper.before(locationA, locationB, currentPage.fnum);
      } else {
        pageMapper.after(locationA, locationB, currentPage.fnum);
      }
      navBar.refresh();
      getActivePage().scrollIntoView();
    }
  });
  navBar.addEventListener("dragover", event => {
    if (!navBar.pageDragged) return;
    event.preventDefault();
  });
  navBar.refresh = () => {
    var items = pageMapper.entries;
    var pages = navBar.children, pagesToRemove = [];
    for (let i = 0;; i++) {
      if (i < items.length && i < pages.length) {
        var page = getPage(items[i][0], items[i][1]);
        if (pages[i] !== page) {
          pages[i].before(page);
        }
      } else if (i < items.length) {
        navBar.append(getPage(items[i][0], items[i][1]));
      } else if (i < pages.length) {
        pagesToRemove.push(pages[i]);
      } else {
        for (let i = 0; i < pagesToRemove.length; i++) {
          pagesToRemove[i].remove();
        }
        break;
      }
    }
    recordPages();
  };
  var getActivePage = () => pageOrder.entries[0]?.[1];
  var openFile = (file) => {
        var fnum = file.fnum, fileRef = pageOrder.entries[0];
        if (!fileRef || fileRef[0] !== fnum) openPage(file);
      }, lastPageRefresh = qrFolder.lastCall(() => {
        var activePage = getActivePage()
        navBar.refresh();
        if (activePage) {
          openPage(activePage);
        }
      }, 5);
  rootFolder.addEventListener("fileselected", function (e) {
    openFile(e.detail.fileElem);
  });
  rootFolder.addEventListener("filerenamed", function (e) {
    var {fileElem, oldHref, newHref} = e.detail,
        fnum = fileElem.fnum, page = pageGallery.get(fnum);
    if (navBar.contains(page)) {
      pageMapper.setProp(fnum, newHref);
      lastPageRefresh();
    }
  });
  rootFolder.addEventListener("filedeleted", function (e) {
    var fileElem = e.detail.fileElem, fnum = fileElem.fnum,
        page = pageGallery.get(fnum);
    if (navBar.contains(page)) {
      pageMapper.deleteValue(fnum);
      pageOrder.deleteProp(fnum);
      navBar.dispatchEvent(new CustomEvent("pageDelete", {detail: page}));
      lastPageRefresh();
    }
  });
  rootFolder.addEventListener("folderdeleted", function (e) {
    var fileElem = e.detail.fileElem, location = fileElem.src, fnum, page;
    for (let fpath of pageMapper.props()) {
      if (fpath.indexOf(location) === 0) {
        fnum = pageMapper.getValue(fpath);
        page = pageGallery.get(fnum);
        if (navBar.contains(page)) {
          pageMapper.deleteValue(fnum);
          pageOrder.deleteProp(fnum);
          navBar.dispatchEvent(new CustomEvent("pageDelete", {detail: page}));
          lastPageRefresh();
        }
      }
    }
  });
  rootFolder.addEventListener("filechanged", function (e) {
    var fileElem = e.detail.fileElem, fnum = fileElem.fnum,
    page = pageGallery.get(fnum);
    if (getActivePage() === page) {
      navBar.dispatchEvent(new CustomEvent("pageEdit", {detail: page}));
    }
  });
  !async function () {
    try {
      var pageOrderProps = JSON.parse(localStorage.getItem("page-order")),
          pageMapperValues = JSON.parse(localStorage.getItem("page-mapper"));
      if (pageOrderProps.length === pageMapperValues.length) {
        for (let i = 0; i < pageOrderProps.length; i++) {
          var response = await rootFolder.getFileLocationByFnum(pageMapperValues[i]);
          if (response !== "-1") {
            pageMapper.append(response, pageMapperValues[i]);
          }
        }
        navBar.refresh();
        for (let i = 0, fnum, page; i < pageOrderProps.length; i++) {
          fnum = pageOrderProps[i];
          page = pageGallery.get(fnum);
          if (page) {
            pageOrder.append(fnum, page);
          }
        }
        var fileRef = pageOrder.entries[0];
        if (fileRef) openPage(fileRef[1]);
      }
    } catch (error) {console.log(error)}
  }();
  var pinPage = () => {
        var unpinedPage = navBar.querySelector(".unpined");
        if (unpinedPage === getActivePage()) 
          unpinedPage.classList.remove("unpined");
      }
  navBar.getActivePage = getActivePage;
  navBar.pinPage = pinPage;
}();
!function () {
  Object.assign(CodeMirror.defaults, {
    styleActiveLine: true,
    lineNumbers: true,
    lineWrapping: true,
    gutters: ["breakpoints", "CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    autoCloseBrackets: true,
    matchTags: {bothTags: true},
    matchBrackets: true,
    foldGutter: true,
    scrollbarStyle: "overlay",
    undoDepth: 1000,
    historyEventDelay: 2000,
    dragDrop: false,
    resetSelectionOnContextMenu: false,
    workTime: 250, 
    workDelay: 250,
    maxHighlightLength: Infinity,
    extraKeys: {
      "Ctrl-J": "toMatchingTag",
      "F11": function(cm) {
        cm.setOption("fullScreen", !cm.getOption("fullScreen"));
        if (cm.getOption("fullScreen"))
          window.content.style.zIndex = "1";
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
  });
  CodeMirror.defineMode("mustache", function(config, parserConfig) {
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
    return CodeMirror.overlayMode(
      CodeMirror.getMode(config, parserConfig.backdrop || "application/x-httpd-php"), 
      mustacheOverlay
    );
  });
  function getMimetype(a) {
    var val = a, m, mode, spec, ext;
    if (m = /.+\.([^.]+)$/.exec(val)) {
      ext = m[1].toLowerCase();
      if (ext === "njs" || ext === "nts") ext = "js";
      var info = window.CodeMirror.findModeByExtension(ext);
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
  var navBar = window.navBar;
  var codeWrapper = window.codeWrapper;
  var editorQueue = new qrFolder.Queue;
  var editorGallery = new Map,
      getEditor = (page) => {
        var editor = editorGallery.get(page);
        if (!editor) {
          page.getContents().then(response => {
            var readOnly = (response === "�f�f�f�d�") ? "nocursor" : false;
            if (readOnly) response = "[Binary Data] not supported for edit."
            var cm = CodeMirror(function(elt) {
                  editorGallery.set(page, elt);
                  editorQueue.resolve(elt);
                }, {
                  value: response,
                  mode:  getMimetype(page.getAttribute("href")),
                  theme: window.panel.firstElementChild.theme,
                  readOnly
                });
            var left, top, curserPos;
            cm.on("change", () => {
              navBar.pinPage();
              var doc = cm.doc;
              if (doc.isClean(doc.generation)) {
                page.classList.remove("unsaved");
              } else {
                page.classList.add("unsaved");
              }
              if (top !== undefined) {
                cm.setCursor(curserPos)
                cm.scrollTo(left, top);
                top = left = curserPos = undefined;
              }
            });
            cm.on("beforeChange", (cm, event) => {
              if ((event.from.line === 0 && event.from.ch === 0) && 
              (event.origin === "undo" || event.origin === "redo")) {
                curserPos = cm.doc.getCursor(),
                left = cm.getScrollInfo().left;
                top  = cm.getScrollInfo().top;
              }
            });
          }).catch(error => console.log(error));
        } else {
          editorQueue.resolve(editor);
        }
        return editorQueue;
      };
  var getActiveEditor = () => codeWrapper.firstElementChild?.CodeMirror;
  codeWrapper.getActiveEditor = getActiveEditor;
  navBar.addEventListener("pageUpdate", event => {
    var page = event.detail;
        editor = editorGallery.get(page);
    if (editor) {
      editor.CodeMirror.setOption("mode", getMimetype(page.getAttribute("href")));
    }
  });
  navBar.addEventListener("pageOpen", event => {
    var page = event.detail;
    codeWrapper.innerHTML = "";
    getEditor(page).then((editorElem) => {
      var theme = window.panel.firstElementChild.theme,
          editor = editorElem.CodeMirror,
          theme2 = editor.getOption("theme");
      if (theme !== theme2) editor.setOption("theme", theme);
      codeWrapper.append(editorElem);
      updateEditor(page);
      editor.refresh();
      if (!sideNav.contains(document.activeElement))
        editor.focus();
    });
  });
  navBar.addEventListener("pageClose", event => {
    if (!navBar.getActivePage()) codeWrapper.innerHTML = "";
  });
  navBar.addEventListener("pageDelete", event => {
    var editorElem = editorGallery.get(event.detail);
    if (editorElem && codeWrapper.contains(editorElem)) editorElem.remove(); 
  });
  var edited = false;
  var updateEditor = (page) => {
    if (edited) return;
    var editorElem = editorGallery.get(page),
        activeEditor = getActiveEditor(), doc;
    if (editorElem.CodeMirror === activeEditor) {
      doc = activeEditor.doc;
      if (!doc.isClean(doc.generation)) return;
      page.getContents(true).then(response => {
        if (activeEditor.getOption("readOnly") === "nocursor") return;
        if (response === doc.getValue()) return;
        if (response === doc.getValue("\r\n")) return;
        var curserPos = doc.getCursor(),
            {left , top} = activeEditor.getScrollInfo();
        doc.setValue(response);
        doc.setCursor(curserPos);
        activeEditor.scrollTo(left, top);
        doc.generation = doc.changeGeneration();
        page.classList.remove("unsaved");
          codeWrapper.dispatchEvent(new CustomEvent("pageSave"));
      }).catch(error => console.log(error));
    }
  };
  navBar.addEventListener("pageEdit", event => {
    updateEditor(event.detail);
  });
  navBar.addEventListener("pointerdown", event => {
    var editor = getActiveEditor();
    if (editor) setTimeout(() => {
      editor.focus();
    });
  });
  var putContents = (passive) => {
    var page = navBar.getActivePage();
    if (page) {
      var doc = getActiveEditor().doc;
      if (!passive) edited = true;
      qrFolder.putContents(
        page.getAttribute("href"),
        getActiveEditor().doc.getValue()
      ).then(() => {
        doc.generation = doc.changeGeneration();
        page.classList.remove("unsaved");
        codeWrapper.dispatchEvent(new CustomEvent("pageSave"));
        if (!passive) setTimeout(() => {edited = false}, 50);
      }).catch(error => console.log(error));
      navBar.pinPage();
    }
  };
  var openPageInTap = () => {
    var page = navBar.getActivePage();
    if (page) {
      window.open(page.href);
    }
  }
  window.addEventListener("keydown", function (e) {
    if (e.ctrlKey) {
      var cmd = e.key.toLowerCase();
      if ("srqko".indexOf(cmd) !== -1) {
        e.preventDefault();
        if (cmd === "s") putContents();
        if (cmd === "q") openPageInTap();
      }
    }
  });
}();
!function () {
  var codeWrapper = window.codeWrapper,
      frameWrapper = window.frameWrapper,
      urlBar = window.searchBar.firstElementChild,
      lock = urlBar.nextElementSibling,
      navBar = window.navBar,
      frameGallery = new Map;
  var createFrame = (page) => {
        var iframe = document.createElement("iframe");
        iframe.addEventListener("load", () => {
          var wd = iframe.contentWindow;
          if (wd.location != "about:blank") {
            wd.addEventListener("scroll", (e) => {
              if (iframe.cancelScroll) return;
              iframe.xScroll = wd.scrollX;
              iframe.yScroll = wd.scrollY;
            });
            wd.addEventListener("keydown", function (e) {
              if (e.ctrlKey) {
                var cmd = e.key.toLowerCase();
                if ("srqko".indexOf(cmd) !== -1) {
                  e.preventDefault();
                }
              }
            });
          }
          localStorage.setItem("bugOn", "false");
          wd.scrollTo(iframe.xScroll, iframe.yScroll);
        });
        frameGallery.set(page, iframe)
        return iframe;
      }
  var getFrame = (page) => {
        var frame = frameGallery.get(page);
        if (!frame) {
          return createFrame(page);
        }
        return frame;
      }
  var activeFrame = null, bugOn = localStorage.getItem("bugOn");
  var updateFrame = (page) => {
        var frame = getFrame(page), location = folderOrigin + page.getAttribute("href");
        if (frame === activeFrame) {
          if (bugOn !== "true") {
            var extention = qrFolder.getExtention(location);
            if (!extention || "zip,exe".indexOf(qrFolder.getExtention(location)) === -1)
              frame.src = location;
            else frame.src = "";
          } else bugOn = false;
          localStorage.setItem("bugOn", "true");
          urlBar.value = location;
        }
      }
  var openFrame = (page) => {
        if (!page) {
          frameWrapper.innerHTML = "";
          urlBar.value = "";
          return;
        }
        if (lock.locked && activeFrame) {
        } else {
          var frame = getFrame(page), location = folderOrigin + page.getAttribute("href");
          if (frame !== activeFrame) {
            if (activeFrame) {
              activeFrame.xScroll = activeFrame.contentWindow?.scrollX;
              activeFrame.yScroll = activeFrame.contentWindow?.scrollY;
              activeFrame.cancelScroll = true;
              setTimeout(() => {activeFrame && (activeFrame.cancelScroll = false)});
              activeFrame.hidden = true;
            }
            frame.hidden = false;
            activeFrame = frame;
            if (!frameWrapper.contains(frame)) {
              frameWrapper.append(frame);
            }
            if (!frame.src) {
              updateFrame(page);
            } else {
              frame.contentWindow.scrollTo(frame.xScroll, frame.yScroll);
              urlBar.value = location;
            }
          }
        }
      }
  var closeFrame = (page) => {
        var frame = frameGallery.get(page);
        if (frame) {
          if (lock.locked && frame === activeFrame) {
          } else if (frameWrapper.contains(frame)) {
            frame.remove();
          }
        }
        if (!navBar.getActivePage()) {
          activeFrame = null;
          openFrame(null);
        }
      }
  navBar.addEventListener("pageUpdate", event => {
    updateFrame(event.detail);
  });
  navBar.addEventListener("pageOpen", event => {
    openFrame(event.detail);
  });
  navBar.addEventListener("pageClose", event => {
    closeFrame(event.detail);
  });
  navBar.addEventListener("pageDelete", event => {
    closeFrame(event.detail);
  });
  codeWrapper.addEventListener("pageSave", () => {
    if (activeFrame) updateFrame(navBar.getActivePage());
  });
  lock.addEventListener("unlock", () => {
    openFrame(navBar.getActivePage());
  });
}();
});