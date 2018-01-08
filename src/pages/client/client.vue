<template>
    <div>
    <h3 class="pageTit">次席信息管理</h3>
    <xheaderBar
        :options="options"
        :headerFn="headerFn"
        :addShow="addShow"
        :isShowSenior="isShowSenior"
    >
    <slot name="addBtn">
      <!-- <el-tooltip content="出金" placement="top-end">
        <el-button plain type="success" @click="setMoney">
          出金
        </el-button>
      </el-tooltip>
      <el-tooltip content="恢复" placement="top-end">
        <el-button plain type="warning" @click="recover">
          恢复
        </el-button>
      </el-tooltip> -->
      <el-tooltip content="新增" placement="top-end">
        <el-button plain type="primary" @click="showClientModel">
          <i class="iconfont icon-add"></i>
        </el-button>
      </el-tooltip>
    </slot>
    </xheaderBar>

    <xtable
        :tableFn="tableFn"
        :options="options"
    ></xtable>
    <xpagers
        :options="options"
    ></xpagers>
    <!-- <xadd
      :addFn="addFn"
      :options="options"
    ></xadd> -->
    <xedit
      :editFn="editFn"
      :options="options"
    ></xedit>
    <xdetails
        :options="options"
    ></xdetails>

	<template>
		<el-dialog
		  title="新增 - 次席信息"
		  :visible.sync="clientVisible"
		  width="40%"
		  :before-close="detailClose">
		  <el-form ref="clientForm"  :rules="clientRules" :model="clientForm" label-width="100px">
		  		<el-form-item label-width="0px">
			  		<el-col :span="12" class="p-r">
					  	<el-form-item label="客户号" prop="ClientNo">
					    	<el-input v-model="clientForm.ClientNo"></el-input>
					  	</el-form-item>
				  	</el-col>
				  	<el-col :span="12" class="p-r">
				  		<el-form-item label="银期大额" prop="BankingfuturesWholesale">
					    	<el-input v-model="clientForm.BankingfuturesWholesale"></el-input>
					  	</el-form-item>
				  	</el-col>
			  	</el-form-item>
			  	<el-form-item label="次席信息" class="cx-items">
				 <el-form-item
				    v-for="(secondSeat, index) in clientForm.ClientSecondSeat"
				    :key="secondSeat.key"
				  >
						<el-col :span="5" class="p-r">
							<el-form-item :prop="'ClientSecondSeat.' + index +'.SecondSeat'"
				    			:rules="{required: true, message: '名称不能为空', trigger: 'blur'}">
							    <el-select v-model="secondSeat.SecondSeat" placeholder="名称">
							      <el-option v-for="(secondSeatSystem, index) in SecondSeatSystemDict" :key="secondSeatSystem.Name" :label="secondSeatSystem.Name" :value="secondSeatSystem.Id"></el-option>
							    </el-select>
							</el-form-item>
						</el-col>
						<el-col :span="5" class="p-r">
							<el-form-item :prop="'ClientSecondSeat.' + index +'.SecondSeatStatus'"
				    			:rules="{required: true, message: '状态不能为空', trigger: 'blur'}">
							    <el-select v-model="secondSeat.SecondSeatStatus" placeholder="状态">
							      <el-option  v-for="(secondSeatStatus, index) in SecondSeatStatusDict" :key="secondSeatStatus.Name" :label="secondSeatStatus.Name" :value="secondSeatStatus.Id"></el-option>
							    </el-select>
							</el-form-item>
						</el-col>
						<el-col :span="6" class="p-r">
					      <el-form-item>
					        <el-date-picker type="date" placeholder="开通日期" v-model="secondSeat.OpenTime" style="width: 100%;"></el-date-picker>
					      </el-form-item>
					    </el-col>
						<el-col :span="6" class="p-r">
					      <el-form-item>
					        <el-date-picker type="date" placeholder="结束日期" v-model="secondSeat.CloseTime" style="width: 100%;"></el-date-picker>
					      </el-form-item>
					    </el-col>
					    <el-col :span="2" v-if="index > 0">
					    	<el-button @click.prevent="removeSecondSeats(secondSeat)"><svg-icon icon-class="delete" /></el-button>
					    </el-col>
				  </el-form-item>
			  	</el-form-item>

			  	<el-form-item>
			  		<el-button @click="addSecondSeats" size="mini"><svg-icon icon-class="plus" /></el-button>
			  	</el-form-item>
			  	<el-form-item label="双开客户"  prop="DoubleOpen">
				    <el-radio :label="true" v-model="clientForm.DoubleOpen">是</el-radio>				      <el-radio :label="false" v-model="clientForm.DoubleOpen">否</el-radio>
			  	</el-form-item>
			  	<el-form-item label="期权">
			  		<el-checkbox v-model="clientForm.CommodityOption">商品期权</el-checkbox>
  					<el-checkbox v-model="clientForm.FinancialOption">金融期权</el-checkbox>
			  	</el-form-item>
			  	<el-form-item label="备注">
			    	<el-input type="textarea" v-model="clientForm.Note"></el-input>
			  	</el-form-item>
			  	<el-form-item>
			    	<el-button type="primary" @click="handleSubmit('clientForm')">保存</el-button>
			    	<el-button @click="clientVisible = false">取消</el-button>
			  	</el-form-item>
			</el-form>
		</el-dialog>
	</template>
	<template>
		<el-dialog
		  :title="viewTitle"
		  :visible.sync="viewClientVisible"
		  width="40%"
		  :before-close="viewDetailClose">
		  <el-form ref="viewClientForm"  :rules="clientRules" :model="viewClientForm" label-width="100px">
		  		<el-form-item label-width="0px">
			  		<el-col :span="12" class="p-r">
					  	<el-form-item label="客户号" prop="ClientNo">
					    	<el-input :disabled='true' v-model="viewClientForm.ClientNo"></el-input>
					  	</el-form-item>
				  	</el-col>
				  	<el-col :span="12" class="p-r">
				  		<el-form-item label="银期大额" prop="BankingfuturesWholesale">
					    	<el-input :disabled='isView' v-model="viewClientForm.BankingfuturesWholesale"></el-input>
					  	</el-form-item>
				  	</el-col>
			  	</el-form-item>
			  	<el-form-item label-width="0px">
			  		<el-col :span="12" class="p-r">
						<el-form-item label="次席系统"
			    			:rules="{required: true, message: '名称不能为空', trigger: 'blur'}">
						    <el-select :disabled='isView' v-model="viewClientForm.SecondSeat" placeholder="名称">
						      <el-option v-for="(secondSeatSystem, index) in SecondSeatSystemDict" :key="secondSeatSystem.Name" :label="secondSeatSystem.Name" :value="secondSeatSystem.Id"></el-option>
						    </el-select>
						</el-form-item>
					</el-col>
					<el-col :span="12" class="p-r">
						<el-form-item  label="次席状态"
			    			:rules="{required: true, message: '状态不能为空', trigger: 'blur'}">
						    <el-select :disabled='isView' v-model="viewClientForm.SecondSeatStatus" placeholder="状态">
						      <el-option  v-for="(secondSeatStatus, index) in SecondSeatStatusDict" :key="secondSeatStatus.Name" :label="secondSeatStatus.Name" :value="secondSeatStatus.Id"></el-option>
						    </el-select>
						</el-form-item>
					</el-col>
				</el-form-item>
				<el-form-item label-width="0px">
					<el-col :span="12" class="p-r">
				      <el-form-item label="开通日期">
				        <el-date-picker :disabled='isView' type="date" placeholder="开通日期" v-model="viewClientForm.OpenTime" style="width: 100%;"></el-date-picker>
				      </el-form-item>
				    </el-col>
					<el-col :span="12" class="p-r">
				      <el-form-item label="结束日期">
				        <el-date-picker :disabled='isView' type="date" placeholder="结束日期" v-model="viewClientForm.CloseTime" style="width: 100%;"></el-date-picker>
				      </el-form-item>
				    </el-col>
			  	</el-form-item>
			  	<el-form-item label="双开客户"  prop="DoubleOpen">
				      <el-radio :label="true" :disabled='isView' v-model="viewClientForm.DoubleOpen">是</el-radio>
				      <el-radio :label="false" :disabled='isView' v-model="viewClientForm.DoubleOpen">否</el-radio>
				</el-form-item>
			  	<el-form-item label="期权">
			  		<el-checkbox :disabled='isView' v-model="viewClientForm.CommodityOption">商品期权</el-checkbox>
  					<el-checkbox :disabled='isView' v-model="viewClientForm.FinancialOption">金融期权</el-checkbox>
			  	</el-form-item>
			  	<el-form-item label="备注">
			    	<el-input type="textarea" :disabled='isView' v-model="viewClientForm.Note"></el-input>
			  	</el-form-item>
			  	<el-form-item label="变更说明">
			    	<el-input v-model="viewClientForm.Description" :disabled='isView'></el-input>
			  	</el-form-item>
			  	<el-form-item>
			    	<el-button type="primary" @click="updateForm('viewClientForm')">{{btnText}}</el-button>
			    	<el-button @click="viewClientVisible = false">关闭</el-button>
			  	</el-form-item>
			</el-form>
		</el-dialog>
	</template>
    </div>
</template>
<style src="./client.scss" lang="scss"></style>