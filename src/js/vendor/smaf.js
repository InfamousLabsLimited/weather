(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === "object" && typeof module === "object") module.exports = factory(); else if (typeof define === "function" && define.amd) define([], factory); else if (typeof exports === "object") exports["Smaf"] = factory(); else root["Smaf"] = factory();
})(this, function() {
    return function(modules) {
        var installedModules = {};
        function __webpack_require__(moduleId) {
            if (installedModules[moduleId]) return installedModules[moduleId].exports;
            var module = installedModules[moduleId] = {
                exports: {},
                id: moduleId,
                loaded: false
            };
            modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
            module.loaded = true;
            return module.exports;
        }
        __webpack_require__.m = modules;
        __webpack_require__.c = installedModules;
        __webpack_require__.p = "";
        return __webpack_require__(0);
    }([ function(module, exports, __webpack_require__) {
        module.exports = __webpack_require__(1);
    }, function(module, exports, __webpack_require__) {
        /**
	 * @license
	 * Copyright 2015 Infamous Labs
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
        "use strict";
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || false;
                    descriptor.configurable = true;
                    if ("value" in descriptor) descriptor.writable = true;
                    Object.defineProperty(target, descriptor.key, descriptor);
                }
            }
            return function(Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
            };
        }();
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            };
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }
        var _coreNotification = __webpack_require__(2);
        var _coreNotification2 = _interopRequireDefault(_coreNotification);
        var _coreBus = __webpack_require__(3);
        var _coreBus2 = _interopRequireDefault(_coreBus);
        var _coreLogger = __webpack_require__(6);
        var _coreLogger2 = _interopRequireDefault(_coreLogger);
        var _coreDevice = __webpack_require__(9);
        var _coreDevice2 = _interopRequireDefault(_coreDevice);
        var _coreRemote = __webpack_require__(10);
        var _coreRemote2 = _interopRequireDefault(_coreRemote);
        var _coreVideo = __webpack_require__(23);
        var _coreVideo2 = _interopRequireDefault(_coreVideo);
        var _coreStorage = __webpack_require__(24);
        var _coreStorage2 = _interopRequireDefault(_coreStorage);
        var _utilIsFunction = __webpack_require__(25);
        var _utilIsFunction2 = _interopRequireDefault(_utilIsFunction);
        var _config = __webpack_require__(8);
        var _config2 = _interopRequireDefault(_config);
        var _utilEach = __webpack_require__(4);
        var _utilEach2 = _interopRequireDefault(_utilEach);
        __webpack_require__(39);
        __webpack_require__(67);
        __webpack_require__(81);
        __webpack_require__(84);
        __webpack_require__(89);
        var log = new _coreLogger2["default"]("Smaf");
        var MODULES = [ "remote", "device", "platform", "storage" ];
        var Smaf = function() {
            function Smaf() {
                var _this = this;
                _classCallCheck(this, Smaf);
                this._initialized = false;
                this._debug = false;
                this._callbacks = {};
                this._scripts = [];
                this._modules = [];
                var pending = {};
                MODULES.forEach(function(item) {
                    pending[item] = true;
                });
                _coreBus2["default"].installTo(this);
                var notificationHandlers = {
                    connect: function connect(evt) {
                        log.debug("Notifications have been initialized");
                        if (_this._initialized) {
                            return;
                        }
                        var ua = window && window.navigator && window.navigator.userAgent ? window.navigator.userAgent : "";
                        _this._notification.send(JSON.stringify({
                            type: "device",
                            userAgent: ua
                        }));
                        log.debug("Sent user agent");
                    }
                };
                this.subscribe("notifications", function(evt) {
                    log.debug("Received notification event");
                    log.debug(evt);
                    var handler = notificationHandlers[evt.type];
                    if (handler) {
                        handler.call(null, evt);
                    }
                });
                log.debug("Registered notification connect handler");
                this.subscribe("module", function(evt) {
                    if (evt.action === "init") {
                        log.debug("Loading " + evt.source + " completed");
                        _this._modules.push(evt);
                        if (evt.source === "storage") {
                            _this._storage = _coreStorage2["default"];
                        }
                        delete pending[evt.source];
                        if (Object.keys(pending).length === 0) {
                            _this.publish("application", {
                                action: "init"
                            });
                            log.info("Smaf initialization completed");
                            var deviceInfo = {
                                type: "device_info",
                                info: _this._device.info()
                            };
                            _this._notification.send(JSON.stringify(deviceInfo));
                        }
                    }
                    if (evt.source === "platform" && evt.action === "script") {
                        log.debug("Scripts: " + JSON.stringify(evt));
                        _this._scripts.push(evt);
                    }
                });
                log.debug("Subscribed to module initialization events");
                this._remote = _coreRemote2["default"];
                this._device = _coreDevice2["default"];
                this._video = _coreVideo2["default"];
            }
            _createClass(Smaf, [ {
                key: "storage",
                value: function storage() {
                    return this._storage.apply(this, arguments);
                }
            }, {
                key: "video",
                value: function video() {
                    return this._video.apply(this, arguments);
                }
            }, {
                key: "init",
                value: function init(access_token) {
                    var debug = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
                    log.debug("Initializing notification");
                    this._notification = new _coreNotification2["default"](_config2["default"].notification.url + "?t=" + access_token, access_token);
                    this._debug = debug;
                    log.debug("Debug mode on?" + debug);
                    if (this._debug) {
                        _coreLogger2["default"].setLogLevel("ROOT", _coreLogger2["default"].Level.DEBUG);
                    }
                    log.debug("Initialized Smaf");
                }
            }, {
                key: "ready",
                value: function ready(fn) {
                    log.debug("Waiting for smaf to prepare");
                    _coreBus2["default"].subscribe("application", function(evt) {
                        if (evt.action === "init") {
                            log.debug("*** APPLICATION INIT CALL ***");
                            fn.call();
                        }
                    });
                    return this;
                }
            }, {
                key: "on",
                value: function on(types, item, fn) {
                    if (typeof types === "object") {
                        for (var type in types) {
                            if (types.hasOwnProperty(type)) {
                                this.on(type, item, types[type]);
                            }
                        }
                        return this;
                    }
                    if ((0, _utilIsFunction2["default"])(item)) {
                        _coreBus2["default"].subscribe(types, item);
                        return this;
                    }
                    if (typeof item === "object") {
                        _coreBus2["default"].installTo(item);
                        item.subscribe(types, fn);
                    } else {
                        _coreBus2["default"].subscribe(types, fn);
                    }
                    return this;
                }
            }, {
                key: "off",
                value: function off(types, item, fn) {
                    if (typeof types === "object") {
                        for (var type in types) {
                            if (types.hasOwnProperty(type)) {
                                this.off(type, item, types[type]);
                            }
                        }
                        return this;
                    }
                    if ((0, _utilIsFunction2["default"])(item)) {
                        _coreBus2["default"].unsubscribe(types, item);
                        return this;
                    }
                    if (typeof item === "object") {
                        if (item.unsubscribe) {
                            item.unsubscribe(types, fn);
                        }
                    } else {
                        _coreBus2["default"].unsubscribe(types, fn);
                    }
                    return this;
                }
            }, {
                key: "info",
                value: function info() {
                    return this._device.info();
                }
            }, {
                key: "scripts",
                value: function scripts() {
                    return this._scripts;
                }
            }, {
                key: "modules",
                value: function modules() {
                    return this._modules;
                }
            }, {
                key: "version",
                value: function version() {
                    return "0.1.4";
                }
            }, {
                key: "addRootAppender",
                value: function addRootAppender(appender, settings) {
                    _coreLogger2["default"].addRootAppender(appender, settings);
                }
            } ]);
            return Smaf;
        }();
        log.debug("Initializing smaf...");
        _coreLogger2["default"].setLogLevel("ROOT", "DEBUG");
        module.exports = new Smaf();
    }, function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || false;
                    descriptor.configurable = true;
                    if ("value" in descriptor) descriptor.writable = true;
                    Object.defineProperty(target, descriptor.key, descriptor);
                }
            }
            return function(Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
            };
        }();
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            };
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }
        var _bus = __webpack_require__(3);
        var _bus2 = _interopRequireDefault(_bus);
        var _logger = __webpack_require__(6);
        var _logger2 = _interopRequireDefault(_logger);
        var _utilInterval = __webpack_require__(7);
        var _utilInterval2 = _interopRequireDefault(_utilInterval);
        var config = __webpack_require__(8);
        var log = new _logger2["default"]("Notification");
        var RECONNECT_INTERVAL = 1e3;
        var TIMEOUT_INTERVAL = 2e3;
        var BACKOFF = 500;
        var BACKOFF_BASE = 2;
        var MAX_TIMEOUT = 5e3;
        var WS_CLOSE_ERROR_CODES = [];
        WS_CLOSE_ERROR_CODES[1e3] = "Normal Closure";
        WS_CLOSE_ERROR_CODES[1001] = "Going Away";
        WS_CLOSE_ERROR_CODES[1002] = "Protocol error";
        WS_CLOSE_ERROR_CODES[1003] = "Unsupported Data";
        WS_CLOSE_ERROR_CODES[1004] = "---Reserved----";
        WS_CLOSE_ERROR_CODES[1005] = "No Status Rcvd";
        WS_CLOSE_ERROR_CODES[1006] = "Abnormal Closure";
        WS_CLOSE_ERROR_CODES[1007] = "Invalid frame payload data";
        WS_CLOSE_ERROR_CODES[1008] = "Policy Violation";
        WS_CLOSE_ERROR_CODES[1009] = "Message Too Big";
        WS_CLOSE_ERROR_CODES[1010] = "Mandatory Ext.";
        WS_CLOSE_ERROR_CODES[1011] = "Internal Server Error";
        WS_CLOSE_ERROR_CODES[1015] = "TLS handshake";
        var buildWebSocket = function buildWebSocket(location) {
            if (window.WebSocket) {
                return new WebSocket(location);
            }
            return new MozWebSocket(location);
        };
        var Notifications = function() {
            function Notifications(location, token) {
                var _this = this;
                _classCallCheck(this, Notifications);
                this._attempts = 0;
                this._location = location;
                this._readyState = WebSocket.CONNECTING;
                this._timeOutInterval = TIMEOUT_INTERVAL;
                this._reconnectInterval = RECONNECT_INTERVAL;
                this._webSocket = null;
                this._forcedClose = false;
                this._session = null;
                var timedOut = false;
                var _token = token;
                this._scheduler = new _utilInterval2["default"](function() {
                    _this.send(JSON.stringify({
                        type: "ping"
                    }));
                }, config.notification.ping_interval);
                var connect = function connect(attempt) {
                    _this._webSocket = buildWebSocket(location);
                    if (!attempt) {
                        log.debug("Connecting...");
                        _this.publish("notifications", {
                            type: "connecting"
                        });
                    } else {
                        log.debug("Reconnecting...");
                        _this.publish("notifications", {
                            type: "reconnecting"
                        });
                    }
                    var ws = _this._webSocket;
                    var timeout = setTimeout(function() {
                        log.debug("Connection timeout");
                        timedOut = true;
                        ws.close();
                        timedOut = false;
                        _this._connected = false;
                    }, _this._timeOutInterval);
                    _this._webSocket.onopen = function(msg) {
                        clearTimeout(timeout);
                        _this._readyState = WebSocket.OPEN;
                        _this._isReconnect = attempt;
                        _this._connected = true;
                        _this._scheduler.start();
                        log.debug("Connected");
                        _this.send(JSON.stringify({
                            type: "connect",
                            token: _token,
                            session_id: _this._session
                        }));
                        _this.publish("notifications", {
                            type: "connect",
                            reconnectAttempts: _this._attempts
                        });
                        log.debug("Informed of connection status");
                    };
                    _this._webSocket.onclose = function(msg) {
                        clearTimeout(timeout);
                        _this._scheduler.stop();
                        _this._webSocket = null;
                        var reason = msg.reason;
                        if (reason === "" || !reason) {
                            reason = WS_CLOSE_ERROR_CODES[msg.code];
                        }
                        if (_this._forcedClose) {
                            log.debug("Closing connection");
                            _this.readyState = WebSocket.CLOSED;
                            _this.publish("notifications", {
                                type: "close",
                                reason: reason
                            });
                        } else {
                            _this.readyState = WebSocket.CONNECTING;
                            log.debug("Reconnecting due to abnormal disconnect: " + reason);
                            _this.publish("notifications", {
                                type: "reconnecting",
                                closeReason: reason,
                                closeCode: msg.code
                            });
                            setTimeout(function() {
                                _this._attempts++;
                                connect(true);
                            }, _this._reconnectInterval * Math.pow(BACKOFF_BASE, _this._attempts));
                        }
                    };
                    _this._webSocket.onmessage = function(msg) {
                        try {
                            log.debug("Received message");
                            log.debug(msg);
                            var obj = JSON && JSON.parse(msg.data) || $ && $.parseJSON(msg.data);
                            switch (obj.type) {
                              case "session":
                                _this._session = obj.session_id;
                                break;

                              default:
                                if (obj.response !== "pong") {
                                    _this.publish("notifications", obj);
                                }
                                break;
                            }
                        } catch (err) {}
                    };
                };
                connect(false);
            }
            _createClass(Notifications, [ {
                key: "send",
                value: function send(data) {
                    if (this._webSocket) {
                        return this._webSocket.send(data);
                    }
                }
            }, {
                key: "close",
                value: function close(code, reason) {
                    if (typeof code === "undefined") {
                        code = 1e3;
                    }
                    this._forcedClose = true;
                    if (this._webSocket) {
                        this._webSocket.close(code, reason);
                    }
                }
            } ]);
            return Notifications;
        }();
        _bus2["default"].installTo(Notifications.prototype);
        exports["default"] = Notifications;
        module.exports = exports["default"];
    }, function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        var _slicedToArray = function() {
            function sliceIterator(arr, i) {
                var _arr = [];
                var _n = true;
                var _d = false;
                var _e = undefined;
                try {
                    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                        _arr.push(_s.value);
                        if (i && _arr.length === i) break;
                    }
                } catch (err) {
                    _d = true;
                    _e = err;
                } finally {
                    try {
                        if (!_n && _i["return"]) _i["return"]();
                    } finally {
                        if (_d) throw _e;
                    }
                }
                return _arr;
            }
            return function(arr, i) {
                if (Array.isArray(arr)) {
                    return arr;
                } else if (Symbol.iterator in Object(arr)) {
                    return sliceIterator(arr, i);
                } else {
                    throw new TypeError("Invalid attempt to destructure non-iterable instance");
                }
            };
        }();
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            };
        }
        var _utilEach = __webpack_require__(4);
        var _utilEach2 = _interopRequireDefault(_utilEach);
        var _utilIsArray = __webpack_require__(5);
        var _utilIsArray2 = _interopRequireDefault(_utilIsArray);
        var CHANNELS = {
            application: [],
            action: [],
            remote: [],
            voice: [],
            notifications: [],
            module: []
        };
        function subscribe(channels, fn) {
            var _this = this;
            if (channels == null) {
                return false;
            }
            if (typeof channels === "object") {
                var isObject = !(0, _utilIsArray2["default"])(channels);
                (0, _utilEach2["default"])(channels, function(key, value) {
                    if (isObject) {
                        subscribe.apply(_this, [ key, value ]);
                    } else {
                        subscribe.apply(_this, [ value, fn ]);
                    }
                });
                return this;
            }
            if (!fn) {
                return false;
            }
            if (!CHANNELS[channels]) {
                return false;
            }
            CHANNELS[channels].push({
                context: this,
                callback: fn
            });
            return this;
        }
        function unsubscribe(channels, fn) {
            var _this2 = this;
            if (channels == null) {
                return false;
            }
            if (typeof channels === "object") {
                var isObject = !(0, _utilIsArray2["default"])(channels);
                (0, _utilEach2["default"])(channels, function(key, value) {
                    if (isObject) {
                        unsubscribe.apply(_this2, [ key, value ]);
                    } else {
                        unsubscribe.apply(_this2, [ value, fn ]);
                    }
                });
                return this;
            }
            if (!CHANNELS[channels]) {
                return false;
            }
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;
            try {
                for (var _iterator = CHANNELS[channels].entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _step$value = _slicedToArray(_step.value, 2);
                    var i = _step$value[0];
                    var subscription = _step$value[1];
                    if (subscription.context === this && subscription.callback === fn) {
                        CHANNELS[channels].splice(i, 1);
                        return this;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator["return"]) {
                        _iterator["return"]();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
            return false;
        }
        function publish(channels) {
            var _this3 = this;
            for (var _len = arguments.length, restArgs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                restArgs[_key - 1] = arguments[_key];
            }
            if (channels == null) {
                return false;
            }
            if (typeof channels === "object") {
                var isObject = !(0, _utilIsArray2["default"])(channels);
                (0, _utilEach2["default"])(channels, function(key, value) {
                    if (isObject) {
                        publish.apply(_this3, [ key ].concat(restArgs));
                    } else {
                        publish.apply(_this3, [ value ].concat(restArgs));
                    }
                });
                return this;
            }
            if (!CHANNELS[channels]) {
                return false;
            }
            for (var i = 0, l = CHANNELS[channels].length; i < l; i++) {
                var subscription = CHANNELS[channels][i];
                subscription.callback.apply(subscription.context, restArgs);
            }
            return this;
        }
        exports["default"] = {
            publish: publish,
            subscribe: subscribe,
            unsubscribe: unsubscribe,
            installTo: function installTo(obj) {
                if (!obj.subscribe && !obj.unsubscribe && !obj.publish) {
                    obj.subscribe = subscribe;
                    obj.unsubscribe = unsubscribe;
                    obj.publish = publish;
                }
            }
        };
        module.exports = exports["default"];
    }, function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            };
        }
        var _isArray = __webpack_require__(5);
        var _isArray2 = _interopRequireDefault(_isArray);
        var each = function each(items, callback) {
            callback = callback || function() {};
            if ((0, _isArray2["default"])(items)) {
                var l = items.length;
                for (var i = 0; i < l; i++) {
                    callback.apply(null, [ i, items[i] ]);
                }
            } else {
                for (var key in items) {
                    if (items.hasOwnProperty(key)) {
                        callback.apply(null, [ key, items[key] ]);
                    }
                }
            }
        };
        exports["default"] = each;
        module.exports = exports["default"];
    }, function(module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        var isArray = function isArray(o) {
            return o && typeof o === "object" && isFinite(o.length) && o.length >= 0 && o.length === Math.floor(o.length) && o.length < 4294967296;
        };
        exports["default"] = isArray;
        module.exports = exports["default"];
    }, function(module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || false;
                    descriptor.configurable = true;
                    if ("value" in descriptor) descriptor.writable = true;
                    Object.defineProperty(target, descriptor.key, descriptor);
                }
            }
            return function(Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
            };
        }();
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }
        var TRACE = 0, DEBUG = 1, INFO = 2, WARN = 3, ERROR = 4, FATAL = 5;
        var levels = {
            TRACE: 0,
            DEBUG: 1,
            INFO: 2,
            WARN: 3,
            ERROR: 4,
            FATAL: 5
        };
        var levelNames = [ "TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL" ];
        var log_levels = {
            ROOT: levels.ERROR
        };
        function getDateTime() {
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth() + 1;
            var day = now.getDate();
            var hour = now.getHours();
            var minute = now.getMinutes();
            var second = now.getSeconds();
            if (month.toString().length === 1) {
                month = "0" + month;
            }
            if (day.toString().length === 1) {
                day = "0" + day;
            }
            if (hour.toString().length === 1) {
                hour = "0" + hour;
            }
            if (minute.toString().length === 1) {
                minute = "0" + minute;
            }
            if (second.toString().length === 1) {
                second = "0" + second;
            }
            return year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second;
        }
        var appenders = {
            console: function(_console) {
                function console(_x) {
                    return _console.apply(this, arguments);
                }
                console.toString = function() {
                    return _console.toString();
                };
                return console;
            }(function(settings) {
                return function(data) {
                    return console.log(data.message);
                };
            }),
            formattedConsole: function formattedConsole(settings) {
                return function(data) {
                    var text = null;
                    if (data.message === null) {
                        text = "null";
                    } else if (typeof data.message === "object") {
                        text = JSON.stringify(data.message);
                    } else if (typeof data.message === "string") {
                        text = data.message;
                    }
                    console.log("[" + data.date + "] - " + data.level + " - [" + data.category + "] - " + text);
                };
            },
            ajax: function ajax(settings) {
                if (!$) {
                    return undefined;
                }
                settings = settings || {};
                return function(data) {
                    $.ajax({
                        type: settings.method || "POST",
                        url: settings.url,
                        data: {
                            data: JSON.stringify(data)
                        },
                        success: function success(response) {},
                        failure: function failure(errMsg) {
                            console.log(errMsg);
                        }
                    });
                };
            }
        };
        var ROOT_APPENDERS = [];
        var Logger = function() {
            function Logger(category) {
                var settings = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
                var appender = arguments.length <= 2 || arguments[2] === undefined ? "formattedConsole" : arguments[2];
                _classCallCheck(this, Logger);
                this.category = category;
                this._appender = appenders[appender](settings);
                log_levels[category] = settings.level;
            }
            _createClass(Logger, [ {
                key: "log",
                value: function log(level, msg) {
                    var log_level = log_levels[this.category] || log_levels.ROOT;
                    if (level < log_level) {
                        return;
                    }
                    var data = {
                        message: msg,
                        level: levelNames[level],
                        date: getDateTime(),
                        category: this.category
                    };
                    this._appender(data);
                    for (var i = 0, l = ROOT_APPENDERS.length; i < l; i++) {
                        ROOT_APPENDERS[i](data);
                    }
                }
            }, {
                key: "level",
                value: function level() {
                    if (arguments.length > 0 && typeof arguments[0] === "string" && levels[arguments[0]] !== undefined) {
                        this.minLevel = levels[arguments[0]];
                    }
                    return levelNames[this.minLevel];
                }
            }, {
                key: "appender",
                value: function appender(_appender, settings) {
                    if (appenders[_appender] === undefined) {
                        return;
                    }
                    this._appender = appenders[_appender](settings);
                }
            }, {
                key: "trace",
                value: function trace(msg) {
                    this.log(TRACE, msg);
                }
            }, {
                key: "debug",
                value: function debug(msg) {
                    this.log(DEBUG, msg);
                }
            }, {
                key: "info",
                value: function info(msg) {
                    this.log(INFO, msg);
                }
            }, {
                key: "warn",
                value: function warn(msg) {
                    this.log(WARN, msg);
                }
            }, {
                key: "error",
                value: function error(msg) {
                    this.log(ERROR, msg);
                }
            }, {
                key: "fatal",
                value: function fatal(msg) {
                    this.log(FATAL, msg);
                }
            } ], [ {
                key: "setLogLevel",
                value: function setLogLevel(category, logLevel) {
                    log_levels[category] = logLevel;
                }
            }, {
                key: "addRootAppender",
                value: function addRootAppender(appender, settings) {
                    if (appenders[appender] === undefined) {
                        return;
                    }
                    ROOT_APPENDERS.push(appenders[appender](settings));
                }
            } ]);
            return Logger;
        }();
        Logger.Level = levels;
        exports["default"] = Logger;
        module.exports = exports["default"];
    }, function(module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || false;
                    descriptor.configurable = true;
                    if ("value" in descriptor) descriptor.writable = true;
                    Object.defineProperty(target, descriptor.key, descriptor);
                }
            }
            return function(Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
            };
        }();
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }
        var Scheduler = function() {
            function Scheduler(func, delay) {
                _classCallCheck(this, Scheduler);
                this._instance = {};
                this._instance.func = func;
                this._instance.delay = delay;
                this._instance.target = delay;
                this._instance.started = false;
            }
            _createClass(Scheduler, [ {
                key: "start",
                value: function start() {
                    var instance = this._instance;
                    var tick = function tick() {
                        if (!instance.started) {
                            instance.startTime = new Date().valueOf();
                            instance.started = true;
                            instance.task = setTimeout(tick, instance.delay);
                            return instance.task;
                        } else {
                            var now = new Date().valueOf();
                            var elapsed = now - instance.startTime, adjust = instance.target - elapsed;
                            instance.func();
                            instance.target += instance.delay;
                            instance.task = setTimeout(tick, instance.delay + adjust);
                            return instance.task;
                        }
                    };
                    tick(this._instance);
                }
            }, {
                key: "stop",
                value: function stop() {
                    if (this._instance.task) {
                        clearTimeout(this._instance.task);
                        this._instance.started = false;
                        this._instance._task = null;
                    }
                }
            } ]);
            return Scheduler;
        }();
        exports["default"] = Scheduler;
        module.exports = exports["default"];
    }, function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        var notification;
        if (false) {
            notification = {
                url: process.env.DEV_WITH_PRODUCTION_BASE_URL ? "ws://www.smaf.tv/ws" : "ws://192.168.0.201:10002/ws",
                ping_interval: 3 * 60 * 1e3
            };
        }
        if (true) {
            notification = {
                url: "ws://www.smaf.tv/ws",
                ping_interval: 3 * 60 * 1e3
            };
        }
        exports["default"] = {
            notification: notification
        };
        module.exports = exports["default"];
    }, function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || false;
                    descriptor.configurable = true;
                    if ("value" in descriptor) descriptor.writable = true;
                    Object.defineProperty(target, descriptor.key, descriptor);
                }
            }
            return function(Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
            };
        }();
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            };
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }
        var _bus = __webpack_require__(3);
        var _bus2 = _interopRequireDefault(_bus);
        var _logger = __webpack_require__(6);
        var _logger2 = _interopRequireDefault(_logger);
        var _remote = __webpack_require__(10);
        var _remote2 = _interopRequireDefault(_remote);
        var _utilAddListener = __webpack_require__(11);
        var _utilAddListener2 = _interopRequireDefault(_utilAddListener);
        var log = new _logger2["default"]("Device");
        var INITIALIZERS = {
            "samsung-smarttv": __webpack_require__(12),
            "lg-webos": __webpack_require__(17),
            "google-androidtv": __webpack_require__(19),
            "samsung-tizen": __webpack_require__(20),
            "browser-browser": __webpack_require__(21),
            "amazon-firetv": __webpack_require__(22)
        };
        var Device = function() {
            function Device() {
                var _this = this;
                _classCallCheck(this, Device);
                this._info = null;
                this._platform = null;
                _bus2["default"].installTo(this);
                this.subscribe("notifications", function(data) {
                    if (data.hasOwnProperty("type") && data.type === "device") {
                        _this._info = data;
                        var platform = data.vendor;
                        if (data.os) {
                            platform = data.vendor + "-" + data.os;
                        }
                        log.debug("Initializing " + platform);
                        _this._platform = INITIALIZERS[platform];
                        _this._platform.init();
                        log.debug("Publishing device initialization");
                        _this.publish("module", {
                            source: "device",
                            action: "init"
                        });
                        log.debug("Registering remote event handlers");
                        console.log(_remote2["default"]);
                        (0, _utilAddListener2["default"])(document, "keydown", function(evt) {
                            _remote2["default"].onKeyDown(evt);
                        });
                        (0, _utilAddListener2["default"])(document, "keyup", function(evt) {
                            _remote2["default"].onKeyUp(evt);
                        });
                    }
                });
            }
            _createClass(Device, [ {
                key: "vendor",
                value: function vendor() {
                    if (!this._info) {
                        return undefined;
                    }
                    return this._info.vendor;
                }
            }, {
                key: "os",
                value: function os() {
                    if (!this._info) {
                        return undefined;
                    }
                    return this._info.os;
                }
            }, {
                key: "info",
                value: function info() {
                    return this._platform.info();
                }
            } ]);
            return Device;
        }();
        exports["default"] = new Device();
        module.exports = exports["default"];
    }, function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || false;
                    descriptor.configurable = true;
                    if ("value" in descriptor) descriptor.writable = true;
                    Object.defineProperty(target, descriptor.key, descriptor);
                }
            }
            return function(Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
            };
        }();
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            };
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }
        var _bus = __webpack_require__(3);
        var _bus2 = _interopRequireDefault(_bus);
        var _logger = __webpack_require__(6);
        var _logger2 = _interopRequireDefault(_logger);
        var log = new _logger2["default"]("Remote");
        var Remote = function() {
            function Remote() {
                var _this = this;
                _classCallCheck(this, Remote);
                this._nameToKey = null;
                this._keyToName = {};
                _bus2["default"].installTo(this);
                this.subscribe("notifications", function(evt) {
                    if (evt.type === "keymap") {
                        log.debug("Received keymap");
                        _this._nameToKey = evt.keymap;
                        for (var key in evt.keymap) {
                            if (_this._nameToKey[key] != null) {
                                _this._keyToName[_this._nameToKey[key]] = key;
                            }
                        }
                        _this.publish("module", {
                            source: "remote",
                            action: "init"
                        });
                    }
                });
            }
            _createClass(Remote, [ {
                key: "isInitialized",
                value: function isInitialized() {
                    return this._nameToKey !== null;
                }
            }, {
                key: "onKeyUp",
                value: function onKeyUp(evt) {
                    var command = this._keyToName[evt.keyCode];
                    log.debug("Key up: " + evt.keyCode + " (" + typeof evt.keyCode + ") - Command: " + command);
                    this.publish("action", {
                        source: "remote",
                        type: "keyUp",
                        command: command,
                        keyCode: evt.keyCode
                    });
                }
            }, {
                key: "onKeyDown",
                value: function onKeyDown(evt) {
                    var command = this._keyToName[evt.keyCode];
                    log.debug("Key down: " + evt.keyCode + " (" + typeof evt.keyCode + ") - Command: " + command);
                    var key = this._keyToName[evt.keyCode];
                    if (key === "BACK" && evt.preventDefault) {
                        evt.preventDefault();
                    }
                    this.publish("action", {
                        source: "remote",
                        type: "keyDown",
                        command: command,
                        keyCode: evt.keyCode
                    });
                }
            } ]);
            return Remote;
        }();
        exports["default"] = new Remote();
        module.exports = exports["default"];
    }, function(module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports["default"] = function(target, event, fn) {
            if (target.addEventListener) {
                target.addEventListener(event, fn);
            } else if (target.attachEvent) {
                target.attachEvent("on" + event, fn);
            }
        };
        module.exports = exports["default"];
    }, function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || false;
                    descriptor.configurable = true;
                    if ("value" in descriptor) descriptor.writable = true;
                    Object.defineProperty(target, descriptor.key, descriptor);
                }
            }
            return function(Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
            };
        }();
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            };
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }
        var _coreBus = __webpack_require__(3);
        var _coreBus2 = _interopRequireDefault(_coreBus);
        var _coreScriptloader = __webpack_require__(13);
        var _coreScriptloader2 = _interopRequireDefault(_coreScriptloader);
        var _utilRemoveAllListeners = __webpack_require__(14);
        var _utilRemoveAllListeners2 = _interopRequireDefault(_utilRemoveAllListeners);
        var _utilEach = __webpack_require__(4);
        var _utilEach2 = _interopRequireDefault(_utilEach);
        var _coreLogger = __webpack_require__(6);
        var _coreLogger2 = _interopRequireDefault(_coreLogger);
        var _utilUuidv5 = __webpack_require__(15);
        var _utilUuidv52 = _interopRequireDefault(_utilUuidv5);
        var log = new _coreLogger2["default"]("SamsungModule");
        var KEY_UID = "smaf.sdk.uid";
        var COUNTRY_TO_CODE = {
            AMERICA_ANALOG: null,
            ASIAWEUROPE_ANALOG: null,
            AUSTRALIA: "au",
            AUSTRIA: "at",
            BELGIUM: "be",
            BELGIUM_DUTCH: "be",
            BELGIUM_FRENCH: "be",
            BRAZIL: "br",
            BULGARIA: "bg",
            CHINA: "cn",
            CHINA_ANALOG: "cn",
            CROATIA: "hr",
            CZECH: "cz",
            DENMARK: "dk",
            EASTEUROPE_ANALOG: null,
            EU: null,
            FINLAND: "fi",
            FRA: "fr",
            GENERALCABLE: null,
            GERMANY: "de",
            GREECE: "gr",
            HONGKONG: "hk",
            HONGKONG_UK_ANALOG: "hk",
            HUNGARY: "hu",
            IRELAND: "ie",
            ITALY: "it",
            JPN: "jp",
            KOR: "kr",
            MONACO: "mc",
            NETHERLANDS: "nl",
            NEWZEALAND: "nz",
            NORTH_AFRICA: null,
            NORWAY: "no",
            NZL_INDONESIA_ANALOG: "id",
            OTHER: null,
            POLAND: "pl",
            PORTUGAL: "pt",
            ROMANIA: "ro",
            RUSSIA: "ru",
            SAN_MARINO: "",
            SERBIA: "rs",
            SINGAPORE: "sg",
            SLOVAKIA: "sk",
            SOUTH_AFRICA: "za",
            SOUTH_AFRICA_ANALOG: "za",
            SPA: "es",
            SWEDEN: "se",
            SWITZERLAND: "ch",
            TAIWAN: "tw",
            TURKEY: "tr",
            UK: "gb",
            USA: "us"
        };
        var APIS = {
            "$MANAGER_WIDGET/Common/af/2.0.0/loader.js": null,
            "$MANAGER_WIDGET/Common/API/Widget.js": function $MANAGER_WIDGETCommonAPIWidgetJs() {
                var widgetAPI = new Common.API.Widget();
                widgetAPI.sendReadyEvent();
            },
            "$MANAGER_WIDGET/Common/webapi/1.0/deviceapis.js": null,
            "$MANAGER_WIDGET/Common/webapi/1.0/webapis.js": null,
            "$MANAGER_WIDGET/Common/API/Plugin.js": function $MANAGER_WIDGETCommonAPIPluginJs() {
                var pluginAPI = new Common.API.Plugin();
                pluginAPI.registIMEKey();
            },
            "$MANAGER_WIDGET/Common/IME/ime2.js": null,
            "$MANAGER_WIDGET/Common/IME_XT9/ime.js": function $MANAGER_WIDGETCommonIME_XT9ImeJs() {
                _g_ime.init("en", "2_35_259_12", "USA", "", "us");
            },
            "$MANAGER_WIDGET/Common/IME_XT9/inputCommon/ime_input.js": null
        };
        function supports_html5_storage() {
            try {
                return "localStorage" in window && window.localStorage !== null;
            } catch (e) {
                return false;
            }
        }
        var Samsung = function() {
            function Samsung() {
                var _this = this;
                _classCallCheck(this, Samsung);
                _coreBus2["default"].installTo(this);
                this._pending = 0;
                (0, _utilEach2["default"])(APIS, function() {
                    _this._pending++;
                });
                this.publish("module", {
                    source: "platform",
                    action: "pending",
                    pending: this._pending
                });
                this.subscribe("module", function(evt) {
                    if (evt.source === "platform" && evt.action === "script") {
                        _this._pending--;
                        log.debug("Waiting for " + _this._pending + " scripts to be loaded");
                        if (_this._pending === 0) {
                            _this._uid = (0, _utilUuidv52["default"])(deviceapis.tv.info.getDeviceID());
                            log.debug("SMAF SAMSUNG UID: " + _this._uid);
                            _this.publish("module", {
                                source: "platform",
                                action: "init"
                            });
                        }
                    }
                });
            }
            _createClass(Samsung, [ {
                key: "init",
                value: function init() {
                    var _this2 = this;
                    log.debug("Initializing Samsung environment");
                    (0, _utilEach2["default"])(APIS, function(key, fn) {
                        var callback = fn || function() {};
                        log.debug("Loading " + key);
                        _coreScriptloader2["default"].load(key, function() {
                            callback.call(null);
                            _this2.publish("module", {
                                source: "platform",
                                action: "script",
                                script: key
                            });
                            log.debug("Loading " + key + " completed");
                        });
                    });
                    (0, _utilRemoveAllListeners2["default"])(document);
                    document.addEventListener("keydown", function(event) {
                        var doPrevent = false;
                        if (event.keyCode === 8 || event.keyCode === 88) {
                            var d = event.srcElement || event.target;
                            if (d.tagName.toUpperCase() === "INPUT" && (d.type.toUpperCase() === "TEXT" || d.type.toUpperCase() === "PASSWORD" || d.type.toUpperCase() === "FILE" || d.type.toUpperCase() === "EMAIL" || d.type.toUpperCase() === "SEARCH" || d.type.toUpperCase() === "DATE") || d.tagName.toUpperCase() === "TEXTAREA") {
                                doPrevent = d.readOnly || d.disabled;
                            } else {
                                doPrevent = true;
                            }
                        }
                        if (doPrevent) {
                            event.preventDefault();
                        }
                    });
                }
            }, {
                key: "info",
                value: function info() {
                    var productTypes = [];
                    productTypes[deviceapis.tv.info.PRODUCT_TYPE_TV] = "TV";
                    productTypes[deviceapis.tv.info.PRODUCT_TYPE_BD] = "Blu-ray";
                    productTypes[deviceapis.tv.info.PRODUCT_TYPE_MONITOR] = "Monitor";
                    var deviceapiCountry = deviceapis.tv.info.getCountry();
                    var country = COUNTRY_TO_CODE[deviceapiCountry] || null;
                    return {
                        short_name: "samsung",
                        uid: (0, _utilUuidv52["default"])(deviceapis.tv.info.getDeviceID()),
                        vendor: "samsung",
                        os: "samsung-smarttv",
                        country: country,
                        language: deviceapis.tv.info.getLanguage(),
                        device: {
                            product: productTypes[deviceapis.tv.info.getProduct()],
                            id: deviceapis.tv.info.getDeviceID(),
                            model: deviceapis.tv.info.getModel(),
                            firmware: deviceapis.tv.info.getFirmware(),
                            country: deviceapis.tv.info.getCountry(),
                            language: deviceapis.tv.info.getLanguage(),
                            version: deviceapis.tv.info.getVersion(),
                            effect3D: deviceapis.displaycontrol.get3DEffectMode(),
                            outputMode: deviceapis.audiocontrol.getOutputMode()
                        },
                        capabilities: {
                            voice: deviceapis.recognition.IsVoiceRecognitionEnabled(),
                            voiceLanguage: deviceapis.recognition.GetCurrentVoiceLanguage()
                        }
                    };
                }
            } ]);
            return Samsung;
        }();
        exports["default"] = new Samsung();
        module.exports = exports["default"];
    }, function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            };
        }
        var _logger = __webpack_require__(6);
        var _logger2 = _interopRequireDefault(_logger);
        var log = new _logger2["default"]("ScriptLoader");
        var doc = document;
        exports["default"] = {
            load: function load(src, callback) {
                var script = doc.createElement("script");
                script.setAttribute("type", "text/javascript");
                script.setAttribute("src", src);
                script.onload = function() {
                    log.debug("Completed loading " + src);
                    callback.apply(undefined);
                };
                doc.getElementsByTagName("head")[0].appendChild(script);
            }
        };
        module.exports = exports["default"];
    }, function(module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        function removeAllEventListeners(obj, filter) {
            if (typeof obj._eventListeners === "undefined" || obj._eventListeners.length === 0) {
                return;
            }
            var listenersToKeep = [];
            if (!filter) {
                filter = function(listener) {
                    return true;
                };
            }
            for (var i = 0, len = obj._eventListeners.length; i < len; i++) {
                var e = obj._eventListeners[i];
                if (filter(e)) {
                    obj.removeEventListener(e.event, e.callback);
                } else {
                    listenersToKeep.push(e);
                }
            }
            obj._eventListeners = listenersToKeep;
        }
        exports["default"] = removeAllEventListeners;
        module.exports = exports["default"];
    }, function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            };
        }
        var _sha1 = __webpack_require__(16);
        var _sha12 = _interopRequireDefault(_sha1);
        exports["default"] = function(data) {
            var outArr = Array.from((0, _sha12["default"])(data));
            outArr[8] = outArr[8] & 63 | 160;
            outArr[6] = outArr[6] & 15 | 80;
            var out = outArr.join("");
            var hex = out.toString("hex", 0, 16);
            return [ hex.substring(0, 8), hex.substring(8, 12), hex.substring(12, 16), hex.substring(16, 20), hex.substring(20, 32) ].join("-");
        };
        module.exports = exports["default"];
    }, function(module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        var Sha1 = {}, Utf8 = {};
        Sha1.hash = function(msg, utf8encode) {
            var i, t;
            utf8encode = typeof utf8encode === "undefined" ? true : utf8encode;
            if (utf8encode) {
                msg = Utf8.encode(msg);
            }
            var K = [ 1518500249, 1859775393, 2400959708, 3395469782 ];
            msg += String.fromCharCode(128);
            var l = msg.length / 4 + 2;
            var N = Math.ceil(l / 16);
            var M = new Array(N);
            for (i = 0; i < N; i++) {
                M[i] = new Array(16);
                for (var j = 0; j < 16; j++) {
                    M[i][j] = msg.charCodeAt(i * 64 + j * 4) << 24 | msg.charCodeAt(i * 64 + j * 4 + 1) << 16 | msg.charCodeAt(i * 64 + j * 4 + 2) << 8 | msg.charCodeAt(i * 64 + j * 4 + 3);
                }
            }
            M[N - 1][14] = (msg.length - 1) * 8 / Math.pow(2, 32);
            M[N - 1][14] = Math.floor(M[N - 1][14]);
            M[N - 1][15] = (msg.length - 1) * 8 & 4294967295;
            var H0 = 1732584193;
            var H1 = 4023233417;
            var H2 = 2562383102;
            var H3 = 271733878;
            var H4 = 3285377520;
            var W = new Array(80);
            var a, b, c, d, e;
            for (i = 0; i < N; i++) {
                for (t = 0; t < 16; t++) {
                    W[t] = M[i][t];
                }
                for (t = 16; t < 80; t++) {
                    W[t] = Sha1.ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
                }
                a = H0;
                b = H1;
                c = H2;
                d = H3;
                e = H4;
                for (t = 0; t < 80; t++) {
                    var s = Math.floor(t / 20);
                    var T = Sha1.ROTL(a, 5) + Sha1.f(s, b, c, d) + e + K[s] + W[t] & 4294967295;
                    e = d;
                    d = c;
                    c = Sha1.ROTL(b, 30);
                    b = a;
                    a = T;
                }
                H0 = H0 + a & 4294967295;
                H1 = H1 + b & 4294967295;
                H2 = H2 + c & 4294967295;
                H3 = H3 + d & 4294967295;
                H4 = H4 + e & 4294967295;
            }
            return Sha1.toHexStr(H0) + Sha1.toHexStr(H1) + Sha1.toHexStr(H2) + Sha1.toHexStr(H3) + Sha1.toHexStr(H4);
        };
        Sha1.f = function(s, x, y, z) {
            switch (s) {
              case 0:
                return x & y ^ ~x & z;

              case 1:
                return x ^ y ^ z;

              case 2:
                return x & y ^ x & z ^ y & z;

              case 3:
                return x ^ y ^ z;
            }
        };
        Sha1.ROTL = function(x, n) {
            return x << n | x >>> 32 - n;
        };
        Sha1.toHexStr = function(n) {
            var s = "", v;
            for (var i = 7; i >= 0; i--) {
                v = n >>> i * 4 & 15;
                s += v.toString(16);
            }
            return s;
        };
        Utf8.encode = function(strUni) {
            var strUtf = strUni.replace(/[\u0080-\u07ff]/g, function(c) {
                var cc = c.charCodeAt(0);
                return String.fromCharCode(192 | cc >> 6, 128 | cc & 63);
            });
            strUtf = strUtf.replace(/[\u0800-\uffff]/g, function(c) {
                var cc = c.charCodeAt(0);
                return String.fromCharCode(224 | cc >> 12, 128 | cc >> 6 & 63, 128 | cc & 63);
            });
            return strUtf;
        };
        Utf8.decode = function(strUtf) {
            var strUni = strUtf.replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, function(c) {
                var cc = (c.charCodeAt(0) & 15) << 12 | (c.charCodeAt(1) & 63) << 6 | c.charCodeAt(2) & 63;
                return String.fromCharCode(cc);
            });
            strUni = strUni.replace(/[\u00c0-\u00df][\u0080-\u00bf]/g, function(c) {
                var cc = (c.charCodeAt(0) & 31) << 6 | c.charCodeAt(1) & 63;
                return String.fromCharCode(cc);
            });
            return strUni;
        };
        exports["default"] = Sha1.hash;
        module.exports = exports["default"];
    }, function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || false;
                    descriptor.configurable = true;
                    if ("value" in descriptor) descriptor.writable = true;
                    Object.defineProperty(target, descriptor.key, descriptor);
                }
            }
            return function(Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
            };
        }();
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            };
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }
        var _coreBus = __webpack_require__(3);
        var _coreBus2 = _interopRequireDefault(_coreBus);
        var _coreLogger = __webpack_require__(6);
        var _coreLogger2 = _interopRequireDefault(_coreLogger);
        var _utilUuid = __webpack_require__(18);
        var _utilUuid2 = _interopRequireDefault(_utilUuid);
        var log = new _coreLogger2["default"]("LGWebOSModule");
        var KEY_UID = "smaf.sdk.uid";
        var LGWebOS = function() {
            function LGWebOS() {
                _classCallCheck(this, LGWebOS);
                _coreBus2["default"].installTo(this);
            }
            _createClass(LGWebOS, [ {
                key: "init",
                value: function init() {
                    log.debug("Initializing LG-WebOS");
                    this._uid = localStorage.getItem(KEY_UID);
                    if (!this._uid) {
                        this._uid = (0, _utilUuid2["default"])();
                        localStorage.setItem(KEY_UID, this._uid);
                    }
                    this.publish("module", {
                        source: "platform",
                        action: "init"
                    });
                }
            }, {
                key: "info",
                value: function info() {
                    return {
                        short_name: "lg-webos",
                        os: "webos",
                        vendor: "lg",
                        uid: this._uid,
                        device: {},
                        capabilities: {}
                    };
                }
            } ]);
            return LGWebOS;
        }();
        exports["default"] = new LGWebOS();
        module.exports = exports["default"];
    }, function(module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        var uuid = function uuid() {
            var d = new Date().getTime();
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c === "x" ? r : r & 3 | 8).toString(16);
            });
        };
        exports["default"] = uuid;
        module.exports = exports["default"];
    }, function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || false;
                    descriptor.configurable = true;
                    if ("value" in descriptor) descriptor.writable = true;
                    Object.defineProperty(target, descriptor.key, descriptor);
                }
            }
            return function(Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
            };
        }();
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            };
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }
        var _coreBus = __webpack_require__(3);
        var _coreBus2 = _interopRequireDefault(_coreBus);
        var _utilRemoveAllListeners = __webpack_require__(14);
        var _utilRemoveAllListeners2 = _interopRequireDefault(_utilRemoveAllListeners);
        var _coreLogger = __webpack_require__(6);
        var _coreLogger2 = _interopRequireDefault(_coreLogger);
        var _utilUuidv5 = __webpack_require__(15);
        var _utilUuidv52 = _interopRequireDefault(_utilUuidv5);
        var log = new _coreLogger2["default"]("BrowserModule");
        var AndroidTV = function() {
            function AndroidTV() {
                _classCallCheck(this, AndroidTV);
                _coreBus2["default"].installTo(this);
            }
            _createClass(AndroidTV, [ {
                key: "init",
                value: function init() {
                    log.debug("Initializing AndroidTV");
                    this.publish("module", {
                        source: "platform",
                        action: "init"
                    });
                    (0, _utilRemoveAllListeners2["default"])(document);
                    document.addEventListener("keydown", function(event) {
                        var doPrevent = false;
                        if (event.keyCode === 8) {
                            var d = event.srcElement || event.target;
                            if (d.tagName.toUpperCase() === "INPUT" && (d.type.toUpperCase() === "TEXT" || d.type.toUpperCase() === "PASSWORD" || d.type.toUpperCase() === "FILE" || d.type.toUpperCase() === "EMAIL" || d.type.toUpperCase() === "SEARCH" || d.type.toUpperCase() === "DATE") || d.tagName.toUpperCase() === "TEXTAREA") {
                                doPrevent = d.readOnly || d.disabled;
                            } else {
                                doPrevent = true;
                            }
                        }
                        if (doPrevent) {
                            event.preventDefault();
                        }
                    });
                }
            }, {
                key: "info",
                value: function info() {
                    var info = JSON.parse(SmafInterface.getDeviceInfo());
                    return {
                        short_name: "androidtv",
                        os: "android",
                        uid: (0, _utilUuidv52["default"])(SmafInterface.getUniqueID()),
                        country: info.country,
                        language: info.language,
                        vendor: info.manufacturer,
                        device: info,
                        capabilities: {}
                    };
                }
            } ]);
            return AndroidTV;
        }();
        exports["default"] = new AndroidTV();
        module.exports = exports["default"];
    }, function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || false;
                    descriptor.configurable = true;
                    if ("value" in descriptor) descriptor.writable = true;
                    Object.defineProperty(target, descriptor.key, descriptor);
                }
            }
            return function(Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
            };
        }();
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            };
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }
        var _coreBus = __webpack_require__(3);
        var _coreBus2 = _interopRequireDefault(_coreBus);
        var _utilRemoveAllListeners = __webpack_require__(14);
        var _utilRemoveAllListeners2 = _interopRequireDefault(_utilRemoveAllListeners);
        var _utilEach = __webpack_require__(4);
        var _utilEach2 = _interopRequireDefault(_utilEach);
        var _coreLogger = __webpack_require__(6);
        var _coreLogger2 = _interopRequireDefault(_coreLogger);
        var _utilUuidv5 = __webpack_require__(15);
        var _utilUuidv52 = _interopRequireDefault(_utilUuidv5);
        var log = new _coreLogger2["default"]("BrowserModule");
        var KEY_UID = "smaf.sdk.uid";
        function supports_html5_storage() {
            try {
                return "localStorage" in window && window.localStorage !== null;
            } catch (e) {
                return false;
            }
        }
        var Tizen = function() {
            function Tizen() {
                _classCallCheck(this, Tizen);
                _coreBus2["default"].installTo(this);
            }
            _createClass(Tizen, [ {
                key: "init",
                value: function init() {
                    log.debug("Initializing Tizen");
                    this._info = {};
                    var self = this;
                    var PROPERTIES = [ "DISPLAY", "NETWORK", "WIFI_NETWORK", "BUILD", "LOCALE" ];
                    var pending = PROPERTIES.length;
                    (0, _utilEach2["default"])(PROPERTIES, function(index, value) {
                        tizen.systeminfo.getPropertyValue(value, function(info) {
                            self._info[value] = info;
                            pending--;
                            if (pending === 0) {
                                self.publish("module", {
                                    source: "platform",
                                    action: "init"
                                });
                            }
                        });
                    });
                    var tvKey = {};
                    var supportedKeys = tizen.tvinputdevice.getSupportedKeys();
                    var keys = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "MediaPlay", "MediaPause", "MediaStop", "MediaPlayPause", "MediaFastForward", "MediaRecord", "MediaRewind", "ChannelDown", "ChannelUp", "VolumeUp", "VolumeDown", "ColorF0Red", "ColorF1Green", "ColorF2Yellow", "ColorF3Blue" ];
                    for (var i = 0; i < supportedKeys.length; i++) {
                        tvKey[supportedKeys[i].name] = supportedKeys[i].code;
                    }
                    for (var i = 0; i < keys.length; i++) {
                        if (tvKey.hasOwnProperty(keys[i])) {
                            try {
                                tizen.tvinputdevice.registerKey(keys[i]);
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }
                    (0, _utilRemoveAllListeners2["default"])(document);
                    document.addEventListener("keydown", function(event) {
                        var doPrevent = false;
                        if (event.keyCode === 8) {
                            var d = event.srcElement || event.target;
                            if (d.tagName.toUpperCase() === "INPUT" && (d.type.toUpperCase() === "TEXT" || d.type.toUpperCase() === "PASSWORD" || d.type.toUpperCase() === "FILE" || d.type.toUpperCase() === "EMAIL" || d.type.toUpperCase() === "SEARCH" || d.type.toUpperCase() === "DATE") || d.tagName.toUpperCase() === "TEXTAREA") {
                                doPrevent = d.readOnly || d.disabled;
                            } else {
                                doPrevent = true;
                            }
                        }
                        if (doPrevent) {
                            event.preventDefault();
                        }
                    });
                }
            }, {
                key: "info",
                value: function info() {
                    var dc = tizen.systeminfo.getCapabilities();
                    var id = (0, _utilUuidv52["default"])(dc.duid);
                    var extract = function extract(val, order) {
                        if (!val) return null;
                        return val.split("_")[order].split(".")[0].toLowerCase();
                    };
                    return {
                        short_name: "samsung-tizen",
                        uid: id,
                        os: "tizen",
                        vendor: "samsung",
                        country: extract(this._info.LOCALE.country, 1),
                        language: extract(this._info.LOCALE.language, 0),
                        device: {
                            product: null,
                            id: dc.duid,
                            model: this._info.BUILD.model,
                            firmware: null,
                            country: this._info.LOCALE.country,
                            language: this._info.LOCALE.language,
                            version: dc.platformVersion,
                            screenSize: {
                                widthInMM: this._info.DISPLAY.physicalWidth,
                                heightInMM: this._info.DISPLAY.physicalHeight
                            }
                        },
                        capabilities: {}
                    };
                }
            } ]);
            return Tizen;
        }();
        exports["default"] = new Tizen();
        module.exports = exports["default"];
    }, function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || false;
                    descriptor.configurable = true;
                    if ("value" in descriptor) descriptor.writable = true;
                    Object.defineProperty(target, descriptor.key, descriptor);
                }
            }
            return function(Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
            };
        }();
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            };
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }
        var _coreBus = __webpack_require__(3);
        var _coreBus2 = _interopRequireDefault(_coreBus);
        var _utilRemoveAllListeners = __webpack_require__(14);
        var _utilRemoveAllListeners2 = _interopRequireDefault(_utilRemoveAllListeners);
        var _coreLogger = __webpack_require__(6);
        var _coreLogger2 = _interopRequireDefault(_coreLogger);
        var _utilUuid = __webpack_require__(18);
        var _utilUuid2 = _interopRequireDefault(_utilUuid);
        var log = new _coreLogger2["default"]("BrowserModule");
        var KEY_UID = "smaf.sdk.uid";
        function supports_html5_storage() {
            try {
                return "localStorage" in window && window.localStorage !== null;
            } catch (e) {
                return false;
            }
        }
        var prefix = function prefix() {
            var styles = window.getComputedStyle(document.documentElement, "");
            var pre = (Array.prototype.slice.call(styles).join("").match(/-(moz|webkit|ms)-/) || styles.OLink === "" && [ "", "o" ])[1];
            var dom = "WebKit|Moz|MS|O".match(new RegExp("(" + pre + ")", "i"))[1];
            return {
                dom: dom,
                lowercase: pre,
                css: "-" + pre + "-",
                js: pre[0].toUpperCase() + pre.substr(1)
            };
        };
        var Browser = function() {
            function Browser() {
                _classCallCheck(this, Browser);
                _coreBus2["default"].installTo(this);
            }
            _createClass(Browser, [ {
                key: "init",
                value: function init() {
                    log.debug("Initializing browser");
                    this.publish("module", {
                        source: "platform",
                        action: "init"
                    });
                    if (supports_html5_storage()) {
                        this._uid = localStorage.getItem(KEY_UID);
                        if (!this._uid) {
                            this._uid = (0, _utilUuid2["default"])();
                            localStorage.setItem(KEY_UID, this._uid);
                        }
                    } else {
                        this._uid = (0, _utilUuid2["default"])();
                    }
                    (0, _utilRemoveAllListeners2["default"])(document);
                    document.addEventListener("keydown", function(event) {
                        var doPrevent = false;
                        if (event.keyCode === 8) {
                            var d = event.srcElement || event.target;
                            if (d.tagName.toUpperCase() === "INPUT" && (d.type.toUpperCase() === "TEXT" || d.type.toUpperCase() === "PASSWORD" || d.type.toUpperCase() === "FILE" || d.type.toUpperCase() === "EMAIL" || d.type.toUpperCase() === "SEARCH" || d.type.toUpperCase() === "DATE") || d.tagName.toUpperCase() === "TEXTAREA") {
                                doPrevent = d.readOnly || d.disabled;
                            } else {
                                doPrevent = true;
                            }
                        }
                        if (doPrevent) {
                            event.preventDefault();
                        }
                    });
                }
            }, {
                key: "info",
                value: function info() {
                    return {
                        short_name: "browser",
                        vendor: prefix().lowercase,
                        uid: this._uid,
                        device: {},
                        capabilities: {}
                    };
                }
            } ]);
            return Browser;
        }();
        exports["default"] = new Browser();
        module.exports = exports["default"];
    }, function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || false;
                    descriptor.configurable = true;
                    if ("value" in descriptor) descriptor.writable = true;
                    Object.defineProperty(target, descriptor.key, descriptor);
                }
            }
            return function(Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
            };
        }();
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            };
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }
        var _coreBus = __webpack_require__(3);
        var _coreBus2 = _interopRequireDefault(_coreBus);
        var _utilRemoveAllListeners = __webpack_require__(14);
        var _utilRemoveAllListeners2 = _interopRequireDefault(_utilRemoveAllListeners);
        var _coreLogger = __webpack_require__(6);
        var _coreLogger2 = _interopRequireDefault(_coreLogger);
        var _coreRemote = __webpack_require__(10);
        var _coreRemote2 = _interopRequireDefault(_coreRemote);
        var _utilUuid = __webpack_require__(18);
        var _utilUuid2 = _interopRequireDefault(_utilUuid);
        var log = new _coreLogger2["default"]("AmazonFireTVModule");
        var KEY_UID = "smaf.sdk.uid";
        function supports_html5_storage() {
            try {
                return "localStorage" in window && window.localStorage !== null;
            } catch (e) {
                return false;
            }
        }
        var FireTV = function() {
            function FireTV() {
                _classCallCheck(this, FireTV);
                _coreBus2["default"].installTo(this);
            }
            _createClass(FireTV, [ {
                key: "init",
                value: function init() {
                    log.debug("Initializing Amazon FireTV");
                    this.publish("module", {
                        source: "platform",
                        action: "init"
                    });
                    if (supports_html5_storage()) {
                        this._uid = localStorage.getItem(KEY_UID);
                        if (!this._uid) {
                            this._uid = (0, _utilUuid2["default"])();
                            localStorage.setItem(KEY_UID, this._uid);
                        }
                    } else {
                        this._uid = (0, _utilUuid2["default"])();
                    }
                    (0, _utilRemoveAllListeners2["default"])(document);
                    window.addEventListener("popstate", function(evt) {
                        log.debug("`Back` button fired");
                        var dummyEvt = {
                            keyCode: "27",
                            preventDefault: function preventDefault() {
                                return null;
                            }
                        };
                        _coreRemote2["default"].onKeyUp(dummyEvt);
                        if (window.history.state !== "backhandler") {
                            evt.preventDefault && evt.preventDefault();
                            log.debug("History state: " + window.history.state + " (NOT `backhandler`)");
                            window.history.pushState("backhandler", null, null);
                        }
                    });
                    window.history.pushState("backhandler", null, null);
                    document.addEventListener("keydown", function(event) {
                        if (event.keyCode === 13) {
                            event.preventDefault();
                        }
                        var doPrevent = false;
                        if (event.keyCode === 8) {
                            var d = event.srcElement || event.target;
                            if (d.tagName.toUpperCase() === "INPUT" && (d.type.toUpperCase() === "TEXT" || d.type.toUpperCase() === "PASSWORD" || d.type.toUpperCase() === "FILE" || d.type.toUpperCase() === "EMAIL" || d.type.toUpperCase() === "SEARCH" || d.type.toUpperCase() === "DATE") || d.tagName.toUpperCase() === "TEXTAREA") {
                                doPrevent = d.readOnly || d.disabled;
                            } else {
                                doPrevent = true;
                            }
                        }
                        if (doPrevent) {
                            event.preventDefault();
                        }
                    });
                }
            }, {
                key: "info",
                value: function info() {
                    return {
                        short_name: "amazon-firetv",
                        os: "FireOS",
                        vendor: "amazon",
                        uid: this._uid,
                        device: {},
                        capabilities: {}
                    };
                }
            } ]);
            return FireTV;
        }();
        exports["default"] = new FireTV();
        module.exports = exports["default"];
    }, function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            };
        }
        var _logger = __webpack_require__(6);
        var _logger2 = _interopRequireDefault(_logger);
        var _utilIsArray = __webpack_require__(5);
        var _utilIsArray2 = _interopRequireDefault(_utilIsArray);
        var log = new _logger2["default"]("Video");
        function video(id) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            if (id instanceof HTMLVideoElement) {
                return smafVideoDecorator(id);
            } else {
                var targetElement = document.getElementById(id);
                if (!targetElement) {
                    log.debug("ID for video element not found");
                    return;
                }
                var sourceOk = false;
                if (targetElement.tagName === "VIDEO") return smafVideoDecorator(targetElement); else {
                    if (!options.sources || !(0, _utilIsArray2["default"])(options.sources)) return null;
                    var existingVideoElements = Array.from(targetElement.querySelectorAll("video"));
                    if (existingVideoElements.length) {
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;
                        try {
                            for (var _iterator = existingVideoElements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var videoEl = _step.value;
                                videoEl.parentNode.removeChild(videoEl);
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator["return"]) {
                                    _iterator["return"]();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }
                    }
                    var newVideoElement;
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;
                    try {
                        for (var _iterator2 = options.sources[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var item = _step2.value;
                            var type = options.sources.type ? options.sources.type : item.src.endsWith(".webm") ? "video/webm" : item.src.endsWith(".ogv") ? "video/ogg" : item.src.endsWith(".mp4") ? "video/mp4" : item.src.endsWith(".3gp") ? "video/3gp" : item.src.endsWith(".mov") ? "mov" : null;
                            if (!type) continue;
                            if (!sourceOk) newVideoElement = document.createElement("video");
                            sourceOk = true;
                            if (type === "mov") {
                                newVideoElement.src = item.src;
                            } else {
                                var newSourceElement = document.createElement("source");
                                newSourceElement.src = item.src;
                                newSourceElement.type = type;
                                newVideoElement.appendChild(newSourceElement);
                            }
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                                _iterator2["return"]();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }
                    if (!sourceOk) return null;
                    newVideoElement.id = id + "_smafVideo";
                    newVideoElement.load();
                    var keys = Object.keys(options);
                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;
                    try {
                        for (var _iterator3 = keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var key = _step3.value;
                            if (key === "style") {
                                var keysStyle = Object.keys(options.style);
                                var _iteratorNormalCompletion4 = true;
                                var _didIteratorError4 = false;
                                var _iteratorError4 = undefined;
                                try {
                                    for (var _iterator4 = keysStyle[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                        var keyStyle = _step4.value;
                                        newVideoElement.style[keyStyle] = options.style[keyStyle];
                                    }
                                } catch (err) {
                                    _didIteratorError4 = true;
                                    _iteratorError4 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                                            _iterator4["return"]();
                                        }
                                    } finally {
                                        if (_didIteratorError4) {
                                            throw _iteratorError4;
                                        }
                                    }
                                }
                            } else {
                                if (key === "class") key = "className";
                                newVideoElement[key] = options[key];
                            }
                        }
                    } catch (err) {
                        _didIteratorError3 = true;
                        _iteratorError3 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                                _iterator3["return"]();
                            }
                        } finally {
                            if (_didIteratorError3) {
                                throw _iteratorError3;
                            }
                        }
                    }
                    targetElement.appendChild(newVideoElement);
                    return smafVideoDecorator(newVideoElement);
                }
            }
            function smafVideoDecorator(videoEl) {
                if (!videoEl.smafWrapped) videoEl.smafWrapped = true; else return videoEl;
                var original = {};
                var methods = [ "play", "pause", "load" ];
                var _iteratorNormalCompletion5 = true;
                var _didIteratorError5 = false;
                var _iteratorError5 = undefined;
                try {
                    for (var _iterator5 = methods[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                        var method = _step5.value;
                        original[method] = videoEl[method];
                    }
                } catch (err) {
                    _didIteratorError5 = true;
                    _iteratorError5 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
                            _iterator5["return"]();
                        }
                    } finally {
                        if (_didIteratorError5) {
                            throw _iteratorError5;
                        }
                    }
                }
                videoEl.play = function() {
                    log.debug('"Smaf.video" extras for: play');
                    return original.play.apply(this, arguments);
                };
                videoEl.pause = function() {
                    log.debug('"Smaf.video" extras for: pause');
                    return original.pause.apply(this, arguments);
                };
                videoEl.load = function() {
                    log.debug('"Smaf.video" extras for: load');
                    return original.load.apply(this, arguments);
                };
                videoEl.playpause = function() {
                    log.debug('"Smaf.video" extras for: playpause');
                    if (videoEl.paused || videoEl.ended) videoEl.play(); else videoEl.pause();
                };
                videoEl.stop = function() {
                    log.debug('"Smaf.video" extras for: stop');
                    videoEl.pause();
                    videoEl.currentTime = 0;
                };
                videoEl.rewind = function() {
                    var seconds = arguments.length <= 0 || arguments[0] === undefined ? 5 : arguments[0];
                    log.debug('"Smaf.video" extras for: rewind');
                    videoEl.currentTime -= seconds;
                };
                videoEl.forward = function() {
                    var seconds = arguments.length <= 0 || arguments[0] === undefined ? 5 : arguments[0];
                    log.debug('"Smaf.video" extras for: forward');
                    videoEl.currentTime += seconds;
                };
                videoEl.volumeUp = function() {
                    var step = arguments.length <= 0 || arguments[0] === undefined ? .1 : arguments[0];
                    log.debug('"Smaf.video" extras for: volumeUp');
                    var volume = videoEl.volume + step;
                    videoEl.volume = volume > 1 ? 1 : volume;
                };
                videoEl.volumeDown = function() {
                    var step = arguments.length <= 0 || arguments[0] === undefined ? .1 : arguments[0];
                    log.debug('"Smaf.video" extras for: volumeUp');
                    var volume = videoEl.volume - step;
                    videoEl.volume = volume < 0 ? 0 : volume;
                };
                videoEl.getType = function() {
                    log.debug('"Smaf.video" getType');
                    var filename = videoEl.currentSrc;
                    return filename.substr(filename.lastIndexOf(".") + 1);
                };
                return videoEl;
            }
        }
        exports["default"] = video;
        module.exports = exports["default"];
    }, function(module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            };
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }
        var _bus = __webpack_require__(3);
        var _bus2 = _interopRequireDefault(_bus);
        var _logger = __webpack_require__(6);
        var _logger2 = _interopRequireDefault(_logger);
        var _utilIsFunction = __webpack_require__(25);
        var _utilIsFunction2 = _interopRequireDefault(_utilIsFunction);
        var _localforage = __webpack_require__(26);
        var _localforage2 = _interopRequireDefault(_localforage);
        var _storageDriversSamsungfilestorage = __webpack_require__(28);
        var _storageDriversSamsungfilestorage2 = _interopRequireDefault(_storageDriversSamsungfilestorage);
        var _promise = __webpack_require__(29);
        var _promise2 = _interopRequireDefault(_promise);
        var log = new _logger2["default"]("Storage");
        var Storage = function Storage() {
            var _this = this;
            _classCallCheck(this, Storage);
            _bus2["default"].installTo(this);
            this.subscribe("notifications", function(data) {
                if (data.hasOwnProperty("type") && data.type === "device") {
                    var expiresTable, expiresFarFutureDate, _local, _localExtra;
                    var config_local;
                    var config_localExtra;
                    (function() {
                        var isSamsungTV = function isSamsungTV() {
                            try {
                                return !!new FileSystem();
                            } catch (e) {
                                return false;
                            }
                        };
                        var setItem = function setItem(key, value) {
                            var attributes = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
                            var callback = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
                            if ((0, _utilIsFunction2["default"])(attributes)) {
                                callback = attributes;
                                attributes = {};
                            }
                            if (attributes && typeof attributes.expires === "number") {
                                var expires = new Date();
                                expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e5);
                                attributes.expires = expires;
                            }
                            _localExtra.getItem(key).then(function(valueExtra) {
                                if (!valueExtra) {
                                    valueExtra = {};
                                    valueExtra.expires = attributes.expires ? attributes.expires.toUTCString() : new Date(expiresFarFutureDate).toUTCString();
                                    valueExtra.created = new Date().toUTCString();
                                    _localExtra.setItem(key, valueExtra).then(function(valueExtra) {
                                        _binaryInsert({
                                            key: key,
                                            expires: Date.parse(valueExtra.expires)
                                        }, expiresTable);
                                    });
                                } else {
                                    var oldExpires = valueExtra.expires;
                                    var newExpires = attributes.expires ? attributes.expires.toUTCString() : new Date(expiresFarFutureDate).toUTCString();
                                    valueExtra.expires = newExpires;
                                    valueExtra.modified = new Date().toUTCString();
                                    _localExtra.setItem(key, valueExtra).then(function(valueExtra) {
                                        if (oldExpires !== newExpires) {
                                            var keyIndex = _expiresTableFindKeyIndex(key, Date.parse(oldExpires));
                                            if (~keyIndex) {
                                                expiresTable.splice(keyIndex, 1);
                                                _binaryInsert({
                                                    key: key,
                                                    expires: Date.parse(valueExtra.expires)
                                                }, expiresTable);
                                                log.debug(expiresTable);
                                            }
                                        }
                                    });
                                }
                            });
                            var promise = _local.setItem(key, value, callback);
                            return promise;
                        };
                        var getItem = function getItem(key) {
                            var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
                            var promise = _localExtra.getItem(key).then(function(valueExtra) {
                                if (valueExtra) {
                                    var itemExpiresMs = Date.parse(valueExtra.expires);
                                    if (_isItemExpired(itemExpiresMs)) {
                                        removeItem(key, null, itemExpiresMs);
                                        return _promise2["default"].resolve(null);
                                    }
                                }
                                return _local.getItem(key);
                            });
                            executeCallback(promise, callback);
                            return promise;
                        };
                        var removeItem = function removeItem(key) {
                            var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
                            var itemExpiresMs = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
                            var promise = _local.removeItem(key).then(function() {
                                _localExtra.removeItem(key);
                                var keyIndex = _expiresTableFindKeyIndex(key, itemExpiresMs);
                                if (keyIndex !== -1) {
                                    expiresTable.splice(keyIndex, 1);
                                    log.debug(expiresTable);
                                }
                            });
                            executeCallback(promise, callback);
                            return promise;
                        };
                        var clear = function clear(callback) {
                            var promise = _local.clear().then(_localExtra.clear()).then(function() {
                                expiresTable = [];
                            });
                            executeCallback(promise, callback);
                            return promise;
                        };
                        var length = function length(callback) {
                            _removeExpired();
                            var numberOfKeys = expiresTable.length;
                            var promise = _promise2["default"].resolve(numberOfKeys);
                            executeCallback(promise, callback);
                            return promise;
                        };
                        var keys = function keys(callback) {
                            _removeExpired();
                            var len = expiresTable.length;
                            var keysArray = [];
                            for (var i = 0; i < len; i++) {
                                keysArray.push(expiresTable[i].key);
                            }
                            var promise = _promise2["default"].resolve(keysArray);
                            executeCallback(promise, callback);
                            return promise;
                        };
                        var iterate = function iterate(iterator, callback) {
                            var promise = _local.iterate(iterator, callback);
                            return promise;
                        };
                        var executeCallback = function executeCallback(promise, callback) {
                            if (callback) {
                                promise.then(function(result) {
                                    callback(null, result);
                                }, function(error) {
                                    callback(error);
                                });
                            }
                        };
                        var _removeExpired = function _removeExpired() {
                            var searchResult = _getIndexesForClosestValues(expiresTable, Date.now());
                            for (var i = 0; i <= searchResult[0]; i++) {
                                var key = expiresTable[i].key;
                                _local.removeItem(key).then(function() {
                                    _localExtra.removeItem(key);
                                });
                            }
                            expiresTable.splice(0, searchResult[0] + 1);
                        };
                        var _isItemExpired = function _isItemExpired(expirationDateMs) {
                            return expirationDateMs && expirationDateMs < Date.now();
                        };
                        var _init = function _init() {
                            _local = _localforage2["default"].createInstance(config_local);
                            _localExtra = _localforage2["default"].createInstance(config_localExtra);
                            _localExtra.iterate(function(valueExtra, key, iterationNumber) {
                                _binaryInsert({
                                    key: key,
                                    expires: Date.parse(valueExtra.expires)
                                }, expiresTable);
                                log.debug([ key, valueExtra ]);
                            }, function() {
                                log.debug("Storage 'expiresTable' initialized");
                                log.debug(expiresTable);
                            });
                        };
                        var _binaryInsert = function _binaryInsert(itemObj, array) {
                            var start = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
                            var end = arguments.length <= 3 || arguments[3] === undefined ? -1 : arguments[3];
                            var value = itemObj.expires;
                            var len = array.length;
                            if (end === -1) {
                                end = len - 1;
                            }
                            var m = start + Math.floor((end - start) / 2);
                            if (len === 0) {
                                array.push(itemObj);
                                return;
                            }
                            if (value >= array[end].expires) {
                                array.splice(end + 1, 0, itemObj);
                                return;
                            }
                            if (value <= array[start].expires) {
                                array.splice(start, 0, itemObj);
                                return;
                            }
                            if (start >= end) {
                                return;
                            }
                            if (value < array[m].expires) {
                                _binaryInsert(itemObj, array, start, m - 1);
                                return;
                            }
                            if (value > array[m].expires) {
                                _binaryInsert(itemObj, array, m + 1, end);
                                return;
                            }
                            if (value === array[m].expires) {
                                array.splice(m + 1, 0, itemObj);
                                return;
                            }
                        };
                        var _expiresTableFindKeyIndex = function _expiresTableFindKeyIndex(key) {
                            var itemExpiresMs = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
                            var result = -1;
                            if (!itemExpiresMs) {
                                for (var i = 0; i < expiresTable.length; i++) {
                                    if (expiresTable[i].key === key) {
                                        result = i;
                                        break;
                                    }
                                }
                            } else {
                                var searchResult = _getIndexesForExactValue(expiresTable, itemExpiresMs);
                                if (searchResult === -1) {
                                    result = -1;
                                } else {
                                    for (var i = searchResult[0]; i <= searchResult[1]; i++) {
                                        if (expiresTable[i].key === key) {
                                            result = i;
                                            break;
                                        }
                                    }
                                }
                            }
                            return result;
                        };
                        var _getIndexesForExactValue = function _getIndexesForExactValue(array, expiresMs) {
                            var min = 0;
                            var max = array.length - 1;
                            var guess;
                            while (min <= max) {
                                guess = Math.floor((min + max) / 2);
                                if (array[guess].expires === expiresMs) {
                                    var lowGuess = guess;
                                    while (array[lowGuess - 1].expires === expiresMs) {
                                        lowGuess--;
                                    }
                                    var hiGuess = guess;
                                    while (array[hiGuess + 1].expires === expiresMs) {
                                        hiGuess++;
                                    }
                                    return [ lowGuess, hiGuess ];
                                } else {
                                    if (array[guess].expires < expiresMs) {
                                        min = guess + 1;
                                    } else {
                                        max = guess - 1;
                                    }
                                }
                            }
                            return -1;
                        };
                        var _getIndexesForClosestValues = function _getIndexesForClosestValues(array, expiresMs) {
                            var low = -1, hi = array.length;
                            while (hi - low > 1) {
                                var mid = Math.round((low + hi) / 2);
                                if (array[mid].expires <= expiresMs) {
                                    low = mid;
                                } else {
                                    hi = mid;
                                }
                            }
                            if (low === -1 || array[low].expires === expiresMs) {
                                hi = low;
                            }
                            return [ low, hi ];
                        };
                        log.debug("Initializing storage");
                        expiresTable = [];
                        expiresFarFutureDate = 2e12;
                        _local = {};
                        _localExtra = {};
                        config_local = {
                            driver: _localforage2["default"].LOCALSTORAGE,
                            name: "smaf.sdk.storage",
                            storeName: "smafStorage"
                        };
                        config_localExtra = {
                            driver: _localforage2["default"].LOCALSTORAGE,
                            name: "smaf.sdk.storage.extra",
                            storeName: "smafStorageExtra"
                        };
                        if (_localforage2["default"].driver()) {
                            _init();
                        } else {
                            if (isSamsungTV()) {
                                _localforage2["default"].defineDriver(_storageDriversSamsungfilestorage2["default"]).then(function() {
                                    config_local.driver = config_localExtra.driver = "samsungFileStorage";
                                    _init();
                                });
                            } else {
                                log.debug("No storage mechanism detected on this environment, so storage() will not be supported");
                            }
                        }
                        _this.iterate = iterate;
                        _this.getItem = getItem;
                        _this.setItem = setItem;
                        _this.removeItem = removeItem;
                        _this.clear = clear;
                        _this.length = length;
                        _this.keys = keys;
                        _this.driver = function() {
                            return _local.driver();
                        };
                        log.debug("Publishing storage initialization");
                        _this.publish("module", {
                            source: "storage",
                            action: "init"
                        });
                    })();
                }
            });
        };
        var storage = new Storage();
        exports["default"] = function() {
            return storage;
        };
        module.exports = exports["default"];
    }, function(module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        var getClass = {}.toString;
        exports["default"] = function(object) {
            return object && getClass.call(object) === "[object Function]";
        };
        module.exports = exports["default"];
    }, function(module, exports, __webpack_require__) {
        var require;
        (function(global, process) {
            "use strict";
            (function() {
                var define, requireModule, require, requirejs;
                (function() {
                    var registry = {}, seen = {};
                    define = function(name, deps, callback) {
                        registry[name] = {
                            deps: deps,
                            callback: callback
                        };
                    };
                    requirejs = require = requireModule = function(name) {
                        requirejs._eak_seen = registry;
                        if (seen[name]) {
                            return seen[name];
                        }
                        seen[name] = {};
                        if (!registry[name]) {
                            throw new Error("Could not find module " + name);
                        }
                        var mod = registry[name], deps = mod.deps, callback = mod.callback, reified = [], exports;
                        for (var i = 0, l = deps.length; i < l; i++) {
                            if (deps[i] === "exports") {
                                reified.push(exports = {});
                            } else {
                                reified.push(requireModule(resolve(deps[i])));
                            }
                        }
                        var value = callback.apply(this, reified);
                        return seen[name] = exports || value;
                        function resolve(child) {
                            if (child.charAt(0) !== ".") {
                                return child;
                            }
                            var parts = child.split("/");
                            var parentBase = name.split("/").slice(0, -1);
                            for (var i = 0, l = parts.length; i < l; i++) {
                                var part = parts[i];
                                if (part === "..") {
                                    parentBase.pop();
                                } else if (part === ".") {
                                    continue;
                                } else {
                                    parentBase.push(part);
                                }
                            }
                            return parentBase.join("/");
                        }
                    };
                })();
                define("promise/all", [ "./utils", "exports" ], function(__dependency1__, __exports__) {
                    "use strict";
                    var isArray = __dependency1__.isArray;
                    var isFunction = __dependency1__.isFunction;
                    function all(promises) {
                        var Promise = this;
                        if (!isArray(promises)) {
                            throw new TypeError("You must pass an array to all.");
                        }
                        return new Promise(function(resolve, reject) {
                            var results = [], remaining = promises.length, promise;
                            if (remaining === 0) {
                                resolve([]);
                            }
                            function resolver(index) {
                                return function(value) {
                                    resolveAll(index, value);
                                };
                            }
                            function resolveAll(index, value) {
                                results[index] = value;
                                if (--remaining === 0) {
                                    resolve(results);
                                }
                            }
                            for (var i = 0; i < promises.length; i++) {
                                promise = promises[i];
                                if (promise && isFunction(promise.then)) {
                                    promise.then(resolver(i), reject);
                                } else {
                                    resolveAll(i, promise);
                                }
                            }
                        });
                    }
                    __exports__.all = all;
                });
                define("promise/asap", [ "exports" ], function(__exports__) {
                    "use strict";
                    var browserGlobal = typeof window !== "undefined" ? window : {};
                    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
                    var local = typeof global !== "undefined" ? global : this === undefined ? window : this;
                    function useNextTick() {
                        return function() {
                            process.nextTick(flush);
                        };
                    }
                    function useMutationObserver() {
                        var iterations = 0;
                        var observer = new BrowserMutationObserver(flush);
                        var node = document.createTextNode("");
                        observer.observe(node, {
                            characterData: true
                        });
                        return function() {
                            node.data = iterations = ++iterations % 2;
                        };
                    }
                    function useSetTimeout() {
                        return function() {
                            local.setTimeout(flush, 1);
                        };
                    }
                    var queue = [];
                    function flush() {
                        for (var i = 0; i < queue.length; i++) {
                            var tuple = queue[i];
                            var callback = tuple[0], arg = tuple[1];
                            callback(arg);
                        }
                        queue = [];
                    }
                    var scheduleFlush;
                    if (typeof process !== "undefined" && {}.toString.call(process) === "[object process]") {
                        scheduleFlush = useNextTick();
                    } else if (BrowserMutationObserver) {
                        scheduleFlush = useMutationObserver();
                    } else {
                        scheduleFlush = useSetTimeout();
                    }
                    function asap(callback, arg) {
                        var length = queue.push([ callback, arg ]);
                        if (length === 1) {
                            scheduleFlush();
                        }
                    }
                    __exports__.asap = asap;
                });
                define("promise/config", [ "exports" ], function(__exports__) {
                    "use strict";
                    var config = {
                        instrument: false
                    };
                    function configure(name, value) {
                        if (arguments.length === 2) {
                            config[name] = value;
                        } else {
                            return config[name];
                        }
                    }
                    __exports__.config = config;
                    __exports__.configure = configure;
                });
                define("promise/polyfill", [ "./promise", "./utils", "exports" ], function(__dependency1__, __dependency2__, __exports__) {
                    "use strict";
                    var RSVPPromise = __dependency1__.Promise;
                    var isFunction = __dependency2__.isFunction;
                    function polyfill() {
                        var local;
                        if (typeof global !== "undefined") {
                            local = global;
                        } else if (typeof window !== "undefined" && window.document) {
                            local = window;
                        } else {
                            local = self;
                        }
                        var es6PromiseSupport = "Promise" in local && "resolve" in local.Promise && "reject" in local.Promise && "all" in local.Promise && "race" in local.Promise && function() {
                            var resolve;
                            new local.Promise(function(r) {
                                resolve = r;
                            });
                            return isFunction(resolve);
                        }();
                        if (!es6PromiseSupport) {
                            local.Promise = RSVPPromise;
                        }
                    }
                    __exports__.polyfill = polyfill;
                });
                define("promise/promise", [ "./config", "./utils", "./all", "./race", "./resolve", "./reject", "./asap", "exports" ], function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __exports__) {
                    "use strict";
                    var config = __dependency1__.config;
                    var configure = __dependency1__.configure;
                    var objectOrFunction = __dependency2__.objectOrFunction;
                    var isFunction = __dependency2__.isFunction;
                    var now = __dependency2__.now;
                    var all = __dependency3__.all;
                    var race = __dependency4__.race;
                    var staticResolve = __dependency5__.resolve;
                    var staticReject = __dependency6__.reject;
                    var asap = __dependency7__.asap;
                    var counter = 0;
                    config.async = asap;
                    function Promise(resolver) {
                        if (!isFunction(resolver)) {
                            throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");
                        }
                        if (!(this instanceof Promise)) {
                            throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
                        }
                        this._subscribers = [];
                        invokeResolver(resolver, this);
                    }
                    function invokeResolver(resolver, promise) {
                        function resolvePromise(value) {
                            resolve(promise, value);
                        }
                        function rejectPromise(reason) {
                            reject(promise, reason);
                        }
                        try {
                            resolver(resolvePromise, rejectPromise);
                        } catch (e) {
                            rejectPromise(e);
                        }
                    }
                    function invokeCallback(settled, promise, callback, detail) {
                        var hasCallback = isFunction(callback), value, error, succeeded, failed;
                        if (hasCallback) {
                            try {
                                value = callback(detail);
                                succeeded = true;
                            } catch (e) {
                                failed = true;
                                error = e;
                            }
                        } else {
                            value = detail;
                            succeeded = true;
                        }
                        if (handleThenable(promise, value)) {
                            return;
                        } else if (hasCallback && succeeded) {
                            resolve(promise, value);
                        } else if (failed) {
                            reject(promise, error);
                        } else if (settled === FULFILLED) {
                            resolve(promise, value);
                        } else if (settled === REJECTED) {
                            reject(promise, value);
                        }
                    }
                    var PENDING = void 0;
                    var SEALED = 0;
                    var FULFILLED = 1;
                    var REJECTED = 2;
                    function subscribe(parent, child, onFulfillment, onRejection) {
                        var subscribers = parent._subscribers;
                        var length = subscribers.length;
                        subscribers[length] = child;
                        subscribers[length + FULFILLED] = onFulfillment;
                        subscribers[length + REJECTED] = onRejection;
                    }
                    function publish(promise, settled) {
                        var child, callback, subscribers = promise._subscribers, detail = promise._detail;
                        for (var i = 0; i < subscribers.length; i += 3) {
                            child = subscribers[i];
                            callback = subscribers[i + settled];
                            invokeCallback(settled, child, callback, detail);
                        }
                        promise._subscribers = null;
                    }
                    Promise.prototype = {
                        constructor: Promise,
                        _state: undefined,
                        _detail: undefined,
                        _subscribers: undefined,
                        then: function then(onFulfillment, onRejection) {
                            var promise = this;
                            var thenPromise = new this.constructor(function() {});
                            if (this._state) {
                                var callbacks = arguments;
                                config.async(function invokePromiseCallback() {
                                    invokeCallback(promise._state, thenPromise, callbacks[promise._state - 1], promise._detail);
                                });
                            } else {
                                subscribe(this, thenPromise, onFulfillment, onRejection);
                            }
                            return thenPromise;
                        },
                        "catch": function _catch(onRejection) {
                            return this.then(null, onRejection);
                        }
                    };
                    Promise.all = all;
                    Promise.race = race;
                    Promise.resolve = staticResolve;
                    Promise.reject = staticReject;
                    function handleThenable(promise, value) {
                        var then = null, resolved;
                        try {
                            if (promise === value) {
                                throw new TypeError("A promises callback cannot return that same promise.");
                            }
                            if (objectOrFunction(value)) {
                                then = value.then;
                                if (isFunction(then)) {
                                    then.call(value, function(val) {
                                        if (resolved) {
                                            return true;
                                        }
                                        resolved = true;
                                        if (value !== val) {
                                            resolve(promise, val);
                                        } else {
                                            fulfill(promise, val);
                                        }
                                    }, function(val) {
                                        if (resolved) {
                                            return true;
                                        }
                                        resolved = true;
                                        reject(promise, val);
                                    });
                                    return true;
                                }
                            }
                        } catch (error) {
                            if (resolved) {
                                return true;
                            }
                            reject(promise, error);
                            return true;
                        }
                        return false;
                    }
                    function resolve(promise, value) {
                        if (promise === value) {
                            fulfill(promise, value);
                        } else if (!handleThenable(promise, value)) {
                            fulfill(promise, value);
                        }
                    }
                    function fulfill(promise, value) {
                        if (promise._state !== PENDING) {
                            return;
                        }
                        promise._state = SEALED;
                        promise._detail = value;
                        config.async(publishFulfillment, promise);
                    }
                    function reject(promise, reason) {
                        if (promise._state !== PENDING) {
                            return;
                        }
                        promise._state = SEALED;
                        promise._detail = reason;
                        config.async(publishRejection, promise);
                    }
                    function publishFulfillment(promise) {
                        publish(promise, promise._state = FULFILLED);
                    }
                    function publishRejection(promise) {
                        publish(promise, promise._state = REJECTED);
                    }
                    __exports__.Promise = Promise;
                });
                define("promise/race", [ "./utils", "exports" ], function(__dependency1__, __exports__) {
                    "use strict";
                    var isArray = __dependency1__.isArray;
                    function race(promises) {
                        var Promise = this;
                        if (!isArray(promises)) {
                            throw new TypeError("You must pass an array to race.");
                        }
                        return new Promise(function(resolve, reject) {
                            var results = [], promise;
                            for (var i = 0; i < promises.length; i++) {
                                promise = promises[i];
                                if (promise && typeof promise.then === "function") {
                                    promise.then(resolve, reject);
                                } else {
                                    resolve(promise);
                                }
                            }
                        });
                    }
                    __exports__.race = race;
                });
                define("promise/reject", [ "exports" ], function(__exports__) {
                    "use strict";
                    function reject(reason) {
                        var Promise = this;
                        return new Promise(function(resolve, reject) {
                            reject(reason);
                        });
                    }
                    __exports__.reject = reject;
                });
                define("promise/resolve", [ "exports" ], function(__exports__) {
                    "use strict";
                    function resolve(value) {
                        if (value && typeof value === "object" && value.constructor === this) {
                            return value;
                        }
                        var Promise = this;
                        return new Promise(function(resolve) {
                            resolve(value);
                        });
                    }
                    __exports__.resolve = resolve;
                });
                define("promise/utils", [ "exports" ], function(__exports__) {
                    "use strict";
                    function objectOrFunction(x) {
                        return isFunction(x) || typeof x === "object" && x !== null;
                    }
                    function isFunction(x) {
                        return typeof x === "function";
                    }
                    function isArray(x) {
                        return Object.prototype.toString.call(x) === "[object Array]";
                    }
                    var now = Date.now || function() {
                        return new Date().getTime();
                    };
                    __exports__.objectOrFunction = objectOrFunction;
                    __exports__.isFunction = isFunction;
                    __exports__.isArray = isArray;
                    __exports__.now = now;
                });
                requireModule("promise/polyfill").polyfill();
            })();
            (function webpackUniversalModuleDefinition(root, factory) {
                if (true) module.exports = factory(); else if (typeof define === "function" && define.amd) define([], factory); else if (typeof exports === "object") exports["localforage"] = factory(); else root["localforage"] = factory();
            })(undefined, function() {
                return function(modules) {
                    var installedModules = {};
                    function __webpack_require__(moduleId) {
                        if (installedModules[moduleId]) return installedModules[moduleId].exports;
                        var module = installedModules[moduleId] = {
                            exports: {},
                            id: moduleId,
                            loaded: false
                        };
                        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
                        module.loaded = true;
                        return module.exports;
                    }
                    __webpack_require__.m = modules;
                    __webpack_require__.c = installedModules;
                    __webpack_require__.p = "";
                    return __webpack_require__(0);
                }([ function(module, exports, __webpack_require__) {
                    "use strict";
                    exports.__esModule = true;
                    function _classCallCheck(instance, Constructor) {
                        if (!(instance instanceof Constructor)) {
                            throw new TypeError("Cannot call a class as a function");
                        }
                    }
                    (function() {
                        "use strict";
                        var CustomDrivers = {};
                        var DriverType = {
                            INDEXEDDB: "asyncStorage",
                            LOCALSTORAGE: "localStorageWrapper",
                            WEBSQL: "webSQLStorage"
                        };
                        var DefaultDriverOrder = [ DriverType.INDEXEDDB, DriverType.WEBSQL, DriverType.LOCALSTORAGE ];
                        var LibraryMethods = [ "clear", "getItem", "iterate", "key", "keys", "length", "removeItem", "setItem" ];
                        var DefaultConfig = {
                            description: "",
                            driver: DefaultDriverOrder.slice(),
                            name: "localforage",
                            size: 4980736,
                            storeName: "keyvaluepairs",
                            version: 1
                        };
                        var driverSupport = function(self) {
                            var indexedDB = indexedDB || self.indexedDB || self.webkitIndexedDB || self.mozIndexedDB || self.OIndexedDB || self.msIndexedDB;
                            var result = {};
                            result[DriverType.WEBSQL] = !!self.openDatabase;
                            result[DriverType.INDEXEDDB] = !!function() {
                                if (typeof self.openDatabase !== "undefined" && self.navigator && self.navigator.userAgent && /Safari/.test(self.navigator.userAgent) && !/Chrome/.test(self.navigator.userAgent)) {
                                    return false;
                                }
                                try {
                                    return indexedDB && typeof indexedDB.open === "function" && typeof self.IDBKeyRange !== "undefined";
                                } catch (e) {
                                    return false;
                                }
                            }();
                            result[DriverType.LOCALSTORAGE] = !!function() {
                                try {
                                    return self.localStorage && "setItem" in self.localStorage && self.localStorage.setItem;
                                } catch (e) {
                                    return false;
                                }
                            }();
                            return result;
                        }(this);
                        var isArray = Array.isArray || function(arg) {
                            return Object.prototype.toString.call(arg) === "[object Array]";
                        };
                        function callWhenReady(localForageInstance, libraryMethod) {
                            localForageInstance[libraryMethod] = function() {
                                var _args = arguments;
                                return localForageInstance.ready().then(function() {
                                    return localForageInstance[libraryMethod].apply(localForageInstance, _args);
                                });
                            };
                        }
                        function extend() {
                            for (var i = 1; i < arguments.length; i++) {
                                var arg = arguments[i];
                                if (arg) {
                                    for (var key in arg) {
                                        if (arg.hasOwnProperty(key)) {
                                            if (isArray(arg[key])) {
                                                arguments[0][key] = arg[key].slice();
                                            } else {
                                                arguments[0][key] = arg[key];
                                            }
                                        }
                                    }
                                }
                            }
                            return arguments[0];
                        }
                        function isLibraryDriver(driverName) {
                            for (var driver in DriverType) {
                                if (DriverType.hasOwnProperty(driver) && DriverType[driver] === driverName) {
                                    return true;
                                }
                            }
                            return false;
                        }
                        var LocalForage = function() {
                            function LocalForage(options) {
                                _classCallCheck(this, LocalForage);
                                this.INDEXEDDB = DriverType.INDEXEDDB;
                                this.LOCALSTORAGE = DriverType.LOCALSTORAGE;
                                this.WEBSQL = DriverType.WEBSQL;
                                this._defaultConfig = extend({}, DefaultConfig);
                                this._config = extend({}, this._defaultConfig, options);
                                this._driverSet = null;
                                this._initDriver = null;
                                this._ready = false;
                                this._dbInfo = null;
                                this._wrapLibraryMethodsWithReady();
                                this.setDriver(this._config.driver);
                            }
                            LocalForage.prototype.config = function config(options) {
                                if (typeof options === "object") {
                                    if (this._ready) {
                                        return new Error("Can't call config() after localforage " + "has been used.");
                                    }
                                    for (var i in options) {
                                        if (i === "storeName") {
                                            options[i] = options[i].replace(/\W/g, "_");
                                        }
                                        this._config[i] = options[i];
                                    }
                                    if ("driver" in options && options.driver) {
                                        this.setDriver(this._config.driver);
                                    }
                                    return true;
                                } else if (typeof options === "string") {
                                    return this._config[options];
                                } else {
                                    return this._config;
                                }
                            };
                            LocalForage.prototype.defineDriver = function defineDriver(driverObject, callback, errorCallback) {
                                var promise = new Promise(function(resolve, reject) {
                                    try {
                                        var driverName = driverObject._driver;
                                        var complianceError = new Error("Custom driver not compliant; see " + "https://mozilla.github.io/localForage/#definedriver");
                                        var namingError = new Error("Custom driver name already in use: " + driverObject._driver);
                                        if (!driverObject._driver) {
                                            reject(complianceError);
                                            return;
                                        }
                                        if (isLibraryDriver(driverObject._driver)) {
                                            reject(namingError);
                                            return;
                                        }
                                        var customDriverMethods = LibraryMethods.concat("_initStorage");
                                        for (var i = 0; i < customDriverMethods.length; i++) {
                                            var customDriverMethod = customDriverMethods[i];
                                            if (!customDriverMethod || !driverObject[customDriverMethod] || typeof driverObject[customDriverMethod] !== "function") {
                                                reject(complianceError);
                                                return;
                                            }
                                        }
                                        var supportPromise = Promise.resolve(true);
                                        if ("_support" in driverObject) {
                                            if (driverObject._support && typeof driverObject._support === "function") {
                                                supportPromise = driverObject._support();
                                            } else {
                                                supportPromise = Promise.resolve(!!driverObject._support);
                                            }
                                        }
                                        supportPromise.then(function(supportResult) {
                                            driverSupport[driverName] = supportResult;
                                            CustomDrivers[driverName] = driverObject;
                                            resolve();
                                        }, reject);
                                    } catch (e) {
                                        reject(e);
                                    }
                                });
                                promise.then(callback, errorCallback);
                                return promise;
                            };
                            LocalForage.prototype.driver = function driver() {
                                return this._driver || null;
                            };
                            LocalForage.prototype.getDriver = function getDriver(driverName, callback, errorCallback) {
                                var self = this;
                                var getDriverPromise = function() {
                                    if (isLibraryDriver(driverName)) {
                                        switch (driverName) {
                                          case self.INDEXEDDB:
                                            return new Promise(function(resolve, reject) {
                                                resolve(__webpack_require__(1));
                                            });

                                          case self.LOCALSTORAGE:
                                            return new Promise(function(resolve, reject) {
                                                resolve(__webpack_require__(2));
                                            });

                                          case self.WEBSQL:
                                            return new Promise(function(resolve, reject) {
                                                resolve(__webpack_require__(4));
                                            });
                                        }
                                    } else if (CustomDrivers[driverName]) {
                                        return Promise.resolve(CustomDrivers[driverName]);
                                    }
                                    return Promise.reject(new Error("Driver not found."));
                                }();
                                getDriverPromise.then(callback, errorCallback);
                                return getDriverPromise;
                            };
                            LocalForage.prototype.getSerializer = function getSerializer(callback) {
                                var serializerPromise = new Promise(function(resolve, reject) {
                                    resolve(__webpack_require__(3));
                                });
                                if (callback && typeof callback === "function") {
                                    serializerPromise.then(function(result) {
                                        callback(result);
                                    });
                                }
                                return serializerPromise;
                            };
                            LocalForage.prototype.ready = function ready(callback) {
                                var self = this;
                                var promise = self._driverSet.then(function() {
                                    if (self._ready === null) {
                                        self._ready = self._initDriver();
                                    }
                                    return self._ready;
                                });
                                promise.then(callback, callback);
                                return promise;
                            };
                            LocalForage.prototype.setDriver = function setDriver(drivers, callback, errorCallback) {
                                var self = this;
                                if (!isArray(drivers)) {
                                    drivers = [ drivers ];
                                }
                                var supportedDrivers = this._getSupportedDrivers(drivers);
                                function setDriverToConfig() {
                                    self._config.driver = self.driver();
                                }
                                function initDriver(supportedDrivers) {
                                    return function() {
                                        var currentDriverIndex = 0;
                                        function driverPromiseLoop() {
                                            while (currentDriverIndex < supportedDrivers.length) {
                                                var driverName = supportedDrivers[currentDriverIndex];
                                                currentDriverIndex++;
                                                self._dbInfo = null;
                                                self._ready = null;
                                                return self.getDriver(driverName).then(function(driver) {
                                                    self._extend(driver);
                                                    setDriverToConfig();
                                                    self._ready = self._initStorage(self._config);
                                                    return self._ready;
                                                })["catch"](driverPromiseLoop);
                                            }
                                            setDriverToConfig();
                                            var error = new Error("No available storage method found.");
                                            self._driverSet = Promise.reject(error);
                                            return self._driverSet;
                                        }
                                        return driverPromiseLoop();
                                    };
                                }
                                var oldDriverSetDone = this._driverSet !== null ? this._driverSet["catch"](function() {
                                    return Promise.resolve();
                                }) : Promise.resolve();
                                this._driverSet = oldDriverSetDone.then(function() {
                                    var driverName = supportedDrivers[0];
                                    self._dbInfo = null;
                                    self._ready = null;
                                    return self.getDriver(driverName).then(function(driver) {
                                        self._driver = driver._driver;
                                        setDriverToConfig();
                                        self._wrapLibraryMethodsWithReady();
                                        self._initDriver = initDriver(supportedDrivers);
                                    });
                                })["catch"](function() {
                                    setDriverToConfig();
                                    var error = new Error("No available storage method found.");
                                    self._driverSet = Promise.reject(error);
                                    return self._driverSet;
                                });
                                this._driverSet.then(callback, errorCallback);
                                return this._driverSet;
                            };
                            LocalForage.prototype.supports = function supports(driverName) {
                                return !!driverSupport[driverName];
                            };
                            LocalForage.prototype._extend = function _extend(libraryMethodsAndProperties) {
                                extend(this, libraryMethodsAndProperties);
                            };
                            LocalForage.prototype._getSupportedDrivers = function _getSupportedDrivers(drivers) {
                                var supportedDrivers = [];
                                for (var i = 0, len = drivers.length; i < len; i++) {
                                    var driverName = drivers[i];
                                    if (this.supports(driverName)) {
                                        supportedDrivers.push(driverName);
                                    }
                                }
                                return supportedDrivers;
                            };
                            LocalForage.prototype._wrapLibraryMethodsWithReady = function _wrapLibraryMethodsWithReady() {
                                for (var i = 0; i < LibraryMethods.length; i++) {
                                    callWhenReady(this, LibraryMethods[i]);
                                }
                            };
                            LocalForage.prototype.createInstance = function createInstance(options) {
                                return new LocalForage(options);
                            };
                            return LocalForage;
                        }();
                        var localForage = new LocalForage();
                        exports["default"] = localForage;
                    }).call(typeof window !== "undefined" ? window : self);
                    module.exports = exports["default"];
                }, function(module, exports) {
                    "use strict";
                    exports.__esModule = true;
                    (function() {
                        "use strict";
                        var globalObject = this;
                        var indexedDB = indexedDB || this.indexedDB || this.webkitIndexedDB || this.mozIndexedDB || this.OIndexedDB || this.msIndexedDB;
                        if (!indexedDB) {
                            return;
                        }
                        var DETECT_BLOB_SUPPORT_STORE = "local-forage-detect-blob-support";
                        var supportsBlobs;
                        var dbContexts;
                        function _createBlob(parts, properties) {
                            parts = parts || [];
                            properties = properties || {};
                            try {
                                return new Blob(parts, properties);
                            } catch (e) {
                                if (e.name !== "TypeError") {
                                    throw e;
                                }
                                var BlobBuilder = globalObject.BlobBuilder || globalObject.MSBlobBuilder || globalObject.MozBlobBuilder || globalObject.WebKitBlobBuilder;
                                var builder = new BlobBuilder();
                                for (var i = 0; i < parts.length; i += 1) {
                                    builder.append(parts[i]);
                                }
                                return builder.getBlob(properties.type);
                            }
                        }
                        function _binStringToArrayBuffer(bin) {
                            var length = bin.length;
                            var buf = new ArrayBuffer(length);
                            var arr = new Uint8Array(buf);
                            for (var i = 0; i < length; i++) {
                                arr[i] = bin.charCodeAt(i);
                            }
                            return buf;
                        }
                        function _blobAjax(url) {
                            return new Promise(function(resolve, reject) {
                                var xhr = new XMLHttpRequest();
                                xhr.open("GET", url);
                                xhr.withCredentials = true;
                                xhr.responseType = "arraybuffer";
                                xhr.onreadystatechange = function() {
                                    if (xhr.readyState !== 4) {
                                        return;
                                    }
                                    if (xhr.status === 200) {
                                        return resolve({
                                            response: xhr.response,
                                            type: xhr.getResponseHeader("Content-Type")
                                        });
                                    }
                                    reject({
                                        status: xhr.status,
                                        response: xhr.response
                                    });
                                };
                                xhr.send();
                            });
                        }
                        function _checkBlobSupportWithoutCaching(idb) {
                            return new Promise(function(resolve, reject) {
                                var blob = _createBlob([ "" ], {
                                    type: "image/png"
                                });
                                var txn = idb.transaction([ DETECT_BLOB_SUPPORT_STORE ], "readwrite");
                                txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, "key");
                                txn.oncomplete = function() {
                                    var blobTxn = idb.transaction([ DETECT_BLOB_SUPPORT_STORE ], "readwrite");
                                    var getBlobReq = blobTxn.objectStore(DETECT_BLOB_SUPPORT_STORE).get("key");
                                    getBlobReq.onerror = reject;
                                    getBlobReq.onsuccess = function(e) {
                                        var storedBlob = e.target.result;
                                        var url = URL.createObjectURL(storedBlob);
                                        _blobAjax(url).then(function(res) {
                                            resolve(!!(res && res.type === "image/png"));
                                        }, function() {
                                            resolve(false);
                                        }).then(function() {
                                            URL.revokeObjectURL(url);
                                        });
                                    };
                                };
                            })["catch"](function() {
                                return false;
                            });
                        }
                        function _checkBlobSupport(idb) {
                            if (typeof supportsBlobs === "boolean") {
                                return Promise.resolve(supportsBlobs);
                            }
                            return _checkBlobSupportWithoutCaching(idb).then(function(value) {
                                supportsBlobs = value;
                                return supportsBlobs;
                            });
                        }
                        function _encodeBlob(blob) {
                            return new Promise(function(resolve, reject) {
                                var reader = new FileReader();
                                reader.onerror = reject;
                                reader.onloadend = function(e) {
                                    var base64 = btoa(e.target.result || "");
                                    resolve({
                                        __local_forage_encoded_blob: true,
                                        data: base64,
                                        type: blob.type
                                    });
                                };
                                reader.readAsBinaryString(blob);
                            });
                        }
                        function _decodeBlob(encodedBlob) {
                            var arrayBuff = _binStringToArrayBuffer(atob(encodedBlob.data));
                            return _createBlob([ arrayBuff ], {
                                type: encodedBlob.type
                            });
                        }
                        function _isEncodedBlob(value) {
                            return value && value.__local_forage_encoded_blob;
                        }
                        function _initStorage(options) {
                            var self = this;
                            var dbInfo = {
                                db: null
                            };
                            if (options) {
                                for (var i in options) {
                                    dbInfo[i] = options[i];
                                }
                            }
                            if (!dbContexts) {
                                dbContexts = {};
                            }
                            var dbContext = dbContexts[dbInfo.name];
                            if (!dbContext) {
                                dbContext = {
                                    forages: [],
                                    db: null
                                };
                                dbContexts[dbInfo.name] = dbContext;
                            }
                            dbContext.forages.push(this);
                            var readyPromises = [];
                            function ignoreErrors() {
                                return Promise.resolve();
                            }
                            for (var j = 0; j < dbContext.forages.length; j++) {
                                var forage = dbContext.forages[j];
                                if (forage !== this) {
                                    readyPromises.push(forage.ready()["catch"](ignoreErrors));
                                }
                            }
                            var forages = dbContext.forages.slice(0);
                            return Promise.all(readyPromises).then(function() {
                                dbInfo.db = dbContext.db;
                                return _getOriginalConnection(dbInfo);
                            }).then(function(db) {
                                dbInfo.db = db;
                                if (_isUpgradeNeeded(dbInfo, self._defaultConfig.version)) {
                                    return _getUpgradedConnection(dbInfo);
                                }
                                return db;
                            }).then(function(db) {
                                dbInfo.db = dbContext.db = db;
                                self._dbInfo = dbInfo;
                                for (var k = 0; k < forages.length; k++) {
                                    var forage = forages[k];
                                    if (forage !== self) {
                                        forage._dbInfo.db = dbInfo.db;
                                        forage._dbInfo.version = dbInfo.version;
                                    }
                                }
                            });
                        }
                        function _getOriginalConnection(dbInfo) {
                            return _getConnection(dbInfo, false);
                        }
                        function _getUpgradedConnection(dbInfo) {
                            return _getConnection(dbInfo, true);
                        }
                        function _getConnection(dbInfo, upgradeNeeded) {
                            return new Promise(function(resolve, reject) {
                                if (dbInfo.db) {
                                    if (upgradeNeeded) {
                                        dbInfo.db.close();
                                    } else {
                                        return resolve(dbInfo.db);
                                    }
                                }
                                var dbArgs = [ dbInfo.name ];
                                if (upgradeNeeded) {
                                    dbArgs.push(dbInfo.version);
                                }
                                var openreq = indexedDB.open.apply(indexedDB, dbArgs);
                                if (upgradeNeeded) {
                                    openreq.onupgradeneeded = function(e) {
                                        var db = openreq.result;
                                        try {
                                            db.createObjectStore(dbInfo.storeName);
                                            if (e.oldVersion <= 1) {
                                                db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
                                            }
                                        } catch (ex) {
                                            if (ex.name === "ConstraintError") {
                                                globalObject.console.warn('The database "' + dbInfo.name + '"' + " has been upgraded from version " + e.oldVersion + " to version " + e.newVersion + ', but the storage "' + dbInfo.storeName + '" already exists.');
                                            } else {
                                                throw ex;
                                            }
                                        }
                                    };
                                }
                                openreq.onerror = function() {
                                    reject(openreq.error);
                                };
                                openreq.onsuccess = function() {
                                    resolve(openreq.result);
                                };
                            });
                        }
                        function _isUpgradeNeeded(dbInfo, defaultVersion) {
                            if (!dbInfo.db) {
                                return true;
                            }
                            var isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName);
                            var isDowngrade = dbInfo.version < dbInfo.db.version;
                            var isUpgrade = dbInfo.version > dbInfo.db.version;
                            if (isDowngrade) {
                                if (dbInfo.version !== defaultVersion) {
                                    globalObject.console.warn('The database "' + dbInfo.name + '"' + " can't be downgraded from version " + dbInfo.db.version + " to version " + dbInfo.version + ".");
                                }
                                dbInfo.version = dbInfo.db.version;
                            }
                            if (isUpgrade || isNewStore) {
                                if (isNewStore) {
                                    var incVersion = dbInfo.db.version + 1;
                                    if (incVersion > dbInfo.version) {
                                        dbInfo.version = incVersion;
                                    }
                                }
                                return true;
                            }
                            return false;
                        }
                        function getItem(key, callback) {
                            var self = this;
                            if (typeof key !== "string") {
                                globalObject.console.warn(key + " used as a key, but it is not a string.");
                                key = String(key);
                            }
                            var promise = new Promise(function(resolve, reject) {
                                self.ready().then(function() {
                                    var dbInfo = self._dbInfo;
                                    var store = dbInfo.db.transaction(dbInfo.storeName, "readonly").objectStore(dbInfo.storeName);
                                    var req = store.get(key);
                                    req.onsuccess = function() {
                                        var value = req.result;
                                        if (value === undefined) {
                                            value = null;
                                        }
                                        if (_isEncodedBlob(value)) {
                                            value = _decodeBlob(value);
                                        }
                                        resolve(value);
                                    };
                                    req.onerror = function() {
                                        reject(req.error);
                                    };
                                })["catch"](reject);
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function iterate(iterator, callback) {
                            var self = this;
                            var promise = new Promise(function(resolve, reject) {
                                self.ready().then(function() {
                                    var dbInfo = self._dbInfo;
                                    var store = dbInfo.db.transaction(dbInfo.storeName, "readonly").objectStore(dbInfo.storeName);
                                    var req = store.openCursor();
                                    var iterationNumber = 1;
                                    req.onsuccess = function() {
                                        var cursor = req.result;
                                        if (cursor) {
                                            var value = cursor.value;
                                            if (_isEncodedBlob(value)) {
                                                value = _decodeBlob(value);
                                            }
                                            var result = iterator(value, cursor.key, iterationNumber++);
                                            if (result !== void 0) {
                                                resolve(result);
                                            } else {
                                                cursor["continue"]();
                                            }
                                        } else {
                                            resolve();
                                        }
                                    };
                                    req.onerror = function() {
                                        reject(req.error);
                                    };
                                })["catch"](reject);
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function setItem(key, value, callback) {
                            var self = this;
                            if (typeof key !== "string") {
                                globalObject.console.warn(key + " used as a key, but it is not a string.");
                                key = String(key);
                            }
                            var promise = new Promise(function(resolve, reject) {
                                var dbInfo;
                                self.ready().then(function() {
                                    dbInfo = self._dbInfo;
                                    if (value instanceof Blob) {
                                        return _checkBlobSupport(dbInfo.db).then(function(blobSupport) {
                                            if (blobSupport) {
                                                return value;
                                            }
                                            return _encodeBlob(value);
                                        });
                                    }
                                    return value;
                                }).then(function(value) {
                                    var transaction = dbInfo.db.transaction(dbInfo.storeName, "readwrite");
                                    var store = transaction.objectStore(dbInfo.storeName);
                                    if (value === null) {
                                        value = undefined;
                                    }
                                    var req = store.put(value, key);
                                    transaction.oncomplete = function() {
                                        if (value === undefined) {
                                            value = null;
                                        }
                                        resolve(value);
                                    };
                                    transaction.onabort = transaction.onerror = function() {
                                        var err = req.error ? req.error : req.transaction.error;
                                        reject(err);
                                    };
                                })["catch"](reject);
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function removeItem(key, callback) {
                            var self = this;
                            if (typeof key !== "string") {
                                globalObject.console.warn(key + " used as a key, but it is not a string.");
                                key = String(key);
                            }
                            var promise = new Promise(function(resolve, reject) {
                                self.ready().then(function() {
                                    var dbInfo = self._dbInfo;
                                    var transaction = dbInfo.db.transaction(dbInfo.storeName, "readwrite");
                                    var store = transaction.objectStore(dbInfo.storeName);
                                    var req = store["delete"](key);
                                    transaction.oncomplete = function() {
                                        resolve();
                                    };
                                    transaction.onerror = function() {
                                        reject(req.error);
                                    };
                                    transaction.onabort = function() {
                                        var err = req.error ? req.error : req.transaction.error;
                                        reject(err);
                                    };
                                })["catch"](reject);
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function clear(callback) {
                            var self = this;
                            var promise = new Promise(function(resolve, reject) {
                                self.ready().then(function() {
                                    var dbInfo = self._dbInfo;
                                    var transaction = dbInfo.db.transaction(dbInfo.storeName, "readwrite");
                                    var store = transaction.objectStore(dbInfo.storeName);
                                    var req = store.clear();
                                    transaction.oncomplete = function() {
                                        resolve();
                                    };
                                    transaction.onabort = transaction.onerror = function() {
                                        var err = req.error ? req.error : req.transaction.error;
                                        reject(err);
                                    };
                                })["catch"](reject);
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function length(callback) {
                            var self = this;
                            var promise = new Promise(function(resolve, reject) {
                                self.ready().then(function() {
                                    var dbInfo = self._dbInfo;
                                    var store = dbInfo.db.transaction(dbInfo.storeName, "readonly").objectStore(dbInfo.storeName);
                                    var req = store.count();
                                    req.onsuccess = function() {
                                        resolve(req.result);
                                    };
                                    req.onerror = function() {
                                        reject(req.error);
                                    };
                                })["catch"](reject);
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function key(n, callback) {
                            var self = this;
                            var promise = new Promise(function(resolve, reject) {
                                if (n < 0) {
                                    resolve(null);
                                    return;
                                }
                                self.ready().then(function() {
                                    var dbInfo = self._dbInfo;
                                    var store = dbInfo.db.transaction(dbInfo.storeName, "readonly").objectStore(dbInfo.storeName);
                                    var advanced = false;
                                    var req = store.openCursor();
                                    req.onsuccess = function() {
                                        var cursor = req.result;
                                        if (!cursor) {
                                            resolve(null);
                                            return;
                                        }
                                        if (n === 0) {
                                            resolve(cursor.key);
                                        } else {
                                            if (!advanced) {
                                                advanced = true;
                                                cursor.advance(n);
                                            } else {
                                                resolve(cursor.key);
                                            }
                                        }
                                    };
                                    req.onerror = function() {
                                        reject(req.error);
                                    };
                                })["catch"](reject);
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function keys(callback) {
                            var self = this;
                            var promise = new Promise(function(resolve, reject) {
                                self.ready().then(function() {
                                    var dbInfo = self._dbInfo;
                                    var store = dbInfo.db.transaction(dbInfo.storeName, "readonly").objectStore(dbInfo.storeName);
                                    var req = store.openCursor();
                                    var keys = [];
                                    req.onsuccess = function() {
                                        var cursor = req.result;
                                        if (!cursor) {
                                            resolve(keys);
                                            return;
                                        }
                                        keys.push(cursor.key);
                                        cursor["continue"]();
                                    };
                                    req.onerror = function() {
                                        reject(req.error);
                                    };
                                })["catch"](reject);
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function executeCallback(promise, callback) {
                            if (callback) {
                                promise.then(function(result) {
                                    callback(null, result);
                                }, function(error) {
                                    callback(error);
                                });
                            }
                        }
                        var asyncStorage = {
                            _driver: "asyncStorage",
                            _initStorage: _initStorage,
                            iterate: iterate,
                            getItem: getItem,
                            setItem: setItem,
                            removeItem: removeItem,
                            clear: clear,
                            length: length,
                            key: key,
                            keys: keys
                        };
                        exports["default"] = asyncStorage;
                    }).call(typeof window !== "undefined" ? window : self);
                    module.exports = exports["default"];
                }, function(module, exports, __webpack_require__) {
                    "use strict";
                    exports.__esModule = true;
                    (function() {
                        "use strict";
                        var globalObject = this;
                        var localStorage = null;
                        try {
                            if (!this.localStorage || !("setItem" in this.localStorage)) {
                                return;
                            }
                            localStorage = this.localStorage;
                        } catch (e) {
                            return;
                        }
                        function _initStorage(options) {
                            var self = this;
                            var dbInfo = {};
                            if (options) {
                                for (var i in options) {
                                    dbInfo[i] = options[i];
                                }
                            }
                            dbInfo.keyPrefix = dbInfo.name + "/";
                            if (dbInfo.storeName !== self._defaultConfig.storeName) {
                                dbInfo.keyPrefix += dbInfo.storeName + "/";
                            }
                            self._dbInfo = dbInfo;
                            return new Promise(function(resolve, reject) {
                                resolve(__webpack_require__(3));
                            }).then(function(lib) {
                                dbInfo.serializer = lib;
                                return Promise.resolve();
                            });
                        }
                        function clear(callback) {
                            var self = this;
                            var promise = self.ready().then(function() {
                                var keyPrefix = self._dbInfo.keyPrefix;
                                for (var i = localStorage.length - 1; i >= 0; i--) {
                                    var key = localStorage.key(i);
                                    if (key.indexOf(keyPrefix) === 0) {
                                        localStorage.removeItem(key);
                                    }
                                }
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function getItem(key, callback) {
                            var self = this;
                            if (typeof key !== "string") {
                                globalObject.console.warn(key + " used as a key, but it is not a string.");
                                key = String(key);
                            }
                            var promise = self.ready().then(function() {
                                var dbInfo = self._dbInfo;
                                var result = localStorage.getItem(dbInfo.keyPrefix + key);
                                if (result) {
                                    result = dbInfo.serializer.deserialize(result);
                                }
                                return result;
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function iterate(iterator, callback) {
                            var self = this;
                            var promise = self.ready().then(function() {
                                var dbInfo = self._dbInfo;
                                var keyPrefix = dbInfo.keyPrefix;
                                var keyPrefixLength = keyPrefix.length;
                                var length = localStorage.length;
                                var iterationNumber = 1;
                                for (var i = 0; i < length; i++) {
                                    var key = localStorage.key(i);
                                    if (key.indexOf(keyPrefix) !== 0) {
                                        continue;
                                    }
                                    var value = localStorage.getItem(key);
                                    if (value) {
                                        value = dbInfo.serializer.deserialize(value);
                                    }
                                    value = iterator(value, key.substring(keyPrefixLength), iterationNumber++);
                                    if (value !== void 0) {
                                        return value;
                                    }
                                }
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function key(n, callback) {
                            var self = this;
                            var promise = self.ready().then(function() {
                                var dbInfo = self._dbInfo;
                                var result;
                                try {
                                    result = localStorage.key(n);
                                } catch (error) {
                                    result = null;
                                }
                                if (result) {
                                    result = result.substring(dbInfo.keyPrefix.length);
                                }
                                return result;
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function keys(callback) {
                            var self = this;
                            var promise = self.ready().then(function() {
                                var dbInfo = self._dbInfo;
                                var length = localStorage.length;
                                var keys = [];
                                for (var i = 0; i < length; i++) {
                                    if (localStorage.key(i).indexOf(dbInfo.keyPrefix) === 0) {
                                        keys.push(localStorage.key(i).substring(dbInfo.keyPrefix.length));
                                    }
                                }
                                return keys;
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function length(callback) {
                            var self = this;
                            var promise = self.keys().then(function(keys) {
                                return keys.length;
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function removeItem(key, callback) {
                            var self = this;
                            if (typeof key !== "string") {
                                globalObject.console.warn(key + " used as a key, but it is not a string.");
                                key = String(key);
                            }
                            var promise = self.ready().then(function() {
                                var dbInfo = self._dbInfo;
                                localStorage.removeItem(dbInfo.keyPrefix + key);
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function setItem(key, value, callback) {
                            var self = this;
                            if (typeof key !== "string") {
                                globalObject.console.warn(key + " used as a key, but it is not a string.");
                                key = String(key);
                            }
                            var promise = self.ready().then(function() {
                                if (value === undefined) {
                                    value = null;
                                }
                                var originalValue = value;
                                return new Promise(function(resolve, reject) {
                                    var dbInfo = self._dbInfo;
                                    dbInfo.serializer.serialize(value, function(value, error) {
                                        if (error) {
                                            reject(error);
                                        } else {
                                            try {
                                                localStorage.setItem(dbInfo.keyPrefix + key, value);
                                                resolve(originalValue);
                                            } catch (e) {
                                                if (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED") {
                                                    reject(e);
                                                }
                                                reject(e);
                                            }
                                        }
                                    });
                                });
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function executeCallback(promise, callback) {
                            if (callback) {
                                promise.then(function(result) {
                                    callback(null, result);
                                }, function(error) {
                                    callback(error);
                                });
                            }
                        }
                        var localStorageWrapper = {
                            _driver: "localStorageWrapper",
                            _initStorage: _initStorage,
                            iterate: iterate,
                            getItem: getItem,
                            setItem: setItem,
                            removeItem: removeItem,
                            clear: clear,
                            length: length,
                            key: key,
                            keys: keys
                        };
                        exports["default"] = localStorageWrapper;
                    }).call(typeof window !== "undefined" ? window : self);
                    module.exports = exports["default"];
                }, function(module, exports) {
                    "use strict";
                    exports.__esModule = true;
                    (function() {
                        "use strict";
                        var BASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                        var BLOB_TYPE_PREFIX = "~~local_forage_type~";
                        var BLOB_TYPE_PREFIX_REGEX = /^~~local_forage_type~([^~]+)~/;
                        var SERIALIZED_MARKER = "__lfsc__:";
                        var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;
                        var TYPE_ARRAYBUFFER = "arbf";
                        var TYPE_BLOB = "blob";
                        var TYPE_INT8ARRAY = "si08";
                        var TYPE_UINT8ARRAY = "ui08";
                        var TYPE_UINT8CLAMPEDARRAY = "uic8";
                        var TYPE_INT16ARRAY = "si16";
                        var TYPE_INT32ARRAY = "si32";
                        var TYPE_UINT16ARRAY = "ur16";
                        var TYPE_UINT32ARRAY = "ui32";
                        var TYPE_FLOAT32ARRAY = "fl32";
                        var TYPE_FLOAT64ARRAY = "fl64";
                        var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;
                        var globalObject = this;
                        function _createBlob(parts, properties) {
                            parts = parts || [];
                            properties = properties || {};
                            try {
                                return new Blob(parts, properties);
                            } catch (err) {
                                if (err.name !== "TypeError") {
                                    throw err;
                                }
                                var BlobBuilder = globalObject.BlobBuilder || globalObject.MSBlobBuilder || globalObject.MozBlobBuilder || globalObject.WebKitBlobBuilder;
                                var builder = new BlobBuilder();
                                for (var i = 0; i < parts.length; i += 1) {
                                    builder.append(parts[i]);
                                }
                                return builder.getBlob(properties.type);
                            }
                        }
                        function serialize(value, callback) {
                            var valueString = "";
                            if (value) {
                                valueString = value.toString();
                            }
                            if (value && (value.toString() === "[object ArrayBuffer]" || value.buffer && value.buffer.toString() === "[object ArrayBuffer]")) {
                                var buffer;
                                var marker = SERIALIZED_MARKER;
                                if (value instanceof ArrayBuffer) {
                                    buffer = value;
                                    marker += TYPE_ARRAYBUFFER;
                                } else {
                                    buffer = value.buffer;
                                    if (valueString === "[object Int8Array]") {
                                        marker += TYPE_INT8ARRAY;
                                    } else if (valueString === "[object Uint8Array]") {
                                        marker += TYPE_UINT8ARRAY;
                                    } else if (valueString === "[object Uint8ClampedArray]") {
                                        marker += TYPE_UINT8CLAMPEDARRAY;
                                    } else if (valueString === "[object Int16Array]") {
                                        marker += TYPE_INT16ARRAY;
                                    } else if (valueString === "[object Uint16Array]") {
                                        marker += TYPE_UINT16ARRAY;
                                    } else if (valueString === "[object Int32Array]") {
                                        marker += TYPE_INT32ARRAY;
                                    } else if (valueString === "[object Uint32Array]") {
                                        marker += TYPE_UINT32ARRAY;
                                    } else if (valueString === "[object Float32Array]") {
                                        marker += TYPE_FLOAT32ARRAY;
                                    } else if (valueString === "[object Float64Array]") {
                                        marker += TYPE_FLOAT64ARRAY;
                                    } else {
                                        callback(new Error("Failed to get type for BinaryArray"));
                                    }
                                }
                                callback(marker + bufferToString(buffer));
                            } else if (valueString === "[object Blob]") {
                                var fileReader = new FileReader();
                                fileReader.onload = function() {
                                    var str = BLOB_TYPE_PREFIX + value.type + "~" + bufferToString(this.result);
                                    callback(SERIALIZED_MARKER + TYPE_BLOB + str);
                                };
                                fileReader.readAsArrayBuffer(value);
                            } else {
                                try {
                                    callback(JSON.stringify(value));
                                } catch (e) {
                                    console.error("Couldn't convert value into a JSON string: ", value);
                                    callback(null, e);
                                }
                            }
                        }
                        function deserialize(value) {
                            if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {
                                return JSON.parse(value);
                            }
                            var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
                            var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);
                            var blobType;
                            if (type === TYPE_BLOB && BLOB_TYPE_PREFIX_REGEX.test(serializedString)) {
                                var matcher = serializedString.match(BLOB_TYPE_PREFIX_REGEX);
                                blobType = matcher[1];
                                serializedString = serializedString.substring(matcher[0].length);
                            }
                            var buffer = stringToBuffer(serializedString);
                            switch (type) {
                              case TYPE_ARRAYBUFFER:
                                return buffer;

                              case TYPE_BLOB:
                                return _createBlob([ buffer ], {
                                    type: blobType
                                });

                              case TYPE_INT8ARRAY:
                                return new Int8Array(buffer);

                              case TYPE_UINT8ARRAY:
                                return new Uint8Array(buffer);

                              case TYPE_UINT8CLAMPEDARRAY:
                                return new Uint8ClampedArray(buffer);

                              case TYPE_INT16ARRAY:
                                return new Int16Array(buffer);

                              case TYPE_UINT16ARRAY:
                                return new Uint16Array(buffer);

                              case TYPE_INT32ARRAY:
                                return new Int32Array(buffer);

                              case TYPE_UINT32ARRAY:
                                return new Uint32Array(buffer);

                              case TYPE_FLOAT32ARRAY:
                                return new Float32Array(buffer);

                              case TYPE_FLOAT64ARRAY:
                                return new Float64Array(buffer);

                              default:
                                throw new Error("Unkown type: " + type);
                            }
                        }
                        function stringToBuffer(serializedString) {
                            var bufferLength = serializedString.length * .75;
                            var len = serializedString.length;
                            var i;
                            var p = 0;
                            var encoded1, encoded2, encoded3, encoded4;
                            if (serializedString[serializedString.length - 1] === "=") {
                                bufferLength--;
                                if (serializedString[serializedString.length - 2] === "=") {
                                    bufferLength--;
                                }
                            }
                            var buffer = new ArrayBuffer(bufferLength);
                            var bytes = new Uint8Array(buffer);
                            for (i = 0; i < len; i += 4) {
                                encoded1 = BASE_CHARS.indexOf(serializedString[i]);
                                encoded2 = BASE_CHARS.indexOf(serializedString[i + 1]);
                                encoded3 = BASE_CHARS.indexOf(serializedString[i + 2]);
                                encoded4 = BASE_CHARS.indexOf(serializedString[i + 3]);
                                bytes[p++] = encoded1 << 2 | encoded2 >> 4;
                                bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
                                bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
                            }
                            return buffer;
                        }
                        function bufferToString(buffer) {
                            var bytes = new Uint8Array(buffer);
                            var base64String = "";
                            var i;
                            for (i = 0; i < bytes.length; i += 3) {
                                base64String += BASE_CHARS[bytes[i] >> 2];
                                base64String += BASE_CHARS[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
                                base64String += BASE_CHARS[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
                                base64String += BASE_CHARS[bytes[i + 2] & 63];
                            }
                            if (bytes.length % 3 === 2) {
                                base64String = base64String.substring(0, base64String.length - 1) + "=";
                            } else if (bytes.length % 3 === 1) {
                                base64String = base64String.substring(0, base64String.length - 2) + "==";
                            }
                            return base64String;
                        }
                        var localforageSerializer = {
                            serialize: serialize,
                            deserialize: deserialize,
                            stringToBuffer: stringToBuffer,
                            bufferToString: bufferToString
                        };
                        exports["default"] = localforageSerializer;
                    }).call(typeof window !== "undefined" ? window : self);
                    module.exports = exports["default"];
                }, function(module, exports, __webpack_require__) {
                    "use strict";
                    exports.__esModule = true;
                    (function() {
                        "use strict";
                        var globalObject = this;
                        var openDatabase = this.openDatabase;
                        if (!openDatabase) {
                            return;
                        }
                        function _initStorage(options) {
                            var self = this;
                            var dbInfo = {
                                db: null
                            };
                            if (options) {
                                for (var i in options) {
                                    dbInfo[i] = typeof options[i] !== "string" ? options[i].toString() : options[i];
                                }
                            }
                            var dbInfoPromise = new Promise(function(resolve, reject) {
                                try {
                                    dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version), dbInfo.description, dbInfo.size);
                                } catch (e) {
                                    return self.setDriver(self.LOCALSTORAGE).then(function() {
                                        return self._initStorage(options);
                                    }).then(resolve)["catch"](reject);
                                }
                                dbInfo.db.transaction(function(t) {
                                    t.executeSql("CREATE TABLE IF NOT EXISTS " + dbInfo.storeName + " (id INTEGER PRIMARY KEY, key unique, value)", [], function() {
                                        self._dbInfo = dbInfo;
                                        resolve();
                                    }, function(t, error) {
                                        reject(error);
                                    });
                                });
                            });
                            return new Promise(function(resolve, reject) {
                                resolve(__webpack_require__(3));
                            }).then(function(lib) {
                                dbInfo.serializer = lib;
                                return dbInfoPromise;
                            });
                        }
                        function getItem(key, callback) {
                            var self = this;
                            if (typeof key !== "string") {
                                globalObject.console.warn(key + " used as a key, but it is not a string.");
                                key = String(key);
                            }
                            var promise = new Promise(function(resolve, reject) {
                                self.ready().then(function() {
                                    var dbInfo = self._dbInfo;
                                    dbInfo.db.transaction(function(t) {
                                        t.executeSql("SELECT * FROM " + dbInfo.storeName + " WHERE key = ? LIMIT 1", [ key ], function(t, results) {
                                            var result = results.rows.length ? results.rows.item(0).value : null;
                                            if (result) {
                                                result = dbInfo.serializer.deserialize(result);
                                            }
                                            resolve(result);
                                        }, function(t, error) {
                                            reject(error);
                                        });
                                    });
                                })["catch"](reject);
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function iterate(iterator, callback) {
                            var self = this;
                            var promise = new Promise(function(resolve, reject) {
                                self.ready().then(function() {
                                    var dbInfo = self._dbInfo;
                                    dbInfo.db.transaction(function(t) {
                                        t.executeSql("SELECT * FROM " + dbInfo.storeName, [], function(t, results) {
                                            var rows = results.rows;
                                            var length = rows.length;
                                            for (var i = 0; i < length; i++) {
                                                var item = rows.item(i);
                                                var result = item.value;
                                                if (result) {
                                                    result = dbInfo.serializer.deserialize(result);
                                                }
                                                result = iterator(result, item.key, i + 1);
                                                if (result !== void 0) {
                                                    resolve(result);
                                                    return;
                                                }
                                            }
                                            resolve();
                                        }, function(t, error) {
                                            reject(error);
                                        });
                                    });
                                })["catch"](reject);
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function setItem(key, value, callback) {
                            var self = this;
                            if (typeof key !== "string") {
                                globalObject.console.warn(key + " used as a key, but it is not a string.");
                                key = String(key);
                            }
                            var promise = new Promise(function(resolve, reject) {
                                self.ready().then(function() {
                                    if (value === undefined) {
                                        value = null;
                                    }
                                    var originalValue = value;
                                    var dbInfo = self._dbInfo;
                                    dbInfo.serializer.serialize(value, function(value, error) {
                                        if (error) {
                                            reject(error);
                                        } else {
                                            dbInfo.db.transaction(function(t) {
                                                t.executeSql("INSERT OR REPLACE INTO " + dbInfo.storeName + " (key, value) VALUES (?, ?)", [ key, value ], function() {
                                                    resolve(originalValue);
                                                }, function(t, error) {
                                                    reject(error);
                                                });
                                            }, function(sqlError) {
                                                if (sqlError.code === sqlError.QUOTA_ERR) {
                                                    reject(sqlError);
                                                }
                                            });
                                        }
                                    });
                                })["catch"](reject);
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function removeItem(key, callback) {
                            var self = this;
                            if (typeof key !== "string") {
                                globalObject.console.warn(key + " used as a key, but it is not a string.");
                                key = String(key);
                            }
                            var promise = new Promise(function(resolve, reject) {
                                self.ready().then(function() {
                                    var dbInfo = self._dbInfo;
                                    dbInfo.db.transaction(function(t) {
                                        t.executeSql("DELETE FROM " + dbInfo.storeName + " WHERE key = ?", [ key ], function() {
                                            resolve();
                                        }, function(t, error) {
                                            reject(error);
                                        });
                                    });
                                })["catch"](reject);
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function clear(callback) {
                            var self = this;
                            var promise = new Promise(function(resolve, reject) {
                                self.ready().then(function() {
                                    var dbInfo = self._dbInfo;
                                    dbInfo.db.transaction(function(t) {
                                        t.executeSql("DELETE FROM " + dbInfo.storeName, [], function() {
                                            resolve();
                                        }, function(t, error) {
                                            reject(error);
                                        });
                                    });
                                })["catch"](reject);
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function length(callback) {
                            var self = this;
                            var promise = new Promise(function(resolve, reject) {
                                self.ready().then(function() {
                                    var dbInfo = self._dbInfo;
                                    dbInfo.db.transaction(function(t) {
                                        t.executeSql("SELECT COUNT(key) as c FROM " + dbInfo.storeName, [], function(t, results) {
                                            var result = results.rows.item(0).c;
                                            resolve(result);
                                        }, function(t, error) {
                                            reject(error);
                                        });
                                    });
                                })["catch"](reject);
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function key(n, callback) {
                            var self = this;
                            var promise = new Promise(function(resolve, reject) {
                                self.ready().then(function() {
                                    var dbInfo = self._dbInfo;
                                    dbInfo.db.transaction(function(t) {
                                        t.executeSql("SELECT key FROM " + dbInfo.storeName + " WHERE id = ? LIMIT 1", [ n + 1 ], function(t, results) {
                                            var result = results.rows.length ? results.rows.item(0).key : null;
                                            resolve(result);
                                        }, function(t, error) {
                                            reject(error);
                                        });
                                    });
                                })["catch"](reject);
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function keys(callback) {
                            var self = this;
                            var promise = new Promise(function(resolve, reject) {
                                self.ready().then(function() {
                                    var dbInfo = self._dbInfo;
                                    dbInfo.db.transaction(function(t) {
                                        t.executeSql("SELECT key FROM " + dbInfo.storeName, [], function(t, results) {
                                            var keys = [];
                                            for (var i = 0; i < results.rows.length; i++) {
                                                keys.push(results.rows.item(i).key);
                                            }
                                            resolve(keys);
                                        }, function(t, error) {
                                            reject(error);
                                        });
                                    });
                                })["catch"](reject);
                            });
                            executeCallback(promise, callback);
                            return promise;
                        }
                        function executeCallback(promise, callback) {
                            if (callback) {
                                promise.then(function(result) {
                                    callback(null, result);
                                }, function(error) {
                                    callback(error);
                                });
                            }
                        }
                        var webSQLStorage = {
                            _driver: "webSQLStorage",
                            _initStorage: _initStorage,
                            iterate: iterate,
                            getItem: getItem,
                            setItem: setItem,
                            removeItem: removeItem,
                            clear: clear,
                            length: length,
                            key: key,
                            keys: keys
                        };
                        exports["default"] = webSQLStorage;
                    }).call(typeof window !== "undefined" ? window : self);
                    module.exports = exports["default"];
                } ]);
            });
        }).call(exports, function() {
            return this;
        }(), __webpack_require__(27));
    }, function(module, exports) {
        var process = module.exports = {};
        var queue = [];
        var draining = false;
        var currentQueue;
        var queueIndex = -1;
        function cleanUpNextTick() {
            draining = false;
            if (currentQueue.length) {
                queue = currentQueue.concat(queue);
            } else {
                queueIndex = -1;
            }
            if (queue.length) {
                drainQueue();
            }
        }
        function drainQueue() {
            if (draining) {
                return;
            }
            var timeout = setTimeout(cleanUpNextTick);
            draining = true;
            var len = queue.length;
            while (len) {
                currentQueue = queue;
                queue = [];
                while (++queueIndex < len) {
                    if (currentQueue) {
                        currentQueue[queueIndex].run();
                    }
                }
                queueIndex = -1;
                len = queue.length;
            }
            currentQueue = null;
            draining = false;
            clearTimeout(timeout);
        }
        process.nextTick = function(fun) {
            var args = new Array(arguments.length - 1);
            if (arguments.length > 1) {
                for (var i = 1; i < arguments.length; i++) {
                    args[i - 1] = arguments[i];
                }
            }
            queue.push(new Item(fun, args));
            if (queue.length === 1 && !draining) {
                setTimeout(drainQueue, 0);
            }
        };
        function Item(fun, array) {
            this.fun = fun;
            this.array = array;
        }
        Item.prototype.run = function() {
            this.fun.apply(null, this.array);
        };
        process.title = "browser";
        process.browser = true;
        process.env = {};
        process.argv = [];
        process.version = "";
        process.versions = {};
        function noop() {}
        process.on = noop;
        process.addListener = noop;
        process.once = noop;
        process.off = noop;
        process.removeListener = noop;
        process.removeAllListeners = noop;
        process.emit = noop;
        process.binding = function(name) {
            throw new Error("process.binding is not supported");
        };
        process.cwd = function() {
            return "/";
        };
        process.chdir = function(dir) {
            throw new Error("process.chdir is not supported");
        };
        process.umask = function() {
            return 0;
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        (function() {
            "use strict";
            var Promise = typeof module !== "undefined" && module.exports && "function" !== "undefined" ? __webpack_require__(29) : this.Promise;
            function _initStorage(options) {
                var self = this;
                var dbInfo = {};
                if (options) {
                    for (var i in options) {
                        dbInfo[i] = options[i];
                    }
                }
                dbInfo.keyPrefix = dbInfo.name + "/";
                if (dbInfo.storeName !== self._defaultConfig.storeName) {
                    dbInfo.keyPrefix += dbInfo.storeName + "/";
                }
                self._dbInfo = dbInfo;
                self._storageObj = {};
                var fileSystemObj = new FileSystem();
                if (fileSystemObj.isValidCommonPath(curWidget.id) == 0) {
                    fileSystemObj.createCommonDir(curWidget.id);
                }
                var file = curWidget.id + "/_" + dbInfo.storeName + ".json";
                var changed = false;
                var fileObj = fileSystemObj.openCommonFile(file, "r+");
                if (fileObj != null) {
                    try {
                        self._storageObj = JSON.parse(fileObj.readAll());
                    } catch (e) {
                        console.log("*** ERROR: " + e);
                    }
                } else {
                    fileObj = fileSystemObj.openCommonFile(file, "w");
                    fileObj.writeAll("{}");
                }
                fileSystemObj.closeCommonFile(fileObj);
                function _saveFile(delay) {
                    if (changed && typeof JSON === "object") {
                        var save = function save() {
                            fileObj = fileSystemObj.openCommonFile(file, "w");
                            fileObj.writeAll(JSON.stringify(self._storageObj));
                            fileSystemObj.closeCommonFile(fileObj);
                            changed = false;
                        };
                        if (typeof delay !== "undefined" && delay) {
                            setTimeout(save, 100);
                        } else {
                            save();
                        }
                    }
                }
                self.localStorageMock = {};
                self.localStorageMock.setItem = function(key, value) {
                    changed = true;
                    self._storageObj[key] = value;
                    _saveFile(true);
                };
                self.localStorageMock.getItem = function(key) {
                    return self._storageObj[key];
                };
                self.localStorageMock.removeItem = function(key) {
                    changed = true;
                    delete self._storageObj[key];
                    _saveFile(true);
                };
                self.localStorageMock.clear = function() {
                    changed = true;
                    self._storageObj = {};
                    _saveFile(true);
                };
                return System["import"]("./../../../../node_modules/localforage/src/utils/serializer").then(function(lib) {
                    dbInfo.serializer = lib;
                    return Promise.resolve();
                });
            }
            function clear(callback) {
                var self = this;
                var promise = self.ready().then(function() {
                    self.localStorageMock.clear();
                });
                executeCallback(promise, callback);
                return promise;
            }
            function getItem(key, callback) {
                var self = this;
                if (typeof key !== "string") {
                    window.console.warn(key + " used as a key, but it is not a string.");
                    key = String(key);
                }
                var promise = self.ready().then(function() {
                    var dbInfo = self._dbInfo;
                    var result = self.localStorageMock.getItem(dbInfo.keyPrefix + key);
                    if (result) {
                        result = dbInfo.serializer.deserialize(result);
                    }
                    return result;
                });
                executeCallback(promise, callback);
                return promise;
            }
            function iterate(iterator, callback) {
                var self = this;
                var promise = self.ready().then(function() {
                    var dbInfo = self._dbInfo;
                    var keyPrefix = dbInfo.keyPrefix;
                    var keyPrefixLength = keyPrefix.length;
                    var i = 1;
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;
                    try {
                        for (var _iterator = Object.keys(self._storageObj)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var key = _step.value;
                            if (key.indexOf(keyPrefix) !== 0) {
                                continue;
                            }
                            var value = self._storageObj[key];
                            if (value) {
                                value = dbInfo.serializer.deserialize(value);
                            }
                            value = iterator(value, key.substring(keyPrefixLength), i++);
                            if (value !== void 0) {
                                return value;
                            }
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator["return"]) {
                                _iterator["return"]();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                });
                executeCallback(promise, callback);
                return promise;
            }
            function key(n, callback) {
                var self = this;
                var promise = self.ready().then(function() {
                    return null;
                });
                executeCallback(promise, callback);
                return promise;
            }
            function keys(callback) {
                var self = this;
                var promise = self.ready().then(function() {
                    return null;
                });
                executeCallback(promise, callback);
                return promise;
            }
            function length(callback) {
                var self = this;
                var promise = self.keys().then(function(keys) {
                    return null;
                });
                executeCallback(promise, callback);
                return promise;
            }
            function removeItem(key, callback) {
                var self = this;
                if (typeof key !== "string") {
                    window.console.warn(key + " used as a key, but it is not a string.");
                    key = String(key);
                }
                var promise = self.ready().then(function() {
                    var dbInfo = self._dbInfo;
                    self.localStorageMock.removeItem(dbInfo.keyPrefix + key);
                });
                executeCallback(promise, callback);
                return promise;
            }
            function setItem(key, value, callback) {
                var self = this;
                if (typeof key !== "string") {
                    window.console.warn(key + " used as a key, but it is not a string.");
                    key = String(key);
                }
                var promise = self.ready().then(function() {
                    if (value === undefined) {
                        value = null;
                    }
                    var originalValue = value;
                    return new Promise(function(resolve, reject) {
                        var dbInfo = self._dbInfo;
                        dbInfo.serializer.serialize(value, function(value, error) {
                            if (error) {
                                reject(error);
                            } else {
                                try {
                                    self.localStorageMock.setItem(dbInfo.keyPrefix + key, value);
                                    resolve(originalValue);
                                } catch (e) {
                                    if (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED") {
                                        reject(e);
                                    }
                                    reject(e);
                                }
                            }
                        });
                    });
                });
                executeCallback(promise, callback);
                return promise;
            }
            function executeCallback(promise, callback) {
                if (callback) {
                    promise.then(function(result) {
                        callback(null, result);
                    }, function(error) {
                        callback(error);
                    });
                }
            }
            var samsungFileStorage = {
                _driver: "samsungFileStorage",
                _initStorage: _initStorage,
                iterate: iterate,
                getItem: getItem,
                setItem: setItem,
                removeItem: removeItem,
                clear: clear,
                length: length,
                key: key,
                keys: keys
            };
            module.exports = samsungFileStorage;
        }).call(window);
    }, function(module, exports, __webpack_require__) {
        "use strict";
        module.exports = __webpack_require__(30);
    }, function(module, exports, __webpack_require__) {
        "use strict";
        module.exports = __webpack_require__(31);
        __webpack_require__(33);
        __webpack_require__(34);
        __webpack_require__(35);
        __webpack_require__(36);
        __webpack_require__(38);
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var asap = __webpack_require__(32);
        function noop() {}
        var LAST_ERROR = null;
        var IS_ERROR = {};
        function getThen(obj) {
            try {
                return obj.then;
            } catch (ex) {
                LAST_ERROR = ex;
                return IS_ERROR;
            }
        }
        function tryCallOne(fn, a) {
            try {
                return fn(a);
            } catch (ex) {
                LAST_ERROR = ex;
                return IS_ERROR;
            }
        }
        function tryCallTwo(fn, a, b) {
            try {
                fn(a, b);
            } catch (ex) {
                LAST_ERROR = ex;
                return IS_ERROR;
            }
        }
        module.exports = Promise;
        function Promise(fn) {
            if (typeof this !== "object") {
                throw new TypeError("Promises must be constructed via new");
            }
            if (typeof fn !== "function") {
                throw new TypeError("not a function");
            }
            this._45 = 0;
            this._81 = 0;
            this._65 = null;
            this._54 = null;
            if (fn === noop) return;
            doResolve(fn, this);
        }
        Promise._10 = null;
        Promise._97 = null;
        Promise._61 = noop;
        Promise.prototype.then = function(onFulfilled, onRejected) {
            if (this.constructor !== Promise) {
                return safeThen(this, onFulfilled, onRejected);
            }
            var res = new Promise(noop);
            handle(this, new Handler(onFulfilled, onRejected, res));
            return res;
        };
        function safeThen(self, onFulfilled, onRejected) {
            return new self.constructor(function(resolve, reject) {
                var res = new Promise(noop);
                res.then(resolve, reject);
                handle(self, new Handler(onFulfilled, onRejected, res));
            });
        }
        function handle(self, deferred) {
            while (self._81 === 3) {
                self = self._65;
            }
            if (Promise._10) {
                Promise._10(self);
            }
            if (self._81 === 0) {
                if (self._45 === 0) {
                    self._45 = 1;
                    self._54 = deferred;
                    return;
                }
                if (self._45 === 1) {
                    self._45 = 2;
                    self._54 = [ self._54, deferred ];
                    return;
                }
                self._54.push(deferred);
                return;
            }
            handleResolved(self, deferred);
        }
        function handleResolved(self, deferred) {
            asap(function() {
                var cb = self._81 === 1 ? deferred.onFulfilled : deferred.onRejected;
                if (cb === null) {
                    if (self._81 === 1) {
                        resolve(deferred.promise, self._65);
                    } else {
                        reject(deferred.promise, self._65);
                    }
                    return;
                }
                var ret = tryCallOne(cb, self._65);
                if (ret === IS_ERROR) {
                    reject(deferred.promise, LAST_ERROR);
                } else {
                    resolve(deferred.promise, ret);
                }
            });
        }
        function resolve(self, newValue) {
            if (newValue === self) {
                return reject(self, new TypeError("A promise cannot be resolved with itself."));
            }
            if (newValue && (typeof newValue === "object" || typeof newValue === "function")) {
                var then = getThen(newValue);
                if (then === IS_ERROR) {
                    return reject(self, LAST_ERROR);
                }
                if (then === self.then && newValue instanceof Promise) {
                    self._81 = 3;
                    self._65 = newValue;
                    finale(self);
                    return;
                } else if (typeof then === "function") {
                    doResolve(then.bind(newValue), self);
                    return;
                }
            }
            self._81 = 1;
            self._65 = newValue;
            finale(self);
        }
        function reject(self, newValue) {
            self._81 = 2;
            self._65 = newValue;
            if (Promise._97) {
                Promise._97(self, newValue);
            }
            finale(self);
        }
        function finale(self) {
            if (self._45 === 1) {
                handle(self, self._54);
                self._54 = null;
            }
            if (self._45 === 2) {
                for (var i = 0; i < self._54.length; i++) {
                    handle(self, self._54[i]);
                }
                self._54 = null;
            }
        }
        function Handler(onFulfilled, onRejected, promise) {
            this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
            this.onRejected = typeof onRejected === "function" ? onRejected : null;
            this.promise = promise;
        }
        function doResolve(fn, promise) {
            var done = false;
            var res = tryCallTwo(fn, function(value) {
                if (done) return;
                done = true;
                resolve(promise, value);
            }, function(reason) {
                if (done) return;
                done = true;
                reject(promise, reason);
            });
            if (!done && res === IS_ERROR) {
                done = true;
                reject(promise, LAST_ERROR);
            }
        }
    }, function(module, exports) {
        (function(global) {
            "use strict";
            module.exports = rawAsap;
            function rawAsap(task) {
                if (!queue.length) {
                    requestFlush();
                    flushing = true;
                }
                queue[queue.length] = task;
            }
            var queue = [];
            var flushing = false;
            var requestFlush;
            var index = 0;
            var capacity = 1024;
            function flush() {
                while (index < queue.length) {
                    var currentIndex = index;
                    index = index + 1;
                    queue[currentIndex].call();
                    if (index > capacity) {
                        for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                            queue[scan] = queue[scan + index];
                        }
                        queue.length -= index;
                        index = 0;
                    }
                }
                queue.length = 0;
                index = 0;
                flushing = false;
            }
            var BrowserMutationObserver = global.MutationObserver || global.WebKitMutationObserver;
            if (typeof BrowserMutationObserver === "function") {
                requestFlush = makeRequestCallFromMutationObserver(flush);
            } else {
                requestFlush = makeRequestCallFromTimer(flush);
            }
            rawAsap.requestFlush = requestFlush;
            function makeRequestCallFromMutationObserver(callback) {
                var toggle = 1;
                var observer = new BrowserMutationObserver(callback);
                var node = document.createTextNode("");
                observer.observe(node, {
                    characterData: true
                });
                return function requestCall() {
                    toggle = -toggle;
                    node.data = toggle;
                };
            }
            function makeRequestCallFromTimer(callback) {
                return function requestCall() {
                    var timeoutHandle = setTimeout(handleTimer, 0);
                    var intervalHandle = setInterval(handleTimer, 50);
                    function handleTimer() {
                        clearTimeout(timeoutHandle);
                        clearInterval(intervalHandle);
                        callback();
                    }
                };
            }
            rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer;
        }).call(exports, function() {
            return this;
        }());
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var Promise = __webpack_require__(31);
        module.exports = Promise;
        Promise.prototype.done = function(onFulfilled, onRejected) {
            var self = arguments.length ? this.then.apply(this, arguments) : this;
            self.then(null, function(err) {
                setTimeout(function() {
                    throw err;
                }, 0);
            });
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var Promise = __webpack_require__(31);
        module.exports = Promise;
        Promise.prototype["finally"] = function(f) {
            return this.then(function(value) {
                return Promise.resolve(f()).then(function() {
                    return value;
                });
            }, function(err) {
                return Promise.resolve(f()).then(function() {
                    throw err;
                });
            });
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var Promise = __webpack_require__(31);
        module.exports = Promise;
        var TRUE = valuePromise(true);
        var FALSE = valuePromise(false);
        var NULL = valuePromise(null);
        var UNDEFINED = valuePromise(undefined);
        var ZERO = valuePromise(0);
        var EMPTYSTRING = valuePromise("");
        function valuePromise(value) {
            var p = new Promise(Promise._61);
            p._81 = 1;
            p._65 = value;
            return p;
        }
        Promise.resolve = function(value) {
            if (value instanceof Promise) return value;
            if (value === null) return NULL;
            if (value === undefined) return UNDEFINED;
            if (value === true) return TRUE;
            if (value === false) return FALSE;
            if (value === 0) return ZERO;
            if (value === "") return EMPTYSTRING;
            if (typeof value === "object" || typeof value === "function") {
                try {
                    var then = value.then;
                    if (typeof then === "function") {
                        return new Promise(then.bind(value));
                    }
                } catch (ex) {
                    return new Promise(function(resolve, reject) {
                        reject(ex);
                    });
                }
            }
            return valuePromise(value);
        };
        Promise.all = function(arr) {
            var args = Array.prototype.slice.call(arr);
            return new Promise(function(resolve, reject) {
                if (args.length === 0) return resolve([]);
                var remaining = args.length;
                function res(i, val) {
                    if (val && (typeof val === "object" || typeof val === "function")) {
                        if (val instanceof Promise && val.then === Promise.prototype.then) {
                            while (val._81 === 3) {
                                val = val._65;
                            }
                            if (val._81 === 1) return res(i, val._65);
                            if (val._81 === 2) reject(val._65);
                            val.then(function(val) {
                                res(i, val);
                            }, reject);
                            return;
                        } else {
                            var then = val.then;
                            if (typeof then === "function") {
                                var p = new Promise(then.bind(val));
                                p.then(function(val) {
                                    res(i, val);
                                }, reject);
                                return;
                            }
                        }
                    }
                    args[i] = val;
                    if (--remaining === 0) {
                        resolve(args);
                    }
                }
                for (var i = 0; i < args.length; i++) {
                    res(i, args[i]);
                }
            });
        };
        Promise.reject = function(value) {
            return new Promise(function(resolve, reject) {
                reject(value);
            });
        };
        Promise.race = function(values) {
            return new Promise(function(resolve, reject) {
                values.forEach(function(value) {
                    Promise.resolve(value).then(resolve, reject);
                });
            });
        };
        Promise.prototype["catch"] = function(onRejected) {
            return this.then(null, onRejected);
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var Promise = __webpack_require__(31);
        var asap = __webpack_require__(37);
        module.exports = Promise;
        Promise.denodeify = function(fn, argumentCount) {
            if (typeof argumentCount === "number" && argumentCount !== Infinity) {
                return denodeifyWithCount(fn, argumentCount);
            } else {
                return denodeifyWithoutCount(fn);
            }
        };
        var callbackFn = "function (err, res) {" + "if (err) { rj(err); } else { rs(res); }" + "}";
        function denodeifyWithCount(fn, argumentCount) {
            var args = [];
            for (var i = 0; i < argumentCount; i++) {
                args.push("a" + i);
            }
            var body = [ "return function (" + args.join(",") + ") {", "var self = this;", "return new Promise(function (rs, rj) {", "var res = fn.call(", [ "self" ].concat(args).concat([ callbackFn ]).join(","), ");", "if (res &&", '(typeof res === "object" || typeof res === "function") &&', 'typeof res.then === "function"', ") {rs(res);}", "});", "};" ].join("");
            return Function([ "Promise", "fn" ], body)(Promise, fn);
        }
        function denodeifyWithoutCount(fn) {
            var fnLength = Math.max(fn.length - 1, 3);
            var args = [];
            for (var i = 0; i < fnLength; i++) {
                args.push("a" + i);
            }
            var body = [ "return function (" + args.join(",") + ") {", "var self = this;", "var args;", "var argLength = arguments.length;", "if (arguments.length > " + fnLength + ") {", "args = new Array(arguments.length + 1);", "for (var i = 0; i < arguments.length; i++) {", "args[i] = arguments[i];", "}", "}", "return new Promise(function (rs, rj) {", "var cb = " + callbackFn + ";", "var res;", "switch (argLength) {", args.concat([ "extra" ]).map(function(_, index) {
                return "case " + index + ":" + "res = fn.call(" + [ "self" ].concat(args.slice(0, index)).concat("cb").join(",") + ");" + "break;";
            }).join(""), "default:", "args[argLength] = cb;", "res = fn.apply(self, args);", "}", "if (res &&", '(typeof res === "object" || typeof res === "function") &&', 'typeof res.then === "function"', ") {rs(res);}", "});", "};" ].join("");
            return Function([ "Promise", "fn" ], body)(Promise, fn);
        }
        Promise.nodeify = function(fn) {
            return function() {
                var args = Array.prototype.slice.call(arguments);
                var callback = typeof args[args.length - 1] === "function" ? args.pop() : null;
                var ctx = this;
                try {
                    return fn.apply(this, arguments).nodeify(callback, ctx);
                } catch (ex) {
                    if (callback === null || typeof callback == "undefined") {
                        return new Promise(function(resolve, reject) {
                            reject(ex);
                        });
                    } else {
                        asap(function() {
                            callback.call(ctx, ex);
                        });
                    }
                }
            };
        };
        Promise.prototype.nodeify = function(callback, ctx) {
            if (typeof callback != "function") return this;
            this.then(function(value) {
                asap(function() {
                    callback.call(ctx, null, value);
                });
            }, function(err) {
                asap(function() {
                    callback.call(ctx, err);
                });
            });
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var rawAsap = __webpack_require__(32);
        var freeTasks = [];
        var pendingErrors = [];
        var requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError);
        function throwFirstError() {
            if (pendingErrors.length) {
                throw pendingErrors.shift();
            }
        }
        module.exports = asap;
        function asap(task) {
            var rawTask;
            if (freeTasks.length) {
                rawTask = freeTasks.pop();
            } else {
                rawTask = new RawTask();
            }
            rawTask.task = task;
            rawAsap(rawTask);
        }
        function RawTask() {
            this.task = null;
        }
        RawTask.prototype.call = function() {
            try {
                this.task.call();
            } catch (error) {
                if (asap.onerror) {
                    asap.onerror(error);
                } else {
                    pendingErrors.push(error);
                    requestErrorThrow();
                }
            } finally {
                this.task = null;
                freeTasks[freeTasks.length] = this;
            }
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var Promise = __webpack_require__(31);
        module.exports = Promise;
        Promise.enableSynchronous = function() {
            Promise.prototype.isPending = function() {
                return this.getState() == 0;
            };
            Promise.prototype.isFulfilled = function() {
                return this.getState() == 1;
            };
            Promise.prototype.isRejected = function() {
                return this.getState() == 2;
            };
            Promise.prototype.getValue = function() {
                if (this._81 === 3) {
                    return this._65.getValue();
                }
                if (!this.isFulfilled()) {
                    throw new Error("Cannot get a value of an unfulfilled promise.");
                }
                return this._65;
            };
            Promise.prototype.getReason = function() {
                if (this._81 === 3) {
                    return this._65.getReason();
                }
                if (!this.isRejected()) {
                    throw new Error("Cannot get a rejection reason of a non-rejected promise.");
                }
                return this._65;
            };
            Promise.prototype.getState = function() {
                if (this._81 === 3) {
                    return this._65.getState();
                }
                if (this._81 === -1 || this._81 === -2) {
                    return 0;
                }
                return this._81;
            };
        };
        Promise.disableSynchronous = function() {
            Promise.prototype.isPending = undefined;
            Promise.prototype.isFulfilled = undefined;
            Promise.prototype.isRejected = undefined;
            Promise.prototype.getValue = undefined;
            Promise.prototype.getReason = undefined;
            Promise.prototype.getState = undefined;
        };
    }, function(module, exports, __webpack_require__) {
        __webpack_require__(40);
        module.exports = __webpack_require__(60).Array.entries;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var addToUnscopables = __webpack_require__(41), step = __webpack_require__(51), Iterators = __webpack_require__(52), toIObject = __webpack_require__(53);
        module.exports = __webpack_require__(57)(Array, "Array", function(iterated, kind) {
            this._t = toIObject(iterated);
            this._i = 0;
            this._k = kind;
        }, function() {
            var O = this._t, kind = this._k, index = this._i++;
            if (!O || index >= O.length) {
                this._t = undefined;
                return step(1);
            }
            if (kind == "keys") return step(0, index);
            if (kind == "values") return step(0, O[index]);
            return step(0, [ index, O[index] ]);
        }, "values");
        Iterators.Arguments = Iterators.Array;
        addToUnscopables("keys");
        addToUnscopables("values");
        addToUnscopables("entries");
    }, function(module, exports, __webpack_require__) {
        var UNSCOPABLES = __webpack_require__(42)("unscopables"), ArrayProto = Array.prototype;
        if (ArrayProto[UNSCOPABLES] == undefined) __webpack_require__(46)(ArrayProto, UNSCOPABLES, {});
        module.exports = function(key) {
            ArrayProto[UNSCOPABLES][key] = true;
        };
    }, function(module, exports, __webpack_require__) {
        var store = __webpack_require__(43)("wks"), uid = __webpack_require__(45), Symbol = __webpack_require__(44).Symbol;
        module.exports = function(name) {
            return store[name] || (store[name] = Symbol && Symbol[name] || (Symbol || uid)("Symbol." + name));
        };
    }, function(module, exports, __webpack_require__) {
        var global = __webpack_require__(44), SHARED = "__core-js_shared__", store = global[SHARED] || (global[SHARED] = {});
        module.exports = function(key) {
            return store[key] || (store[key] = {});
        };
    }, function(module, exports) {
        var global = module.exports = typeof window != "undefined" && window.Math == Math ? window : typeof self != "undefined" && self.Math == Math ? self : Function("return this")();
        if (typeof __g == "number") __g = global;
    }, function(module, exports) {
        var id = 0, px = Math.random();
        module.exports = function(key) {
            return "Symbol(".concat(key === undefined ? "" : key, ")_", (++id + px).toString(36));
        };
    }, function(module, exports, __webpack_require__) {
        var $ = __webpack_require__(47), createDesc = __webpack_require__(48);
        module.exports = __webpack_require__(49) ? function(object, key, value) {
            return $.setDesc(object, key, createDesc(1, value));
        } : function(object, key, value) {
            object[key] = value;
            return object;
        };
    }, function(module, exports) {
        var $Object = Object;
        module.exports = {
            create: $Object.create,
            getProto: $Object.getPrototypeOf,
            isEnum: {}.propertyIsEnumerable,
            getDesc: $Object.getOwnPropertyDescriptor,
            setDesc: $Object.defineProperty,
            setDescs: $Object.defineProperties,
            getKeys: $Object.keys,
            getNames: $Object.getOwnPropertyNames,
            getSymbols: $Object.getOwnPropertySymbols,
            each: [].forEach
        };
    }, function(module, exports) {
        module.exports = function(bitmap, value) {
            return {
                enumerable: !(bitmap & 1),
                configurable: !(bitmap & 2),
                writable: !(bitmap & 4),
                value: value
            };
        };
    }, function(module, exports, __webpack_require__) {
        module.exports = !__webpack_require__(50)(function() {
            return Object.defineProperty({}, "a", {
                get: function() {
                    return 7;
                }
            }).a != 7;
        });
    }, function(module, exports) {
        module.exports = function(exec) {
            try {
                return !!exec();
            } catch (e) {
                return true;
            }
        };
    }, function(module, exports) {
        module.exports = function(done, value) {
            return {
                value: value,
                done: !!done
            };
        };
    }, function(module, exports) {
        module.exports = {};
    }, function(module, exports, __webpack_require__) {
        var IObject = __webpack_require__(54), defined = __webpack_require__(56);
        module.exports = function(it) {
            return IObject(defined(it));
        };
    }, function(module, exports, __webpack_require__) {
        var cof = __webpack_require__(55);
        module.exports = Object("z").propertyIsEnumerable(0) ? Object : function(it) {
            return cof(it) == "String" ? it.split("") : Object(it);
        };
    }, function(module, exports) {
        var toString = {}.toString;
        module.exports = function(it) {
            return toString.call(it).slice(8, -1);
        };
    }, function(module, exports) {
        module.exports = function(it) {
            if (it == undefined) throw TypeError("Can't call method on  " + it);
            return it;
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var LIBRARY = __webpack_require__(58), $export = __webpack_require__(59), redefine = __webpack_require__(61), hide = __webpack_require__(46), has = __webpack_require__(64), Iterators = __webpack_require__(52), $iterCreate = __webpack_require__(65), setToStringTag = __webpack_require__(66), getProto = __webpack_require__(47).getProto, ITERATOR = __webpack_require__(42)("iterator"), BUGGY = !([].keys && "next" in [].keys()), FF_ITERATOR = "@@iterator", KEYS = "keys", VALUES = "values";
        var returnThis = function() {
            return this;
        };
        module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
            $iterCreate(Constructor, NAME, next);
            var getMethod = function(kind) {
                if (!BUGGY && kind in proto) return proto[kind];
                switch (kind) {
                  case KEYS:
                    return function keys() {
                        return new Constructor(this, kind);
                    };

                  case VALUES:
                    return function values() {
                        return new Constructor(this, kind);
                    };
                }
                return function entries() {
                    return new Constructor(this, kind);
                };
            };
            var TAG = NAME + " Iterator", DEF_VALUES = DEFAULT == VALUES, VALUES_BUG = false, proto = Base.prototype, $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT], $default = $native || getMethod(DEFAULT), methods, key;
            if ($native) {
                var IteratorPrototype = getProto($default.call(new Base()));
                setToStringTag(IteratorPrototype, TAG, true);
                if (!LIBRARY && has(proto, FF_ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);
                if (DEF_VALUES && $native.name !== VALUES) {
                    VALUES_BUG = true;
                    $default = function values() {
                        return $native.call(this);
                    };
                }
            }
            if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
                hide(proto, ITERATOR, $default);
            }
            Iterators[NAME] = $default;
            Iterators[TAG] = returnThis;
            if (DEFAULT) {
                methods = {
                    values: DEF_VALUES ? $default : getMethod(VALUES),
                    keys: IS_SET ? $default : getMethod(KEYS),
                    entries: !DEF_VALUES ? $default : getMethod("entries")
                };
                if (FORCED) for (key in methods) {
                    if (!(key in proto)) redefine(proto, key, methods[key]);
                } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
            }
            return methods;
        };
    }, function(module, exports) {
        module.exports = false;
    }, function(module, exports, __webpack_require__) {
        var global = __webpack_require__(44), core = __webpack_require__(60), hide = __webpack_require__(46), redefine = __webpack_require__(61), ctx = __webpack_require__(62), PROTOTYPE = "prototype";
        var $export = function(type, name, source) {
            var IS_FORCED = type & $export.F, IS_GLOBAL = type & $export.G, IS_STATIC = type & $export.S, IS_PROTO = type & $export.P, IS_BIND = type & $export.B, target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE], exports = IS_GLOBAL ? core : core[name] || (core[name] = {}), expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {}), key, own, out, exp;
            if (IS_GLOBAL) source = name;
            for (key in source) {
                own = !IS_FORCED && target && key in target;
                out = (own ? target : source)[key];
                exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == "function" ? ctx(Function.call, out) : out;
                if (target && !own) redefine(target, key, out);
                if (exports[key] != out) hide(exports, key, exp);
                if (IS_PROTO && expProto[key] != out) expProto[key] = out;
            }
        };
        global.core = core;
        $export.F = 1;
        $export.G = 2;
        $export.S = 4;
        $export.P = 8;
        $export.B = 16;
        $export.W = 32;
        module.exports = $export;
    }, function(module, exports) {
        var core = module.exports = {
            version: "1.2.6"
        };
        if (typeof __e == "number") __e = core;
    }, function(module, exports, __webpack_require__) {
        var global = __webpack_require__(44), hide = __webpack_require__(46), SRC = __webpack_require__(45)("src"), TO_STRING = "toString", $toString = Function[TO_STRING], TPL = ("" + $toString).split(TO_STRING);
        __webpack_require__(60).inspectSource = function(it) {
            return $toString.call(it);
        };
        (module.exports = function(O, key, val, safe) {
            if (typeof val == "function") {
                val.hasOwnProperty(SRC) || hide(val, SRC, O[key] ? "" + O[key] : TPL.join(String(key)));
                val.hasOwnProperty("name") || hide(val, "name", key);
            }
            if (O === global) {
                O[key] = val;
            } else {
                if (!safe) delete O[key];
                hide(O, key, val);
            }
        })(Function.prototype, TO_STRING, function toString() {
            return typeof this == "function" && this[SRC] || $toString.call(this);
        });
    }, function(module, exports, __webpack_require__) {
        var aFunction = __webpack_require__(63);
        module.exports = function(fn, that, length) {
            aFunction(fn);
            if (that === undefined) return fn;
            switch (length) {
              case 1:
                return function(a) {
                    return fn.call(that, a);
                };

              case 2:
                return function(a, b) {
                    return fn.call(that, a, b);
                };

              case 3:
                return function(a, b, c) {
                    return fn.call(that, a, b, c);
                };
            }
            return function() {
                return fn.apply(that, arguments);
            };
        };
    }, function(module, exports) {
        module.exports = function(it) {
            if (typeof it != "function") throw TypeError(it + " is not a function!");
            return it;
        };
    }, function(module, exports) {
        var hasOwnProperty = {}.hasOwnProperty;
        module.exports = function(it, key) {
            return hasOwnProperty.call(it, key);
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var $ = __webpack_require__(47), descriptor = __webpack_require__(48), setToStringTag = __webpack_require__(66), IteratorPrototype = {};
        __webpack_require__(46)(IteratorPrototype, __webpack_require__(42)("iterator"), function() {
            return this;
        });
        module.exports = function(Constructor, NAME, next) {
            Constructor.prototype = $.create(IteratorPrototype, {
                next: descriptor(1, next)
            });
            setToStringTag(Constructor, NAME + " Iterator");
        };
    }, function(module, exports, __webpack_require__) {
        var def = __webpack_require__(47).setDesc, has = __webpack_require__(64), TAG = __webpack_require__(42)("toStringTag");
        module.exports = function(it, tag, stat) {
            if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, {
                configurable: true,
                value: tag
            });
        };
    }, function(module, exports, __webpack_require__) {
        __webpack_require__(68);
        __webpack_require__(71);
        module.exports = __webpack_require__(60).Array.from;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var $at = __webpack_require__(69)(true);
        __webpack_require__(57)(String, "String", function(iterated) {
            this._t = String(iterated);
            this._i = 0;
        }, function() {
            var O = this._t, index = this._i, point;
            if (index >= O.length) return {
                value: undefined,
                done: true
            };
            point = $at(O, index);
            this._i += point.length;
            return {
                value: point,
                done: false
            };
        });
    }, function(module, exports, __webpack_require__) {
        var toInteger = __webpack_require__(70), defined = __webpack_require__(56);
        module.exports = function(TO_STRING) {
            return function(that, pos) {
                var s = String(defined(that)), i = toInteger(pos), l = s.length, a, b;
                if (i < 0 || i >= l) return TO_STRING ? "" : undefined;
                a = s.charCodeAt(i);
                return a < 55296 || a > 56319 || i + 1 === l || (b = s.charCodeAt(i + 1)) < 56320 || b > 57343 ? TO_STRING ? s.charAt(i) : a : TO_STRING ? s.slice(i, i + 2) : (a - 55296 << 10) + (b - 56320) + 65536;
            };
        };
    }, function(module, exports) {
        var ceil = Math.ceil, floor = Math.floor;
        module.exports = function(it) {
            return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var ctx = __webpack_require__(62), $export = __webpack_require__(59), toObject = __webpack_require__(72), call = __webpack_require__(73), isArrayIter = __webpack_require__(76), toLength = __webpack_require__(77), getIterFn = __webpack_require__(78);
        $export($export.S + $export.F * !__webpack_require__(80)(function(iter) {
            Array.from(iter);
        }), "Array", {
            from: function from(arrayLike) {
                var O = toObject(arrayLike), C = typeof this == "function" ? this : Array, $$ = arguments, $$len = $$.length, mapfn = $$len > 1 ? $$[1] : undefined, mapping = mapfn !== undefined, index = 0, iterFn = getIterFn(O), length, result, step, iterator;
                if (mapping) mapfn = ctx(mapfn, $$len > 2 ? $$[2] : undefined, 2);
                if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
                    for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
                        result[index] = mapping ? call(iterator, mapfn, [ step.value, index ], true) : step.value;
                    }
                } else {
                    length = toLength(O.length);
                    for (result = new C(length); length > index; index++) {
                        result[index] = mapping ? mapfn(O[index], index) : O[index];
                    }
                }
                result.length = index;
                return result;
            }
        });
    }, function(module, exports, __webpack_require__) {
        var defined = __webpack_require__(56);
        module.exports = function(it) {
            return Object(defined(it));
        };
    }, function(module, exports, __webpack_require__) {
        var anObject = __webpack_require__(74);
        module.exports = function(iterator, fn, value, entries) {
            try {
                return entries ? fn(anObject(value)[0], value[1]) : fn(value);
            } catch (e) {
                var ret = iterator["return"];
                if (ret !== undefined) anObject(ret.call(iterator));
                throw e;
            }
        };
    }, function(module, exports, __webpack_require__) {
        var isObject = __webpack_require__(75);
        module.exports = function(it) {
            if (!isObject(it)) throw TypeError(it + " is not an object!");
            return it;
        };
    }, function(module, exports) {
        module.exports = function(it) {
            return typeof it === "object" ? it !== null : typeof it === "function";
        };
    }, function(module, exports, __webpack_require__) {
        var Iterators = __webpack_require__(52), ITERATOR = __webpack_require__(42)("iterator"), ArrayProto = Array.prototype;
        module.exports = function(it) {
            return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
        };
    }, function(module, exports, __webpack_require__) {
        var toInteger = __webpack_require__(70), min = Math.min;
        module.exports = function(it) {
            return it > 0 ? min(toInteger(it), 9007199254740991) : 0;
        };
    }, function(module, exports, __webpack_require__) {
        var classof = __webpack_require__(79), ITERATOR = __webpack_require__(42)("iterator"), Iterators = __webpack_require__(52);
        module.exports = __webpack_require__(60).getIteratorMethod = function(it) {
            if (it != undefined) return it[ITERATOR] || it["@@iterator"] || Iterators[classof(it)];
        };
    }, function(module, exports, __webpack_require__) {
        var cof = __webpack_require__(55), TAG = __webpack_require__(42)("toStringTag"), ARG = cof(function() {
            return arguments;
        }()) == "Arguments";
        module.exports = function(it) {
            var O, T, B;
            return it === undefined ? "Undefined" : it === null ? "Null" : typeof (T = (O = Object(it))[TAG]) == "string" ? T : ARG ? cof(O) : (B = cof(O)) == "Object" && typeof O.callee == "function" ? "Arguments" : B;
        };
    }, function(module, exports, __webpack_require__) {
        var ITERATOR = __webpack_require__(42)("iterator"), SAFE_CLOSING = false;
        try {
            var riter = [ 7 ][ITERATOR]();
            riter["return"] = function() {
                SAFE_CLOSING = true;
            };
            Array.from(riter, function() {
                throw 2;
            });
        } catch (e) {}
        module.exports = function(exec, skipClosing) {
            if (!skipClosing && !SAFE_CLOSING) return false;
            var safe = false;
            try {
                var arr = [ 7 ], iter = arr[ITERATOR]();
                iter.next = function() {
                    safe = true;
                };
                arr[ITERATOR] = function() {
                    return iter;
                };
                exec(arr);
            } catch (e) {}
            return safe;
        };
    }, function(module, exports, __webpack_require__) {
        __webpack_require__(82);
        module.exports = __webpack_require__(60).Object.keys;
    }, function(module, exports, __webpack_require__) {
        var toObject = __webpack_require__(72);
        __webpack_require__(83)("keys", function($keys) {
            return function keys(it) {
                return $keys(toObject(it));
            };
        });
    }, function(module, exports, __webpack_require__) {
        var $export = __webpack_require__(59), core = __webpack_require__(60), fails = __webpack_require__(50);
        module.exports = function(KEY, exec) {
            var fn = (core.Object || {})[KEY] || Object[KEY], exp = {};
            exp[KEY] = exec(fn);
            $export($export.S + $export.F * fails(function() {
                fn(1);
            }), "Object", exp);
        };
    }, function(module, exports, __webpack_require__) {
        __webpack_require__(85);
        module.exports = __webpack_require__(60).String.endsWith;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var $export = __webpack_require__(59), toLength = __webpack_require__(77), context = __webpack_require__(86), ENDS_WITH = "endsWith", $endsWith = ""[ENDS_WITH];
        $export($export.P + $export.F * __webpack_require__(88)(ENDS_WITH), "String", {
            endsWith: function endsWith(searchString) {
                var that = context(this, searchString, ENDS_WITH), $$ = arguments, endPosition = $$.length > 1 ? $$[1] : undefined, len = toLength(that.length), end = endPosition === undefined ? len : Math.min(toLength(endPosition), len), search = String(searchString);
                return $endsWith ? $endsWith.call(that, search, end) : that.slice(end - search.length, end) === search;
            }
        });
    }, function(module, exports, __webpack_require__) {
        var isRegExp = __webpack_require__(87), defined = __webpack_require__(56);
        module.exports = function(that, searchString, NAME) {
            if (isRegExp(searchString)) throw TypeError("String#" + NAME + " doesn't accept regex!");
            return String(defined(that));
        };
    }, function(module, exports, __webpack_require__) {
        var isObject = __webpack_require__(75), cof = __webpack_require__(55), MATCH = __webpack_require__(42)("match");
        module.exports = function(it) {
            var isRegExp;
            return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == "RegExp");
        };
    }, function(module, exports, __webpack_require__) {
        var MATCH = __webpack_require__(42)("match");
        module.exports = function(KEY) {
            var re = /./;
            try {
                "/./"[KEY](re);
            } catch (e) {
                try {
                    re[MATCH] = false;
                    return !"/./"[KEY](re);
                } catch (f) {}
            }
            return true;
        };
    }, function(module, exports, __webpack_require__) {
        __webpack_require__(90);
        __webpack_require__(95);
        module.exports = __webpack_require__(60).Symbol;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var $ = __webpack_require__(47), global = __webpack_require__(44), has = __webpack_require__(64), DESCRIPTORS = __webpack_require__(49), $export = __webpack_require__(59), redefine = __webpack_require__(61), $fails = __webpack_require__(50), shared = __webpack_require__(43), setToStringTag = __webpack_require__(66), uid = __webpack_require__(45), wks = __webpack_require__(42), keyOf = __webpack_require__(91), $names = __webpack_require__(92), enumKeys = __webpack_require__(93), isArray = __webpack_require__(94), anObject = __webpack_require__(74), toIObject = __webpack_require__(53), createDesc = __webpack_require__(48), getDesc = $.getDesc, setDesc = $.setDesc, _create = $.create, getNames = $names.get, $Symbol = global.Symbol, $JSON = global.JSON, _stringify = $JSON && $JSON.stringify, setter = false, HIDDEN = wks("_hidden"), isEnum = $.isEnum, SymbolRegistry = shared("symbol-registry"), AllSymbols = shared("symbols"), useNative = typeof $Symbol == "function", ObjectProto = Object.prototype;
        var setSymbolDesc = DESCRIPTORS && $fails(function() {
            return _create(setDesc({}, "a", {
                get: function() {
                    return setDesc(this, "a", {
                        value: 7
                    }).a;
                }
            })).a != 7;
        }) ? function(it, key, D) {
            var protoDesc = getDesc(ObjectProto, key);
            if (protoDesc) delete ObjectProto[key];
            setDesc(it, key, D);
            if (protoDesc && it !== ObjectProto) setDesc(ObjectProto, key, protoDesc);
        } : setDesc;
        var wrap = function(tag) {
            var sym = AllSymbols[tag] = _create($Symbol.prototype);
            sym._k = tag;
            DESCRIPTORS && setter && setSymbolDesc(ObjectProto, tag, {
                configurable: true,
                set: function(value) {
                    if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
                    setSymbolDesc(this, tag, createDesc(1, value));
                }
            });
            return sym;
        };
        var isSymbol = function(it) {
            return typeof it == "symbol";
        };
        var $defineProperty = function defineProperty(it, key, D) {
            if (D && has(AllSymbols, key)) {
                if (!D.enumerable) {
                    if (!has(it, HIDDEN)) setDesc(it, HIDDEN, createDesc(1, {}));
                    it[HIDDEN][key] = true;
                } else {
                    if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
                    D = _create(D, {
                        enumerable: createDesc(0, false)
                    });
                }
                return setSymbolDesc(it, key, D);
            }
            return setDesc(it, key, D);
        };
        var $defineProperties = function defineProperties(it, P) {
            anObject(it);
            var keys = enumKeys(P = toIObject(P)), i = 0, l = keys.length, key;
            while (l > i) $defineProperty(it, key = keys[i++], P[key]);
            return it;
        };
        var $create = function create(it, P) {
            return P === undefined ? _create(it) : $defineProperties(_create(it), P);
        };
        var $propertyIsEnumerable = function propertyIsEnumerable(key) {
            var E = isEnum.call(this, key);
            return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
        };
        var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
            var D = getDesc(it = toIObject(it), key);
            if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
            return D;
        };
        var $getOwnPropertyNames = function getOwnPropertyNames(it) {
            var names = getNames(toIObject(it)), result = [], i = 0, key;
            while (names.length > i) if (!has(AllSymbols, key = names[i++]) && key != HIDDEN) result.push(key);
            return result;
        };
        var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
            var names = getNames(toIObject(it)), result = [], i = 0, key;
            while (names.length > i) if (has(AllSymbols, key = names[i++])) result.push(AllSymbols[key]);
            return result;
        };
        var $stringify = function stringify(it) {
            if (it === undefined || isSymbol(it)) return;
            var args = [ it ], i = 1, $$ = arguments, replacer, $replacer;
            while ($$.length > i) args.push($$[i++]);
            replacer = args[1];
            if (typeof replacer == "function") $replacer = replacer;
            if ($replacer || !isArray(replacer)) replacer = function(key, value) {
                if ($replacer) value = $replacer.call(this, key, value);
                if (!isSymbol(value)) return value;
            };
            args[1] = replacer;
            return _stringify.apply($JSON, args);
        };
        var buggyJSON = $fails(function() {
            var S = $Symbol();
            return _stringify([ S ]) != "[null]" || _stringify({
                a: S
            }) != "{}" || _stringify(Object(S)) != "{}";
        });
        if (!useNative) {
            $Symbol = function Symbol() {
                if (isSymbol(this)) throw TypeError("Symbol is not a constructor");
                return wrap(uid(arguments.length > 0 ? arguments[0] : undefined));
            };
            redefine($Symbol.prototype, "toString", function toString() {
                return this._k;
            });
            isSymbol = function(it) {
                return it instanceof $Symbol;
            };
            $.create = $create;
            $.isEnum = $propertyIsEnumerable;
            $.getDesc = $getOwnPropertyDescriptor;
            $.setDesc = $defineProperty;
            $.setDescs = $defineProperties;
            $.getNames = $names.get = $getOwnPropertyNames;
            $.getSymbols = $getOwnPropertySymbols;
            if (DESCRIPTORS && !__webpack_require__(58)) {
                redefine(ObjectProto, "propertyIsEnumerable", $propertyIsEnumerable, true);
            }
        }
        var symbolStatics = {
            "for": function(key) {
                return has(SymbolRegistry, key += "") ? SymbolRegistry[key] : SymbolRegistry[key] = $Symbol(key);
            },
            keyFor: function keyFor(key) {
                return keyOf(SymbolRegistry, key);
            },
            useSetter: function() {
                setter = true;
            },
            useSimple: function() {
                setter = false;
            }
        };
        $.each.call(("hasInstance,isConcatSpreadable,iterator,match,replace,search," + "species,split,toPrimitive,toStringTag,unscopables").split(","), function(it) {
            var sym = wks(it);
            symbolStatics[it] = useNative ? sym : wrap(sym);
        });
        setter = true;
        $export($export.G + $export.W, {
            Symbol: $Symbol
        });
        $export($export.S, "Symbol", symbolStatics);
        $export($export.S + $export.F * !useNative, "Object", {
            create: $create,
            defineProperty: $defineProperty,
            defineProperties: $defineProperties,
            getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
            getOwnPropertyNames: $getOwnPropertyNames,
            getOwnPropertySymbols: $getOwnPropertySymbols
        });
        $JSON && $export($export.S + $export.F * (!useNative || buggyJSON), "JSON", {
            stringify: $stringify
        });
        setToStringTag($Symbol, "Symbol");
        setToStringTag(Math, "Math", true);
        setToStringTag(global.JSON, "JSON", true);
    }, function(module, exports, __webpack_require__) {
        var $ = __webpack_require__(47), toIObject = __webpack_require__(53);
        module.exports = function(object, el) {
            var O = toIObject(object), keys = $.getKeys(O), length = keys.length, index = 0, key;
            while (length > index) if (O[key = keys[index++]] === el) return key;
        };
    }, function(module, exports, __webpack_require__) {
        var toIObject = __webpack_require__(53), getNames = __webpack_require__(47).getNames, toString = {}.toString;
        var windowNames = typeof window == "object" && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];
        var getWindowNames = function(it) {
            try {
                return getNames(it);
            } catch (e) {
                return windowNames.slice();
            }
        };
        module.exports.get = function getOwnPropertyNames(it) {
            if (windowNames && toString.call(it) == "[object Window]") return getWindowNames(it);
            return getNames(toIObject(it));
        };
    }, function(module, exports, __webpack_require__) {
        var $ = __webpack_require__(47);
        module.exports = function(it) {
            var keys = $.getKeys(it), getSymbols = $.getSymbols;
            if (getSymbols) {
                var symbols = getSymbols(it), isEnum = $.isEnum, i = 0, key;
                while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) keys.push(key);
            }
            return keys;
        };
    }, function(module, exports, __webpack_require__) {
        var cof = __webpack_require__(55);
        module.exports = Array.isArray || function(arg) {
            return cof(arg) == "Array";
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var classof = __webpack_require__(79), test = {};
        test[__webpack_require__(42)("toStringTag")] = "z";
        if (test + "" != "[object z]") {
            __webpack_require__(61)(Object.prototype, "toString", function toString() {
                return "[object " + classof(this) + "]";
            }, true);
        }
    } ]);
});

