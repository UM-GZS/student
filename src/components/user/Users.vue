<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>用户管理</el-breadcrumb-item>
			<el-breadcrumb-item>用户列表</el-breadcrumb-item>
		</el-breadcrumb>
		<el-card>
			<el-row :gutter="20">
				<el-col :span="8">
					<el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUsersList">
						<el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
					</el-input>
				</el-col>
				<el-col :span="4">
					<el-button type="primary" @click="AddDialogVisible = true">添加</el-button>
				</el-col>
			</el-row>
			<el-table :data="userList" border stripe>
				<el-table-column label="#" type="index"></el-table-column>
				<el-table-column label="用户名" prop="username"></el-table-column>
				<el-table-column label="邮箱" prop="email"></el-table-column>
				<el-table-column label="电话" prop="mobile"></el-table-column>
				<el-table-column label="角色" prop="role_name"></el-table-column>
				<el-table-column label="状态" prop="mg_state">
					<template slot-scope="scope">
						<el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)">
						</el-switch>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="180px">
					<template slot-scope="scope">
						<el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)"></el-button>
						<el-button size="mini" type="danger" icon="el-icon-delete" @click="removeUser(scope.row.id)"></el-button>
						<el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
							<el-button size="mini" type="warning" icon="el-icon-setting" @click="setRloe(scope.row)"></el-button>
						</el-tooltip>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
			:page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
			</el-pagination>
		</el-card>

		<el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
			<el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
				<el-form-item label="用户名">
					<el-input v-model="editForm.username" disabled></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="editForm.email"></el-input>
				</el-form-item>
				<el-form-item label="电话" prop="mobile">
					<el-input v-model="editForm.mobile"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editUser">确 定</el-button>
			</span>
		</el-dialog>
		<el-dialog title="添加用户" :visible.sync="AddDialogVisible" width="50%" @close="addDialogClose">
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
				<el-form-item label="用户名" prop="username">
					<el-input v-model="addForm.username"></el-input>
				</el-form-item>
				<el-form-item label="密码" prop="password">
					<el-input v-model="addForm.password" type="password"></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="addForm.email"></el-input>
				</el-form-item>
				<el-form-item label="电话" prop="mobile">
					<el-input v-model="addForm.mobile"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="AddDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addUser">确 定</el-button>
			</span>
		</el-dialog>
		<el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="resetRoleDialog">
			<div>
				<p>当前的用户：{{userInfo.username}}</p>
				<p>当前的角色：{{userInfo.role_name}}</p>
				<p>分配新角色：
					<el-select v-model="selectRoleId" placeholder="请选择">
						<el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
						</el-option>
					</el-select>
				</p>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button @click="setRoleDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="setRoleInfo">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		data() {
			var checkEmail = (rule, value, callBack) => {
				const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
				if (regEmail.test(value)) {
					return callBack()
				}
				callBack(new Error('请输入正确的邮箱'))
			}
			var checkMobile = (rule, value, callBack) => {
				const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
				if (regMobile.test(value)) {
					return callBack()
				}
				callBack(new Error('请输入正确的手机号码'))
			}
			return {
				queryInfo: {
					query: '',
					pagenum: 1,
					pagesize: 2
				},
				userList: [],
				total: 0,
				AddDialogVisible: false,
				editDialogVisible: false,
				setRoleDialogVisible: false,
				userInfo: {},
				rolesList: [],
				selectRoleId: '',
				addForm: {
					username: '',
					password: '',
					email: '',
					mobile: ''
				},
				editForm: {

				},
				editFormRules: {
					email: [{
							required: true,
							message: '请输入邮箱',
							trigger: 'blur'
						},
						{
							validator: checkEmail,
							trigger: 'blur'
						}
					],
					mobile: [{
							required: true,
							message: '请输入电话',
							trigger: 'blur'
						},
						{
							validator: checkMobile,
							trigger: 'blur'
						}
					]
				},
				addFormRules: {
					username: [{
							required: true,
							message: '请输入用户名',
							trigger: 'blur'
						},
						{
							min: 3,
							max: 10,
							message: '用户名长度在3~10个字符之间',
							trigger: 'blur'
						}
					],
					password: [{
							required: true,
							message: '请输入密码',
							trigger: 'blur'
						},
						{
							min: 6,
							max: 15,
							message: '密码长度在6~15个字符之间',
							trigger: 'blur'
						}
					],
					email: [{
							required: true,
							message: '请输入邮箱',
							trigger: 'blur'
						},
						{
							validator: checkEmail,
							trigger: 'blur'
						}
					],
					mobile: [{
							required: true,
							message: '请输入电话',
							trigger: 'blur'
						},
						{
							validator: checkMobile,
							trigger: 'blur'
						}
					]
				}
			}
		},
		created() {
			this.getUsersList()
		},
		methods: {
			async getUsersList() {
				const {
					data: res
				} = await this.$http.get('users', {
					params: this.queryInfo
				})
				if (res.meta.status !== 200) {
					return this.$message({
						showClose: true,
						message: res.meta.msg,
						type: 'error'
					})
				}
				this.userList = res.data.users
				this.total = res.data.total
			},
			handleSizeChange(newSize) {
				this.queryInfo.pagesize = newSize
				this.getUsersList()
			},
			handleCurrentChange(newPage) {
				this.queryInfo.pagenum = newPage
				this.getUsersList()
			},
			async userStateChange(userInfo) {
				const {
					data: res
				} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
				if (res.meta.status !== 200) {
					userInfo.mg_state = !userInfo.mg_state
					return this.$message({
						showClose: true,
						message: res.meta.msg,
						type: 'error'
					})
				}
				this.$message({
					showClose: true,
					message: res.meta.msg,
					type: 'success'
				})
			},
			addDialogClose() {
				this.$refs.addFormRef.resetFields()
			},
			addUser() {
				this.$refs.addFormRef.validate(async valid => {
					if (!valid) return
					const {
						data: res
					} = await this.$http.post('users', this.addForm)
					if (res.meta.status !== 201) {
						return this.$message({
							showClose: true,
							message: res.meta.msg,
							type: 'error'
						})
					}
					this.$message({
						showClose: true,
						message: res.meta.msg,
						type: 'success'
					})
					this.AddDialogVisible = false
					this.getUsersList()
				})
			},
			async showEditDialog(id) {
				const {
					data: res
				} = await this.$http.get('users/' + id)
				if (res.meta.status !== 200) {
					return this.$message({
						showClose: true,
						message: res.meta.msg,
						type: 'error'
					})
				}
				this.editForm = res.data
				this.editDialogVisible = true
			},
			editDialogClose() {
				this.$refs.editFormRef.resetFields()
			},
			editUser() {
				this.$refs.editFormRef.validate(async valid => {
					if (!valid) return
					const {
						data: res
					} = await this.$http.put('users/' + this.editForm.id, {
						email: this.editForm.email,
						mobile: this.editForm.mobile
					})
					if (res.meta.status !== 200) {
						return this.$message({
							showClose: true,
							message: res.meta.msg,
							type: 'error'
						})
					}
					this.$message({
						showClose: true,
						message: res.meta.msg,
						type: 'success'
					})
					this.editDialogVisible = false
					this.getUsersList()
				})
			},
			async removeUser(id) {
				console.log(id)
				const confirmRsult = await this.$confirm('确认删除该用户吗?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).catch(err => err)
				if (confirmRsult !== 'confirm') return
				const {
					data: res
				} = await this.$http.delete('users/' + id)
				if (res.meta.status !== 200) {
					return this.$message({
						showClose: true,
						message: res.meta.msg,
						type: 'error'
					})
				}
				this.$message({
					showClose: true,
					message: res.meta.msg,
					type: 'success'
				})
				this.getUsersList()
			},
			async setRloe(userInfo) {
				this.userInfo = userInfo
				const {
					data: res
				} = await this.$http.get('roles')
				if (res.meta.status !== 200) {
					this.$message({
						showClose: true,
						message: res.meta.msg,
						type: 'error'
					})
				}
				this.rolesList = res.data
				this.setRoleDialogVisible = true
				console.log(res)
			},
			async setRoleInfo() {
				if(!this.selectRoleId) {
					return this.$message({
						showClose: true,
						message: '请选择要分配的角色',
						type: 'error'
					})
				}
				const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {rid: this.selectRoleId})
				if(res.meta.status !== 200) {
					return this.$message({
						showClose: true,
						message: res.meta.msg,
						type: 'error'
					})
				}
				this.$message({
					showClose: true,
					message: res.meta.msg,
					type: 'success'
				})
				this.getUsersList()
				this.setRoleDialogVisible = false
			},
			resetRoleDialog() {
				this.selectRoleId = '',
				this.userInfo = []
			}
		}
	}
</script>

<style lang="less" scoped>
</style>
