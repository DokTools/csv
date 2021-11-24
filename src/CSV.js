"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var path_1 = require("path");
var fs_1 = require("fs");
var readline_1 = require("readline");
var wc_1 = require("./wc");
var CSV = /** @class */ (function () {
    function CSV(filePath, options) {
        this.lineResolvers = [];
        this.gettersCollection = {
            value: this.valueGetter,
            pos: this.posGetter,
            line: this.lineGetter
        };
        this.defaultGetters = ['value'];
        this.typesToParsers = {
            number: parseFloat,
            date: function (value) {
                if (/\d+$/.test(value)) {
                    value = parseInt(value);
                }
                return new Date(value);
            }
        };
        this.filePath = filePath;
        this.fields = [];
        this.fieldsIndex = [];
        this.lineResolvers[0] = this.setFieldsIndex;
        this.sep = (options && options.sep) || ';';
    }
    CSV.prototype.setFieldsIndex = function (data) {
        for (var _i = 0, _a = this.fields; _i < _a.length; _i++) {
            var field = _a[_i];
            this.fieldsIndex.push(data.columns.indexOf(field));
        }
        return undefined; //so we dont trigger yield in readTicks
    };
    CSV.prototype.setFields = function (fields) {
        this.fields = fields;
    };
    CSV.prototype.valueGetter = function (_a) {
        var _this = this;
        var info = _a.info, data = _a.data, options = _a.options;
        var _value = {};
        this.fieldsIndex.forEach(function (index, position) {
            var value = data.columns[index];
            if (value || !options.excludeEmpty) {
                var key = _this.fields[position];
                var types = options.types;
                if (value && types && types[key] && typeof _this.typesToParsers[types[key]] === 'function') {
                    value = _this.typesToParsers[types[key]](value);
                }
                _value[key] = value;
            }
        });
        info._value = _value;
    };
    CSV.prototype.posGetter = function (_a) {
        var info = _a.info, pos = _a.pos;
        info.pos = pos + 1;
    };
    CSV.prototype.lineGetter = function (_a) {
        var info = _a.info, data = _a.data;
        info.line = data.line;
    };
    CSV.prototype.defaultLineParser = function (data, pos, options) {
        var info = {};
        for (var _i = 0, _a = options.getters; _i < _a.length; _i++) {
            var getter = _a[_i];
            var fn = this.gettersCollection[getter];
            typeof fn === 'function' && fn.bind(this)({ info: info, data: data, pos: pos, options: options });
        }
        return info;
    };
    CSV.prototype.splitLine = function (line) {
        var columns = line.split(this.sep);
        var pos = 0;
        for (var _i = 0, columns_1 = columns; _i < columns_1.length; _i++) {
            var col = columns_1[_i];
            if (col[0] === '"') {
                for (var i = pos; i < columns.length; i++) {
                    var secondCol = columns[i];
                    var lastQuoteIndex = secondCol && secondCol.lastIndexOf('"');
                    if (lastQuoteIndex && lastQuoteIndex !== -1) {
                        var newCol = columns.slice(pos, i + 1).join(this.sep);
                        columns.splice(pos, i - pos);
                        columns[pos] = newCol;
                    }
                }
            }
            pos++;
        }
        return columns;
    };
    CSV.prototype.getLines = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, wc_1["default"])(this.filePath, { l: true })];
                    case 1: return [2 /*return*/, (_a.sent()).l - 1];
                }
            });
        });
    };
    CSV.prototype.getWords = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, wc_1["default"])(this.filePath, { w: true })];
                    case 1: return [2 /*return*/, (_a.sent()).w];
                }
            });
        });
    };
    CSV.prototype.readLine = function (line, pos, options) {
        return __awaiter(this, void 0, void 0, function () {
            var columns, data;
            return __generator(this, function (_a) {
                columns = this.splitLine(line);
                data = {
                    columns: columns,
                    line: line
                };
                return [2 /*return*/, (this.lineResolvers[pos] || this.defaultLineParser).bind(this)(data, pos, options)];
            });
        });
    };
    /**
     *
     * @param {readline.ReadLine}
     * @return {Array<Object>}
     */
    CSV.prototype.readNormal = function (rl, options) {
        var rl_1, rl_1_1;
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function () {
            var data, linePos, line, info, e_1_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        data = [];
                        linePos = 0;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 7, 8, 13]);
                        rl_1 = __asyncValues(rl);
                        _b.label = 2;
                    case 2: return [4 /*yield*/, rl_1.next()];
                    case 3:
                        if (!(rl_1_1 = _b.sent(), !rl_1_1.done)) return [3 /*break*/, 6];
                        line = rl_1_1.value;
                        return [4 /*yield*/, this.readLine(line, linePos, options)];
                    case 4:
                        info = _b.sent();
                        if (info) {
                            data.push(info);
                        }
                        linePos += 1;
                        _b.label = 5;
                    case 5: return [3 /*break*/, 2];
                    case 6: return [3 /*break*/, 13];
                    case 7:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 13];
                    case 8:
                        _b.trys.push([8, , 11, 12]);
                        if (!(rl_1_1 && !rl_1_1.done && (_a = rl_1["return"]))) return [3 /*break*/, 10];
                        return [4 /*yield*/, _a.call(rl_1)];
                    case 9:
                        _b.sent();
                        _b.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 12: return [7 /*endfinally*/];
                    case 13: return [2 /*return*/, data];
                }
            });
        });
    };
    /**
     *
     * @param rl
     * @param options
     * @return {AsyncGenerator}
     */
    CSV.prototype.readTicks = function (rl, options) {
        return __asyncGenerator(this, arguments, function readTicks_1() {
            var linePos, rl_2, rl_2_1, line, info, e_2_1;
            var e_2, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        linePos = 0;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 10, 11, 16]);
                        rl_2 = __asyncValues(rl);
                        _b.label = 2;
                    case 2: return [4 /*yield*/, __await(rl_2.next())];
                    case 3:
                        if (!(rl_2_1 = _b.sent(), !rl_2_1.done)) return [3 /*break*/, 9];
                        line = rl_2_1.value;
                        return [4 /*yield*/, __await(this.readLine(line, linePos, options))];
                    case 4:
                        info = _b.sent();
                        if (!info) return [3 /*break*/, 7];
                        return [4 /*yield*/, __await(info)];
                    case 5: return [4 /*yield*/, _b.sent()];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        linePos += 1;
                        _b.label = 8;
                    case 8: return [3 /*break*/, 2];
                    case 9: return [3 /*break*/, 16];
                    case 10:
                        e_2_1 = _b.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 16];
                    case 11:
                        _b.trys.push([11, , 14, 15]);
                        if (!(rl_2_1 && !rl_2_1.done && (_a = rl_2["return"]))) return [3 /*break*/, 13];
                        return [4 /*yield*/, __await(_a.call(rl_2))];
                    case 12:
                        _b.sent();
                        _b.label = 13;
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        if (e_2) throw e_2.error;
                        return [7 /*endfinally*/];
                    case 15: return [7 /*endfinally*/];
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param {Array} fields
     * @param {Object} options additional options
     * @param {Boolean} options.excludeEmpty dont include empty properties
     * @param {Object} options.types specify each column type to parse it automatically
     * @param {Boolean} options.ticks specify if you want to get the whole data as false or iterate line by line using JavaScript Generators
     * @param {string[]} options.getters
     * @returns {Array|AsyncGenerator}
     */
    CSV.prototype.read = function (fields, options) {
        if (options === void 0) { options = { excludeEmpty: false, types: {} }; }
        return __awaiter(this, void 0, void 0, function () {
            var readStream, rl;
            return __generator(this, function (_a) {
                if (!options.getters)
                    options.getters = this.defaultGetters;
                this.setFields(fields);
                readStream = fs_1["default"].createReadStream(path_1["default"].resolve(this.filePath));
                rl = readline_1["default"].createInterface({
                    input: readStream,
                    crlfDelay: Infinity
                });
                if (options.ticks) {
                    return [2 /*return*/, this.readTicks(rl, options)];
                }
                return [2 /*return*/, this.readNormal(rl, options)];
            });
        });
    };
    CSV.writeLine = function (o, text) {
        var buf = Buffer.from(text);
        fs_1["default"].writeSync(o, buf, undefined, buf.length, undefined);
    };
    /**
     *
     * @param {String[]} fields csv header fields
     * @param {Object[]} data data to write as array of objects
     * @param {Object} options additional options
     * @param {Boolean} optons.dynamic if disabled you'll lose the dynamic headears feature
     * @returns
     */
    CSV.prototype.write = function (fields, data, options) {
        var e_3, _a;
        if (options === void 0) { options = { dynamic: false }; }
        return __awaiter(this, void 0, void 0, function () {
            var dynamic, readStream, rl, allFields, linePos, tmpFile, o, rl_3, rl_3_1, line, oldFields_1, newFields, e_3_1, allFieldsIndex, _loop_1, this_1, _i, data_1, json;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        dynamic = options.dynamic;
                        if (!fs_1["default"].existsSync(this.filePath) || fs_1["default"].statSync(this.filePath).size === 0) {
                            fs_1["default"].writeFileSync(this.filePath, fields.join(this.sep) + "\n");
                        }
                        readStream = fs_1["default"].createReadStream(path_1["default"].resolve(this.filePath));
                        rl = readline_1["default"].createInterface({
                            input: readStream,
                            crlfDelay: Infinity
                        });
                        allFields = [];
                        linePos = 0;
                        tmpFile = this.filePath + ".tmp";
                        if (dynamic) {
                            o = fs_1["default"].openSync(tmpFile, 'w+');
                        }
                        else {
                            //append new data
                            o = fs_1["default"].openSync(this.filePath, 'a+');
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 12]);
                        rl_3 = __asyncValues(rl);
                        _b.label = 2;
                    case 2: return [4 /*yield*/, rl_3.next()];
                    case 3:
                        if (!(rl_3_1 = _b.sent(), !rl_3_1.done)) return [3 /*break*/, 5];
                        line = rl_3_1.value;
                        if (linePos++ === 0) {
                            oldFields_1 = this.splitLine(line);
                            newFields = fields.filter(function (field) { return !oldFields_1.includes(field); });
                            //append new field names
                            allFields.push.apply(allFields, __spreadArray(__spreadArray([], oldFields_1, false), newFields, false));
                            if (dynamic) {
                                CSV.writeLine(o, allFields.join(this.sep) + "\n");
                                return [3 /*break*/, 4];
                            }
                            return [3 /*break*/, 5];
                        }
                        CSV.writeLine(o, line + "\n");
                        _b.label = 4;
                    case 4: return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 12];
                    case 6:
                        e_3_1 = _b.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 12];
                    case 7:
                        _b.trys.push([7, , 10, 11]);
                        if (!(rl_3_1 && !rl_3_1.done && (_a = rl_3["return"]))) return [3 /*break*/, 9];
                        return [4 /*yield*/, _a.call(rl_3)];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        if (e_3) throw e_3.error;
                        return [7 /*endfinally*/];
                    case 11: return [7 /*endfinally*/];
                    case 12:
                        allFieldsIndex = __spreadArray([], new Array(allFields.length).keys(), true);
                        _loop_1 = function (json) {
                            CSV.writeLine(o, allFieldsIndex.map(function (index) { return json[allFields[index]]; }).join(this_1.sep) + "\n");
                        };
                        this_1 = this;
                        //time to append new data
                        for (_i = 0, data_1 = data; _i < data_1.length; _i++) {
                            json = data_1[_i];
                            _loop_1(json);
                        }
                        dynamic && fs_1["default"].renameSync(tmpFile, this.filePath);
                        rl.close();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    return CSV;
}());
exports["default"] = CSV;
