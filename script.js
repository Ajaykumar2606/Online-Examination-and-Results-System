let users = []; // Stores registered users
let admin = { username: "ajay", password: "ajay@26" }; // Admin credentials
let exams = []; // Stores exams created by the admin
let currentExam = null; // Tracks the current exam being taken by the student
let currentQuestion = 0; // Tracks the current question index
let score = 0; // Tracks the student's score
let studentResults = {}; // Stores results of students

// Adding default exam and questions
exams.push({
    name: "Sample Exam",
    questions: [
        {
            question: "What is the capital of France?",
            options: ["Berlin", "Madrid", "Paris", "Lisbon"],
            correctAnswer: 2 // Index of the correct answer
        },
        {
            question: "Which planet is known as the Red Planet?",
            options: ["Earth", "Mars", "Jupiter", "Saturn"],
            correctAnswer: 1
        },
        {
            question: "What is the largest ocean on Earth?",
            options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
            correctAnswer: 3
        },
        {
            question: "Who wrote 'Romeo and Juliet'?",
            options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"],
            correctAnswer: 1
        },
        {
            question: "What is the chemical symbol for water?",
            options: ["H2O", "O2", "CO2", "NaCl"],
            correctAnswer: 0
        }
    ]
});

// Function to validate user login
function login(username, password) {
    for (let user of users) {
        if (user.username === username && user.password === password) {
            return true;
        }
    }
    return false;
}

// Function to register a new user
function register(username, email, fullname, password, confirmPassword) {
    if (password !== confirmPassword) {
        return false;
    }
    if (!email.includes('@') || !email.includes('.')) {
        return false;
    }
    if (fullname.trim() === "") {
        return false;
    }
    for (let user of users) {
        if (user.username === username) {
            return false;
        }
    }
    users.push({ username: username, email: email, fullname: fullname, password: password });
    return true;
}

// Function to handle forgot password
function forgotPassword(username) {
    for (let user of users) {
        if (user.username === username) {
            return true;
        }
    }
    return false;
}

// Function to validate admin login
function adminLogin(username, password) {
    if (admin.username === username && admin.password === password) {
        return true;
    }
    return false;
}

// Function to display questions for the student
function showQuestion() {
    if (currentQuestion >= currentExam.questions.length) {
        let username = $("#logout-btn").attr("data-username");
        studentResults[username] = score; // Store the student's score
        $("#exam-page").hide();
        $("#results-page").show();
        $("#results").text("Your score is " + score + " out of " + currentExam.questions.length);
        return;
    }
    let question = currentExam.questions[currentQuestion];
    let html = "<p>" + question.question + "</p>";
    for (let i = 0; i < question.options.length; i++) {
        html += "<input type='radio' name='answer' value='" + i + "'>" + question.options[i] + "<br>";
    }
    $("#question-container").html(html);
}

// Event listener for student login
$("#login-form").submit(function(event) {
    event.preventDefault();
    let username = $("#username").val();
    let password = $("#password").val();
    if (login(username, password)) {
        $("#login-page").hide();
        $("#exam-page").show();
        currentExam = exams[0]; // For simplicity, assume students take the first exam
        currentQuestion = 0; // Reset question index
        score = 0; // Reset score
        showQuestion();
        $("#logout-btn").attr("data-username", username);
    } else {
        $("#results-page").show();
        $("#results").text("Invalid username or password");
    }
});

// Event listener for submitting exam answers
$("#exam-form").submit(function(event) {
    event.preventDefault();
    let answer = parseInt($("input[name='answer']:checked").val());
    let question = currentExam.questions[currentQuestion];
    if (answer === question.correctAnswer) {
        score++;
    }
    currentQuestion++;
    showQuestion();
});

// Event listener for user registration
$("#register-form").submit(function(event) {
    event.preventDefault();
    let username = $("#reg-username").val();
    let email = $("#reg-email").val();
    let fullname = $("#reg-fullname").val();
    let password = $("#reg-password").val();
    let confirmPassword = $("#reg-confirm-password").val();
    if (register(username, email, fullname, password, confirmPassword)) {
        $("#registerModal").modal("hide");
    } else {
        $("#results-page").show();
        $("#results").text("Registration failed");
    }
});

// Event listener for forgot password
$("#forgot-password-form").submit(function(event) {
    event.preventDefault();
    let username = $("#fp-username").val();
    if (forgotPassword(username)) {
        $("#forgotPasswordModal").modal("hide");
    } else {
        $("#results-page").show();
        $("#results").text("Username not found");
    }
});

// Event listener for admin login
$("#admin-login-form").submit(function(event) {
    event.preventDefault();
    let username = $("#admin-username").val();
    let password = $("#admin-password").val();
    if (adminLogin(username, password)) {
        $("#adminLoginModal").modal("hide");
        $("#login-page").hide();
        $("#admin-dashboard").show();
        loadExams(); // Load exams when admin logs in
    } else {
        $("#results-page").show();
        $("#results").text("Invalid admin credentials");
    }
});

