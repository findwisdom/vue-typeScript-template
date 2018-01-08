import Vue from 'vue'
import Router from 'vue-router'
import Layout from '../components/layout'
import entry from '../pages/entry'
import client from '../pages/client'
// routes
// import homeRoute from './home'
// import productRoute from './product'
import { USERNAME_KEY, STORAGE_IDENTITY_KEY, CLIENT_ID, CLIENT_SECRET } from '../config/wucc-config'

Vue.use(Router)

const constantRouterMap = [
    { path: '/404', component: getView('error404'), hidden: true }
]

const asyncRouterMap = [
    { path: '*', redirect: '/404', hidden: true },
    {
        path: '/',
        component: getView(`client`),
        redirect: '/client',
        name: 'index',
        hidden: true
    },
    {
        path: '/client',
        component: Layout,
        redirect: '/client/client',
        name: '次席信息管理',
        meta: {title: '次席信息管理', icon: 'component', role: ['WPBS_MessageManage']},
        children: [{
            path: 'client',
            name: 'client',
            component: getView(`client`),
            meta: { title: '次席信息管理', icon: 'component', role: ['WPBS_MessageManage']}
        }]
    },
    {
        path: '/changeHistory',
        component: Layout,
        redirect: '/changeHistory/changeHistory',
        name: 'changeHistory',
        meta: {title: '次席变更记录', icon: 'clipboard', role: ['WPBS_ChangeLog']},
        children: [{
            path: 'changeHistory',
            name: 'changeHistory',
            component: getView(`changeHistory`),
            meta: {title: '次席变更记录', icon: 'clipboard', role: ['WPBS_ChangeLog']}
        }]
    },
    {
        path: '/setMoney',
        component: Layout,
        redirect: '/setMoney/Withdraw',
        name: 'Withdraw',
        meta: {title: '出金参数设置', icon: 'international', role: ['WPBS_WithdrawSetting']},
        children: [{
            path: 'Withdraw',
            name: 'Withdraw',
            component: getView(`setMoney`),
            meta: {title: '出金参数设置', icon: 'zip', role: ['WPBS_WithdrawSetting']}
        }]
    },
    {
        path: '/setMoney',
        component: Layout,
        redirect: '/setMoney/Restore',
        name: 'Restore',
        meta: {title: '恢复参数设置', icon: 'international',  role: ['WPBS_ReturnSetting']},
        children: [{
            path: 'Restore',
            name: 'Restore',
            component: getView(`restore`),
            meta: {title: '恢复参数设置', icon: 'international', role: ['WPBS_ReturnSetting']}
        }]
    },

    {
        path: '/synStream',
        component: Layout,
        redirect: '/synStream/synStream',
        name: 'synStream',
        meta: {title: '操作同步流水', icon: 'international', role: ['WPBS_OperationLog']},
        children: [{
            path: 'synStream',
            name: 'synStream',
            component: getView(`synStream`),
            meta: {title: '操作同步流水', icon: 'withdraw', role: ['WPBS_OperationLog']}
        }]
    },
    {
        path: '/dictionaries',
        component: Layout,
        redirect: '/dictionaries/immsNames',
        name: 'dictionaries',
        meta: { title: '数据字典', icon: 'dictionaries', role: ['WPBS_Dictionaries'] },
        children: [
            {
                path: 'dictionaries',
                name: 'dictionaries',
                component: getView(`dictionaries`),
                meta: { title: '数据字典', icon: 'dictionaries', role: ['WPBS_Dictionaries'] }
            }
        ]
    },
]

if (localStorage.getItem(STORAGE_IDENTITY_KEY) === null) {
    location.href = 'login.html'
    // Vue.prototype.$alert('登录已经失效请重新登陆', '登录失效', {
    //     confirmButtonText: '确定',
    //     callback: action => {
    //         location.href = 'login.html'
    //     }
    // })
}
let role
let profile = JSON.parse(localStorage.getItem(STORAGE_IDENTITY_KEY)).profile
if(typeof profile === 'object'){
    role = profile.role
}else {
    role = JSON.parse(profile).role
}

function getView (name): any {
    return (resolve, reject) => {
        require.ensure([], (require) => {
            resolve(require(`pages/${name}/index.ts`))
        }, reject, 'product')
    }
}

function hasPermission(roles, route) {
    if (route.meta && route.meta.role) {
        return roles.some(role => route.meta.role.indexOf(role) >= 0)
    } else {
        return true
    }
}

function filterAsyncRouter(asyncRouterMap, roles) {
    const accessedRouters = asyncRouterMap.filter(route => {
        if (hasPermission(roles, route)) {
            if (route.children && route.children.length) {
                route.children = filterAsyncRouter(route.children, roles)
            }
            return true
        }
        return false
    })
    return accessedRouters
}

let accessedRouters

if (role.indexOf('superAdmin') >= 0) {
    accessedRouters = asyncRouterMap
} else {
    accessedRouters = filterAsyncRouter(asyncRouterMap, role)
}

export let routers = constantRouterMap.concat(accessedRouters)

let routes: Router.RouteConfig[] = routers


export default new Router({
    mode: 'history',
    routes: routes
})




