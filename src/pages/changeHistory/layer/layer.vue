<template>
    <div class="changeHistory">
        <el-dialog
            title="次席变更详情"
            class="formDialog details"
            :close-on-click-modal="false"
            @close="setVisible"
            :visible.sync="show"
        >
            <div>客户号:{{beforeData[0].ClientNo}}</div>
            <div style="margin-bottom: 12px;">变更说明:{{beforeData[0].Note}}</div>
            <el-table
                :data="beforeData"
                style="width: 100%">
                <el-table-column label="变更前">
                    <el-table-column
                        prop="SecondSeat"
                        label="名称"
                    >
                    </el-table-column>
                    <el-table-column
                        prop="SecondSeatStatus"
                        label="状态"
                    >
                    </el-table-column>
                    <el-table-column
                        prop="OpenTime"
                        label="开通日期"
                    >
                    </el-table-column>
                    <el-table-column
                        prop="CloseTime"
                        label="关闭日期"
                    >
                    </el-table-column>
                    <el-table-column
                        prop="DoubleOpen"
                        label="双开客户"
                    >
                    </el-table-column>
                    <el-table-column
                        prop="CommodityOption"
                        label="商品期权"
                    >
                    </el-table-column>
                    <el-table-column
                        prop="FinancialOption"
                        label="金融期权"
                    >
                    </el-table-column>
                    <el-table-column
                        prop="BankingfuturesWholesale"
                        label="银期大额"
                    >
                    </el-table-column>
                </el-table-column>
            </el-table>
            <el-table
                :data="afterData"
                style="width: 100%">
                <el-table-column label="变更后">
                    <el-table-column
                        prop="SecondSeat"
                        label="名称"
                        >
                    </el-table-column>
                    <el-table-column
                        prop="SecondSeatStatus"
                        label="状态"
                        >
                    </el-table-column>
                    <el-table-column
                        prop="OpenTime"
                        label="开通日期"
                        >
                    </el-table-column>
                    <el-table-column
                        prop="CloseTime"
                        label="关闭日期"
                        >
                    </el-table-column>
                    <el-table-column
                        prop="DoubleOpen"
                        label="双开客户"
                        >
                    </el-table-column>
                    <el-table-column
                        prop="CommodityOption"
                        label="商品期权"
                        >
                    </el-table-column>
                    <el-table-column
                        prop="FinancialOption"
                        label="金融期权"
                        >
                    </el-table-column>
                    <el-table-column
                        prop="BankingfuturesWholesale"
                        label="银期大额"
                    >
                    </el-table-column>
                </el-table-column>
            </el-table>
            <div style="text-align:right;margin-top: 20px;">
                <el-button @click="show = false">关 闭</el-button>
            </div>
        </el-dialog>
    </div>
</template>
