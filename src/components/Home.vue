<template>
	<div>
		<el-button type="info" @click="out">退出登录</el-button>
	</div>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		methods: {
			out() {
				window.sessionStorage.clear()
				this.$router.push("/login")
				this.$message({
					showClose: true,
					message: '已退出登录'
				})
			}
		}
	}
</script>

<style lang="less" scoped>
</style>
