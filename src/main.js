const refreshQuoteBtn = document.getElementById('quote__btn');
const timsIntroBtns = {};
let clicksCloseEvent = 0;
let clickSubmitEvent = 0;
const todos = JSON.parse(localStorage.getItem('todos')) || [];
let todoId = JSON.parse(localStorage.getItem('todo-id')) || 0;

const introPrompts = {
  addTodoPrompt: {
    btnLm: document.getElementById('todo-app-intro__add-btn'),
    promptLm: document.getElementById('todo-app-prompt'),
    closeBtn: document.getElementById('todo-app-prompt__cancel-btn'),
    activeClass: 'todo-app-prompt--active',
    timeout: {
      lastPromptTim: 'promptToSearchTim',
      currentTim: 'addTodoTim',
      time: 1500
    }
  }, 
  searchTodoPrompt: {
    btnLm: document.getElementById('todo-app-intro__search-btn'),
    promptLm: document.getElementById('search-todo-prompt'),
    activeClass: 'search-todo-prompt--active',
    timeout: {
      lastPromptTim: 'searchToPromptTim',
      currentTim: 'searchTim',
      time: 1250
    }
  }
};

// Todo next week


/* Completed interlinked prompt animations.
  //Refactor the showPrompt and hidePrompt into togglePrompt to achieve reusability with all the todo-intro__buttons prompts.
  //Connect showAddPrompt and showSearchPrompt animations so only one prompt can be shown at once. 
*/

  // Form validation; There must be at least a title to send the form.
  // If information is added to the add todo prompt and is closed, a confirmation modal will appear to make sure if the user wants to discard the changes. This also has to work interchangeably with the search prompt, as the animations will be interlinked.
  
  // Add a form submit to get the todo data and send it to and array of objects. The maximum incompleted tasks are 100.
  /*
  {
    id: 'task-[1-100]',
    title: '',
    date: ''/null,
    description: ''/null,
    completed: true/false
  }
  */

  // Render all tasks HTML

  // Implement remove task and render HTML seamlessly


// Todo next week

async function getQuoteData() {
  const response = await fetch('/.netlify/functions/fetch-data');
  if (response.status !== 200) {
    throw new Error("Could't fetch the data");
  }
  return await response.json();
}

function checkActiveBtn(btnLm) {
  if (btnLm.getAttribute('aria-expanded') === 'false') {
    btnLm.classList.add('btn--active');
  } 
  else {  
    btnLm.classList.remove('btn--active');
  }
};

function showPrompt(promptLm, btnLm, classToAdd) {
  promptLm.removeAttribute('hidden');
  btnLm.setAttribute('aria-expanded', true);
  setTimeout(() => {
    promptLm.classList.add(classToAdd);
  });
}

function hidePrompt(promptLm, btnLm, classToRemove, timeoutId, time) {
  btnLm.setAttribute('aria-expanded', false);
  promptLm.classList.remove(classToRemove);

  timsIntroBtns[timeoutId] = setTimeout(() => {
    promptLm.setAttribute('hidden', '');
  }, time);
}


function checkLastBtnTim(e, key, classToMatch, timToMatch) {
  if (e.currentTarget.matches('.' + classToMatch) && key === timToMatch) {
    return 1;
  } 
  else {
    return 0;
  }
}

function clearAllIntroBtnsTims(lastActiveTim, e) {
  for (const key in timsIntroBtns) {
    if (key !== lastActiveTim) {
      if (
        checkLastBtnTim(e, key, 'todo-app-intro__search-btn', 'addTodoTim') || 
        checkLastBtnTim(e, key, 'todo-app-intro__add-btn', 'searchTim') || 
        checkLastBtnTim(e, key, 'todo-app-intro__search-btn', 'submitPromptTim')
        ) {
        // if e.target is searchBtn and tim === 'addTodoTim' skip clear
        // if e.target is addBtn and tim === 'searchTim' skip clear
        // if e.target is searchBtn and tim === submitPromptTim skip clear
        continue;
      }
      clearTimeout(timsIntroBtns[key]);
    } 
  }
}

function removeLastActivePrompt({promptLm, timeout: {lastPromptTim, time}, btnLm, activeClass}) {
  if (btnLm.matches('.btn--active')) {
    checkActiveBtn(btnLm);
    hidePrompt(promptLm, btnLm, activeClass, lastPromptTim, time);
  }
}

function togglePrompt({btnLm, promptLm, activeClass, timeout: {currentTim, time}}, {timeout: {lastPromptTim}}, e) {
  if (promptLm.matches('.' + activeClass)) {
    hidePrompt(promptLm, btnLm, activeClass, currentTim, time);
  } 
  else {
    clearAllIntroBtnsTims(lastPromptTim, e)
    showPrompt(promptLm, btnLm, activeClass);
  }
} 

function addEventToCloseBtn({closeBtn, btnLm, promptLm, activeClass, timeout: {time}}) {
  if (clicksCloseEvent === 1) {
    closeBtn.addEventListener('click', () => {
      clicksCloseEvent = 0;
      checkActiveBtn(btnLm);
      
      hidePrompt(promptLm, btnLm, activeClass, 'closeAddTodoPromptTim', time);
    }, {once: true});
  }
}

function getFormData(form) {
  const data = new FormData(form);
  const todoData = (Object.fromEntries(data.entries()));
  todoData.id = `task-${todoId}`;
  todoData.completed = false;
  return todoData;
}

// Implement a confirmational modal that checks if the user has closed the submit prompt with typed data inside.

function addEventToPromptForm({promptLm, btnLm, activeClass, timeout: {time}}) {
  if (clickSubmitEvent === 1) {
    const addTodoPromptFormLm = document.getElementById('todo-app-prompt__form');
    addTodoPromptFormLm.addEventListener('submit', (e) => {
      if (addTodoPromptFormLm.checkValidity()) {
        e.preventDefault();
      }
      clickSubmitEvent = 0;
      todoId++;
      localStorage.setItem('todo-id', todoId);

      const todoData = getFormData(addTodoPromptFormLm);
      todos.push(todoData);
      console.log(todos);
      localStorage.setItem('todos', JSON.stringify(todos));

      checkActiveBtn(btnLm);
      hidePrompt(promptLm, btnLm, activeClass, 'submitPromptTim', time);
      addTodoPromptFormLm.reset();
    }, {once: true});
  }
}

function showAddTodoPrompt(e) {
  const { addTodoPrompt, searchTodoPrompt } = introPrompts;
  const addTodoBtnLm = addTodoPrompt.btnLm;
  clicksCloseEvent++;
  clickSubmitEvent++;
  checkActiveBtn(addTodoBtnLm);
  removeLastActivePrompt(searchTodoPrompt);
  addEventToCloseBtn(addTodoPrompt);
  addEventToPromptForm(addTodoPrompt);
  togglePrompt(addTodoPrompt, searchTodoPrompt, e);
}

function showSearchTodoPrompt(e) {
  const { addTodoPrompt, searchTodoPrompt } = introPrompts;
  const searchBtnLm = searchTodoPrompt.btnLm;
  checkActiveBtn(searchBtnLm);
  removeLastActivePrompt(addTodoPrompt);
  togglePrompt(searchTodoPrompt, addTodoPrompt, e);
}

introPrompts.addTodoPrompt.btnLm.addEventListener('click', showAddTodoPrompt);

introPrompts.searchTodoPrompt.btnLm.addEventListener('click', showSearchTodoPrompt);

refreshQuoteBtn.addEventListener('click', () => {
  getQuoteData()
    .then(data => console.log(data))
    .catch(err => console.err(err));
}); 

