/*
数据字典
 */
import Vue from 'vue'
import {get} from '../api/http'

export function getafterData (ClientId) {
    let url = Vue.prototype.$baseUrl.imss + `ClientChangeLog?$filter=ClientId eq ${ClientId} and ChangeLogType eq 'after'`
    return get(url)
}
