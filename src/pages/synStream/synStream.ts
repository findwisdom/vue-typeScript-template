/**
 * Created by wisdom on 2017/12/25.
 */
import Vue from 'base'
import {Component} from 'vue-property-decorator'
import template from './synStream.vue'

const clone = require('clone')
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
    name: 'synStream',
    mixins: [template],
    watch: {
        'getState.initTableData': {
            handler: function (val, oldVal) {
                if (oldVal !== undefined) {
                    this.setFilters()
                    this.setTableData(val)
                }
            },
            deep: true
        },
        'getDetailState.initTableData': {
            handler: function (val, oldVal) {
                if (oldVal !== undefined) {
                    this.setDetailFilters()
                    this.setDetailTableData(val)
                }
            },
            deep: true
        }
    },
    beforeMount() {
        this.$xvuex.registerModule(this, this.detailOptions, this.detailOptions.gridKey)
    },
    mounted() {
        //console.log(Vue.prototype)
    }
})

export default class synStream extends Vue {
    formInline:object = {
        userId: null
    }
    isToday:boolean = false
    addShow:boolean = false
    delShow:boolean = false
    detailVisible:boolean = true
    modelVisible:boolean = false
    clientWithdrawForm: object = {
        ClientNo: ''
    }

    data() {
        return {
            options: Object.assign({}, Vue.prototype.$xvuex.options, {
                url: Vue.prototype.$baseUrl.imss + 'SyncLogStatistic',
                delUrl: Vue.prototype.$baseUrl.imss + 'SyncLogStatistic',
                addUrl: Vue.prototype.$baseUrl.imss + 'SyncLogStatistic',
                editUrl: Vue.prototype.$baseUrl.imss + 'SyncLogStatistic',
                urlParameter: {
                    $filter: '',
                    $orderby: '',
                    $expand: ''
                },
                dicUrls: {},
                title: '操作同步流水',  // 本页面名称
                gridKey: 'Clientwithdraw',  // 本页面 Eng名，唯一
                isSelection: true, // 是否开启多选checkBox
                pager_size_opts: [30, 50, 100],
                pager_Size: 30,
                table: [
                    {
                        key: 'Id',
                        title: 'ID',
                        addLayer: 'show',   // 新增页面是否显示：show  hide,默认show
                        editLayer: 'show', // 编辑页面 是否显示：show  hide,默认show
                        searchKey: 'hide', // 搜索下拉 是否显示：show  hide,默认show
                        column: 'hide',  // 列表 是否显示：show  hide,默认show
                        width: 'auto',   // 长度 200,默认auto
                        type: 'number'  // 默认 string  ，种类：string  number select remoteMethod
                    },
                    {
                        key: 'SerialNo',
                        title: '流水号',
                        render: [
                            {
                              class: 'pointer',
                              text: '点击查看流水详情',
                              fn: this.showModel,
                            }
                        ]
                    },
                    {
                        key: 'SyncType',
                        title: '操作类型',
                        searchKey: 'hide',
                        type: 'select',
                        filter: true,
                        filters: [{value:`(SyncType eq IMSS.SyncLogs.SyncTypeEnum'Restore')`,text:'设置出金参数'},{value:`(SyncType eq IMSS.SyncLogs.SyncTypeEnum'Withdraw')`,text:'设置恢复参数'}],
                        rules: [{required: true, message: '必填'}]
                    },
                    {
                        key: 'ClientCount',
                        title: '设置客户数',
                        searchKey: 'hide',
                        rules: [{required: true, message: '必填'}]
                    },
                    {
                        key: 'CreationTime',
                        title: '修改时间',
                        type: 'date',
                        rules: [{required: true, message: '必填'}]
                    },
                    {
                        key: 'CreatorUserId',
                        title: '操作人',
                        width: 160,
                        addLayer: 'hide',
                        editLayer: 'hide'
                    }
                ]
            }),
            detailOptions: Object.assign({}, Vue.prototype.$xvuex.options, {
                url: Vue.prototype.$baseUrl.imss + 'SyncLog',
                urlParameter: {
                    $filter: '',
                    $orderby: 'ClientNo',
                    $expand: ''
                },
                dicUrls: {
                    ChiefStatusDict: Vue.prototype.$baseUrl.imss + `DataDictionaryType?$filter=(Code eq 'CSS')&$expand=DataDictionary`,
                },
                title: '操作同步流水详细',  // 本页面名称
                gridKey: 'ClientwithdrawDetail',  // 本页面 Eng名，唯一
                isSelection: true, // 是否开启多选checkBox
                pager_size_opts: [30, 50, 100],
                pager_Size: 30,
                table: [
                    {
                        key: 'Id',
                        title: 'ID',
                        addLayer: 'show',   // 新增页面是否显示：show  hide,默认show
                        editLayer: 'show', // 编辑页面 是否显示：show  hide,默认show
                        searchKey: 'hide', // 搜索下拉 是否显示：show  hide,默认show
                        column: 'hide',  // 列表 是否显示：show  hide,默认show
                        width: 'auto',   // 长度 200,默认auto
                        type: 'number'  // 默认 string  ，种类：string  number select remoteMethod
                    },
                    {
                        key: 'ClientNo',
                        title: '客户号'
                    },
                    {
                        key: 'ChiefStatus',
                        title: '主席状态',
                        searchKey: 'hide',
                        dicKey: 'ChiefStatusDict',
                        type: 'select',
                        filter: true,
                        filters: [],
                        rules: [{required: true, message: '必填'}]
                    },
                    {
                        key: 'MaxWithdraw',
                        title: '最大出金限额',
                        searchKey: 'hide',
                        rules: [{required: true, message: '必填'}]
                    },
                    {
                        key: 'UnitLimit',
                        title: '出金单笔限额',
                        type: 'date',
                        rules: [{required: true, message: '必填'}]
                    }
                ]
            })
        }
    }


