// Toggle between login and signup forms
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

showSignup.addEventListener('click', function() {
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
});

showLogin.addEventListener('click', function() {
    signupForm.classList.remove('active');
    loginForm.classList.add('active');
});

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getDatabase,
  set,
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATqYMD1vN0AuexjDlVWZCWBXtKCTaedKk",
  authDomain: "gen-ai-project-199c2.firebaseapp.com",
  projectId: "gen-ai-project-199c2",
  storageBucket: "gen-ai-project-199c2.appspot.com",
  messagingSenderId: "801166494619",
  appId: "1:801166494619:web:212e80340c8c5eea022f3e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();
const auth = getAuth(app);
const dbref = ref(db);

let EmailLogin = document.getElementById("loginInputEmail");
let PasswordLogin = document.getElementById("loginInputPassword");
let LoginForm = document.getElementById("LoginForm");

let EmailInp = document.getElementById("emailInp");
let PasswordInp = document.getElementById("passwordInp");
let FnameInp = document.getElementById("fnameInp");
let LnameInp = document.getElementById("lnameInp");
let MainForm = document.getElementById("MainForm");

let SignInUser = (evt) => {
  evt.preventDefault();

  signInWithEmailAndPassword(auth, EmailLogin.value, PasswordLogin.value)
    .then((credentials) => {
      console.log(credentials.user);
      get(child(dbref, "UsersAuthList/" + credentials.user.uid)).then(
        (snapshot) => {
          if (
            snapshot.exists() &&
            snapshot.val().firstname &&
            snapshot.val().lastname
          ) {
              console.log(snapshot.val());
            // User is already registered, set session storage and redirect
            sessionStorage.setItem(
              "user-info",
              JSON.stringify({
                firstname: snapshot.val().firstname,
                lastname: snapshot.val().lastname,
              })
            );
            sessionStorage.setItem(
              "user-creds",
              JSON.stringify(credentials.user)
            );
            window.location.href = "chat.html";
          } else {
            // User is not registered, handle the case accordingly (e.g., prompt for registration)
            console.log("User is not registered in the database");
          }
        }
      );
    })
    .catch((error) => {
      console.log(error.code);
      console.log(error.message);
    });
};

let RegisterUser = (evt) => {
  evt.preventDefault();

  createUserWithEmailAndPassword(auth, EmailInp.value, PasswordInp.value)
    .then((credentials) => {
      set(ref(db, "UsersAuthList/" + credentials.user.uid), {
        firstname: FnameInp.value,
        lastname: LnameInp.value,
      });
      MainForm.reset();
      window.alert("User created successfully! Please login to continue.");


    })
    .catch((error) => {
      console.log(error.code);
      console.log(error.message);
    });
};

MainForm.addEventListener("submit", RegisterUser);
LoginForm.addEventListener("submit", SignInUser);