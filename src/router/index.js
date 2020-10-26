import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const routes = [{
		path: '/',
		redirect: '/login'
	},
	{
		path: '/home',
		component: Home
	},
	{
		path: '/login',
		component: Login
	}
]

const router = new VueRouter({
	routes
})

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
	//to 表示即将跳转的路径
	//from 表示从那个路径跳转过来
	//next 表示一个函数，放行
	//next() 放行 next('/login') 强制跳转
	if (to.path === '/login') return next();
	//从sessionStorage 获取token
	const loginToken = window.sessionStorage.getItem('token')
	if (!loginToken) return next('/login')
	next()
})

export default router
