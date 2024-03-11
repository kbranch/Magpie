var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};
var _e, _t, _n, _i, _s, _o, _r, _a, _c, _h, _l, _u, __, __fn, _d, d_fn, _p, p_fn, _m, m_fn, _E, E_fn, _e2, _f, __2, __fn2, _g, g_fn, _p2, p_fn2, _e3, _e4, _N, _O, _p3, p_fn3, _E2, E_fn2, _e5, _y, _C, _v, _T, _L, _R, _A, _I, _D, D_fn, _w, w_fn, _S, S_fn, _b, b_fn, _k, _U, _P, _M;
var e, t = { exports: {} }, n = "object" == typeof Reflect ? Reflect : null, i = n && "function" == typeof n.apply ? n.apply : function(e2, t2, n2) {
  return Function.prototype.apply.call(e2, t2, n2);
};
e = n && "function" == typeof n.ownKeys ? n.ownKeys : Object.getOwnPropertySymbols ? function(e2) {
  return Object.getOwnPropertyNames(e2).concat(Object.getOwnPropertySymbols(e2));
} : function(e2) {
  return Object.getOwnPropertyNames(e2);
};
var s = Number.isNaN || function(e2) {
  return e2 != e2;
};
function o() {
  o.init.call(this);
}
t.exports = o, t.exports.once = function(e2, t2) {
  return new Promise(function(n2, i2) {
    function s2(n3) {
      e2.removeListener(t2, o2), i2(n3);
    }
    function o2() {
      "function" == typeof e2.removeListener && e2.removeListener("error", s2), n2([].slice.call(arguments));
    }
    E(e2, t2, o2, { once: true }), "error" !== t2 && function(e3, t3, n3) {
      "function" == typeof e3.on && E(e3, "error", t3, n3);
    }(e2, s2, { once: true });
  });
}, o.EventEmitter = o, o.prototype._events = void 0, o.prototype._eventsCount = 0, o.prototype._maxListeners = void 0;
var r = 10;
function a(e2) {
  if ("function" != typeof e2)
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof e2);
}
function c(e2) {
  return void 0 === e2._maxListeners ? o.defaultMaxListeners : e2._maxListeners;
}
function h(e2, t2, n2, i2) {
  var s2, o2, r2, h2;
  if (a(n2), void 0 === (o2 = e2._events) ? (o2 = e2._events = /* @__PURE__ */ Object.create(null), e2._eventsCount = 0) : (void 0 !== o2.newListener && (e2.emit("newListener", t2, n2.listener ? n2.listener : n2), o2 = e2._events), r2 = o2[t2]), void 0 === r2)
    r2 = o2[t2] = n2, ++e2._eventsCount;
  else if ("function" == typeof r2 ? r2 = o2[t2] = i2 ? [n2, r2] : [r2, n2] : i2 ? r2.unshift(n2) : r2.push(n2), (s2 = c(e2)) > 0 && r2.length > s2 && !r2.warned) {
    r2.warned = true;
    var l2 = new Error("Possible EventEmitter memory leak detected. " + r2.length + " " + String(t2) + " listeners added. Use emitter.setMaxListeners() to increase limit");
    l2.name = "MaxListenersExceededWarning", l2.emitter = e2, l2.type = t2, l2.count = r2.length, h2 = l2, console && console.warn && console.warn(h2);
  }
  return e2;
}
function l() {
  if (!this.fired)
    return this.target.removeListener(this.type, this.wrapFn), this.fired = true, 0 === arguments.length ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
}
function u(e2, t2, n2) {
  var i2 = { fired: false, wrapFn: void 0, target: e2, type: t2, listener: n2 }, s2 = l.bind(i2);
  return s2.listener = n2, i2.wrapFn = s2, s2;
}
function d(e2, t2, n2) {
  var i2 = e2._events;
  if (void 0 === i2)
    return [];
  var s2 = i2[t2];
  return void 0 === s2 ? [] : "function" == typeof s2 ? n2 ? [s2.listener || s2] : [s2] : n2 ? function(e3) {
    for (var t3 = new Array(e3.length), n3 = 0; n3 < t3.length; ++n3)
      t3[n3] = e3[n3].listener || e3[n3];
    return t3;
  }(s2) : m(s2, s2.length);
}
function p(e2) {
  var t2 = this._events;
  if (void 0 !== t2) {
    var n2 = t2[e2];
    if ("function" == typeof n2)
      return 1;
    if (void 0 !== n2)
      return n2.length;
  }
  return 0;
}
function m(e2, t2) {
  for (var n2 = new Array(t2), i2 = 0; i2 < t2; ++i2)
    n2[i2] = e2[i2];
  return n2;
}
function E(e2, t2, n2, i2) {
  if ("function" == typeof e2.on)
    i2.once ? e2.once(t2, n2) : e2.on(t2, n2);
  else {
    if ("function" != typeof e2.addEventListener)
      throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof e2);
    e2.addEventListener(t2, function s2(o2) {
      i2.once && e2.removeEventListener(t2, s2), n2(o2);
    });
  }
}
Object.defineProperty(o, "defaultMaxListeners", { enumerable: true, get: function() {
  return r;
}, set: function(e2) {
  if ("number" != typeof e2 || e2 < 0 || s(e2))
    throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + e2 + ".");
  r = e2;
} }), o.init = function() {
  void 0 !== this._events && this._events !== Object.getPrototypeOf(this)._events || (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
}, o.prototype.setMaxListeners = function(e2) {
  if ("number" != typeof e2 || e2 < 0 || s(e2))
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e2 + ".");
  return this._maxListeners = e2, this;
}, o.prototype.getMaxListeners = function() {
  return c(this);
}, o.prototype.emit = function(e2) {
  for (var t2 = [], n2 = 1; n2 < arguments.length; n2++)
    t2.push(arguments[n2]);
  var s2 = "error" === e2, o2 = this._events;
  if (void 0 !== o2)
    s2 = s2 && void 0 === o2.error;
  else if (!s2)
    return false;
  if (s2) {
    var r2;
    if (t2.length > 0 && (r2 = t2[0]), r2 instanceof Error)
      throw r2;
    var a2 = new Error("Unhandled error." + (r2 ? " (" + r2.message + ")" : ""));
    throw a2.context = r2, a2;
  }
  var c2 = o2[e2];
  if (void 0 === c2)
    return false;
  if ("function" == typeof c2)
    i(c2, this, t2);
  else {
    var h2 = c2.length, l2 = m(c2, h2);
    for (n2 = 0; n2 < h2; ++n2)
      i(l2[n2], this, t2);
  }
  return true;
}, o.prototype.addListener = function(e2, t2) {
  return h(this, e2, t2, false);
}, o.prototype.on = o.prototype.addListener, o.prototype.prependListener = function(e2, t2) {
  return h(this, e2, t2, true);
}, o.prototype.once = function(e2, t2) {
  return a(t2), this.on(e2, u(this, e2, t2)), this;
}, o.prototype.prependOnceListener = function(e2, t2) {
  return a(t2), this.prependListener(e2, u(this, e2, t2)), this;
}, o.prototype.removeListener = function(e2, t2) {
  var n2, i2, s2, o2, r2;
  if (a(t2), void 0 === (i2 = this._events))
    return this;
  if (void 0 === (n2 = i2[e2]))
    return this;
  if (n2 === t2 || n2.listener === t2)
    0 == --this._eventsCount ? this._events = /* @__PURE__ */ Object.create(null) : (delete i2[e2], i2.removeListener && this.emit("removeListener", e2, n2.listener || t2));
  else if ("function" != typeof n2) {
    for (s2 = -1, o2 = n2.length - 1; o2 >= 0; o2--)
      if (n2[o2] === t2 || n2[o2].listener === t2) {
        r2 = n2[o2].listener, s2 = o2;
        break;
      }
    if (s2 < 0)
      return this;
    0 === s2 ? n2.shift() : function(e3, t3) {
      for (; t3 + 1 < e3.length; t3++)
        e3[t3] = e3[t3 + 1];
      e3.pop();
    }(n2, s2), 1 === n2.length && (i2[e2] = n2[0]), void 0 !== i2.removeListener && this.emit("removeListener", e2, r2 || t2);
  }
  return this;
}, o.prototype.off = o.prototype.removeListener, o.prototype.removeAllListeners = function(e2) {
  var t2, n2, i2;
  if (void 0 === (n2 = this._events))
    return this;
  if (void 0 === n2.removeListener)
    return 0 === arguments.length ? (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0) : void 0 !== n2[e2] && (0 == --this._eventsCount ? this._events = /* @__PURE__ */ Object.create(null) : delete n2[e2]), this;
  if (0 === arguments.length) {
    var s2, o2 = Object.keys(n2);
    for (i2 = 0; i2 < o2.length; ++i2)
      "removeListener" !== (s2 = o2[i2]) && this.removeAllListeners(s2);
    return this.removeAllListeners("removeListener"), this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0, this;
  }
  if ("function" == typeof (t2 = n2[e2]))
    this.removeListener(e2, t2);
  else if (void 0 !== t2)
    for (i2 = t2.length - 1; i2 >= 0; i2--)
      this.removeListener(e2, t2[i2]);
  return this;
}, o.prototype.listeners = function(e2) {
  return d(this, e2, true);
}, o.prototype.rawListeners = function(e2) {
  return d(this, e2, false);
}, o.listenerCount = function(e2, t2) {
  return "function" == typeof e2.listenerCount ? e2.listenerCount(t2) : p.call(e2, t2);
}, o.prototype.listenerCount = p, o.prototype.eventNames = function() {
  return this._eventsCount > 0 ? e(this._events) : [];
};
var _ = t.exports, f = null;
"undefined" != typeof WebSocket ? f = WebSocket : "undefined" != typeof MozWebSocket ? f = MozWebSocket : "undefined" != typeof global ? f = global.WebSocket || global.MozWebSocket : "undefined" != typeof window ? f = window.WebSocket || window.MozWebSocket : "undefined" != typeof self && (f = self.WebSocket || self.MozWebSocket);
const g = f;
let N;
const O = new Uint8Array(16);
function y() {
  if (!N && (N = "undefined" != typeof crypto && crypto.getRandomValues && crypto.getRandomValues.bind(crypto), !N))
    throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
  return N(O);
}
const C = [];
for (let e2 = 0; e2 < 256; ++e2)
  C.push((e2 + 256).toString(16).slice(1));
