import Vue from 'base'
import { Component } from 'vue-property-decorator'
import template from './login.vue'

import login from 'components/login'

import bg from '../../assets/images/bg1.jpg'

@Component({
    name: 'page-login',
    mixins: [template],
    components: {
        login
    }
})
export default class Login extends Vue {
}
