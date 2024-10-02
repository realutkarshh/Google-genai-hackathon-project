const typingForm = document.querySelector(".typing-form"); //Getting the Typing form
const chatList= document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion-list .suggestion");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChatButton = document.querySelector("#delete-chat-button");

let UserCreds = JSON.parse(sessionStorage.getItem("user-creds"));
let UserInfo = JSON.parse(sessionStorage.getItem("user-info"));
let greetingTitle = document.getElementById("greetingTitle");
let signOutButton = document.getElementById("signOutButton");

//Logic for the signout button
let Signout = () => {
    sessionStorage.removeItem("user-creds");
    sessionStorage.removeItem("user-info");
    window.location.href = 'index.html'
}

//logic to check whether the credentials of the user exists on the database or not
let CheckCred = () => {
    if(!sessionStorage.getItem("user-creds"))
        window.location.href = 'index.html'
    else{

        greetingTitle.innerText = `Hello, `+ UserInfo.firstname;
    }
}

//Event listener to load the credentials and signout button
window.addEventListener("load",CheckCred);
signOutButton.addEventListener('click',Signout);

let userMessage = null;
let isResponseGenerating = false;
const API_KEY = "AIzaSyBofXZKdSnwEjSqK5gmKNYC9-aWxSF5v8Y";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

//Load the user data from the local storage
const loadLocalStorageData = () => {
    const savedChats = localStorage.getItem("savedChats");
    const isLightMode = (localStorage.getItem("themeColor") === "light_mode");
    document.body.classList.toggle("light_mode",isLightMode);
    toggleThemeButton.innerText =  isLightMode ? "dark_mode" : "light_mode";

    chatList.innerHTML = savedChats || "";

    document.body.classList.toggle("hide-header", savedChats);
    chatList.scrollTo(0, chatList.scrollHeight);

}
loadLocalStorageData();

//Function to create the message DIV whenever the user sends a message
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

//Show typing effect whenever the response is about  to be generated
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
    const words = text.split(' ');
    let currentWordIndex = 0;
    const typingInterval = setInterval(() => {
        textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
        incomingMessageDiv.querySelector(".icon").classList.add("hide");

        if(currentWordIndex === words.length){
            clearInterval(typingInterval);
            isResponseGenerating = false;
            incomingMessageDiv.querySelector(".icon").classList.remove("hide");
            localStorage.setItem("savedChats",chatList.innerHTML);
        }
        chatList.scrollTo(0, chatList.scrollHeight);
    },25);
}

//Function to generate the Gemini API response and  display it in the chat list
const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text");
    try{
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                contents:[{
                    role:"user",
                    parts: [{text: "Respond thoughtfully and empathetically to the following mental health-related question in about 200 words:" + userMessage}]
                }]
            })
        });


        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message);
        
        const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');;
        showTypingEffect(apiResponse, textElement, incomingMessageDiv);
    } catch (error){
        isResponseGenerating = false;
        textElement.innerText = error.message;
        textElement.classList.add("error");
        console.log(error);
    } finally {
        incomingMessageDiv.classList.remove("loading");
    }
}

//Function to show the loading animation
const showLoadingAnimation = () => {
    const html = `<div class="message incoming">
        <div class="message-content">
            <img src="gemini-icon.png" alt="Gemini Image" class="avatar">
            <p class="text"></p>
            <div class="loading-indicator">
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
            </div>
        </div>
        <span onclick="copyMessage(this)" class="icon material-symbols-outlined"> content_copy </span> `;
    const incomingMessageDiv = createMessageElement(html, "incoming","loading");
    chatList.appendChild(incomingMessageDiv);
    chatList.scrollTo(0, chatList.scrollHeight);
    generateAPIResponse(incomingMessageDiv);
}

//Function for the copy button in the responses generated by
const copyMessage = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;
    navigator.clipboard.writeText(messageText);
    copyIcon.innerText = "done";
    setTimeout(() => copyIcon.innerText = "content_copy",1000)
}

const handleOutGoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
    if(!userMessage || isResponseGenerating) return;

    isResponseGenerating = true;
    
    const html = `<div class="message outgoing">
        <div class="message-content">
          <img src="9187604.png" alt="User Image" class="avatar" />
          <p class="text"></p>
        </div>
      </div>`;
    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;
    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset();
    chatList.scrollTo(0, chatList.scrollHeight);
    document.body.classList.add("hide-header");
    setTimeout(showLoadingAnimation, 500);
}

suggestions.forEach(suggestion => {
    suggestion.addEventListener("click", () => {
        userMessage = suggestion.querySelector(".text").innerText;
        handleOutGoingChat();
    })
})

toggleThemeButton.addEventListener("click"  , () => {
   const isLightMode =  document.body.classList.toggle("light_mode");
   localStorage.setItem("themeColor",isLightMode ? "light_mode" : "dark_mode");
   toggleThemeButton.innerText =  isLightMode ? "dark_mode" : "light_mode";
});

deleteChatButton.addEventListener("click", () => {
    if(confirm("Are you sure you want to delete all message?")){
        localStorage.removeItem("savedChats");
        loadLocalStorageData();
    }
});

typingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    handleOutGoingChat();
})