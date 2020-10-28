<template>
	<el-container class="home_container">
		<el-header>
			<div>
				<img src="../assets/logo.png" alt="logo" />
				<span>电商后台管理系统</span>
			</div>
			<el-button type="info" @click="out">退出登录</el-button>
		</el-header>
		<el-container>
			<el-aside :width="isCollapse ? '65px' : '200px'">
				<div class="toggle_button" @click="toggleCollapse">|||</div>
				<el-menu :collapse-transition="false" :collapse="isCollapse" 
				unique-opened background-color="#333744" text-color="#fff" 
				active-text-color="#409FFF" :router="true"
				:default-active="activePath">
					<el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
						<template slot="title">
							<i :class="iconObj[item.path]"></i>
							<span>{{item.authName}}</span>
						</template>
						<el-menu-item :index="'/'+child.path" 
						v-for="child in item.children" :key="child.id"
						@click="navStatus('/'+child.path)">
							<template slot="title">
								<i class="el-icon-menu"></i>
								<span>{{child.authName}}</span>
							</template>
						</el-menu-item>
					</el-submenu>
				</el-menu>
			</el-aside>
			<el-container>
				<el-main>
					<router-view></router-view>
				</el-main>
			</el-container>
		</el-container>
		<el-footer>Footer</el-footer>
	</el-container>
</template>

<script>
	export default {
		data() {
			return {
				menuList: [],
				iconObj: {
					'users': 'el-icon-user-solid',
					'rights': 'el-icon-s-cooperation',
					'goods': 'el-icon-s-order',
					'orders': 'el-icon-s-claim',
					'reports': 'el-icon-s-marketing'
				},
				isCollapse: false,
				activePath: ''
			}
		},
		created() {
			this.getMenuList()
			this.activePath = window.sessionStorage.getItem('activePath')
		},
		methods: {
			//退出登录
			out() {
				window.sessionStorage.clear()
				this.$router.push("/login")
				this.$message({
					showClose: true,
					message: '已退出登录'
				})
			},
			//获取左侧菜单
			async getMenuList() {
				const {data: res} = await this.$http.get('menus')
				if (res.meta.status !== 200) {
					return this.$message({
						showClose: true,
						message: res.meta.msg,
						type: 'error'
					})
				}
				this.menuList = res.data
				console.log(res)
			},
			toggleCollapse() {
				this.isCollapse = !this.isCollapse
			},
			navStatus(statuP) {
				window.sessionStorage.setItem('activePath', statuP)
				this.activePath = statuP
			}
		}
	}
</script>

<style lang="less" scoped>
	.home_container {
		height: 100%;
	}

	.el-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: #fff;
		font-size: 20px;
	}

	.el-header,
	.el-footer {
		background: #373d41;
	}

	.el-header>div {
		display: flex;
		align-items: center;
	}

	.el-header>div>img {
		width: 40px;
		height: 40px;
	}

	.el-header>div>span {
		margin-left: 10px;
	}

	.el-aside {
		background: #333744;
	}
	
	.toggle_button {
		color: #fff;
		background: #4A5060;
		font-size: 10px;
		line-height: 24px;
		text-align: center;
		letter-spacing: 0.2em;
		cursor: pointer;
	}
	
	.el-menu {
		border: none
	}

	.el-main {
		background: #eaedf1;
	}
</style>
