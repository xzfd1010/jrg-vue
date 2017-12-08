import Vue from 'vue'
// import bar from './bar';

var app = new Vue({
    el: '#app',
    data: {
        todos: [],
        newTodo: ''
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
        }
    },
    // 持久化
    created() {
        window.onbeforeunload = () => {
            let dataString = JSON.stringify(this.todos)
            localStorage.setItem('myTodos', dataString)
            localStorage.setItem('newToDo',this.newTodo.trim())
        };

        let oldDataString = localStorage.getItem('myTodos')
        let oldData = JSON.parse(oldDataString)

        this.todos = oldData || []

        this.newTodo = localStorage.getItem('newToDo') || '';
    }

})