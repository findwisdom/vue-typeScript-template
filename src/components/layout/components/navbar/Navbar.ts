/**
 * Created by wisdom on 2017/12/26.
 */
import Vue from 'base'
import { Component } from 'vue-property-decorator'
import template from './Navbar.vue'
import personMenu from 'components/personMenu'
// interface Data{
//     sidebar:object
// }

@Component({
    name: 'Navbar',
    mixins: [template],
    components: {
        personMenu
    }
})
export default class Navbar extends Vue {
    mounted () {
        //console.log(this.$store)
    }
    get sidebar () {
        return this.$store.getters['app/sidebar']
    }

    toggleSideBar () {
        this.$store.dispatch('app/toggleSideBar')
    }
}