 import React, { useState, useEffect } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import Todo from './Todo';
import { db } from './firebase';
import {
  query,
  collection,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import Axios from 'axios';

const style = {
  bg: `h-screen w-screen p-4 bg-gradient-to-r from-[#2F80ED] to-[#1CB5E0]`,
  container: `bg-slate-100 max-w-[500px] w-full m-auto rounded-md shadow-xl p-4`,
  heading: `text-3xl font-bold text-center text-gray-800 p-2`,
  form: `flex justify-between`,
  input: `border p-2 w-full text-xl`,
  button: `border p-4 ml-2 bg-purple-500 text-slate-100`,
  count: `text-center p-2`,
};

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const [ user, setUser ] = useState([]);
  const [ profile, setProfile ] = useState([]);

  const login = useGoogleLogin({
      onSuccess: (codeResponse) => setUser(codeResponse),
      onError: (error) => console.log('Login Failed:', error)
  });

  useEffect(
      () => {
          if (user) {
              Axios
                  .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                      headers: {
                          Authorization: `Bearer ${user.access_token}`,
                          Accept: 'application/json'
                      }
                  })
                  .then((res) => {
                      setProfile(res.data);
                  })
                  .catch((err) => console.log(err));
          }
      },
      [ user ]
    );

    // log out function to log the user out of google and set the profile array to null
    const logOut = () => {
        googleLogout();
        setProfile(null);
    };

  // Create todo
  const createTodo = async (e) => {
    e.preventDefault(e);
    if (input === '') {
      alert('Por favor adicione algo para a lista');
      return;
    }
    await addDoc(collection(db, 'todos'), {
      text: input,
      completed: false,
    });
    setInput('');
  };

  // Read todo from firebase
  useEffect(() => {
    const q = query(collection(db, 'todos'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let todosArr = [];
      querySnapshot.forEach((doc) => {
        todosArr.push({ ...doc.data(), id: doc.id });
      });
      setTodos(todosArr);
    });
    return () => unsubscribe();
  }, []);

  const [filters, setFilters] = useState({
    completed: false,
    dueToday: false,
    dueThisWeek: false,
    dueThisMonth: false,
  });
  
  function applyFilters() {
    const filteredTodos = todos.filter((todo) => {
      return (
        filters.completed && todo.completed ||
        filters.dueToday && todo.dueDate.toDateString() === new Date().toDateString() ||
        filters.dueThisWeek &&
          todo.dueDate.toDateString().slice(0, 10) === new Date().toDateString().slice(0, 10) ||
        filters.dueThisMonth &&
          todo.dueDate.toDateString().slice(0, 7) === new Date().toDateString().slice(0, 7)
      );
    });
  
    setTodos(filteredTodos);
  }
  
  useEffect(() => {
    applyFilters();
  }, [filters]);
  // Update todo in firebase
  const toggleComplete = async (todo) => {
    await updateDoc(doc(db, 'todos', todo.id), {
      completed: !todo.completed,
    });
  };

  // Delete todo
  const deleteTodo = async (id) => {
    await deleteDoc(doc(db, 'todos', id));
  };

  return (
    <div className={style.bg}>
      <div class="flex justify-end m-2 items-center px-6 pb-3 border-b-2 border-gray-200">
        <select
          name="filters"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">Todos</option>
          <option value="completed">Completos</option>
          <option value="not-completed">A fazer</option>
        </select>
        {profile ? (
          <div class="flex justify-end items-center px-6 py-3 ">
            <img src={profile.picture} alt="user image" class="rounded-full w-8 h-8 mr-3" />
            <br />
            <button onClick={logOut} class="text-gray-600 hover:text-gray-800">Sair</button>
          </div>
        ) : (
          <button onClick={() => login()} class="justify-end bg-white rounded-md p-2 text-gray-800 hover:bg-gray-200 hover:text-white">
            Entrar com o google
          </button>
        )}
      </div>
      <div className={style.container}>
        <h3 className={style.heading}>Todo Processo Seletivo</h3>
        <form onSubmit={createTodo} className={style.form}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={style.input}
            type='text'
            placeholder='Adicionar a lista'
          />
          <button className={style.button}>
            <AiOutlinePlus size={30} />
          </button>
        </form>
        <ul>
          {todos.map((todo, index) => (
            <Todo
              key={index}
              todo={todo}
              toggleComplete={toggleComplete}
              deleteTodo={deleteTodo}
            />
          ))}
        </ul>
        {todos.length < 1 ? null : (
          <p className={style.count}>{`Voce tem ${todos.length} tarefa`}</p>
        )}
      </div>
    </div>
  );
}

export default App;
