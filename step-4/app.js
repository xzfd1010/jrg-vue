import Vue from 'vue'
import AV from 'leancloud-storage'

var APP_ID = 'siRl1WujnvXjjlWxIAgkd9wl-gzGzoHsz';
var APP_KEY = '51dsOhp93MEucIRCGgKyY4x0';

AV.init({
    appId: APP_ID,
    appKey: APP_KEY
});


var app = new Vue({
    el: '#app',
    data: {
        todos: [],
        newTodo: '',
        actionType: 'signUp',
        formData: {
            username: '',
            password: ''
        },
        currentUser: null
    },
    methods: {
        addNewTodo: function () {
            var newToDo = this.newTodo.trim()
            if (newToDo) {
                this.todos.push({
                    title: newToDo,
                    createdAt: new Date().toLocaleString(),
                    done: false
                })
            }
            this.newTodo = ''
        },
        removeTodo: function (todo) {
            var index = this.todos.indexOf(todo);
            this.todos.splice(index, 1);
        },
        signUp: function () {
            let user = new AV.User();
            user.setUsername(this.formData.username);
            user.setPassword(this.formData.password);
            user.signUp().then((loginedUser) => {
                this.currentUser = this.getCurrentUser()
                console.log(this.currentUser)
            }, function (error) {
                alert('注册失败')
            });
        },
        login: function () {
            console.log('aaa')

            AV.User.logIn(this.formData.username, this.formData.password).then((loginedUser) => {
                this.currentUser = this.getCurrentUser() // 👈
                console.log(this.currentUser)
            }, function (error) {
                alert('登录失败')
            });
        },
        getCurrentUser: function () {
            let current = AV.User.current();
            if (current) {

                let {id, createdAt, attributes: {username}} = AV.User.current()
                return {id, username, createdAt}
            } else {
                return null
            }
        },
        // 登出功能
        logout: function () {
            AV.User.logOut()
            this.currentUser = null
            window.location.reload()
        }
    },
    // 持久化
    created() {
        window.onbeforeunload = () => {
            let dataString = JSON.stringify(this.todos)
            localStorage.setItem('myTodos', dataString)
            localStorage.setItem('newToDo', this.newTodo.trim())
        };

        let oldDataString = localStorage.getItem('myTodos')
        let oldData = JSON.parse(oldDataString)

        this.todos = oldData || []

        this.newTodo = localStorage.getItem('newToDo') || '';

        // 检查用户是否登录
        this.currentUser = this.getCurrentUser()
    }

})