// Function to load exams in the admin dashboard
function loadExams() {
    let html = "<h3>Exams</h3>";
    if (exams.length === 0) {
        html += "<p>No exams available.</p>";
    } else {
        html += "<ul class='list-group'>";
        for (let i = 0; i < exams.length; i++) {
            html += `<li class='list-group-item'>
                        <strong>${exams[i].name}</strong>
                        <button class='btn btn-danger btn-sm float-right delete-exam-btn' data-index='${i}'>Delete</button>
                        <button class='btn btn-info btn-sm float-right view-exam-btn' data-index='${i}'>View</button>
                    </li>`;
        }
        html += "</ul>";
    }
    $("#admin-content").html(html);

    // Add event listeners for delete and view buttons
    $(".delete-exam-btn").click(function() {
        let index = $(this).data("index");
        exams.splice(index, 1); // Delete the exam
        loadExams(); // Reload the exams list
    });

    $(".view-exam-btn").click(function() {
        let index = $(this).data("index");
        let exam = exams[index];
        let html = `<h3>${exam.name}</h3>`;
        html += "<ul class='list-group'>";
        for (let question of exam.questions) {
            html += `<li class='list-group-item'>
                        <strong>${question.question}</strong><br>
                        Options: ${question.options.join(", ")}<br>
                        Correct Answer: ${question.options[question.correctAnswer]}
                    </li>`;
        }
        html += "</ul>";
        $("#admin-content").html(html);
    });
}

// Event listener for adding exams (admin)
$("#add-exam-btn").click(function() {
    let html = "<form id='add-exam-form'><div class='form-group'><label for='exam-name'>Exam Name:</label><input type='text' class='form-control' id='exam-name' required></div>";
    html += "<div id='questions-container'></div>";
    html += "<button type='button' class='btn btn-primary' id='add-question-btn'>Add Question</button>";
    html += "<button type='submit' class='btn btn-primary'>Add Exam</button></form>";
    $("#admin-content").html(html);

    let questionIndex = 0;
    let questions = [];

    // Event listener for adding questions to the exam
    $("#add-question-btn").click(function() {
        let questionHtml = "<div class='form-group'><label for='question-" + questionIndex + "'>Question:</label><input type='text' class='form-control' id='question-" + questionIndex + "' required></div>";
        questionHtml += "<div class='form-group'><label for='option1-" + questionIndex + "'>Option 1:</label><input type='text' class='form-control' id='option1-" + questionIndex + "' required></div>";
        questionHtml += "<div class='form-group'><label for='option2-" + questionIndex + "'>Option 2:</label><input type='text' class='form-control' id='option2-" + questionIndex + "' required></div>";
        questionHtml += "<div class='form-group'><label for='option3-" + questionIndex + "'>Option 3:</label><input type='text' class='form-control' id='option3-" + questionIndex + "' required></div>";
        questionHtml += "<div class='form-group'><label for='option4-" + questionIndex + "'>Option 4:</label><input type='text' class='form-control' id='option4-" + questionIndex + "' required></div>";
        questionHtml += "<div class='form-group'><label for='correctAnswer-" + questionIndex + "'>Correct Answer:</label><select class='form-control' id='correctAnswer-" + questionIndex + "'>";
        questionHtml += "<option value='0'>Option 1</option>";
        questionHtml += "<option value='1'>Option 2</option>";
        questionHtml += "<option value='2'>Option 3</option>";
        questionHtml += "<option value='3'>Option 4</option>";
        questionHtml += "</select></div>";
        $("#questions-container").append(questionHtml);
        questionIndex++;
    });

    // Event listener for submitting the exam
    $("#add-exam-form").submit(function(event) {
        event.preventDefault();
        let examName = $("#exam-name").val();
        questions = [];
        for (let i = 0; i < questionIndex; i++) {
            let question = $("#question-" + i).val();
            let options = [
                $("#option1-" + i).val(),
                $("#option2-" + i).val(),
                $("#option3-" + i).val(),
                $("#option4-" + i).val()
            ];
            let correctAnswer = parseInt($("#correctAnswer-" + i).val());
            questions.push({ question: question, options: options, correctAnswer: correctAnswer });
        }
        exams.push({ name: examName, questions: questions });
        $("#admin-content").html("Exam added successfully");
        loadExams(); // Reload the exams list
    });
});

// Event listener for viewing users (admin)
$("#view-users-btn").click(function() {
    let html = "";
    for (let user of users) {
        html += "<p>Username: " + user.username + ", Email: " + user.email + ", Full Name: " + user.fullname + "</p>";
    }
    $("#admin-content").html(html);
});

// Event listener for viewing student results (admin)
$("#view-student-results-btn").click(function() {
    let html = "";
    for (let username in studentResults) {
        html += "<p>Username: " + username + ", Score: " + studentResults[username] + "</p>";
    }
    $("#admin-content").html(html);
});

// Event listener for logout (student)
$("#logout-btn").click(function() {
    $("#exam-page").hide();
    $("#login-page").show();
    currentQuestion = 0;
    score = 0;
});

// Event listener for logout (results page)
$("#logout-results-btn").click(function() {
    $("#results-page").hide();
    $("#login-page").show();
    currentQuestion = 0;
    score = 0;
});

// Event listener for admin logout
$("#admin-logout-btn").click(function() {
    $("#admin-dashboard").hide();
    $("#login-page").show();
});
