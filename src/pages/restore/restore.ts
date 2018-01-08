/**
 * Created by wisdom on 2017/12/25.
 */
import Vue from 'base'
import {Component} from 'vue-property-decorator'
import template from './restore.vue'

const clone = require('clone')
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
    name: 'restore',
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
        }
    },
    beforeMount() {
        this.$xvuex.registerModule(this, this.options, this.options.gridKey)
    },
    mounted() {
        this.initDatas()
    }
})

export default class restore extends Vue {

    selects: Array<object> = [] //选中的出金表数据
    tableData: Array<object> = [] //出金表数据
    ChiefStatusDict: Array<object> = [] //主席状态字典
    TSSId:number = null //总次席状态Id
    title :string = '出金参数设置'//标题
    modelVisible: boolean=false
    clientModelVisible: boolean=false
    async modelClose(){
      this.modelVisible = false
    }
    modelForm: object={
        ClientNo:null,
        Status:null,
        StatusName:null,
        MaxWithdraw:null,
        UnitLimit:null
    }

    /**
     * 设置出金表数据
     * */
    get setMoneyTableDatas(){
        return this.$store.getters['setMoney/setRestoreData']
    }
    /**
     * 次席信息数据
     * */
    get getState() {
        return this.$store.state[this.options.gridKey]
    }
    get getPath(){
        return this.$route.name;   //获得当前路径名称
    }

    /**初始化数据*/
    async initDatas(){
        //主席状态字典
        let url = Vue.prototype.$baseUrl.imss + `DataDictionaryType?$filter=(Code eq 'CSS')&$expand=DataDictionary`
        let requestDataHeader = Vue.prototype.$api.request(url)
        fetch(requestDataHeader).then(resp => {
            return resp.json()
        }).then(datas => {
            if(datas.value.length > 0){
                this.ChiefStatusDict = datas.value[0].DataDictionary
            }
        })
    }

    /**移除客户*/
    async remove(item){
        var i = 0
        var tableData = clone(this.setMoneyTableDatas)
        tableData.forEach(function(dataItem){
            if(dataItem.ClientNo == item.ClientNo){
                tableData.splice(i,1)
            }
            i++
        })
        this.tableData = tableData
        this.$store.dispatch('setMoney/setRestoreData', tableData)
    }

