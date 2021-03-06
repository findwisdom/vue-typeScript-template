"use strict";
exports.__esModule = true;
var tslib_1 = require("tslib");
/**
 * Created by wisdom on 2017/12/25.
 */
var vue_1 = require("vue");
var vue_property_decorator_1 = require("vue-property-decorator");
var recoverySetting_vue_1 = require("./recoverySetting.vue");
var clone = require('clone');
var Dictionaries = (function (_super) {
    tslib_1.__extends(Dictionaries, _super);
    function Dictionaries() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formInline = {
            userId: null
        };
        _this.options = Object.assign({}, vue_1["default"].prototype.$xvuex.options, {
            url: vue_1["default"].prototype.$baseUrl.imss + 'DataDictionary',
            delUrl: vue_1["default"].prototype.$baseUrl.imss + 'DataDictionary',
            addUrl: vue_1["default"].prototype.$baseUrl.imss + 'DataDictionary',
            editUrl: vue_1["default"].prototype.$baseUrl.imss + 'DataDictionary',
            urlParameter: {
                $filter: 'TypeId eq 2',
                $orderby: '',
                $expand: ''
            },
            dicUrls: {},
            title: '恢复参数设置',
            gridKey: 'recoverySetting',
            isSelection: true,
            table: [
                {
                    key: 'Id',
                    title: 'ID',
                    addLayer: 'hide',
                    editLayer: 'hide',
                    searchKey: 'hide',
                    column: 'hide',
                    width: 'auto',
                    type: 'number' // 默认 string  ，种类：string  number select remoteMethod
                },
                {
                    key: 'Code',
                    title: '客户号',
                    rules: [{ required: true, message: '必填' }]
                },
                {
                    key: 'Name',
                    title: '主席状态',
                    rules: [{ required: true, message: '必填' }]
                },
                {
                    key: 'Description',
                    title: '最大出金限额',
                    searchKey: 'hide',
                    column: 'hide',
                    addLayer: 'hide',
                    editLayer: 'hide',
                    type: 'dependence',
                    dependenceVal: null
                },
                {
                    key: 'Note',
                    title: '出金单笔限额',
                    type: 'textarea'
                },
                {
                    key: 'action',
                    title: '操作',
                    width: 160,
                    addLayer: 'hide',
                    editLayer: 'hide',
                    searchKey: 'hide',
                    render: [
                        {
                            fn: _this.editRow,
                            type: 'primary',
                            tag: 'button',
                            text: '编辑'
                        },
                        {
                            fn: _this.deleteRow,
                            tag: 'button',
                            type: 'danger',
                            text: '删除'
                        }
                    ]
                }
            ]
        });
        return _this;
    }
    Dictionaries.prototype.onSubmit = function () {
    };
    Dictionaries.prototype.batchDel = function () { };
    // 同步主席
    Dictionaries.prototype.synFn = function () { };
    /**
     *  设置筛选项内容
     */
    Dictionaries.prototype.setFilters = function () {
        var _this = this;
        var table = clone(this.getState.table);
        table.forEach(function (item) {
            if (item.filter === true) {
                var filters_1 = [];
                var selects_1 = [];
                var dicData = _this.$store.state[item.dicKey].data.value;
                dicData.forEach(function (dicItem) {
                    //            帅选
                    var filterItem = {};
                    filterItem.text = dicItem.Value;
                    filterItem.value = "(" + item.key + " eq '" + dicItem.Code + "')";
                    filters_1.push(filterItem);
                    //            修改新增
                    var selectItem = {};
                    selectItem.text = dicItem.Value;
                    selectItem.value = dicItem.Code;
                    selects_1.push(selectItem);
                });
                item['filters'] = filters_1;
                item['selects'] = selects_1;
            }
        });
        _this.$store.dispatch(_this.options.gridKey + 'setData', { table: table });
    };
    /**
     * 设置展现给用户的表格数据
     * @param tableData 表格数据
     */
    Dictionaries.prototype.setTableData = function (tableData) {
        var initData = clone(tableData);
        // initData.forEach(function (item) {
        //     VarietyDict.forEach(function (dicItem) {
        //         if (dicItem.Code === item.Variety) {
        //             item.Variety = dicItem.Value
        //         }
        //     })
        //     StdWRStatusDict.forEach(function (dicItem) {
        //         if (dicItem.Code === item.StdWRStatus) {
        //             item.StdWRStatus = dicItem.Value
        //         }
        //     })
        // })
        this.$store.dispatch(this.options.gridKey + 'setData', { tableData: initData });
    };
    Dictionaries.prototype.editRow = function (scope) {
        var _this = this;
        var data = scope.row;
        if (data) {
            this.getState.initTableData.forEach(function (item) {
                if (item.Id === data.Id) {
                    _this.$store.dispatch(_this.options.gridKey + '_edit_Window_Visible', item);
                }
            });
        }
    };
    Dictionaries.prototype.deleteRow = function (scope) {
        var _this = this;
        this.$confirm('此操作将删除该项, 是否继续?', '删除确认', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(function () {
            var id = scope.row.Id;
            var url = _this.options.delUrl + ("(" + id + ")");
            var requestDataHeader = vue_1["default"].prototype.$api.request(url, {
                method: 'DELETE'
            });
            fetch(requestDataHeader).then(function (resp) {
                return resp.text();
            }).then(function (data) {
                _this.$message({
                    type: 'success',
                    message: '删除成功!'
                });
                _this.$store.dispatch(_this.options.gridKey + '_set_refresh');
            });
        })["catch"](function () {
        });
    };
    Dictionaries.prototype.headerFn = function () {
        return {};
    };
    Dictionaries.prototype.tableFn = function () {
        return {};
    };
    Dictionaries.prototype.addFn = function () {
        return {};
    };
    Dictionaries.prototype.editFn = function () {
        return {};
    };
    Object.defineProperty(Dictionaries.prototype, "getState", {
        get: function () {
            return this.$store.state[this.options.gridKey];
        },
        enumerable: true,
        configurable: true
    });
    return Dictionaries;
}(vue_1["default"]));
Dictionaries = tslib_1.__decorate([
    vue_property_decorator_1.Component({
        name: 'dictionaries',
        mixins: [recoverySetting_vue_1["default"]],
        watch: {
            'getState.initTableData': {
                handler: function (val, oldVal) {
                    if (oldVal !== undefined) {
                        // this.setFilters()
                        this.setTableData(val);
                    }
                },
                deep: true
            }
        },
        mounted: function () {
        }
    })
], Dictionaries);
exports["default"] = Dictionaries;
//# sourceMappingURL=recoverySetting.js.map