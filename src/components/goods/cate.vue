<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品列表</el-breadcrumb-item>
		</el-breadcrumb>
		<el-card>
			<el-row>
				<el-col>
					<el-button type="primary" @click="showAddCatDialog">添加分类</el-button>
				</el-col>
			</el-row>
			<tree-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#"
			border :show-row-hover="false" style="margin-top: 15px;">
				<template slot="isok" slot-scope="scope">
					<i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
					<i class="el-icon-error" v-else style="color: red;"></i>
				</template>
				<template slot="order" slot-scope="scope">
					<el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
					<el-tag size="mini" v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
					<el-tag size="mini" v-else type="warning">三级</el-tag>
				</template>
				<template slot="opt" slot-scope="scope">
					<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
					<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCate(scope.row.cat_id)">删除</el-button>
				</template>
			</tree-table>
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
			:page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
			</el-pagination>
		</el-card>
		<el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
				<el-form-item label="分类名称:" prop="cat_name">
					<el-input v-model="addForm.cat_name"></el-input>
				</el-form-item>
				<el-form-item label="父级分类:">
					<el-cascader clearable change-on-select v-model="selectKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChange"></el-cascader>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addCate">确 定</el-button>
			</span>
		</el-dialog>
		<el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
			<el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
				<el-form-item label="分类名称:" prop="cat_name">
					<el-input v-model="editForm.cat_name"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editCate">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				cateList: [],
				queryInfo: {
					type: 3,
					pagenum: 1,
					pagesize: 2
				},
				total: 0,
				columns: [{
						label: '分类名称',
						prop: 'cat_name'
					},
					{
						label: '是否有效',
						type: 'template',
						template: 'isok'
					},
					{
						label: '排序',
						type: 'template',
						template: 'order'
					},
					{
						label: '操作',
						type: 'template',
						template: 'opt'
					}
				],
				addDialogVisible: false,
				editDialogVisible: false,
				editForm: {},
				addForm: {
					cat_name: '',
					cat_pid: 0,
					cat_level: 0
				},
				addFormRules: {
					cat_name: [{
						required: true,
						message: '请输入分类名称',
						trigger: 'blur'
					}]
				},
				editFormRules: {
					cat_name: [{
						required: true,
						message: '请输入分类名称',
						trigger: 'blur'
					}]
				},
				selectKeys: [],
				parentCateList: [],
				cascaderProps: {
					expandTrigger: 'hover',
					value: 'cat_id',
					label: 'cat_name',
					children: 'children'
				}
			}
		},
		created() {
			this.getCateList()
		},
		methods: {
			async getCateList() {
				const {
					data: res
				} = await this.$http.get('categories', {
					params: this.queryInfo
				})
				if (res.meta.status !== 200) {
					return this.$message({
						showClose: true,
						message: '获取商品分类失败！',
						type: 'error'
					})
				}
				this.cateList = res.data.result
				this.total = res.data.total
			},
			handleSizeChange(newSize) {
				this.queryInfo.pagesize = newSize
				this.getCateList()
			},
			handleCurrentChange(newPage) {
				this.queryInfo.pagenum = newPage
				this.getCateList()
			},
			addDialogClose() {
				this.$refs.addFormRef.resetFields()
				this.selectKeys = []
				this.addForm.cat_pid = 0
				this.addForm.cat_level = 0
			},
			showAddCatDialog() {
				this.getParentCateList()
				this.addDialogVisible = true
			},
			async getParentCateList() {
				const {
					data: res
				} = await this.$http.get('categories', {
					params: {
						type: 2
					}
				})
				if (res.meta.status !== 200) {
					return this.$message({
						showClose: true,
						message: '获取分类列表失败！',
						type: 'error'
					})
				}
				this.parentCateList = res.data
				console.log(this.parentCateList)
			},
			parentCateChange() {
				console.log(this.selectKeys)
				if(this.selectKeys.length > 0) {
					this.addForm.cat_pid = this.selectKeys[this.selectKeys.length - 1]
					this.addForm.cat_level = this.selectKeys.length
					return
				} else {
					this.addForm.cat_pid = 0
					this.addForm.cat_level = 0
				}
			},
			addCate() {
				console.log(this.addForm)
				this.$refs.addFormRef.validate(async vaild => {
					if(!vaild) return
					const {data: res} = await this.$http.post('categories', this.addForm)
					if(res.meta.status !== 201) {
						return this.$message({
							showClose: true,
							message: '添加分类失败！',
							type: 'error'
						})
					}
					this.$message({
						showClose: true,
						message: '添加分类成功！',
						type: 'success'
					})
					this.getCateList()
					this.addDialogVisible = false
				})
			},
			async removeCate(id) {
				console.log(id)
				const confirmRsult = await this.$confirm('确认删除该分类吗？', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).catch(err => err)
				if (confirmRsult !== 'confirm') return
				const {data: res} = await this.$http.delete('categories/' + id)
				if (res.meta.status !== 200) {
					return this.$message({
						showClose: true,
						message: '删除分类失败！',
						type: 'error'
					})
				}
				this.$message({
					showClose: true,
					message: '删除分类成功！',
					type: 'success'
				})
				this.getCateList()
			},
			async showEditDialog(id) {
				const {data: res} = await this.$http.get('categories/' + id)
				if (res.meta.status !== 200) {
					return this.$message({
						showClose: true,
						message: '获取分类失败！',
						type: 'error'
					})
				}
				this.editForm = res.data
				this.editDialogVisible = true
			},
			editDialogClose() {
				this.$refs.editFormRef.resetFields()
			},
			editCate() {
				this.$refs.editFormRef.validate(async valid => {
					if (!valid) return
					const {data: res} = await this.$http.put('categories/' + this.editForm.cat_id, {
						cat_name: this.editForm.cat_name
					})
					if (res.meta.status !== 200) {
						return this.$message({
							showClose: true,
							message: '修改分类失败！',
							type: 'error'
						})
					}
					this.$message({
						showClose: true,
						message: '修改分类成功！',
						type: 'success'
					})
					this.editDialogVisible = false
					this.getCateList()
				})
			}
		}
	}
</script>

<style lang="less" scoped>
</style>
