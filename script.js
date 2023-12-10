
    let posts = [];
    let users = [];

    function getUsers() {
    return fetch("https://jsonplaceholder.typicode.com/users")
    .then(response => response.json())
    .catch(error => console.error(`Ошибка при загрузке списка пользователей: ${error}`));
}

    function getPosts() {
    return fetch("https://jsonplaceholder.typicode.com/posts")
    .then(response => response.json())
    .then(data => {
    posts = data;
    savePosts();
    return posts;
})
    .catch(error => console.error(`Ошибка при загрузке списка постов: ${error}`));
}

    function savePosts() {
    localStorage.setItem("posts", JSON.stringify(posts));
}

    function createPost(postData) {
    return fetch("https://jsonplaceholder.typicode.com/posts", {
    method: 'POST',
    body: JSON.stringify(postData),
    headers: {
    'Content-type': 'application/json; charset=UTF-8',
},
})
    .then(response => response.json())
    .then(data => {
    posts.push(data);
    savePosts();
    return data;
})
    .catch(error => console.error(`Ошибка при создании поста: ${error}`));
}

    function updatePost(postId, postData) {
    return fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
    headers: {
    'Content-type': 'application/json; charset=UTF-8',
},
})
    .then(response => response.json())
    .then(updatedPost => {

    const index = posts.findIndex(post => post.id === postId);
    if (index !== -1) {
    posts[index] = updatedPost;
    //confirm(updatedPost.name)
    savePosts();
}
    return updatedPost;
})
    .catch(error => console.error(`Ошибка при редактировании поста: ${error}`));
}

    function deletePost(postId) {
    return fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`, {
    method: 'DELETE',
})
    .then(response => response.json())
    .then(() => {
    posts = posts.filter(post => post.id !== postId);
    savePosts();
})
    .catch(error => console.error(`Ошибка при удалении поста: ${error}`));
}

    function openPostForm() {
    const select = document.getElementById("userId");
    select.innerHTML = "";
    users.forEach(user => {
    const option = document.createElement("option");
    option.value = user.id;
    option.text = user.name;
    select.appendChild(option);
});

    document.getElementById("post-form").reset();
    document.getElementById("post-modal").style.display = "block";
}

    function closePostForm() {
    document.getElementById("post-modal").style.display = "none";
}

    /*function toggleTheme() {
    document.body.classList.toggle("dark-theme");
    const currentTheme = document.body.classList.contains("dark-theme") ? "dark" : "light";
    localStorage.setItem("theme", currentTheme);
}*/
    function toggleTheme() {
        const body = document.body;
        body.classList.toggle("dark-theme");

        // Применяем тему к постам
        renderPosts();

        const currentTheme = body.classList.contains("dark-theme") ? "dark" : "light";
        localStorage.setItem("theme", currentTheme);
    }

    function renderPosts() {
    const postsContainer = document.getElementById("posts-container");
    postsContainer.innerHTML = "";

    posts.forEach(post => {
    const postContainer = document.createElement("div");
    postContainer.className = "post";

    postContainer.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.body}</p>
            <p>Автор: ${getAuthorName(post.userId)}</p>
            <button onclick="editPost(${post.id})">Редактировать</button>
            <button onclick="deletePostHandler(${post.id})">Удалить</button>
        `;

    if (localStorage.getItem(`important_${post.id}`) === 'true') {
    postContainer.classList.add('important-post');
}

    postsContainer.appendChild(postContainer);
});
}

    function getAuthorName(userId) {
    const user = users.find(u => String(u.id) === String(userId));
    return user ? user.name : "Unknown User";
}

    document.getElementById("post-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const postId = document.getElementById("post-id").value;
    const postData = {
    title: document.getElementById("title").value,
    body: document.getElementById("body").value,
    userId: document.getElementById("userId").value,
};

    if (postId) {
    updatePost(postId, postData)
    .then(() => {
    renderPosts();
    closePostForm();
})
    .catch(error => console.error(`Ошибка при обработке обновления поста: ${error}`));
} else {
    createPost(postData)
    .then(() => {
    renderPosts();
    closePostForm();
})
    .catch(error => console.error(`Ошибка при обработке создания поста: ${error}`));
}
});


    function editPost(postId) {
    const select = document.getElementById("userId");
    select.innerHTML = "";

    if (users.length === 0) {
    loadUsers()
    .then(() => {
    populateUsersSelect();
    continueEdit();
})
    .catch(error => console.error(`Ошибка при загрузке пользователей: ${error}`));
} else {
    populateUsersSelect();
    continueEdit();
}

    function populateUsersSelect() {
    users.forEach(user => {
    const option = document.createElement("option");
    option.value = user.id;
    option.text = user.name;
    select.appendChild(option);
});
}

    function continueEdit() {
    const post = posts.find(p => p.id === postId);
    if (post) {
    document.getElementById("post-id").value = postId;
    document.getElementById("title").value = post.title;
    document.getElementById("body").value = post.body;
    document.getElementById("userId").value = post.userId;

    openPostForm();

    const saveBtn = document.getElementById("save-post-btn");
    saveBtn.onclick = function () {
    const formData = new FormData(document.getElementById("post-form"));

    const updatedPostData = {
    title: formData.get("title"),
    body: formData.get("body"),
    userId: formData.get("userId"),
};
    //confirm(updatedPostData.userId)


    const user = users.find(u => u.id === parseInt(updatedPostData.userId));
    if (user) {
    updatedPostData.name = user.name;

}
    //confirm(updatedPostData.name)

    updatePost(postId, updatedPostData)
    .then(() => {
    renderPosts();
    closePostForm();
})
    .catch(error => console.error(`Ошибка при обработке обновления поста: ${error}`));
};
}
}
}



    function deletePostHandler(postId) {
    if (confirm("Вы уверены, что хотите удалить пост?")) {
    deletePost(postId)
    .then(() => {
    renderPosts();
})
    .catch(error => console.error(`Ошибка при обработке удаления поста: ${error}`));
}
}

    document.addEventListener("DOMContentLoaded", function () {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
}

    getUsers()
    .then(data => {
    users = data;
    return getPosts();
})
    .then(() => {
    renderPosts();
})
    .catch(error => console.error(`Ошибка при инициализации приложения: ${error}`));
});
