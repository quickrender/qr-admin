function var_dump(e) {
  if (typeof e === "string") {
    if (e === "") return "string" + "(" + "\"\"" + ")";
    var pattern = /\S/; //  /[^s]/  /[^ |\n|\t|\f|\r|\v]/
    if (e.search(pattern) === -1)
    return "string" + "(" + e.replace(/\n/g, "\\n").replace(/ /g, "_").replace(/\t/g, "\\t") + ")";
  }
  if (Array.isArray(e)) {
    if (e.length === 0) return "array" + "(" + "[]" + ")";
    return "array" + "(" + JSON.stringify(e) + ")";
  }
  return typeof e + "(" + JSON.stringify(e) + ")";
}
async function $fetch(e) {
  var xmlhttp = new XMLHttpRequest(),
  Obj =  {then: function (a) {
    Obj.state = a;
  }};
  xmlhttp.onload = function () {
    Obj.state(this);
  }
  xmlhttp.open("GET", e);
  xmlhttp.send();
  return Obj;
}
(function (window) {
  window.htmlentities = {
    /**
     * Converts a string to its html characters completely.
     *
     * @param {String} str String with unescaped HTML characters
     **/
    encode : function (str) {
      var buf = [];
      for (var i=str.length-1;i>=0;i--) {
        buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
      }
      return buf.join('');
    },
    /**
     * Converts an html characterSet into its original character.
     *
     * @param {String} str htmlSet entities
     **/
    decode : function (str) {
      return str.replace(/&#(\d+);/g, function (match, dec) {
        return String.fromCharCode(dec);
      });
    }
  };
})(window);
Object.defineProperty(Object.prototype, "show", {value: function (f=1) {
  return Object.$entries(this, "<hr>", true, f);
}});
Object.getEntries = function(e) {
  return Object.getOwnPropertyNames(e).map(function(a) {
    return [a, e[a]]
  });
}
Object.defineProperty(Object.prototype, "$forEach", {value: function(e) {
  var c = this, b = 0;
  for (let d in c) {
    e(c[d],b,c,d);
    b++;
  }
}});
Object.defineProperty(Array.prototype, "$forEach", {value: function (f) {
  for (let i = 0; i < this.length; i++) f(this[i],i,this)
}});
JSON.$stringify = function(e, f=1, g = 0) {
  var counter = g; counter++;
  if (typeof e === "string" || typeof e === "number"
  || typeof e === "boolean" || typeof e === "function"
  || e instanceof Date)
  return e.toString();
  if (e === null) return "null";
  if (e === undefined) return "undefined";
  if (counter < f) {
    if (Array.isArray(e)) {
      var text = "[";
      e.$forEach(function(a,b,c) {
        text += ((b === 0) ? "" : ",") + JSON.$stringify(a, f, counter);
      });
      text += "]";
      return text;
    } else {
      var text = "{";
      if (e.$forEach) {
        e.$forEach(function(a,b,c,d) {
          text += ((b === 0) ? "" : ",") + d + ":" + JSON.$stringify(a, f, counter);
        });
      } else {
        if (typeof e === "object" && e !== null && !e.toString) {
          Object.prototype.$forEach.call(e, function(a,b,c,d) {
            text += ((b === 0) ? "" : ",") + d + ":" + JSON.$stringify(a, f, counter);
          });
        } else {
          text += JSON.$stringify(e, f, counter);
        }
      }
      text += "}";
      return text;
    }
  } else {
    if (Array.isArray(e)) {
      var text = "[";
      e.$forEach(function(a,b,c) {
        if (typeof a === "object" && a !== null && !a.toString || Array.isArray(a)) {
          text += ((b === 0) ? "" : ",") + Object.prototype.toString.call(a);
        } else { 
          text += ((b === 0) ? "" : ",") + a;
        }
      });
      text += "]";
      return text;
    } else {
      var text = "{";
      if (e.$forEach) {
        e.$forEach(function(a,b,c,d) {
          if ((typeof a === "object" && a !== null && !a.toString) || Array.isArray(a)) {
            text += ((b === 0) ? "" : ",") + d + ":" + Object.prototype.toString.call(a);
          } else {
            text += ((b === 0) ? "" : ",") + d + ":" + a;
          }
        });
      } else {
        if (typeof e === "object" && e !== null && !e.toString) { 
          Object.prototype.$forEach.call(e, function(a,b,c,d) {
            if ((typeof a === "object" && a !== null && !a.toString) || Array.isArray(a)) {
              text += ((b === 0) ? "" : ",") + d + ":" + Object.prototype.toString.call(a);
            } else {
              text += ((b === 0) ? "" : ",") + d + ":" + a;
            }
          });
        } else {
          text += e;
        }
      }
      text += "}";
      return text;
    }
  }
}
Object.defineProperty(Array.prototype, "split", {value: function (e, f, g=0, h=false) {
  var text = "", txt = "", counter = g; counter++;
  if (counter === 3) return JSON.$stringify(this, h);
  for (let i = 0; i < this.length; i++) {
    if (Array.isArray(this[i])) {
      txt = this[i].split(" = ", null, counter, h);  
    } else {
      if (typeof this[i] === "function") txt = this[i].toString();
      else txt = JSON.$stringify(this[i], h);
    }
    if (counter === 1) {
      if (f) text += ((i === 0) ? "" : e) + i + ". " + txt;
      else text += ((i === 0) ? "" : e) + txt;
    } else {
      if (f) text += ((i === 0) ? "" : (i % 2 === 0) ? "<br>" : e) + i + ". " + txt;
      else text += ((i === 0) ? "" : (i % 2 === 0) ? "<br>" : e) + txt;
    }
  }
  return text;
}});
Object.$entries = function (e) {
  let txt = [], text = [], len = Infinity, i = 0;
  if (arguments[2]) {len = arguments[2]}
  for (let x in e) {
    i++;
    try {
      //if (!(typeof e[x] === "object" && e[x] !== null && !e[x].toString)) {
        txt.push(x);
        txt.push(e[x]);
        text.push(txt);
        txt = [];
      //}
    } catch (e) {
      console.log(e);
    }
  }
  if (arguments[1]) { 
    if (arguments[2]) {
      if (arguments[3]) return text.split(arguments[1], arguments[2], undefined, arguments[3]);
      return text.split(arguments[1], arguments[2]);
    } else {
      if (arguments[3]) return text.split(arguments[1], null, undefined, arguments[3]);
      return text.split(arguments[1]);
    }  
  } else {
    return text;
  }
}
class Efg {
  constructor(e, f) {
    if (typeof e === "string") {
      if (e.indexOf("<") === -1) {
        this.target = document.querySelectorAll(e);
        if (this.target.length === 1)
        this.target = this.target[0];
      } else {
        var parser = new DOMParser();
        var doc = parser.parseFromString(e, "text/html");
        this.target = doc.body.childNodes;
      }
    } else if (e instanceof Efg) {
      this.target = e.target;
    } else {
      this.target = e;
    }
    var type = this.target.toString().slice(8, -1);
    if (Array.isArray(this.target))
    this.targetArr = this.target;
    else if (type === "HTMLCollection" || type === "NodeList")
    this.targetArr = Array.from(this.target)
    else
    this.targetArr = Array.of(this.target);
    this.$ = f;
  }
  ready(e) {
    this.targetArr.forEach((a) => {
      a.addEventListener("load", e.bind(a, this.$));
    });
    return this.$(this.target);
  }
  hide() {
    this.targetArr.forEach(function(a) {
      a.style.display = "none";
    });
    return this.$(this.target);
  }
  toggle(e=0) {
    if (typeof e !== "boolean") {
      this.targetArr.forEach(function(a) {
        if (a.style.display !== "none") {
          var x = setInterval(function() {
            var opacity = Number(getComputedStyle(a).getPropertyValue("opacity"));
            if (opacity != 0) {
              a.style.opacity = opacity - 0.01;
            } else {
              clearInterval(x);
              a.style.display = "none";
            }
          }, e/100);
        } else {
          a.style.display = "";
          var x = setInterval(function() {
            var opacity = Number(getComputedStyle(a).getPropertyValue("opacity"));
            if (opacity != 1) {
              a.style.opacity = opacity + 0.01;
            } else {
              clearInterval(x);
            }
          }, e/100);
        }
      });
    } else {
      var Str = "";
      if (e === false)
      Str = "none";
      this.targetArr.forEach(function(a) {
        a.style.display = Str;
      });
    }
    return this.$(this.target);
  }
  on(e, f) {
    this.targetArr.forEach(function(a) {
      a.addEventListener(e, f);
    });
    return this.$(this.target);
  }
  click(e) {
    this.targetArr.forEach(function(a) {
      a.addEventListener("click", e);
    });
    return this.$(this.target);
  }
  text(e) {
    if (!e) {
      var text = "";
      this.targetArr.forEach(function(a) {
        text += a.textContent;
      });
      return text;
    } else if (typeof e === "function") {
      this.targetArr.forEach(function(a, b) {
        a.textContent = e(b, a.textContent);
      });
      return this.$(this.target);
    } else {
      this.targetArr.forEach(function(a) {
        a.textContent = e;
      });
      return this.$(this.target);
    }
  }
  html(e) {
    if (!e) {
      var text = "";
      this.targetArr.forEach(function(a, b) {
        if (b === 0)
        text += a.innerHTML;
      });
      return text;
    } else if (typeof e === "function") {
      this.targetArr.forEach(function(a, b) {
        a.innerHTML = e(b, a.innerHTML);
      });
      return this.$(this.target);
    } else {
      this.targetArr.forEach(function(a) {
        a.innerHTML = e;
      });
      return this.$(this.target);
    }
  }
  val(e) {
    if (!e) {
      var text = "";
      this.targetArr.forEach(function(a, b) {
        if (b === 0 && a.value !== undefined)
        text += a.value;
      });
      return text;
    } else if (typeof e === "function") {
      this.targetArr.forEach(function(a, b) {
        if (a.value !== undefined)
        a.value = e(b, a.value);
      })
      return this.$(this.target);
    } else {
      this.targetArr.forEach(function(a) {
        if (a.value !== undefined)
        a.value = e;
      });
      return this.$(this.target);
    }
  }
  attr(e, f) {
    if (!f) {
      var text = "";
      this.targetArr.forEach(function(a, b) {
        if (b === 0 && a.getAttribute(e))
        text += a.getAttribute(e)
      });
      return text;
    } else if (typeof f === "function") {
      this.targetArr.forEach(function(a, b) {
        a.setAttribute(e, f(b, a.getAttribute(e)));
        console.log(e);
      });
      return this.$(this.target);
    } else {
      this.targetArr.forEach(function(a) {
        a.setAttribute(e, f);
      });
      return this.$(this.target);
    }
  }
  append(...e) {
    e.forEach((x) => {
      if (x instanceof Efg) {
        var ele = document.createElement("div");
        x.targetArr.forEach(function(a) {
          ele.appendChild(a);
        });
        x = ele.innerHTML;
      }
      if (typeof x === "object") {
        this.targetArr.forEach(function(a) {
          var ele = x.cloneNode(true);
          a.insertAdjacentElement("beforeend", ele);
        });
      } else {
        this.targetArr.forEach(function(a) {
          a.insertAdjacentHTML("beforeend", x);
        });
      }
    });
    return this.$(this.target);
  }
  prepend(...e) {
    e.reverse();
    e.forEach((x) => {
      if (x instanceof Efg) {
        var ele = document.createElement("div");
        x.targetArr.forEach(function(a) {
          ele.appendChild(a);
        });
        x = ele.innerHTML;
      }
      if (typeof x === "string") {
        this.targetArr.forEach(function(a) {
          a.insertAdjacentHTML("afterbegin", x);
        });
      } else {
        this.targetArr.forEach(function(a) {
          var ele = x.cloneNode(true);
          a.insertAdjacentElement("afterbegin", ele);
        });
      }
    });
    return this.$(this.target);
  }
  after(...e) {
    e.reverse();
    e.forEach((x) => {
      if (x instanceof Efg) {
        var ele = document.createElement("div");
        x.targetArr.forEach(function(a) {
          ele.appendChild(a);
        });
        x = ele.innerHTML;
      }
      if (typeof x === "string") {
        this.targetArr.forEach(function(a) {
          a.insertAdjacentHTML("afterend", x);
        });
      } else {
        this.targetArr.forEach(function(a) {
          var ele = x.cloneNode(true);
          a.insertAdjacentElement("afterend", ele);
        });
      }
    });
    return this.$(this.target);
  }
  before(...e) {
    e.forEach((x) => {
      if (x instanceof Efg) {
        var ele = document.createElement("div");
        x.targetArr.forEach(function(a) {
          ele.appendChild(a);
        });
        x = ele.innerHTML;
      }
      if (typeof x === "string") {
        this.targetArr.forEach(function(a) {
          a.insertAdjacentHTML("beforebegin", x);
        });
      } else {
        this.targetArr.forEach(function(a) {
          var ele = x.cloneNode(true);
          a.insertAdjacentElement("beforebegin", ele);
        });
      }
    });
    return this.$(this.target);
  }
  remove(e) {
    var Arr = [];
    if (e) {
      this.targetArr.forEach(function(a) {
        if (this.$(e).targetArr.includes(a)) {
          Arr.push(a);
        }
      });
    } else {
      Arr = this.targetArr;
    }
    Arr.forEach(function(a) {
      if (a.remove)
      a.remove();
    }); 
    return this.$(this.target);
  }
  empty() {
    this.targetArr.forEach(function(a) {
      a.innerHTML = "";
    });
    return this.$(this.target)
  }
  addClass(e) {
    this.targetArr.forEach(function(a) {
      if (a.className.indexOf(e) === -1)
      a.className += " " + e;
    });
    return this.$(this.target);
  }
  removeClass(e) {
    this.targetArr.forEach(function(a) {
      if (a.className.indexOf(" " + e) !== -1) {
        a.className = a.className.replace(" " + e, "");
      } else if (a.className.indexOf(e) !== -1) {
        a.className = a.className.replace(e, "");
      }
    });
    return this.$(this.target);
  }
  toggleClass(e) {
    this.targetArr.forEach(function(a) {
      if (a.className.indexOf(e) === -1) {
        a.className += " " + e;
      } else {
        if (a.className.indexOf(" " + e) !== -1) {
          a.className = a.className.replace(" " + e, "");
        } else if (a.className.indexOf(e) !== -1) {
          a.className = a.className.replace(e, "");
        }
      }
    });
    return this.$(this.target);
  }
  css(e, f) {
    if (typeof e === "object") {
      e.forEach((x, y, z, w) => {
        this.targetArr.forEach(function(a) {
          a.style[w] = x;
        });
      });
      return this.$(this.target);
    } else if (f) {
      this.targetArr.forEach(function(a) {
        if (a.nodeType === 1)
        a.style[e] = f;
      });
      return this.$(this.target);
    } else {
      return getComputedStyle(this.targetArr[0]).getPropertyValue(e);
    }
  }
  width(e) {
    if (!e) {
      var target = getComputedStyle(this.targetArr[0]),
      width = Number(target.getPropertyValue("width").replace("px", ""));
      if (target.getPropertyValue("box-sizing") !== "border-box")
      return width;
      else {
        var offset = Number(target.getPropertyValue("padding-right").replace("px", "")) +
        Number(target.getPropertyValue("padding-left").replace("px", "")) + 
        Number(target.getPropertyValue("border-right-width").replace("px", "")) +
        Number(target.getPropertyValue("border-left-width").replace("px", ""));
        return width - offset;
      }
    } else {
      if (!isNaN(e)) {e = e + "px";}
      this.targetArr.forEach(function(a) {
        a.style.width = e;
      });
      return this.$(this.target);
    }
  }
  innerWidth() {
    var target = getComputedStyle(this.targetArr[0]),
    width = Number(target.getPropertyValue("width").replace("px", ""));
    if (target.getPropertyValue("box-sizing") !== "border-box") {
      var offset = Number(target.getPropertyValue("padding-right").replace("px", "")) +
      Number(target.getPropertyValue("padding-left").replace("px", ""));
      return width + offset;
    } else {
      var offset = Number(target.getPropertyValue("border-right-width").replace("px", "")) +
      Number(target.getPropertyValue("border-left-width").replace("px", ""));
      return width - offset;
    }
  }
  outerWidth(e) {
    var target = getComputedStyle(this.targetArr[0]),
    width = Number(target.getPropertyValue("width").replace("px", ""));
    if (target.getPropertyValue("box-sizing") !== "border-box") {
      var offset = Number(target.getPropertyValue("padding-right").replace("px", "")) +
      Number(target.getPropertyValue("padding-left").replace("px", "")) + 
      Number(target.getPropertyValue("border-right-width").replace("px", "")) +
      Number(target.getPropertyValue("border-left-width").replace("px", ""));
      if (e) {
        offset = offset + 
        Number(target.getPropertyValue("margin-right").replace("px", "")) +
        Number(target.getPropertyValue("margin-left").replace("px", ""));
      }
      return width + offset;
    } else { 
      var offset = 0
      if (e) {
        offset += Number(target.getPropertyValue("margin-right").replace("px", "")) +
        Number(target.getPropertyValue("margin-left").replace("px", ""));
      }
      return width + offset;
    }
  }
  height(e) {
    if (!e) {
      var target = getComputedStyle(this.targetArr[0]),
      width = Number(target.getPropertyValue("height").replace("px", ""));
      if (target.getPropertyValue("box-sizing") !== "border-box")
      return width;
      else {
        var offset = Number(target.getPropertyValue("padding-top").replace("px", "")) +
        Number(target.getPropertyValue("padding-bottom").replace("px", "")) + 
        Number(target.getPropertyValue("border-top-width").replace("px", "")) +
        Number(target.getPropertyValue("border-bottom-width").replace("px", ""));
        return width - offset;
      }
    } else {
      if (!isNaN(e)) {e = e + "px";}
      this.targetArr.forEach(function(a) {
        a.style.height = e;
      });
      return this.$(this.target);
    }
  }
  innerHeight() {
    var target = getComputedStyle(this.targetArr[0]),
    width = Number(target.getPropertyValue("height").replace("px", ""));
    if (target.getPropertyValue("box-sizing") !== "border-box") {
      var offset = Number(target.getPropertyValue("padding-top").replace("px", "")) +
      Number(target.getPropertyValue("padding-bottom").replace("px", ""));
      return width + offset;
    } else {
      var offset = Number(target.getPropertyValue("border-top-width").replace("px", "")) +
      Number(target.getPropertyValue("border-bottom-width").replace("px", ""));
      return width - offset;
    }
  }
  outerHeight(e) {
    var target = getComputedStyle(this.targetArr[0]),
    width = Number(target.getPropertyValue("height").replace("px", ""));
    if (target.getPropertyValue("box-sizing") !== "border-box") {
      var offset = Number(target.getPropertyValue("padding-right").replace("px", "")) +
      Number(target.getPropertyValue("padding-bottom").replace("px", "")) + 
      Number(target.getPropertyValue("border-top-width").replace("px", "")) +
      Number(target.getPropertyValue("border-bottom-width").replace("px", ""));
      if (e) {
        offset = offset + 
        Number(target.getPropertyValue("margin-top").replace("px", "")) +
        Number(target.getPropertyValue("margin-bottom").replace("px", ""));
      }
      return width + offset;
    } else { 
      var offset = 0
      if (e) {
        offset += Number(target.getPropertyValue("margin-top").replace("px", "")) +
        Number(target.getPropertyValue("margin-bottom").replace("px", ""));
      }
      return width + offset;
    }
  }
  parent() {
    var Arr = this.targetArr.map(function(a) {
      return a.parentElement;
    });
    return this.$(Arr);
  }
  parents() {
    var Arr = this.targetArr.reduce(function(a, b) {
      var eleArr = [];
      function recurse(e) {
        if (!a.includes(e)) eleArr.push(e);
        if (e.parentElement) {
          recurse(e.parentElement);
        }
      }
      if (b.parentElement)
      recurse(b.parentElement);
      return a.concat(eleArr);
    }, []);
    return this.$(Arr);
  }
  parentsUntil(e) {
    var excludes = [];
    if (e)
    excludes = this.$(e).targetArr;
    var Arr = this.targetArr.reduce(function(a, b) {
      var eleArr = [];
      function recurse(e) {
        if (!a.includes(e)) eleArr.push(e);
        if (e.parentElement && !excludes.includes(e.parentElement)) {
          recurse(e.parentElement);
        }
      }
      if (b.parentElement && !excludes.includes(b.parentElement))
      recurse(b.parentElement);
      return a.concat(eleArr);
    }, []);
    return this.$(Arr);
  }
  children(e) {
    var includes = [];
    if (e) 
    includes = this.$(e).targetArr;
    var Arr = this.targetArr.reduce(function(a, b) {
      var eleArr = [];
      Array.from(b.children).forEach(function(a) {
        if (e) {
          if (includes.includes(a)) {
            eleArr.push(a);
          }
        } else {
          eleArr.push(a);
        }
      });
      return a.concat(eleArr);
    }, []);
    return this.$(Arr)
  }
  find(e) {
    var includes = [];
    if (e)
    includes = this.$(e).targetArr;
    var Arr = this.targetArr.reduce(function(a, b) {
      var eleArr = [];
      b.querySelectorAll("*").forEach(function(x) {
        if (includes.includes(x) && !a.includes(x)) eleArr.push(x);
      });
      return a.concat(eleArr);
    }, []);
    return this.$(Arr);
  }
  siblings(e) {
    var includes = [];
    if (e)
    includes = this.$(e).targetArr;
    var Arr = this.targetArr.reduce(function(a, b) {
      var eleArr = [];
      Array.from(b.parentElement.children).forEach(function(x) {
        if (e) {
          if (includes.includes(x) && !a.includes(x) && b !== x) eleArr.push(x);
        } else
        if (!a.includes(x) && b !== x) eleArr.push(x);
      });
      return a.concat(eleArr);
    }, []);
    return this.$(Arr);
  }
  next(e) {
    var includes = [];
    if (e)
    includes = this.$(e).targetArr;
    var Arr = this.targetArr.reduce(function(a, b) {
      var eleArr = [];
      if (e) {
        if (b.nextElementSibling && includes.includes(b.nextElementSibling))
        eleArr.push(b.nextElementSibling);
      } else
      if (b.nextElementSibling)
      eleArr.push(b.nextElementSibling);
      return a.concat(eleArr);
    }, []);
    return this.$(Arr);
  }
  nextAll(e) {
    var includes = [];
    if (e)
    includes = this.$(e).targetArr;
    var Arr = this.targetArr.reduce(function(a, b) {
      var eleArr = [];
      if (e) {
        while (b = b.nextElementSibling) {
          if (!a.includes(b) && includes.includes(b))
          eleArr.push(b);
        }
      } else {
        while (b = b.nextElementSibling) {
          if (!a.includes(b))
          eleArr.push(b);
        }
      }
      return a.concat(eleArr);
    }, []);
    return this.$(Arr);
  }
  nextUntil(e) {
    var includes = [];
    if (e)
    includes = this.$(e).targetArr;
    var Arr = this.targetArr.reduce(function(a, b) {
      var eleArr = [];
      if (e) {
        while (b = b.nextElementSibling) {
          if (!a.includes(b) && includes.includes(b))
          eleArr.push(b);
        }
      } else {
        while (b = b.nextElementSibling) {
          if (!a.includes(b))
          eleArr.push(b);
        }
      }
      return a.concat(eleArr);
    }, []);
    return this.$(Arr);
  }
  first() {
    var Arr = [];
    if (this.targetArr[0])
    Arr = this.targetArr[0];
    return this.$(Arr);
  }
  last() {
    var Arr = [];
    if (this.targetArr[this.targetArr.length - 1])
    Arr = this.targetArr[this.targetArr.length - 1];
    return this.$(Arr);
  }
  eq(e) {
    var Arr = [];
    if (this.targetArr[e])
    Arr = this.targetArr[e];
    return this.$(Arr);
  }
  filter(e) {
    if (typeof e !== "function") {
      var Arr = [], includes = [];
      if (e) 
      includes = this.$(e).targetArr;
      this.targetArr.forEach(function(a) {
        if (includes.includes(a))
        Arr.push(a);
      });
      return this.$(Arr);
    } else {
      this.targetArr.forEach(function(a) {
        e.bind(a)();
      });
    }
  }
  not(e) {
    var Arr = [], excludes = [];
    if (e) 
    excludes = this.$(e).targetArr;
    this.targetArr.forEach(function(a) {
      if (!excludes.includes(a))
      Arr.push(a);
    });
    return this.$(Arr);
  }
  load(e, f, g) {
    var query = "";
    if (f && g)
    query = f;
    var Prom = new Promise((x) => {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4) {
          if (xhttp.status == 200)
          this.targetArr.forEach((a) => {
            a.innerHTML = xhttp.responseText;
          });
          x([xhttp.responseText, xhttp.status, xhttp]);
        }
      }
      xhttp.open("GET", e + "?" + query);
      xhttp.send();
    });
    var Func = arguments[arguments.length-1];
    Prom.then((e) => {
      this.targetArr.forEach(function(a) {
        Func.bind(a, ...e)();
      });
    });
    return this.$(this.target);
  }
}
$ = function(e) {return new Efg(e, arguments.callee)};
$.get = function(e, f, g) {
  var Obj;
  var query = "";
  if (f && g) {
    if (typeof f === "string")
    query = f;
    else if (typeof f === "object")
    f.forEach(function(a, b, c, d) {
      query += d + "=" + a + "&"
    });
  }
  var Prom = new Promise((x) => {
    var xhttp = new XMLHttpRequest();
    Obj = xhttp;
    xhttp.onreadystatechange = () => {
      if (xhttp.readyState == 4) {
        if (xhttp.status == 200)
        x([xhttp.responseText, xhttp.status, xhttp]);
      }
    }
    xhttp.open("GET", e + "?" + query);
    xhttp.send();
  });
  var Func = arguments[arguments.length-1];
  Prom.then((e) => {
    Func.bind(null, ...e)();
  });
  return Obj;
}
$.post = function(e, f, g) {
  var Obj;
  var query = "";
  if (f && g) {
    if (typeof f === "string")
    query = f;
    else if (typeof f === "object")
    f.forEach(function(a, b, c, d) {
      query += d + "=" + a + "&"
    });
  }
  var Prom = new Promise((x) => {
    var xhttp = new XMLHttpRequest();
    Obj = xhttp;
    xhttp.onreadystatechange = () => {
      if (xhttp.readyState == 4) {
        if (xhttp.status == 200)
        x([xhttp.responseText, xhttp.status, xhttp]);
      }
    }
    xhttp.open("POST", e);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(query);
  });
  var Func = arguments[arguments.length-1];
  Prom.then((e) => {
    Func.bind(null, ...e)();
  });
  return Obj;
}
$.noConflict = function() {
  var x = this;
  $ = undefined;
  return x;
}
