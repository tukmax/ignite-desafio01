const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userExist = users.some(user=> user.username === username)
  if(!userExist){
    return response.status(404).json({error: 'User not found'})
  }
  request.username = username
  return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const userExist = users.some(user=>user.username === username)

  if(userExist){
    return response.status(400).json({error: 'User Already exists'})
  }
  const newUser = { 
    id: uuidv4(),
    name, 
    username, 
    todos: []
  }
  users.push(newUser);
  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request
  const user = users.find(useToFilter=> useToFilter.username === username)
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request
  const {title,deadline} = request.body
  const user = users.find(useToFilter=> useToFilter.username === username)
  const newTodo = {
    id: uuidv4(),
	title,
	done: false, 
	deadline: new Date(deadline), 
	created_at: new Date()
  }
  user.todos.push(newTodo)
  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request
  const {title,deadline} = request.body
  const {id} = request.params
  const user = users.find(useToFilter=> useToFilter.username === username)
  const todo = user.todos.find(userTodo=> userTodo.id === id)
  if(!todo){
    return response.status(404).json({error: 'todo not found'})
  }
  todo.title = title
  todo.deadline = deadline
  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {username} = request
  const {id} = request.params
  const user = users.find(useToFilter=> useToFilter.username === username)
  const todo = user.todos.find(userTodo=> userTodo.id === id)
  if(!todo){
    return response.status(404).json({error: 'todo not found'})
  }
  todo.done = true
  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request
  const {id} = request.params
  const user = users.find(useToFilter=> useToFilter.username === username)
  const todo = user.todos.find(userTodo=> userTodo.id === id)
  if(!todo){
    return response.status(404).json({error: 'todo not found'})
  }
  user.todos.splice(todo, 1)
  return response.status(204).json(user.todos)
});

module.exports = app;