<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/roles' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>角色管理</el-breadcrumb-item>
			<el-breadcrumb-item>角色列表</el-breadcrumb-item>
		</el-breadcrumb>
		<el-card>
			<el-row>
				<el-col>
					<el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
				</el-col>
			</el-row>
			<el-table :data="rolesList" border stripe>
				<el-table-column type="expand">
					<template slot-scope="scope">
						<el-row :class="['bdbottom', index1 === 0?'bdtop':'', 'vcenter']" v-for="(item1, index1) in scope.row.children"
						:key="item1.id">
							<el-col :span="5">
								<el-tag closable @close="removeRight(scope.row, item1.id)">{{index1}}{{item1.authName}}</el-tag>
								<i class="el-icon-caret-right"></i>
							</el-col>
							<el-col :span="19">
								<el-row :class="[index2 === 0?'':'bdtop', 'vcenter']" v-for="(item2, index2) in item1.children" :key="item2.id">
									<el-col :span="6">
										<el-tag type="success" closable @close="removeRight(scope.row, item2.id)">{{index2}}{{item2.authName}}</el-tag>
										<i class="el-icon-caret-right"></i>
									</el-col>
									<el-col :span="18">
										<el-tag type="warning" v-for="(item3, index3) in item2.children" :key="item3.id" closable @close="removeRight(scope.row, item3.id)">
											{{index3}}{{item3.authName}}
										</el-tag>
									</el-col>
								</el-row>
							</el-col>
						</el-row>
					</template>
				</el-table-column>
				<el-table-column type="index" label="#"></el-table-column>
				<el-table-column label="角色名称" prop="roleName"></el-table-column>
				<el-table-column label="角色描述" prop="roleDesc"></el-table-column>
				<el-table-column label="操作" width="300px">
					<template slot-scope="scope">
						<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
						<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRole(scope.row.id)">删除</el-button>
						<el-button type="warning" icon="el-icon-setting" size="mini" @click="showRightsDialog(scope.row)">分配权限</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<el-dialog title="分配权限" :visible.sync="rightsDialogVisible" width="50%" @close="rightDialogClose">
			<el-tree :data="rightsList" :props="rightsDefaultProps" show-checkbox node-key="id" default-expand-all
			:default-checked-keys="defKeys" ref="treeRef"></el-tree>
			<span slot="footer" class="dialog-footer">
				<el-button @click="rightsDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editRights">确 定</el-button>
			</span>
		</el-dialog>
		<el-dialog title="编辑角色" :visible.sync="rolesDialogVisible" width="50%" @close="editDialogClose">
			<el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
				<el-form-item label="角色名称" prop="roleName">
					<el-input v-model="editForm.roleName"></el-input>
				</el-form-item>
				<el-form-item label="描述" prop="roleDesc">
					<el-input v-model="editForm.roleDesc"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="rolesDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editRole">确 定</el-button>
			</span>
		</el-dialog>
		<el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
				<el-form-item label="角色名称" prop="roleName">
					<el-input v-model="addForm.roleName"></el-input>
				</el-form-item>
				<el-form-item label="描述" prop="roleDesc">
					<el-input v-model="addForm.roleDesc"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addRole">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				rolesList: [],
				rightsDialogVisible: false,
				rolesDialogVisible: false,
				addDialogVisible: false,
				rightsList: [],
				rightsDefaultProps: {
					children: 'children',
					label: 'authName'
				},
				defKeys: [],
				roleId: '',
				editForm: {},
				addForm: {},
				editFormRules: {
					roleName: [
						{required: true, message: '请输入角色昵称', trigger: 'blur'}
					]
				},
				addFormRules: {
					roleName: [
						{required: true, message: '请输入角色昵称', trigger: 'blur'}
					]
				}
			}
		},
		created() {
			this.getRolesList()
		},
		methods: {
			async getRolesList() {
				const {
					data: res
				} = await this.$http.get('roles')
				if (res.meta.status !== 200) {
					return this.$message({
						showClose: true,
						messsage: '获取角色列表失败！',
						type: 'error'
					})
				}
				this.rolesList = res.data
			},
			async removeRight(role, rightId) {
				const confirmResult = await this.$confirm('确认删除该权限吗？', '删除权限', {
					confirmBottonText: '确定',
					cancelBottonText: '取消',
					type: 'warning'
				}).catch(err => err)
				if (confirmResult !== 'confirm') return
				const {
					data: res
				} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
				if (res.meta.status !== 200) {
					return this.$message({
						showClose: true,
						message: '删除权限失败！',
						type: 'error'
					})
				}
				this.$message({
					showClose: true,
					message: '删除权限成功！',
					type: 'success'
				})
				role.children = res.data
			},
			async showRightsDialog(role) {
				this.roleId = role.id
				const {
					data: res
				} = await this.$http.get('rights/tree')
				if (res.meta.status !== 200) {
					return this.$message({
						showClose: true,
						message: '获取权限失败！',
						type: 'error'
					})
				}
				this.rightsList = res.data
				this.getLeafKeys(role, this.defKeys)
				this.rightsDialogVisible = true
			},
			getLeafKeys(node, arr) {
				if (!node.children) {
					return arr.push(node.id)
				}
				node.children.forEach(item => {
					this.getLeafKeys(item, arr)
				})
			},
			rightDialogClose() {
				this.defKeys = []
			},
			async editRights() {
				const keys = [
					...this.$refs.treeRef.getCheckedKeys(),
					...this.$refs.treeRef.getHalfCheckedKeys()
				]
				const idStr = keys.join(',')
				const {
					data: res
				} = await this.$http.post(`roles/${this.roleId}/rights`, {
					rids: idStr
				})
				if (res.meta.status !== 200) {
					return this.$message({
						showClose: true,
						message: '修改权限失败！',
						type: 'error'
					})
				}
				this.$message({
					showClose: true,
					message: '修改权限成功！',
					type: 'success'
				})
				this.getRolesList()
				this.rightsDialogVisible = false
			},
			async removeRole(roleId) {
				const confirmRsult = await this.$confirm('确认删除该角色吗?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).catch(err => err)
				if (confirmRsult !== 'confirm') return
				const {
					data: res
				} = await this.$http.delete('roles/'+roleId)
				if (res.meta.status !== 200) {
					return this.$message({
						showClose: true,
						message: '删除角色失败！',
						type: 'error'
					})
				}
				this.$message({
					showClose: true,
					message: '删除角色成功！',
					type: 'success'
				})
				this.getRolesList()
			},
			async showEditDialog(roleId) {
				const {data: res} = await this.$http.get('roles/'+roleId)
				if(res.meta.status !== 200) {
					return this.$message({
						showClose: true,
						message: '获取角色失败！',
						type: 'error'
					})
				}
				this.editForm = res.data
				this.rolesDialogVisible = true
			},
			editRole() {
				this.$refs.editFormRef.validate(async valid => {
					if (!valid) return
					const {data: res} = await this.$http.put('roles/'+this.editForm.roleId, {
						roleName: this.editForm.roleName,
						roleDesc: this.editForm.roleDesc
					})
					console.log(res.meta.msg)
					if (res.meta.status !== 200) {
						return this.$message({
							showClose: true,
							message: '修改角色失败！',
							type: 'error'
						})
					}
					this.$message({
						showClose: true,
						message: '修改角色成功！',
						type: 'success'
					})
					this.rolesDialogVisible = false
					this.getRolesList()
				})
			},
			editDialogClose() {
				this.$refs.editFormRef.resetFields()
			},
			addRole() {
				this.$refs.addFormRef.validate(async valid => {
					if (!valid) return
					const {data: res} = await this.$http.post('roles/', this.addForm)
					console.log(res.meta.msg)
					if(res.meta.status !== 201) {
						return this.$message({
							showClose: true,
							message: '添加角色失败！',
							type: 'error'
						})
					}
					this.$message({
						showClose: true,
						message: '添加角色成功！',
						type: 'success'
					})
					this.addDialogVisible = false
					this.getRolesList()
				})
			},
			addDialogClose() {
				this.$refs.addFormRef.resetFields()
			}
		}
	}
</script>

<style lang="less" scoped>
	.el-tag {
		margin: 7px;
	}

	.bdtop {
		border-top: 1px solid #eee;
	}

	.bdbottom {
		border-bottom: 1px solid #eee;
	}

	.vcenter {
		display: flex;
		align-items: center;
	}
</style>