    onSubmit () {

    }

    batchDel(){}
    /**
     *  设置筛选项内容
     */
    setFilters() {
        let _this = this
        let table = clone(this.getState.table)
        _this.$store.dispatch(_this.options.gridKey + 'setData', {table: table})
    }

    /**
     * 设置展现给用户的表格数据
     * @param tableData 表格数据
     */
    setTableData(tableData) {
        let initData = clone(tableData)
        initData.forEach(function (item) {
            if(item.SyncType == 'Withdraw'){
                item.SyncType = '设置恢复参数'
            }else if(item.SyncType == 'Restore'){
                item.SyncType = '设置出金参数'
            }
            item.CreationTime = item.CreationTime!= null ? item.CreationTime.substring(0,19).replace('T',' ') :''
        })
        this.$store.dispatch(this.options.gridKey + 'setData', {tableData: initData})
    }
    /**
     *  设置筛选项内容
     */
    setDetailFilters() {
        let _this = this
        let table = clone(this.getDetailState.table)
        table.forEach(function (item) {
            if (item.filter === true && _this.$store.state[item.dicKey]) {
                let filters = []
                let selects = []
                let dicData = _this.$store.state[item.dicKey].data.value
                if(item.dicKey == 'ChiefStatusDict'){
                    if(dicData.length>0){
                        dicData[0].DataDictionary.forEach(function (dicItem) {
                            //筛选
                            let filterItem: any = {}
                            filterItem.text = dicItem.Name
                            filterItem.value = `(${item.key} eq ${dicItem.Code})`
                            filters.push(filterItem)
                            //修改新增
                            let selectItem: any = {}
                            selectItem.text = dicItem.Name
                            selectItem.value = dicItem.Code
                            selects.push(selectItem)
                        })
                        item['filters'] = filters
                        item['selects'] = selects
                    }
                }else{
                    if(dicData.length>0){
                        dicData[0].DataDictionary.forEach(function (dicItem) {
                        console.log(dicItem.Name)
                            //筛选
                            let filterItem: any = {}
                            filterItem.text = dicItem.Name
                            filterItem.value = `(${item.key} eq ${dicItem.Id})`
                            filters.push(filterItem)
                            //修改新增
                            let selectItem: any = {}
                            selectItem.text = dicItem.Name
                            selectItem.value = dicItem.Id
                            selects.push(selectItem)
                        })
                        item['filters'] = filters
                        item['selects'] = selects
                    }
                }
            }
        })
        _this.$store.dispatch(_this.detailOptions.gridKey + 'setData', {table: table})
    }
    /**
     * 详细
     * @param tableData 表格数据
     */
    setDetailTableData(tableData) {
        let initData = clone(tableData)
        initData.forEach(function (item) {
            if(item.ChiefStatus == 1){
                item.ChiefStatus = '正常'
            }else if(item.ChiefStatus == 4){
                item.ChiefStatus = '只可平仓'
            }else if(item.ChiefStatus == 5){
                item.ChiefStatus = '禁取'
            }else if(item.ChiefStatus == 6){
                item.ChiefStatus = '冻结'
            }
        })
        this.$store.dispatch(this.detailOptions.gridKey + 'setData', {tableData: initData})
    }

    editRow(scope) { // 设置修改弹窗数据
        let _this = this
        let data = scope.row
        if (data) {
            this.getState.initTableData.forEach(function (item) {
                if (item.Id === data.Id) {
                    _this.$store.dispatch(_this.options.gridKey + '_edit_Window_Visible', item)
                }
            })
        }
    }

    deleteRow(scope) {
        this.$confirm('此操作将删除该项, 是否继续?', '删除确认', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            let id = scope.row.Id
            let url = `${Vue.prototype.$baseUrl.imss}/ClientWithdraw(${id})`
            let requestDataHeader = Vue.prototype.$api.request(url, {
                method: 'DELETE'
            })
            fetch(requestDataHeader).then(resp => {
                return resp.json()
            }).then(data => {
                this.$message({
                    type: 'success',
                    message: '删除成功!'
                })
            })
        }).catch(() => {

        })
    }

    headerFn() {
        return {}
    }

    tableFn() {
        return {

        }
    }

    addFn() {
        return {}
    }

    editFn() {
        return {}
    }

    get getState() {
        return this.$store.state[this.options.gridKey]
    }

    get getDetailState() {
        return this.$store.state[this.detailOptions.gridKey]
    }

    async modelClose(){
        this.modelVisible = false
        this.detailVisible = false
    }
    async showModel(scope){
        this.modelVisible = true
        this.detailVisible = true
        let data = scope.row
        //let url = `${Vue.prototype.$baseUrl.imss}SyncLog?$filter=(SerialNo eq '${data.SerialNo}')`
        this.$store.dispatch(this.detailOptions.gridKey + 'setData', {urlParameter: {$filter:`SerialNo eq '${data.SerialNo}'`} })
        console.log(data.SerialNo)
        //this.$xvuex.registerModule(this, this.detailOptions, this.detailOptions.gridKey)

        //this.$store.dispatch(this.detailOptions.gridKey + 'setData', {requestUrl: url})
        //console.log(url)
    }
}
