Queue = class {
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
var firstCall = (func, delay) => {
  if (delay === undefined) {
    var queue = new Queue(function (a) {
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
};
var lastCall = (func, delay) => {
  if (delay === undefined) {
    var queue = new Queue(function (a) {
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
};
var syncCall = (func) => {
  var queue = new Queue,
  rtn = new Queue(() => queue.resolve());
  return async function () {
    await queue;
    func(...arguments, rtn);
    return rtn;
  }
};
var asyncCall = (a, b, delay) => {
  var func = lastCall(b, delay);
  return function () {
    a(...arguments, func);
  }
}
exports.Queue = Queue;
exports.firstCall = firstCall;
exports.lastCall = lastCall;
exports.syncCall = syncCall;
exports.asyncCall = asyncCall;
/*___________________________________________________________________ */
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
Object.defineProperty(Object.prototype, "var_dump", {value: function () {
  if (typeof this === "string") {
    if (this === "") return "string" + "(" + "\"\"" + ")";
    if (this.search(/\S/) === -1)
    return "string" + "(" + this.replace(/\n/g, "\\n").replace(/ /g, "_").replace(/\t/g, "\\t") + ")";
  }
  if (Array.isArray(this)) {
    if (this.length === 0) return "array" + "(" + "[]" + ")";
    return "array" + "(" + JSON.stringify(this) + ")";
  }
  return typeof this + "(" + JSON.stringify(this) + ")";
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