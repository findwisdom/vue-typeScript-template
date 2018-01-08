import Vue from 'base'
import store from  'store'
import apiService from 'api-service'
import { Component, Watch } from 'vue-property-decorator'
import template from './app.vue'
import entry from 'pages/entry'
import layout from 'components/layout'

import { USERNAME_KEY, STORAGE_IDENTITY_KEY, CLIENT_ID, CLIENT_SECRET } from '../../config/wucc-config'

let user = store.state.auth.user
let timestamp = (new Date()).getTime() / 1000
let callbacktime = user.expires_at - 10


@Component({
    name: 'page-app',
    mixins: [template],
    components: {
        entry,
        layout
    },
})
export default class App extends Vue {
    mounted () {
        this.startSlientRenew ()
    }
    startSlientRenew () {
        if (timestamp > callbacktime && timestamp < (user.expires_at - 5)) {
            apiService.login.slientRenew()
        }
        if (timestamp < callbacktime) {
            let time = (callbacktime - timestamp) * 1000
            setTimeout(function () {
                apiService.login.slientRenew()
            }, time)
        }
    }

    @Watch('$route')
    routerchange (val, oldVal) {
        //出金参数设置
        if (val.name === 'Restore') {
            //this.$router.push({ path: '/setMoney/setMoney',query:{Type:'Restore'}})
        }
        //恢复参数设置
        if (val.name === 'Withdraw') {
            //this.$router.push({ path: '/setMoney/setMoney',query:{Type:'Withdraw'}})
        }
    }
}
