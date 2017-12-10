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
        fetchTodos:function () {
            if (this.currentUser) {
                var query = new AV.Query('AllTodos');
                query.find().then((todos) => {
                    let avAllTodos = todos[0];
                    console.log(avAllTodos)
                    let id = avAllTodos.id;
                    console.log(id)
                    this.todos = JSON.parse(avAllTodos.attributes.content);
                    this.todos.id = id; // 保存id，这里如果没有id证明还没有保存
                    console.log(todos)
                    console.log(id)
                }, function (error) {
                    console.log(error);
                })
            }
        },
        updateTodos: function () {
            let dataString = JSON.stringify(this.todos);
            let avTodos = AV.Object.createWithoutData('AllTodos', this.todos.id)

            avTodos.set('content', dataString);
            avTodos.save().then(() => {
                console.log('更新成功')
            })
        },
        saveTodos: function () {
            let dataString = JSON.stringify(this.todos);
            var AVTodos = AV.Object.extend('AllTodos');
            var avTodos = new AVTodos();

            // 设置读写权限
            var acl = new AV.ACL();
            acl.setReadAccess(AV.User.current(), true);
            acl.setWriteAccess(AV.User.current(), true);

            avTodos.set('content', dataString);
            avTodos.setACL(acl); // 访问权限控制
            avTodos.save().then(function (todo) {
                this.todos.id = todo.id;
                console.log('保存成功')
            }, function (error) {
                console.log('保存失败')
            });
        },
        saveOrUpdateTodos: function () {
            if (this.todos.id) {
                this.updateTodos()
            } else {
              this.saveTodos()
            }
        },
        addNewTodo: function () {
            var newToDo = this.newTodo.trim();
            if (newToDo) {
                this.todos.push({
                    title: newToDo,
                    createdAt: new Date().toLocaleString(),
                    done: false
                })
                this.saveOrUpdateTodos()
            }
            this.newTodo = ''
        },
        removeTodo: function (todo) {
            var index = this.todos.indexOf(todo);
            this.todos.splice(index, 1);
            this.saveOrUpdateTodos()
        },
        changeStatus:function () {
            this.saveOrUpdateTodos()
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

            AV.User.logIn(this.formData.username, this.formData.password).then((loginedUser) => {
                this.currentUser = this.getCurrentUser() //
                this.fetchTodos()

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
        // this.newTodo = localStorage.getItem('newToDo') || '';

        // 检查用户是否登录
        this.currentUser = this.getCurrentUser();
        this.fetchTodos();
    }

})