const v = { randomUUID: "undefined" != typeof crypto && crypto.randomUUID && crypto.randomUUID.bind(crypto) };
function T(e2, t2, n2) {
  if (v.randomUUID && !t2 && !e2)
    return v.randomUUID();
  const i2 = (e2 = e2 || {}).random || (e2.rng || y)();
  if (i2[6] = 15 & i2[6] | 64, i2[8] = 63 & i2[8] | 128, t2) {
    n2 = n2 || 0;
    for (let e3 = 0; e3 < 16; ++e3)
      t2[n2 + e3] = i2[e3];
    return t2;
  }
  return function(e3, t3 = 0) {
    return (C[e3[t3 + 0]] + C[e3[t3 + 1]] + C[e3[t3 + 2]] + C[e3[t3 + 3]] + "-" + C[e3[t3 + 4]] + C[e3[t3 + 5]] + "-" + C[e3[t3 + 6]] + C[e3[t3 + 7]] + "-" + C[e3[t3 + 8]] + C[e3[t3 + 9]] + "-" + C[e3[t3 + 10]] + C[e3[t3 + 11]] + C[e3[t3 + 12]] + C[e3[t3 + 13]] + C[e3[t3 + 14]] + C[e3[t3 + 15]]).toLowerCase();
  }(i2);
}
const L = { BOUNCED: "Bounced", CONNECTED: "Connected", CONNECTION_REFUSED: "ConnectionRefused", DATA_PACKAGE: "DataPackage", INVALID_PACKET: "InvalidPacket", LOCATION_INFO: "LocationInfo", PRINT_JSON: "PrintJSON", RECEIVED_ITEMS: "ReceivedItems", RETRIEVED: "Retrieved", ROOM_INFO: "RoomInfo", ROOM_UPDATE: "RoomUpdate", SET_REPLY: "SetReply" }, R = { BOUNCE: "Bounce", CONNECT: "Connect", CONNECT_UPDATE: "ConnectUpdate", GET_DATA_PACKAGE: "GetDataPackage", GET: "Get", LOCATION_CHECKS: "LocationChecks", LOCATION_SCOUTS: "LocationScouts", SAY: "Say", SET_NOTIFY: "SetNotify", SET: "Set", STATUS_UPDATE: "StatusUpdate", SYNC: "Sync" }, A = { DISCONNECTED: "Disconnected", CONNECTING: "Connecting", WAITING_FOR_AUTH: "Waiting For Authentication", CONNECTED: "Connected" }, I = { ITEM_SEND: "ItemSend", ITEM_CHEAT: "ItemCheat", HINT: "Hint", JOIN: "Join", PART: "Part", CHAT: "Chat", SERVER_CHAT: "ServerChat", TUTORIAL: "Tutorial", TAGS_CHANGED: "TagsChanged", COMMAND_RESULT: "CommandResult", ADMIN_COMMAND_RESULT: "AdminCommandResult", GOAL: "Goal", RELEASE: "Release", COLLECT: "Collect", COUNTDOWN: "Countdown" }, w = { DISABLED: 0, ENABLED: 1, GOAL: 2, AUTO: 6, AUTO_ENABLED: 7 }, D = { DISABLED: 0, ENABLED: 1, GOAL: 2 };
class S {
  constructor(e2) {
    __privateAdd(this, __);
    __privateAdd(this, _d);
    __privateAdd(this, _p);
    __privateAdd(this, _m);
    __privateAdd(this, _E);
    __privateAdd(this, _e, void 0);
    __privateAdd(this, _t, /* @__PURE__ */ new Map());
    __privateAdd(this, _n, /* @__PURE__ */ new Map());
    __privateAdd(this, _i, []);
    __privateAdd(this, _s, 0);
    __privateAdd(this, _o, 0);
    __privateAdd(this, _r, {});
    __privateAdd(this, _a, -1);
    __privateAdd(this, _c, -1);
    __privateAdd(this, _h, "");
    __privateAdd(this, _l, []);
    __privateAdd(this, _u, { release: w.DISABLED, collect: w.DISABLED, remaining: w.DISABLED });
    __privateSet(this, _e, e2), __privateGet(this, _e).addListener(L.DATA_PACKAGE, __privateMethod(this, _d, d_fn).bind(this)), __privateGet(this, _e).addListener(L.CONNECTED, __privateMethod(this, _p, p_fn).bind(this)), __privateGet(this, _e).addListener(L.ROOM_INFO, __privateMethod(this, _m, m_fn).bind(this)), __privateGet(this, _e).addListener(L.ROOM_UPDATE, __privateMethod(this, _E, E_fn).bind(this)), __privateGet(this, _e).addListener(L.SET_REPLY, __privateMethod(this, __, __fn).bind(this));
  }
  get package() {
    return __privateGet(this, _t);
  }
  get players() {
    return __privateGet(this, _n);
  }
  get games() {
    return __privateGet(this, _i);
  }
  get hintCost() {
    return __privateGet(this, _s);
  }
  get hintPoints() {
    return __privateGet(this, _o);
  }
  get slotData() {
    return __privateGet(this, _r);
  }
  get slot() {
    return __privateGet(this, _a);
  }
  get team() {
    return __privateGet(this, _c);
  }
  get seed() {
    return __privateGet(this, _h);
  }
  get permissions() {
    return __privateGet(this, _u);
  }
  async set(e2) {
    const t2 = e2.build();
    if (t2.want_reply)
      return new Promise((e3) => {
        __privateGet(this, _l).push({ key: t2.key, resolve: e3 }), __privateGet(this, _e).send(t2);
      });
    __privateGet(this, _e).send(t2);
  }
}
_e = new WeakMap();
_t = new WeakMap();
_n = new WeakMap();
_i = new WeakMap();
_s = new WeakMap();
_o = new WeakMap();
_r = new WeakMap();
_a = new WeakMap();
_c = new WeakMap();
_h = new WeakMap();
_l = new WeakMap();
_u = new WeakMap();
__ = new WeakSet();
__fn = function(e2) {
  const t2 = __privateGet(this, _l).findIndex((t3) => t3.key === e2.key);
  if (-1 !== t2) {
    const { resolve: n2 } = __privateGet(this, _l)[t2];
    __privateGet(this, _l).splice(t2, 1), n2(e2);
  }
};
_d = new WeakSet();
d_fn = function(e2) {
  for (const t2 in e2.data.games) {
    const n2 = e2.data.games[t2];
    __privateGet(this, _t).set(t2, n2);
    let i2 = false, s2 = false;
    n2.item_name_groups || (n2.item_name_groups = { Everything: [] }, i2 = true), n2.location_name_groups || (n2.location_name_groups = { Everywhere: [] }, s2 = true), n2.location_id_to_name = {}, n2.item_id_to_name = {};
    for (const [e3, t3] of Object.entries(n2.location_name_to_id))
      n2.location_id_to_name[t3] = e3, s2 && n2.location_name_groups.Everywhere.push(e3);
    for (const [e3, t3] of Object.entries(n2.item_name_to_id))
      n2.item_id_to_name[t3] = e3, i2 && n2.item_name_groups.Everything.push(e3);
  }
};
_p = new WeakSet();
p_fn = function(e2) {
  for (const t2 of e2.players) {
    const n2 = { ...t2, ...e2.slot_info[t2.slot] };
    __privateGet(this, _n).set(n2.slot, n2);
  }
  __privateSet(this, _a, e2.slot), __privateSet(this, _c, e2.team), __privateSet(this, _o, e2.hint_points ?? 0), __privateSet(this, _r, e2.slot_data);
};
_m = new WeakSet();
m_fn = function(e2) {
  __privateSet(this, _h, e2.seed_name), __privateSet(this, _s, e2.hint_cost), __privateSet(this, _u, e2.permissions), __privateSet(this, _i, e2.games), __privateGet(this, _e).emitRawEvent("__onRoomInfoLoaded");
};
_E = new WeakSet();
E_fn = function(e2) {
  if (e2.hint_points && __privateSet(this, _o, e2.hint_points), e2.hint_cost && __privateSet(this, _s, e2.hint_cost), e2.permissions && __privateSet(this, _u, e2.permissions), e2.players)
    for (const t2 of e2.players) {
      const e3 = __privateGet(this, _n).get(t2.slot);
      __privateGet(this, _n).set(e3.slot, { ...e3, ...t2 });
    }
};
class b {
  constructor(e2) {
    __privateAdd(this, __2);
    __privateAdd(this, _g);
    __privateAdd(this, _p2);
    __privateAdd(this, _e2, void 0);
    __privateAdd(this, _f, []);
    __privateSet(this, _e2, e2), __privateGet(this, _e2).addListener(L.SET_REPLY, __privateMethod(this, __2, __fn2).bind(this)), __privateGet(this, _e2).addListener(L.RETRIEVED, __privateMethod(this, _g, g_fn).bind(this)), __privateGet(this, _e2).addListener(L.CONNECTED, __privateMethod(this, _p2, p_fn2).bind(this));
  }
  get mine() {
    return __privateGet(this, _f);
  }
}
_e2 = new WeakMap();
_f = new WeakMap();
__2 = new WeakSet();
__fn2 = function(e2) {
  e2.key === `_read_hints_${__privateGet(this, _e2).data.team}_${__privateGet(this, _e2).data.slot}` && __privateSet(this, _f, e2.value);
};
_g = new WeakSet();
g_fn = function(e2) {
  for (const t2 in e2.keys)
    t2 === `_read_hints_${__privateGet(this, _e2).data.team}_${__privateGet(this, _e2).data.slot}` && __privateSet(this, _f, e2.keys[t2]);
};
_p2 = new WeakSet();
p_fn2 = function() {
  __privateGet(this, _e2).send({ cmd: R.SET_NOTIFY, keys: [`_read_hints_${__privateGet(this, _e2).data.team}_${__privateGet(this, _e2).data.slot}`] }, { cmd: R.GET, keys: [`_read_hints_${__privateGet(this, _e2).data.team}_${__privateGet(this, _e2).data.slot}`] });
};
class k {
  constructor(e2) {
    __privateAdd(this, _e3, void 0);
    __privateSet(this, _e3, e2);
  }
  name(e2, t2) {
    if (isNaN(t2) || !Number.isSafeInteger(t2))
      throw new Error(`'id' must be a safe integer. Received: ${t2}`);
    const n2 = __privateGet(this, _e3).data.package.get(e2);
    if (!n2)
      return `Unknown ${e2} Item: ${t2}`;
    const i2 = n2.item_id_to_name[t2];
    return i2 || `Unknown ${e2} Item: ${t2}`;
  }
  id(e2, t2) {
    const n2 = __privateGet(this, _e3).data.package.get(e2);
    if (!n2)
      throw new Error(`Unknown game: ${e2}`);
    const i2 = n2.item_name_to_id[t2];
    if (!i2)
      throw new Error(`Unknown item name: ${t2}`);
    return i2;
  }
  group(e2, t2) {
    const n2 = __privateGet(this, _e3).data.package.get(e2);
    if (!n2)
      throw new Error(`Unknown game: ${e2}`);
    const i2 = n2.item_name_groups[t2];
    return i2 || [];
  }
}
_e3 = new WeakMap();
const U = { NO_HINT: 0, HINT_EVERYTHING: 1, HINT_ONLY_NEW: 2 };
class P {
  constructor(e2) {
    __privateAdd(this, _p3);
    __privateAdd(this, _E2);
    __privateAdd(this, _e4, void 0);
    __privateAdd(this, _N, []);
    __privateAdd(this, _O, []);
    __privateSet(this, _e4, e2), __privateGet(this, _e4).addListener(L.CONNECTED, __privateMethod(this, _p3, p_fn3).bind(this)), __privateGet(this, _e4).addListener(L.ROOM_UPDATE, __privateMethod(this, _E2, E_fn2).bind(this));
  }
  get checked() {
    return __privateGet(this, _N);
  }
  get missing() {
    return __privateGet(this, _O);
  }
  check(...e2) {
    __privateGet(this, _e4).send({ cmd: R.LOCATION_CHECKS, locations: e2 });
  }
  scout(e2 = U.NO_HINT, ...t2) {
    __privateGet(this, _e4).send({ cmd: R.LOCATION_SCOUTS, locations: t2, create_as_hint: e2 });
  }
  name(e2, t2) {
    if (isNaN(t2) || !Number.isSafeInteger(t2))
      throw new Error(`'id' must be a safe integer. Received: ${t2}`);
    const n2 = __privateGet(this, _e4).data.package.get(e2);
    if (!n2)
      return `Unknown ${e2} Location: ${t2}`;
    const i2 = n2.location_id_to_name[t2];
    return i2 || `Unknown ${e2} Location: ${t2}`;
  }
  id(e2, t2) {
    const n2 = __privateGet(this, _e4).data.package.get(e2);
    if (!n2)
      throw new Error(`Unknown game: ${e2}`);
    const i2 = n2.location_name_to_id[t2];
    if (!i2)
      throw new Error(`Unknown location name: ${t2}`);
    return i2;
  }
  group(e2, t2) {
    const n2 = __privateGet(this, _e4).data.package.get(e2);
    if (!n2)
      throw new Error(`Unknown game: ${e2}`);
    const i2 = n2.location_name_groups[t2];
    return i2 || [];
  }
  autoRelease() {
    __privateGet(this, _e4).send({ cmd: R.LOCATION_CHECKS, locations: __privateGet(this, _O) });
  }
}
_e4 = new WeakMap();
_N = new WeakMap();
_O = new WeakMap();
_p3 = new WeakSet();
p_fn3 = function(e2) {
  __privateSet(this, _N, e2.checked_locations), __privateSet(this, _O, e2.missing_locations);
};
_E2 = new WeakSet();
E_fn2 = function(e2) {
  if (e2.checked_locations) {
    for (const t2 of e2.checked_locations)
      if (!__privateGet(this, _N).includes(t2)) {
        __privateGet(this, _N).push(t2);
        const e3 = __privateGet(this, _O).indexOf(t2);
        -1 !== e3 && __privateGet(this, _O).splice(e3, 1);
      }
  }
};
class M {
  constructor(e2) {
    __privateAdd(this, _e5, void 0);
    __privateSet(this, _e5, e2);
  }
  name(e2) {
    var _a2;
    if (0 === e2)
      return "Archipelago";
    const t2 = (_a2 = __privateGet(this, _e5).data.players.get(e2)) == null ? void 0 : _a2.name;
    if (!t2)
      throw new Error(`Unable to find player by id: ${e2}`);
    return t2;
  }
  alias(e2) {
    var _a2;
    if (0 === e2)
      return "Archipelago";
    const t2 = (_a2 = __privateGet(this, _e5).data.players.get(e2)) == null ? void 0 : _a2.alias;
    if (!t2)
      throw new Error(`Unable to find player by id: ${e2}`);
    return t2;
  }
  game(e2) {
    var _a2;
    if (0 === e2)
      return "Archipelago";
    const t2 = (_a2 = __privateGet(this, _e5).data.players.get(e2)) == null ? void 0 : _a2.game;
    if (!t2)
      throw new Error(`Unable to find player by id: ${e2}`);
    return t2;
  }
  members(e2) {
    var _a2;
    const t2 = (_a2 = __privateGet(this, _e5).data.players.get(e2)) == null ? void 0 : _a2.group_members;
    return t2 || [];
  }
}
_e5 = new WeakMap();
const G = { TEXT: "text", PLAYER_ID: "player_id", PLAYER_NAME: "player_name", ITEM_ID: "item_id", ITEM_NAME: "item_name", LOCATION_ID: "location_id", LOCATION_NAME: "location_name", ENTRANCE_NAME: "entrance_name", COLOR: "color" }, $ = { BOLD: "bold", UNDERLINE: "underline", BLACK: "black", RED: "red", GREEN: "green", YELLOW: "yellow", BLUE: "blue", MAGENTA: "magenta", CYAN: "cyan", WHITE: "white", BLACK_BACKGROUND: "black_bg", RED_BACKGROUND: "red_bg", GREEN_BACKGROUND: "green_bg", YELLOW_BACKGROUND: "yellow_bg", BLUE_BACKGROUND: "blue_bg", PURPLE_BACKGROUND: "purple_bg", CYAN_BACKGROUND: "cyan_bg", WHITE_BACKGROUND: "white_bg" };
class x {
  constructor() {
    __privateAdd(this, _D);
    __privateAdd(this, _w);
    __privateAdd(this, _S);
    __privateAdd(this, _b);
    __privateAdd(this, _y, void 0);
    __privateAdd(this, _C, A.DISCONNECTED);
    __privateAdd(this, _v, new _.EventEmitter());
    __privateAdd(this, _T, new S(this));
    __privateAdd(this, _L, new b(this));
    __privateAdd(this, _R, new k(this));
    __privateAdd(this, _A, new P(this));
    __privateAdd(this, _I, new M(this));
  }
  get status() {
    return __privateGet(this, _C);
  }
  get data() {
    return __privateGet(this, _T);
  }
  get hints() {
    return __privateGet(this, _L);
  }
  get items() {
    return __privateGet(this, _R);
  }
  get locations() {
    return __privateGet(this, _A);
  }
  get players() {
    return __privateGet(this, _I);
  }
  get uri() {
    if (__privateGet(this, _y))
      return __privateGet(this, _y).url;
  }
  async connect(e2) {
    if (e2.port < 1 || e2.port > 65535 || !Number.isInteger(e2.port))
      throw new Error(`Port must be an integer between 1 and 65535. Received: ${e2.port}`);
    try {
      if (__privateSet(this, _C, A.CONNECTING), "ws" === e2.protocol)
        await __privateMethod(this, _w, w_fn).call(this, `ws://${e2.hostname}:${e2.port}/`);
      else if ("wss" === e2.protocol)
        await __privateMethod(this, _w, w_fn).call(this, `wss://${e2.hostname}:${e2.port}/`);
      else
        try {
          await __privateMethod(this, _w, w_fn).call(this, `wss://${e2.hostname}:${e2.port}/`);
        } catch {
          await __privateMethod(this, _w, w_fn).call(this, `ws://${e2.hostname}:${e2.port}/`);
        }
      return await new Promise((t2, n2) => {
        const i2 = () => {
          __privateMethod(this, _D, D_fn).call(this, e2).then((e3) => {
            __privateGet(this, _v).removeListener("__onRoomInfoLoaded", i2.bind(this)), t2(e3);
          }).catch((e3) => n2(e3));
        };
        __privateGet(this, _v).addListener("__onRoomInfoLoaded", i2.bind(this));
      });
    } catch (e3) {
      throw this.disconnect(), e3;
    }
  }
  emitRawEvent(e2, ...t2) {
    __privateGet(this, _v).emit(e2, ...t2);
  }
  send(...e2) {
    var _a2;
    (_a2 = __privateGet(this, _y)) == null ? void 0 : _a2.send(JSON.stringify(e2));
  }
  say(e2) {
    this.send({ cmd: R.SAY, text: e2 });
  }
  updateStatus(e2) {
    this.send({ cmd: R.STATUS_UPDATE, status: e2 });
  }
  disconnect() {
    var _a2;
    (_a2 = __privateGet(this, _y)) == null ? void 0 : _a2.close(), __privateSet(this, _y, void 0), __privateSet(this, _C, A.DISCONNECTED), __privateGet(this, _v).removeAllListeners(), __privateSet(this, _T, new S(this)), __privateSet(this, _L, new b(this)), __privateSet(this, _R, new k(this)), __privateSet(this, _A, new P(this)), __privateSet(this, _I, new M(this));
  }
  addListener(e2, t2) {
    __privateGet(this, _v).addListener(e2, t2);
  }
  removeListener(e2, t2) {
    __privateGet(this, _v).removeListener(e2, t2);
  }
}
_y = new WeakMap();
_C = new WeakMap();
_v = new WeakMap();
_T = new WeakMap();
_L = new WeakMap();
_R = new WeakMap();
_A = new WeakMap();
_I = new WeakMap();
_D = new WeakSet();
D_fn = function(e2) {
  const t2 = e2.version ?? B;
  return new Promise((n2, i2) => {
    const s2 = (e3) => {
      __privateSet(this, _C, A.CONNECTED), this.removeListener(L.CONNECTED, s2.bind(this)), n2(e3);
    };
    this.addListener(L.CONNECTED, s2.bind(this)), this.addListener(L.CONNECTION_REFUSED, ((e3) => {
      this.disconnect(), i2(e3.errors);
    }).bind(this)), this.send({ cmd: R.GET_DATA_PACKAGE, games: __privateGet(this, _T).games }, { cmd: R.CONNECT, game: e2.game, name: e2.name, version: { ...t2, class: "Version" }, items_handling: e2.items_handling, uuid: e2.uuid ?? T(), tags: e2.tags ?? [], password: e2.password ?? "" });
  });
};
_w = new WeakSet();
w_fn = function(e2) {
  return new Promise((t2, n2) => {
    __privateSet(this, _y, new g(e2)), __privateGet(this, _y).onopen = () => {
      __privateSet(this, _C, A.WAITING_FOR_AUTH), __privateGet(this, _y) ? (__privateGet(this, _y).onmessage = __privateMethod(this, _S, S_fn).bind(this), t2()) : n2(["Socket was closed unexpectedly."]);
    }, __privateGet(this, _y).onerror = (e3) => {
      __privateSet(this, _C, A.DISCONNECTED), n2([e3]);
    };
  });
};
_S = new WeakSet();
S_fn = function(e2) {
  const t2 = JSON.parse(e2.data.toString());
  for (const e3 of t2)
    switch (__privateGet(this, _v).emit("PacketReceived", e3), e3.cmd) {
      case L.INVALID_PACKET:
        __privateGet(this, _v).emit(L.INVALID_PACKET, e3);
        break;
      case L.BOUNCED:
        __privateGet(this, _v).emit(L.BOUNCED, e3);
        break;
      case L.CONNECTION_REFUSED:
        __privateGet(this, _v).emit(L.CONNECTION_REFUSED, e3);
        break;
      case L.CONNECTED:
        __privateGet(this, _v).emit(L.CONNECTED, e3);
        break;
      case L.DATA_PACKAGE:
        __privateGet(this, _v).emit(L.DATA_PACKAGE, e3);
        break;
      case L.LOCATION_INFO:
        __privateGet(this, _v).emit(L.LOCATION_INFO, e3);
        break;
      case L.RECEIVED_ITEMS:
        __privateGet(this, _v).emit(L.RECEIVED_ITEMS, e3);
        break;
      case L.RETRIEVED:
        __privateGet(this, _v).emit(L.RETRIEVED, e3);
        break;
      case L.ROOM_INFO:
        __privateGet(this, _v).emit(L.ROOM_INFO, e3);
        break;
      case L.ROOM_UPDATE:
        __privateGet(this, _v).emit(L.ROOM_UPDATE, e3);
        break;
      case L.SET_REPLY:
        __privateGet(this, _v).emit(L.SET_REPLY, e3);
        break;
      case L.PRINT_JSON:
        __privateGet(this, _v).emit(L.PRINT_JSON, e3, __privateMethod(this, _b, b_fn).call(this, e3));
    }
};
_b = new WeakSet();
b_fn = function(e2) {
  return e2.type === I.CHAT || e2.type === I.SERVER_CHAT ? e2.message : e2.data.reduce((e3, t2) => {
    switch (t2.type) {
      case G.PLAYER_ID:
        return e3 + this.players.alias(parseInt(t2.text));
      case G.LOCATION_ID:
        return e3 + this.locations.name(this.players.game(t2.player), parseInt(t2.text));
      case G.ITEM_ID:
        return e3 + this.items.name(this.players.game(t2.player), parseInt(t2.text));
      default:
        return e3 + t2.text;
    }
  }, "");
};
const B = { major: 0, minor: 4, build: 2 };
class K {
  constructor(e2, t2, n2 = false) {
    __privateAdd(this, _k, []);
    __privateAdd(this, _U, void 0);
    __privateAdd(this, _P, void 0);
    __privateAdd(this, _M, void 0);
    __privateSet(this, _U, e2), __privateSet(this, _P, t2), __privateSet(this, _M, n2);
  }
  replace(e2) {
    return __privateGet(this, _k).push({ operation: "replace", value: e2 }), this;
  }
  default(e2) {
    return __privateGet(this, _k).push({ operation: "default", value: e2 }), this;
  }
  add(e2) {
    return __privateGet(this, _k).push({ operation: "add", value: e2 }), this;
  }
  multiply(e2) {
    return __privateGet(this, _k).push({ operation: "mul", value: e2 }), this;
  }
  power(e2) {
    return __privateGet(this, _k).push({ operation: "pow", value: e2 }), this;
  }
  modulo(e2) {
    return __privateGet(this, _k).push({ operation: "mod", value: e2 }), this;
  }
  max(e2) {
    return __privateGet(this, _k).push({ operation: "max", value: e2 }), this;
  }
  min(e2) {
    return __privateGet(this, _k).push({ operation: "min", value: e2 }), this;
  }
  and(e2) {
    return __privateGet(this, _k).push({ operation: "and", value: e2 }), this;
  }
  or(e2) {
    return __privateGet(this, _k).push({ operation: "or", value: e2 }), this;
  }
  xor(e2) {
    return __privateGet(this, _k).push({ operation: "xor", value: e2 }), this;
  }
  shiftLeft(e2) {
    return __privateGet(this, _k).push({ operation: "left_shift", value: e2 }), this;
  }
  shiftRight(e2) {
    return __privateGet(this, _k).push({ operation: "right_shift", value: e2 }), this;
  }
  remove(e2) {
    return __privateGet(this, _k).push({ operation: "remove", value: e2 }), this;
  }
  pop(e2) {
    return __privateGet(this, _k).push({ operation: "pop", value: e2 }), this;
  }
  update(e2) {
    return __privateGet(this, _k).push({ operation: "update", value: e2 }), this;
  }
  build() {
    return { cmd: R.SET, key: __privateGet(this, _U), default: __privateGet(this, _P), want_reply: __privateGet(this, _M), operations: __privateGet(this, _k) };
  }
}
_k = new WeakMap();
_U = new WeakMap();
_P = new WeakMap();
_M = new WeakMap();
const F = { UNKNOWN: 0, CONNECTED: 5, READY: 10, PLAYING: 20, GOAL: 30 }, V = { REFERENCE_CLIENT: "AP", DEATH_LINK: "DeathLink", TRACKER: "Tracker", TEXT_ONLY: "TextOnly" }, W = { INVALID_SLOT: "InvalidSlot", INVALID_GAME: "InvalidGame", INCOMPATIBLE_VERSION: "IncompatibleVersion", INVALID_PASSWORD: "InvalidPassword", INVALID_ITEMS_HANDLING: "InvalidItemsHandling" }, Y = { FILLER: 0, PROGRESSION: 1, NEVER_EXCLUDE: 2, TRAP: 4 }, H = { LOCAL_ONLY: 0, REMOTE_DIFFERENT_WORLDS: 1, REMOTE_OWN_WORLD: 2, REMOTE_STARTING_INVENTORY: 4, REMOTE_ALL: 7 }, j = { CMD: "cmd", ARGUMENTS: "arguments" }, J = { SPECTATOR: 0, PLAYER: 1, GROUP: 2 };
export {
  R as CLIENT_PACKET_TYPE,
  F as CLIENT_STATUS,
  V as COMMON_TAGS,
  W as CONNECTION_ERROR,
  A as CONNECTION_STATUS,
  U as CREATE_AS_HINT_MODE,
  x as Client,
  S as DataManager,
  b as HintManager,
  H as ITEMS_HANDLING_FLAGS,
  Y as ITEM_FLAGS,
  k as ItemsManager,
  P as LocationsManager,
  B as MINIMUM_SUPPORTED_AP_VERSION,
  j as PACKET_PROBLEM_TYPE,
  w as PERMISSION,
  I as PRINT_JSON_TYPE,
  M as PlayersManager,
  D as REDUCED_PERMISSION,
  L as SERVER_PACKET_TYPE,
  J as SLOT_TYPE,
  K as SetOperationsBuilder,
  $ as VALID_JSON_COLOR_TYPE,
  G as VALID_JSON_MESSAGE_TYPE
};
