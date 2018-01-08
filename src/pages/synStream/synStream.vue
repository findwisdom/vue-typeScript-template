<template><!-- 操作同步流水 -->
    <div>
        <h3 class="pageTit">{{options.title}}</h3>
        <div>
            <xheaderBar
                :options="options"
                :headerFn="headerFn"
                :addShow="addShow"
                :delShow="delShow"
            >
            </xheaderBar>
            <xtable
                :tableFn="tableFn"
                :options="options"
            ></xtable>
            <xpagers
                :options="options"
            ></xpagers>
        </div>
        <template>
        <el-dialog
          title="流水详情"
          :visible.sync="modelVisible"
          width="40%"
          :before-close="modelClose">
            <xtable
                :options="detailOptions"
            ></xtable>
            <xpagers
                :options="detailOptions"
            ></xpagers>
          <!-- <el-form ref="clientForm" :model="clientWithdrawForm" label-width="100px">
                <el-form-item label="客户号" prop="ClientNo">
                    <el-input v-model="clientWithdrawForm.ClientNo"></el-input>
                </el-form-item>
                <el-form-item label="最大出金限额" prop="MaxWithdraw">
                    <el-input v-model="clientWithdrawForm.MaxWithdraw"></el-input>
                </el-form-item>
                <el-form-item label="出金单笔限额" prop="UnitLimit">
                    <el-input v-model="clientWithdrawForm.UnitLimit"></el-input>
                </el-form-item>
        </el-form> -->
        </el-dialog>
        </template>
    </div>
</template>
<style src="./synStream.scss" lang="scss" scoped></style>
