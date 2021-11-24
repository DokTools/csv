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
exports.__esModule = true;
var os_1 = require("os");
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var path_1 = require("path");
var readline_1 = require("readline");
var platform = os_1["default"].platform();
var optionToIndex = {
    l: 0,
    w: 1,
    c: 2
};
/**
 *
 * @param {string} filePath
 * @param {object} options
 * @param {boolean} l lines
 * @param {boolean} w words
 * @param {boolean} c chars
 * @returns
 */
function wc(filePath, options) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function () {
        var fields, readStream, rl, r, rl_1, rl_1_1, line, words, e_1_1, stats, toReturn_1, _i, fields_1, field, cmd, stdout, splited, toReturn, i, _b, fields_2, field;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    fields = Object.entries(options)
                        .filter(function (_a) {
                        var key = _a[0], value = _a[1];
                        return value && optionToIndex[key] !== undefined;
                    })
                        .map(function (_a) {
                        var key = _a[0], value = _a[1];
                        return key;
                    })
                        .sort(function (a, b) { return optionToIndex[a] - optionToIndex[b]; });
                    if (!(platform === 'win32')) return [3 /*break*/, 13];
                    readStream = fs_1["default"].createReadStream(path_1["default"].resolve(filePath));
                    rl = readline_1["default"].createInterface({
                        input: readStream,
                        crlfDelay: Infinity
                    });
                    r = { l: 0, w: 0, c: 0 };
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, 7, 12]);
                    rl_1 = __asyncValues(rl);
                    _c.label = 2;
                case 2: return [4 /*yield*/, rl_1.next()];
                case 3:
                    if (!(rl_1_1 = _c.sent(), !rl_1_1.done)) return [3 /*break*/, 5];
                    line = rl_1_1.value;
                    if (options.l)
                        r.l++;
                    words = void 0;
                    if (options.w)
                        r.w += (words = line.split(/\s+/)).length;
                    _c.label = 4;
                case 4: return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_1_1 = _c.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _c.trys.push([7, , 10, 11]);
                    if (!(rl_1_1 && !rl_1_1.done && (_a = rl_1["return"]))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _a.call(rl_1)];
                case 8:
                    _c.sent();
                    _c.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12:
                    stats = fs_1["default"].statSync(filePath);
                    if (options.c)
                        r.c += stats.size;
                    toReturn_1 = {};
                    for (_i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
                        field = fields_1[_i];
                        toReturn_1[field] = r[field];
                    }
                    return [2 /*return*/, toReturn_1];
                case 13:
                    cmd = "wc " + fields.map(function (x) { return "-" + x; }).join(' ') + " " + filePath;
                    stdout = (0, child_process_1.execSync)(cmd).toString().trim();
                    splited = stdout.split(/\s{1,}/);
                    toReturn = {};
                    i = 0;
                    for (_b = 0, fields_2 = fields; _b < fields_2.length; _b++) {
                        field = fields_2[_b];
                        toReturn[field] = parseInt(splited[i]);
                        i++;
                    }
                    return [2 /*return*/, toReturn];
            }
        });
    });
}
exports["default"] = wc;
