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
					<el-button type="primary">添加角色</el-button>
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
						<el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
						<el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
						<el-button type="warning" icon="el-icon-setting" size="mini" @click="showRightsDialog(scope.row)">分配权限</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<el-dialog title="分配权限" :visible.sync="rightsDialogVisible" width="50%" @close="rightDialogClose">
			<el-tree :data="rightsList" :props="rightsDefaultProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
			<span slot="footer" class="dialog-footer">
				<el-button @click="rightsDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editRights">确 定</el-button>
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
				rightsList: [],
				rightsDefaultProps: {
					children: 'children',
					label: 'authName'
				},
				defKeys: [],
				roleId: ''
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
						messsage: res.meta.msg,
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
						message: res.meta.msg,
						type: 'error'
					})
				}
				this.$message({
					showClose: true,
					message: res.meta.msg,
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
						message: res.meta.msg,
						type: 'error'
					})
				}
				this.rightsList = res.data
				this.getLeafKeys(role, this.defKeys)
				this.rightsDialogVisible = true
			},
			getLeafKeys(node, arr) {
				if(!node.children) {
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
				const  idStr = keys.join(',')
				const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})
				if(res.meta.status !== 200) {
					this.$message({
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
				this.getRolesList()
				this.rightsDialogVisible = false
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
