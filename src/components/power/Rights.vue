<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>权限管理</el-breadcrumb-item>
			<el-breadcrumb-item>权限列表</el-breadcrumb-item>
		</el-breadcrumb>
		<el-card>
			<el-table :data="rightList" border stripe>
				<el-table-column type="index" label="#"></el-table-column>
				<el-table-column label="权限名称" prop="authName"></el-table-column>
				<el-table-column label="路径" prop="path"></el-table-column>
				<el-table-column label="权限等级" prop="level">
					<template slot-scope="scope">
						<el-tag v-if="scope.row.level === '0'">一级权限</el-tag>
						<el-tag v-else-if="scope.row.level === '1'" type="success">二级权限</el-tag>
						<el-tag v-else type="danger">三级权限</el-tag>
					</template>
				</el-table-column>

			</el-table>
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenum"
			:page-sizes="[1, 2, 5, 10]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
			</el-pagination>
		</el-card>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				rightsList: [],
				rightList: [],
				pagenum: 2,
				pagesize: 10,
				total: 0
			}
		},
		created() {
			this.getRightsList()
		},
		methods: {
			async getRightsList() {
				const {
					data: res
				} = await this.$http.get('rights/list')
				if (res.meta.status !== 200) {
					return this.$message({
						showClose: true,
						$message: '获取权限列表失败！',
						type: 'error'
					})
				}
				this.rightsList = res.data
				this.total = res.data.length
				this.setPage(this.pagesize, this.pagenum)
			},
			handleSizeChange(newSize) {
				this.pagesize = newSize
				this.setPage(this.pagesize, this.pagenum)
			},
			handleCurrentChange(newPage) {
				this.pagenum = newPage
				this.setPage(this.pagesize, this.pagenum)
			},
			setPage(size, page) {
				this.rightList = []
				if (this.total % size === 0) {
					for (var i = (page - 1) * size; i < size * page; i++) {
						this.rightList.push(this.rightsList[i])
					}
					return
				}
				var pageCount = Math.ceil(this.total / size)
				if (pageCount === page) {
					for (var j = (page - 1) * size; j < this.total; j++) {
						this.rightList.push(this.rightsList[j])
					}
					return
				}
				for (var z = (page - 1) * size; z < size * page; z++) {
					this.rightList.push(this.rightsList[z])
				}
			}
		}
	}
</script>

<style lang="less" scoped>
</style>
