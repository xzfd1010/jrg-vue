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
        todos: [], // todo列表
        newTodo: '', // 输入的内容
        actionType: 'signUp', // 注册or登录
        // 供注册和登录框使用的form数据列表
        formData: {
            username: '',
            password: ''
        },
        currentUser: null
    },
    computed: {
        disabled: function () {
            return this.formData.username === '' || this.formData.password === ''
        }
    },
    // 持久化
    created() {
        // 检查用户是否登录
        this.currentUser = this.getCurrentUser();
        this.fetchTodos();
    },
    methods: {
        // 添加新的todo
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
        // 删除todo
        removeTodo: function (todo) {
            var index = this.todos.indexOf(todo);
            this.todos.splice(index, 1);
            this.saveOrUpdateTodos()
        },
        // 改变todo的完成状态
        changeStatus: function () {
            this.saveOrUpdateTodos()
        },
        // 更新todo列表或者创建todo列表
        saveOrUpdateTodos: function () {
            if (this.todos.id) {
                this.updateTodos()
            } else {
                this.saveTodos()
            }
        },
        // 更新todos
        updateTodos: function () {
            let dataString = JSON.stringify(this.todos);
            // 根据id更新云端的avTodos
            let avTodos = AV.Object.createWithoutData('AllTodos', this.todos.id)
            avTodos.set('content', dataString);
            avTodos.save().then(() => {
                console.log('更新成功')
            })
        },
        // 创建某用户的todos
        saveTodos: function () {
            let dataString = JSON.stringify(this.todos);
            // 构建表名 AllTodos，声明类型
            var AVTodos = AV.Object.extend('AllTodos');
            // 新建对象
            var avTodos = new AVTodos();

            // 设置读写权限
            var acl = new AV.ACL();
            acl.setReadAccess(AV.User.current(), true);
            acl.setWriteAccess(AV.User.current(), true);

            // 设置内容
            avTodos.set('content', dataString);
            avTodos.setACL(acl); // 访问权限控制
            // 保存
            avTodos.save().then(function (todo) {
                // 本地保存当前todo的id
                this.todos.id = todo.id;
                console.log('保存成功')
            }, function (error) {
                console.log('保存失败')
            });
        },

        // 注册
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
        // 登录
        login: function () {

            AV.User.logIn(this.formData.username, this.formData.password)
                .then((loginedUser) => {
                    this.currentUser = this.getCurrentUser(); //
                    this.fetchTodos()

                }, function (error) {
                    alert('登录失败')
                });
        },
        // 登出功能
        logout: function () {
            AV.User.logOut();
            this.currentUser = null;
            window.location.reload()
        },
        // 返回所需的currentUser对象
        getCurrentUser: function () {
            let current = AV.User.current();
            if (current) {
                let {id, createdAt, attributes: {username}} = AV.User.current()
                return {id, username, createdAt}
            } else {
                return null
            }
        },
        // 用于在登录/进入页面时获取todos
        fetchTodos: function () {
            if (this.currentUser) {
                // 获取当前用户的AllTodos
                var query = new AV.Query('AllTodos');
                query.find().then((todos) => {
                    let avAllTodos = todos[0]; // 获取保存当前用户所有todo的列表
                    let id = avAllTodos.id;
                    this.todos = JSON.parse(avAllTodos.attributes.content);
                    this.todos.id = id; // 保存id，这里如果没有id证明还没有创建过todo
                }, function (error) {
                    console.log(error);
                })
            }
        }

    }
})