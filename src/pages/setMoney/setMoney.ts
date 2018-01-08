/**
 * Created by wisdom on 2017/12/25.
 */
import Vue from 'base'
import {Component} from 'vue-property-decorator'
import template from './setMoney.vue'

const clone = require('clone')
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
    name: 'setMoney',
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

export default class setMoney extends Vue {

    selects: Array<object> = [] //选中的出金表数据
    tableData: Array<object> = [] //出金表数据
    ChiefStatusDict: Array<object> = [] //主席状态字典
    title :string = '出金参数设置'//标题
    SSSId: number = null //总次席状态字典
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
        return this.$store.getters['setMoney/tableData']
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
            if (resp.ok === true) {
                return resp.json()
            } else {
                isRequestOk = resp.ok
                return resp.json()
            }
        }).then(datas => {
            if(datas.value.length > 0){
                this.ChiefStatusDict = datas.value[0].DataDictionary
            }
        })
        //总次席状态字典
        let _self = this
        let url = Vue.prototype.$baseUrl.imss + `DataDictionaryType?$filter=(Code eq 'SSS')&$expand=DataDictionary`
        let requestDataHeader = Vue.prototype.$api.request(url)
        fetch(requestDataHeader).then(resp => {
            if (resp.ok === true) {
                return resp.json()
            } else {
                isRequestOk = resp.ok
                return resp.json()
            }
        }).then(datas => {
            if(datas.value.length > 0){
                var SSSDict = datas.value[0].DataDictionary
                SSSDict.forEach(function(item){
                    if(item.Name == '正常'){
                        _self.SSSId = item.Id
                        //console.log(_self.SSSId)
                    }
                })

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
        this.$store.dispatch('setMoney/setTableData', tableData)
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
                this.$store.dispatch('setMoney/setTableData', tableData)
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
        /*if(this.selects.length > 0) {*/
            let dtos = []
            this.tableData.forEach(function (item) {
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
        /*}else{
            this.$message({
                showClose: true,
                message: '请先勾选客户！'
            })
        }*/
    }

    /**
     * ===================================================
     * 选择客户页面
     * */
    //次席信息管理表格数据
    //次席信息管理表格数据
    data() {
        return {
            options: Object.assign({}, Vue.prototype.$xvuex.options, {
                url: Vue.prototype.$baseUrl.imss + 'ClientSecondSeat',
                delUrl: Vue.prototype.$baseUrl.imss + 'ClientSecondSeat',
                addUrl: Vue.prototype.$baseUrl.imss + 'Client/IMSS.CreateClient',
                editUrl: Vue.prototype.$baseUrl.imss + 'ClientSecondSeat',
                updateUrl: Vue.prototype.$baseUrl.imss + 'Client/IMSS.UpdateClient',
                urlParameter: {
                    $filter: '',
                    $orderby: '',
                    $expand: 'Client'
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
                        key: 'Client.ClientNo',
                        title: '客户号',
                        fixed: 'left',
                        readOnly:true
                        /*,render: [
                         {
                         class: 'pointer',
                         text: '点击查看次席信息详情',
                         fn: this.showViewDetail,
                         }
                         ]*/
                    },
                    {
                        key: 'Client.TotalSecondSeatStatus',
                        title: '总次席状态',
                        dicKey: 'SecondSeatStatusDict',
                        type: 'select',
                        filter: true,
                        filters: [],
                        searchKey: 'hide',
                        readOnly:true,
                        fixed: 'left'
                    },
                    {
                        key: 'SecondSeat',
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
                        key: 'Client.MultiSecondSeat',
                        title: '多次席',
                        searchKey: 'hide',
                        type: 'select',
                        selects: [{value:true,text:'是'},{value:false,text:'否'}],
                        readOnly:true
                    },
                    {
                        key: 'Client.DoubleOpen',
                        title: '双开客户',
                        searchKey: 'hide',
                        selects: [{value:true,text:'是'},{value:false,text:'否'}],
                        type: 'select',
                        filter: true,
                        filters: [{value:`(DoubleOpen eq true)`,text:'是'},{value:`(DoubleOpen eq false)`,text:'否'}],
                        rules: [{required: true, message: '必填'}]
                    },
                    {
                        key: 'Client.BankingfuturesWholesale',
                        title: '银期大额',
                        type:'number'
                    },
                    {
                        key: 'Client.CommodityOption',
                        title: '商品期权',
                        dicKey: 'SPQQDict',
                        searchKey: 'show',
                        selects: [{value:true,text:'正常'},{value:false,text:' '}],
                        filter: true,
                        filters: [{value:`(CommodityOption eq true)`,text:'正常'},{value:`(CommodityOption eq false)`,text:''}],
                        type: 'select'
                    },
                    {
                        key: 'Client.FinancialOption',
                        title: '金融期权',
                        dicKey: 'JRQQDict',
                        searchKey: 'show',
                        selects: [{value:true,text:'正常'},{value:false,text:' '}],
                        filter: true,
                        filters: [{value:`(FinancialOption eq true)`,text:'正常'},{value:`(FinancialOption eq false)`,text:''}],
                        type: 'select'
                    },
                    {
                        key: 'Note',
                        title: '备注',
                        column: 'hide',
                        searchKey: 'hide'
                    }
                ]
            })

        }
    }

    /**
     *  设置筛选项内容
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
     * 设置展现给用户的表格数据
     * @param tableData 表格数据
     */
    setTableData(tableData) {
        let _self = this
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
                _self.SecondSeatStatusDict = SecondSeatStatusDict[0].DataDictionary
                SecondSeatStatusDict[0].DataDictionary.forEach(function (dicItem) {
                    if (dicItem.Id === item.Client.TotalSecondSeatStatus) {
                        item.Client.TotalSecondSeatStatus = dicItem.Name
                    }
                })
            }
            //设置次席系统
            if(SecondSeatSystemDict.length>0){
                _self.SecondSeatSystemDict = SecondSeatSystemDict[0].DataDictionary
                SecondSeatSystemDict[0].DataDictionary.forEach(function (dicItem) {
                    if (dicItem.Id === item.SecondSeat) {
                        item.SecondSeat = dicItem.Name
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
            if(item.Client.MultiSecondSeat == true){
                item.Client.MultiSecondSeat = '是'
            }else if(item.Client.MultiSecondSeat == false){
                item.Client.MultiSecondSeat = '否'
            }
            item.Client.DoubleOpen = item.Client.DoubleOpen == true ? '是': '否'
            item.Client.CommodityOption = item.Client.CommodityOption == true ? '正常': ''
            item.Client.FinancialOption = item.Client.FinancialOption == true ? '正常': ''
            item.OpenTime = (item.OpenTime != null?item.OpenTime.split('T')[0]:null)
            item.CloseTime = (item.CloseTime != null?item.CloseTime.split('T')[0]:null)
        })
        this.$store.dispatch(this.options.gridKey + 'setData', {tableData: initData})
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
  /*  setFilters() {
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
*/
    /**
     * 设置展现给用户的次席信息管理表格数据
     * @param tableData 次席信息管理表格数据
     */
    /*setTableData(tableData) {
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
*/
    //打开选择客户model
    async showClientModel(){
        this.clientModelVisible = true
        this.$store.dispatch(this.options.gridKey + 'setData', {urlParameter: {
            $expand:`Client($filter=((TotalSecondSeatStatus eq ${this.SSSId})and(DoubleOpen eq false))) `
        }})
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
                if(tableData.length > 0){
                    tableData.forEach(function (item) {
                        if (item.ClientNo === selectClient.Client.ClientNo) {
                            flag = true
                        }
                    })
                }
                if (!flag) {
                    let status = null
                    //console.log(_self.ChiefStatusDict)
                    _self.ChiefStatusDict.forEach(function (dict) {
                        if (dict.Name == '正常') {
                            status = Number(dict.Code)
                        }
                    })
                    var client = {
                        ClientNo: selectClient.Client.ClientNo,
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
            this.$store.dispatch('setMoney/setTableData', tableData)
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