    /**点击出金表展示信息model*/
    async showModel(row, column, cell, event){
        if(column.label!=""&&column.label !="操作"){
            this.modelVisible = true
            this.modelForm = row
        }
    }
    /**修改出金信息*/
    async handleSubmit(formName){
        //console.log(this.modelForm)
        var tableData = this.tableData
        var _self = this
        this.tableData.forEach(function(item){
            if(_self.modelForm.ClientNo == item.ClientNo){
                item = _self.modelForm
                _self.$message({
                    showClose: true,
                    message: '修改成功',
                    type: 'success'
                })
                _self.modelVisible = false
            }
        })
    }
    /**选择客户checkbox*/
    async selectTableCheckbox(selection) {
        let select = clone(selection)
        this.selects = select
    }
    /**导入银期大额*/
    async exportBank(){
        if(this.tableData.length > 0) {
            this.$confirm('确认导入银期大额?', '导入确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let tableData = clone(this.setMoneyTableDatas)
                tableData.forEach(function (item) {
                    if (item.BankingfuturesWholesale != null) {
                        item.MaxWithdraw = item.BankingfuturesWholesale
                    }

                })
                this.tableData = tableData
                this.$store.dispatch('setMoney/setRestoreData', tableData)
            })
        }else{
            this.$message({
                showClose: true,
                message: '请先选择客户！'
            })
        }

    }
    /**同步主席*/
    async Same(){
        let _self = this
        if(this.selects.length > 0) {
            let dtos = []
            this.selects.forEach(function (item) {
                var dto = {
                    "ClientNo": item.ClientNo,
                    "ChiefStatus": item.Status,
                    "MaxWithdraw": item.MaxWithdraw,
                    "UnitLimit": item.UnitLimit
                }
                dtos.push(dto)
            })
            let url = Vue.prototype.$baseUrl.imss + 'SyncLog/IMSS.Sync'
            let params = {
                "dtos": dtos,
                "type": "Withdraw"
            }
            let requestDataHeader = Vue.prototype.$api.request(url, {method: 'POST', body: JSON.stringify(params)})
            fetch(requestDataHeader).then(resp => {
                if (resp.ok === true) {
                    _self.$message({
                        showClose: true,
                        message: '同步成功',
                        type: 'success'
                    })
                } else {
                    return resp.json()
                }
            }).then(data => {
            })
        }else{
            this.$message({
                showClose: true,
                message: '请先勾选客户！'
            })
        }
    }

    /**
     * ===================================================
     * 选择客户页面
     * */
    //次席信息管理表格数据
    data() {
        return {
            options: Object.assign({}, Vue.prototype.$xvuex.options, {
                url: Vue.prototype.$baseUrl.imss + 'Client',
                delUrl: Vue.prototype.$baseUrl.imss + 'Client/IMSS.DeleteClient',
                addUrl: Vue.prototype.$baseUrl.imss + 'Client/IMSS.CreateClient',
                editUrl: Vue.prototype.$baseUrl.imss + 'Client/IMSS.UpdateClient',
                urlParameter: {
                    $filter: `((TotalSecondSeatStatus eq 10)and(DoubleOpen eq false))`,
                    $orderby: '',
                    $expand: ''
                },
                dicUrls: {
                  SecondSeatSystemDict: Vue.prototype.$baseUrl.imss + `DataDictionaryType?$filter=(Code eq 'SS')&$expand=DataDictionary`,
                  SecondSeatStatusDict: Vue.prototype.$baseUrl.imss + `DataDictionaryType?$filter=(Code eq 'SSS')&$expand=DataDictionary`
                },
                title: '次席系统',  // 本页面名称
                gridKey: 'choseClient',  // 本页面 Eng名，唯一
                isSelection: true, // 是否开启多选checkBox
                pager_size_opts: [30, 50, 100],
                pager_Size: 30,
                table: [
                    {
                        key: 'Id',
                        title: 'ID',
                        addLayer: 'hide',   // 新增页面是否显示：show  hide,默认show
                        editLayer: 'hide', // 编辑页面 是否显示：show  hide,默认show
                        searchKey: 'hide', // 搜索下拉 是否显示：show  hide,默认show
                        column: 'hide',  // 列表 是否显示：show  hide,默认show
                        width: 'auto',   // 长度 200,默认auto
                        type: 'number'  // 默认 string  ，种类：string  number select remoteMethod
                    },
                    {
                        key: 'ClientNo',
                        title: '客户号',
                        fixed: 'left',
                        rules: [{required: true, message: '必填'}]
                    },
                    {
                        key: 'TotalSecondSeatStatus',
                        title: '总次席状态',
                        dicKey: 'SecondSeatStatusDict',
                        searchKey: 'hide',
                        readOnly:true,
                        fixed: 'left'
                    },
                    {
                        key: 'SecondSeatSystem',
                        title: '次席系统',
                        dicKey: 'SecondSeatSystemDict', // 如果有数据字典，必须要有dicKey，指向数据字典路劲
                        width: 120,
                        type: 'select',
                        filter: true,
                        filters: [],
                        rules: [{required: true, message: '必填'}]
                    },
                    {
                        key: 'SecondSeatStatus',
                        title: '次席系统状态',
                        dicKey: 'SecondSeatStatusDict',
                        type: 'select',
                        filter: true,
                        filters: [],
                        rules: [{required: true, message: '必填'}]
                    },
                    {
                        key: 'MultiSecondSeat',
                        title: '多次席',
                        searchKey: 'hide',
                        type: 'select',
                        filter: true,
                        selects: [{value:true,text:'是'},{value:false,text:'否'}],
                        filters: [{value:`(MultiSecondSeat eq true)`,text:'是'},{value:`(MultiSecondSeat eq false)`,text:'否'}],
                        readOnly:true
                    },
                    {
                        key: 'DoubleOpen',
                        title: '双开客户',
                        searchKey: 'hide',
                        rules: [{required: true, message: '必填'}]
                    },
                    {
                        key: 'BankingfuturesWholesale',
                        title: '银期大额',
                        type:'number'
                    },
                    {
                        key: 'CommodityOption',
                        title: '商品期权',
                        dicKey: 'SPQQDict',
                        searchKey: 'show',
                        selects: [{value:true,text:'正常'},{value:false,text:' '}],
                        filter: true,
                        filters: [{value:`(CommodityOption eq true)`,text:'正常'},{value:`(CommodityOption eq false)`,text:''}],
                        type: 'select'
                    },
                    {
                        key: 'FinancialOption',
                        title: '金融期权',
                        dicKey: 'JRQQDict',
                        searchKey: 'show',
                        selects: [{value:true,text:'正常'},{value:false,text:' '}],
                        filter: true,
                        filters: [{value:`(FinancialOption eq true)`,text:'正常'},{value:`(FinancialOption eq false)`,text:''}],
                        type: 'select'
                    },
                    {
                        key: 'OpenTime',
                        title: '开通日期',
                        searchKey: 'hide',
                        column: 'hide',
                        type: 'date'
                    },
                    {
                        key: 'CloseTime',
                        title: '关闭日期',
                        searchKey: 'hide',
                        column: 'hide',
                        type: 'date'
                    },
                    {
                        key: 'Note',
                        title: '备注',
                        searchKey: 'hide'
                    }
                ]
            })

        }
    }



    tableFn() {
        return {
            selectCheckbox(selection) {
                let select = clone(selection)
                console.log(select)
                //this.$store.dispatch(this.options.gridKey + 'setData', {selection: select})
            }
        }
    }
    /**
     *  设置次席信息管理表格筛选项内容
     */
    setFilters() {
        let _this = this
        let table = clone(this.getState.table)
        table.forEach(function (item) {
            if (item.filter === true && _this.$store.state[item.dicKey]) {
                let filters = []
                let selects = []
                let dicData = _this.$store.state[item.dicKey].data.value
                if(dicData.length>0){
                    dicData[0].DataDictionary.forEach(function (dicItem) {
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
        })
        _this.$store.dispatch(_this.options.gridKey + 'setData', {table: table})
    }

    /**
     * 设置展现给用户的次席信息管理表格数据
     * @param tableData 次席信息管理表格数据
     */
    setTableData(tableData) {
        let initData = clone(tableData)
        let SecondSeatSystemDict = ''
        let SecondSeatStatusDict = ''
        if(this.$store.state.SecondSeatSystemDict.data){
            SecondSeatSystemDict = this.$store.state.SecondSeatSystemDict.data.value
        }
        if(this.$store.state.SecondSeatStatusDict.data){
            SecondSeatStatusDict = this.$store.state.SecondSeatStatusDict.data.value
        }
        initData.forEach(function (item) {
            //设置总次席系统状态
            if(SecondSeatStatusDict.length>0){
                SecondSeatStatusDict[0].DataDictionary.forEach(function (dicItem) {
                if (dicItem.Id === item.TotalSecondSeatStatus) {
                        item.TotalSecondSeatStatus = dicItem.Name
                    }
                })
            }
            //设置次席系统
            if(SecondSeatSystemDict.length>0){
            SecondSeatSystemDict[0].DataDictionary.forEach(function (dicItem) {
            if (dicItem.Id === item.SecondSeatSystem) {
                    item.SecondSeatSystem = dicItem.Name
                }
            })
            }
            //设置次席系统状态
            if(SecondSeatStatusDict.length>0){
            SecondSeatStatusDict[0].DataDictionary.forEach(function (dicItem) {
                if (dicItem.Id === item.SecondSeatStatus) {
                    item.SecondSeatStatus = dicItem.Name
                }
            })
            }
            item.MultiSecondSeat = item.MultiSecondSeat == true ? '是': '否'
            item.DoubleOpen = item.DoubleOpen == true ? '是': '否'
            item.CommodityOption = item.CommodityOption == true ? '正常': ''
            item.FinancialOption = item.FinancialOption == true ? '正常': ''
            item.OpenTime = (item.OpenTime != null?item.OpenTime.split('T')[0]:null)
            item.CloseTime = (item.CloseTime != null?item.CloseTime.split('T')[0]:null)
        })
        this.$store.dispatch(this.options.gridKey + 'setData', {tableData: initData})
    }

    //打开选择客户model
    async showClientModel(){
        this.clientModelVisible = true
    }
    //关闭选择客户model
    async clientModelClose(){
        this.clientModelVisible = false
    }

    //添加客户
    async addClients(){
        let selectArr = this.getState.selection
        let _self = this
        var tableData = clone(this.setMoneyTableDatas)
        if(selectArr.length >0) {
            selectArr.forEach(function (selectClient) {
                var flag = false
                tableData.forEach(function (item) {
                    if (item.ClientNo === selectClient.ClientNo) {
                        flag = true
                    }
                })
                if (!flag) {
                    let status = null
                    _self.ChiefStatusDict.forEach(function (dict) {
                        if (dict.Name == '正常') {
                            status = Number(dict.Code)
                        }
                    })
                    var client = {
                        ClientNo: selectClient.ClientNo,
                        StatusName: '正常',
                        Status: status,
                        MaxWithdraw: 1000000,
                        UnitLimit: 0,
                        BankingfuturesWholesale: selectClient.BankingfuturesWholesale
                    }
                    tableData.push(client)
                }
            })
            this.tableData = tableData
            this.clientModelVisible = false
            //清空选择框
            let select = this.$store.state[this.options.gridKey].selection
            this.$store.dispatch(this.options.gridKey + 'setData', {selection: []})
            this.$store.dispatch(this.options.gridKey + '_set_refresh')
            this.$store.dispatch('setMoney/setRestoreData', tableData)
        }else{
            //this.$notify({
            //    title: '温馨提示',
            //    message: '请先选择客户！'
            //});
            this.$message({
                title: '温馨提示',
                showClose: true,
                message: '请先选择客户！'
            })
        }
    }

    async setMoneyTableData(setMoney){
        var params = this.$route.params.ClientNo
        var _self = this
        let url = Vue.prototype.$baseUrl.imss + `DataDictionaryType?$filter=(Code eq 'CSS')&$expand=DataDictionary`
        let requestDataHeader = Vue.prototype.$api.request(url)
        fetch(requestDataHeader).then(resp => {
            return resp.json()
        }).then(datas => {
            if(datas.value.length > 0){
                this.ChiefStatusDict = datas.value[0].DataDictionary
                console.log(this.ChiefStatusDict)
            }
            //console.log(this.ChiefStatusDict)
        })
        if (setMoney && params == 'ClientArr'){
            var dataArr = []
            var maxWithdraw = 0
            var status = null
            if(setMoney.Type == 1){
                maxWithdraw = 1000000
                this.title = '出金参数设置'
                this.type = 1
                this.ChiefStatusDict.forEach(function(dict){
                    if(dict.Name ='正常'){
                        status = dict.Code
                    }
                })
            }else if(setMoney.Type == 2){
                maxWithdraw = 0
                this.title = '恢复参数设置'
                this.type = 2
                this.ChiefStatusDict.forEach(function(dict){
                    if(dict.Name ='只可平仓'){
                        status = dict.Code
                    }
                })
            }
            setMoney.Clients.forEach(function(client){
                var client = {
                    ClientNo: client.ClientNo,
                    Status: status,
                    MaxWithdraw: maxWithdraw,
                    UnitLimit: 0,
                    BankingfuturesWholesale: client.BankingfuturesWholesale
                }
                dataArr.push(client)
            })
            this.tableData = dataArr
            this.$store.dispatch()
        }
    }
    //添加客户
    async AddClient(){
        var maxWithdraw = 0
        if(this.type == 1){
            maxWithdraw = 1000000
        }else if(this.type == 2){
            maxWithdraw = 0
        }
        var userId = this.formInline.userId
        let _self = this
        if(userId){
            var flag = false
            this.tableData.forEach(function(client){
                if(client.ClientNo == userId){
                    flag = true
                }
            })
            if(!flag){
                //判断该客户号是否存在
                let url = Vue.prototype.$baseUrl.imss + `Client/$count?$filter=(ClientNo eq '${userId}')`
                let requestDataHeader = Vue.prototype.$api.request(url)
                fetch(requestDataHeader).then(resp => {
                    return resp.text()
                }).then(count => {
                    if (Number(count) > 0) {
                        var client = {
                          ClientNo: userId,
                          Status: '正常',
                          MaxWithdraw: maxWithdraw,
                          UnitLimit: 0
                        }
                        _self.tableData.push(client)
                        var setMoney = JSON.parse(localStorage.getItem('setMoney'))
                        var clientNoArr = setMoney.ClientNoArr
                        clientNoArr.push(userId)
                        var newSetMoney = {
                            ClientNoArr: clientNoArr,
                            Type: setMoney.Type
                        }
                        localStorage.setItem('setMoney', JSON.stringify(newSetMoney))
                        _self.formInline.userId = ''
                    }else{
                        _self.$notify({
                          title: '温馨提示',
                          message: '该客户号不存在！'
                        });
                    }
                })
            }else{
                this.$notify({
                  title: '温馨提示',
                  message: '该客户号已经存在！'
                });
            }
        }
    }

    async exportBank2(){
        let _self = this
        let myRequests = []
        this.tableData.forEach(function(client){
            let url = Vue.prototype.$baseUrl.imss + `Client?$filter=(ClientNo eq '${client.ClientNo}')`
            myRequests.push(url)
        })
        Promise.all(myRequests.map(myRequest =>
          fetch(myRequest).then(resp => {
            return resp.json()
          })
        )).then(datas => {
          datas.forEach(function (data, index) {
                if(data.value.length > 0){
                    _self.tableData.forEach(function(item){
                        if(item.ClientNo == data.value[0].ClientNo && data.value[0].BankingfuturesWholesale != null){
                            item.MaxWithdraw = data.value[0].BankingfuturesWholesale
                        }
                    })
                }
          })
        })
    }


}
