/**
 * Created by wisdom on 2017/12/25.
 */
import Vue from 'base'
import {Component} from 'vue-property-decorator'
import template from './client.vue'


const clone = require('clone')
import Vue from 'vue'
import Component from 'vue-class-component'


@Component({
	name: 'client',
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
    mounted() {
        //console.log(Vue.prototype)
    }
})

export default class client extends Vue{
    addShow: boolean = false
    clientVisible: boolean = false
    viewClientVisible: boolean = false

    //高级搜索
    isShowSenior:boolean = false // 高级搜索是否显示
    //次席系统字典和次席系统状态字典
    SecondSeatSystemDict:Array<object> = []
    SecondSeatStatusDict:Array<object> = []
    viewTitle:string = ''//查看 - 次席信息
    btnText:string = '修改'
    isView:boolean = true
    //新增表单
    clientForm: object = {
            ClientNo: null,
            DoubleOpen: null,
            CommodityOption: null,
            FinancialOption: null,
            BankingfuturesWholesale: null,
            ClientSecondSeat: [{
                SecondSeat: null,
                SecondSeatStatus:null,
                OpenTime:null,
                CloseTime:null
            }],
            Note:null
    }
    //编辑表单
    viewClientForm: object = {
        ClientId: null,
        ClientNo: null,
        DoubleOpen: null,
        CommodityOption: null,
        FinancialOption: null,
        BankingfuturesWholesale: null,
        Id:null,
        SecondSeat: null,
        SecondSeatStatus:null,
        OpenTime:null,
        CloseTime:null,
        Note:null,
        Description:null
    }
    //新增页面验证
    clientRules: object =  {
        ClientNo: [
          { required: true, message: '请输入六位数字的客户号', trigger: 'blur' },
          { min: 6, max: 6, message: '请输入六位数字的客户号', trigger: 'blur' }
        ],
        DoubleOpen: [{ required: true, message: '必选', trigger: 'blur' }]
    }

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
                gridKey: 'client',  // 本页面 Eng名，唯一
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
                        isExpand:true,
                        filters: [{value:`(Client.DoubleOpen eq true)`,text:'是'},{value:`(Client.DoubleOpen eq false)`,text:'否'}],
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
                    },
                    {
                        key: 'action',
                        title: '操作',
                        width: 160,
                        addLayer: 'hide',  // 新增页面 是否显示：不显示写，显示可不写或其他值
                        editLayer: 'hide',  // 新增页面 是否显示：不显示写，显示可不写或其他值
                        searchKey: 'hide', // 搜索下拉 是否显示：show  hide,默认show
                        fixed: 'right',
                        render: [
                            {
                                fn: this.editRow,
                                type: 'primary',
                                tag: 'button',
                                text: '编辑'
                            },
                            {
                                fn: this.deleteRow,
                                tag: 'button',
                                type: 'danger',
                                text: '删除'
                            }
                        ]
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
            //item.Client.MultiSecondSeat = item.Client.MultiSecondSeat == true ? '是': '否'
            item.Client.DoubleOpen = item.Client.DoubleOpen == true ? '是': '否'
            item.Client.CommodityOption = item.Client.CommodityOption == true ? '正常': ''
            item.Client.FinancialOption = item.Client.FinancialOption == true ? '正常': ''
            item.OpenTime = (item.OpenTime != null?item.OpenTime.split('T')[0]:null)
            item.CloseTime = (item.CloseTime != null?item.CloseTime.split('T')[0]:null)
        })
        this.$store.dispatch(this.options.gridKey + 'setData', {tableData: initData})
    }

    /**
     * 保存次席信息
     * */
    async handleSubmit(formName) {
        /* if (this.isView) { //查看
         this.isView = false
         this.btnText = '完成修改'
         } else {
         this.isView = true
         this.btnText = '修改'*/
        let _self = this
        let clientForm = _self.clientForm
        let clientSecondSeat = _self.clientForm.ClientSecondSeat
        console.log(clientForm)
        let secondSeatDto = []
        let clientDto = {
            ClientNo: clientForm.ClientNo,
            DoubleOpen: clientForm.DoubleOpen,
            BankingfuturesWholesale: clientForm.BankingfuturesWholesale ? Number(clientForm.BankingfuturesWholesale) : null,
            CommodityOption: clientForm.CommodityOption ? clientForm.CommodityOption : false,
            FinancialOption: clientForm.FinancialOption ? clientForm.FinancialOption : false,
            Note: clientForm.Note
        }
        if(clientSecondSeat.length > 0){
            clientSecondSeat.forEach(function (item) {
                var secondSeat = {
                    SecondSeat: item.SecondSeat,
                    SecondSeatStatus: item.SecondSeatStatus,
                    OpenTime: item.OpenTime?item.OpenTime:null,
                    CloseTime: item.CloseTime?item.CloseTime:null
                }
                secondSeatDto.push(secondSeat)
            })
        }
        let datas ={
            ClientDto: clientDto,
            SecondSeatDto: secondSeatDto
        }
        console.log(datas)
        this.$refs[formName].validate((valid) => {
            if (valid) {
                let url = _self.getState.addUrl
                let requestDataHeader = Vue.prototype.$api.request(url, {
                    method: 'POST',
                    body: JSON.stringify(datas)
                })
                fetch(requestDataHeader).then(resp => {
                    if (resp.ok === true) {
                        _self.clientVisible = false
                        _self.$message({
                            showClose: true,
                            message: '新增成功',
                            type: 'success'
                        })
                        _self.$store.dispatch(_self.options.gridKey + '_set_refresh')
                        _self.show = false // 关闭弹窗
                    } else {
                        return resp.json()
                    }
                }).then(data => {
                })
            } else {
                _self.$message({
                    showClose: true,
                    message: '表单数据验证失败！',
                    type: 'primary'
                })
                return false;
            }
        })
        /*clientSecondSeat.forEach(function (item) {
            var dto = {
                dto: {
                    ClientNo: clientForm.ClientNo,
                    SecondSeat: item.SecondSeat,
                    SecondSeatStatus: item.SecondSeatStatus,
                    DoubleOpen: clientForm.DoubleOpen != null ? clientForm.DoubleOpen : null,
                    BankingfuturesWholesale: clientForm.BankingfuturesWholesale ? Number(clientForm.BankingfuturesWholesale) : null,
                    CommodityOption: clientForm.CommodityOption ? clientForm.CommodityOption : false,
                    FinancialOption: clientForm.FinancialOption ? clientForm.FinancialOption : false,
                    OpenTime: (item.OpenTime ? item.OpenTime : null),
                    CloseTime: (item.CloseTime ? item.CloseTime : null),
                    Note: clientForm.Note
                }
            }
            _self.$refs[formName].validate((valid) => {
                if (valid) {
                    let url = _self.getState.addUrl
                    let requestDataHeader = Vue.prototype.$api.request(url, {
                        method: 'POST',
                        body: JSON.stringify(dto)
                    })
                    fetch(requestDataHeader).then(resp => {
                        if (resp.ok === true) {
                            _self.clientVisible = false
                            _self.$message({
                                showClose: true,
                                message: '新增成功',
                                type: 'success'
                            })
                            _self.$store.dispatch(_self.options.gridKey + '_set_refresh')
                            _self.show = false // 关闭弹窗
                        } else {
                            return resp.json()
                        }
                    }).then(data => {
                    })
                } else {
                    _self.$message({
                        showClose: true,
                        message: '表单数据验证失败！',
                        type: 'primary'
                    })
                    return false;
                }
            })

        })*/
        /*}*/

    }


    /**
     *  设置修改弹窗数据
     * */
    editRow(scope) {

        let item = clone(scope.row)
        let _self = this
        let url = _self.getState.editUrl+'('+item.Id+')?$expand=Client'
        let requestDataHeader = Vue.prototype.$api.request(url)
        fetch(requestDataHeader).then(resp => {
            if (resp.ok === true) {
                return resp.json()
            } else {
                isRequestOk = resp.ok
                return resp.json()
            }
        }).then(data => {
            _self.viewClientForm = {
                ClientId: data.Client.Id,
                ClientNo: data.Client.ClientNo,
                DoubleOpen: data.Client.DoubleOpen,
                CommodityOption: data.Client.CommodityOption,
                FinancialOption:  data.Client.FinancialOption,
                BankingfuturesWholesale: data.Client.BankingfuturesWholesale,
                Id:data.Id,
                SecondSeat: data.SecondSeat,
                SecondSeatStatus:data.SecondSeatStatus,
                OpenTime:data.OpenTime,
                CloseTime:data.CloseTime,
                Note:data.Client.Note,
                Description:null
            }
            //console.log(data)
            _self.viewClientVisible = true
            _self.isView = false
            _self.viewTitle = '编辑 - 次席信息'
        })

    }
    /**
     * 更新次席信息
     * */
    async updateForm(formName) {
        let _self = this
        let data = this.viewClientForm
            var clientDto = {
                Id: data.ClientId,
                DoubleOpen: data.DoubleOpen,
                BankingfuturesWholesale: data.BankingfuturesWholesale,
                CommodityOption: data.CommodityOption,
                FinancialOption: data.FinancialOption,
                Note:data.Note,
                Description: data.Description
            }
            var seatDto = {
                CurrentSecondSeat: data.Id,
                SecondSeat: data.SecondSeat,
                SecondSeatStatus: data.SecondSeatStatus,
                OpenTime: data.OpenTime,
                CloseTime: data.CloseTime
            }
            var dto = {
                ClientDto: clientDto,
                SeatDto: seatDto
            }
            console.log(dto)
            _self.$refs[formName].validate((valid) => {
                if (valid) {
                    let url = _self.getState.updateUrl
                    let requestDataHeader = Vue.prototype.$api.request(url, {
                        method: 'POST',
                        body: JSON.stringify(dto)
                    })
                    fetch(requestDataHeader).then(resp => {
                        if (resp.ok === true) {
                            _self.clientVisible = false
                            _self.$message({
                                showClose: true,
                                message: '更新成功',
                                type: 'success'
                            })
                            _self.$store.dispatch(_self.options.gridKey + '_set_refresh')
                            _self.viewClientVisible = false // 关闭弹窗
                        } else {
                            return resp.json()
                        }
                    }).then(data => {
                    })
                } else {
                    _self.$message({
                        showClose: true,
                        message: '表单数据验证失败！',
                        type: 'primary'
                    })
                    return false;
                }
            })



    }

    async viewDetailClose(){
        this.viewClientVisible = false
    }
    showViewDetail(scope){
        let data = clone(scope.row)
        data.DoubleOpen = data.DoubleOpen == '是'? 'true':'false'
        data.CommodityOption = data.CommodityOption == '正常'? true:false
        data.FinancialOption = data.FinancialOption == '正常'? true:false
        this.viewClientForm = data
        this.viewClientVisible = true
        this.isView = true
        this.viewTitle = '查看 - 次席信息'
    }

    async deleteRow(scope) {
        let _this = this
        this.$confirm('此操作将删除该项, 是否继续?', '删除确认', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            let id = scope.row.Id
            let url = _this.getState.delUrl+ '('+id+')'
            let requestDataHeader = Vue.prototype.$api.request(url, {
                method: 'DELETE'
            })
            fetch(requestDataHeader).then(resp => {
                if (resp.ok === true) {
                    _this.$message({
                        showClose: true,
                        message: '删除成功',
                        type: 'success'
                    })
                    _this.$store.dispatch(_this.options.gridKey + '_set_refresh')
                } else {
                    return resp.json()
                }
            }).then(data => {
                // this.$message({
                //     type: 'success',
                //     message: '删除成功!'
                // })
            })
        }).catch(() => {

        })
    }

    headerFn() {
        return {
            // 批量删除
            batchDel() {
                let _this = this
                let delObjs = _this.getState.selection
                let $length = delObjs.length
                if ($length === 0) {
                  this.$message({
                    message: '请先选中需要删除的项目。',
                    type: 'warning'
                  })
                  return false
                }
                this.$confirm('此操作将删除选中项, 是否继续?', '批量删除确认', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }).then(() => {
                  let myRequests = []
                  delObjs.forEach(function (item) {
                    let url = _this.getState.delUrl+ '('+item.Id+')'
                        myRequests.push(Vue.prototype.$api.request(url, {method: 'DELETE'}))
                  })
                  Promise.all(myRequests.map(myRequest =>
                    fetch(myRequest).then(resp => {
                        if (resp.ok === true) {
                            _this.$message({
                                type: 'success',
                                message: '删除成功!'
                            })
                            _this.$store.dispatch(_this.options.gridKey + '_set_refresh')
                            //删除最后一页 bug
                            let pagerCurrentPage = _this.getState.pager_CurrentPage
                            let pageSize = _this.getState.pager_Size
                            let pagerTotal = _this.getState.pager_Total
                            if (pagerCurrentPage > 1 && pagerTotal % pageSize === $length) {
                              _this.$store.dispatch(_this.getState.gridKey + 'setData', {pager_CurrentPage: pagerCurrentPage - 1})
                            }
                            _this.$store.dispatch(_this.getState.gridKey + 'setData', {selection: []})
                        } else {
                            //isRequestOk = resp.ok
                            return resp.json()
                        }
                    })
                  ))
                }).catch(() => {

                })
            }
        }
    }

    tableFn() {
        return {}
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

    async handleClose(done) {
        this.dialogVisible = false
        //this.$confirm('确认关闭？')
        //  .then(_ => {
        //    done();
        //  })
        //  .catch(_ => {});
    }

    //删除次席
    async removeSecondSeats(item) {
        var index = this.clientForm.ClientSecondSeat.indexOf(item)
        if (index !== -1) {
          this.clientForm.ClientSecondSeat.splice(index, 1)
        }
    }
    //添加次席
    async  addSecondSeats() {
        this.clientForm.ClientSecondSeat.push({
          value: '',
          key: Date.now()
        });
    }
    //展示新增Model
    async showClientModel(){
        this.clientVisible = true
        this.clientForm = {
            ClientNo: null,
            DoubleOpen: null,
            CommodityOption: null,
            FinancialOption: null,
            BankingfuturesWholesale: null,
            ClientSecondSeat: [{
                  SecondSeat: null,
                  SecondSeatStatus:null,
                  OpenTime:null,
                  CloseTime:null
                }],
            Note:null
        }
        if(this.$store.state.SecondSeatSystemDict.data.value.length > 0){
            this.SecondSeatSystemDict = this.$store.state.SecondSeatSystemDict.data.value[0].DataDictionary
        }
        if(this.$store.state.SecondSeatStatusDict.data.value.length > 0){
            this.SecondSeatStatusDict = this.$store.state.SecondSeatStatusDict.data.value[0].DataDictionary
        }
    }

    async detailClose(){
        this.clientVisible = false
    }

    //出金
    async setMoney(){
        //console.log(this.getState.requestUrl)
        //console.log(this.getState.selection)
        let client = {
            ClientNo: null,
            BankingfuturesWholesale: null
        }
        let clientArr = []
        let selectArr = this.getState.selection
        selectArr.forEach(function(item){
            var flag = false
            for(var i = 0; i < clientArr.length; i++){
                if(item.ClientNo === clientArr[i].ClientNo){
                    flag = true
                }
            }
            if(!flag && item.DoubleOpen == '否' && item.TotalSecondSeatStatus == '正常'){
                client = {
                    ClientNo: item.ClientNo,
                    BankingfuturesWholesale: item.BankingfuturesWholesale
                }
                clientArr.push(client)
            }
        })
        var setMoney = {
            Clients: clientArr,
            Type: 1
        }
        localStorage.setItem('setMoney', JSON.stringify(setMoney))
        this.$router.push({ path: '/setMoney/setMoney/ClientArr',query:{Name:'出金'}})
    }
    //恢复
    async recover(){
        let client = {
            ClientNo: null,
            BankingfuturesWholesale: null
        }
        let clientArr = []
        let selectArr = this.getState.selection
        //console.log(selectArr)
        selectArr.forEach(function(item){
            var flag = false
            for(var i = 0; i < clientArr.length; i++){
                if(item.ClientNo === clientArr[i].ClientNo){
                    flag = true
                }
            }
            if(!flag && item.DoubleOpen == '否' && item.TotalSecondSeatStatus == '正常'){
                client = {
                    ClientNo: item.ClientNo,
                    BankingfuturesWholesale: item.BankingfuturesWholesale
                }
                clientArr.push(client)
            }
        })
        var setMoney = {
            Clients: clientArr,
            Type: 2
        }
        localStorage.setItem('setMoney', JSON.stringify(setMoney))
        this.$router.push({ path: '/setMoney/setMoney/ClientArr',query:{Name:'恢复'}})
    }
}
