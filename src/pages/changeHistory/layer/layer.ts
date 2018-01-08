/**
 * Created by wisdom on 2017/12/25.
 */
import Vue from 'vue'
import {Component} from 'vue-property-decorator'
import layer from './layer.vue'
import {getafterData} from '../../../api-service/changeHistory.service'

const clone = require('clone')

@Component({
    name: 'layer',
    mixins: [layer],
    watch: {
        'getCommon.layerShow': {
            handler: function (val, oldVal) {
                this.show = val
                if (val === true) {
                    let copyData = clone(this.getCommon.userMsg)
                    let beforeData = this.changeVal(copyData)
                    this.beforeData = [beforeData]
                    this.getafterData(this.getCommon.userMsg)
                }
            },
            deep: false
        }
    },
    mounted() {
    }
})

export default class Layer extends Vue {
    show: boolean = false
    beforeData: any = [{ClientNo: null, Note: null}] // 页面初始
    afterData: any = [{ClientNo: null, Note: null}]

    setVisible() {
        this.$store.dispatch('common/setcommon', {layerShow: false})
    }

    async getafterData(val) {
        let ClientId = val.ClientId
        let data = await getafterData(ClientId)
        this.afterData = [this.changeVal(data.value[0])]
    }

    changeVal(obj): object {
        try {
            obj.CloseTime = obj.CloseTime.substring(0,19).replace('T',' ')
            obj.OpenTime = obj.OpenTime.substring(0,19).replace('T',' ')
        } catch (e) {
        }
        obj.DoubleOpen = obj.DoubleOpen === true ? '是' : '否'
        obj.CommodityOption = obj.CommodityOption === true ? '开' : '关'
        obj.FinancialOption = obj.FinancialOption === true ? '开' : '关'
        let ss = this.getState.SS.data.value[0].DataDictionary
        ss.forEach(function (item) {
            if (item.Id === obj.SecondSeat) {
                obj.SecondSeat = item.Name
            }
        })
        let sss = this.getState.SSS.data.value[0].DataDictionary
        sss.forEach(function (item) {
            if (item.Id === obj.SecondSeatStatus) {
                obj.SecondSeatStatus = item.Name
            }
        })
        return obj
    }

    get getCommon() {
        return this.$store.state.common
    }

    get getState() {
        return this.$store.state
    }
}
