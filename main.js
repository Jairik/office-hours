/* Main functionalities for the website */
import { getClassList } from './class-list.js'  // Static class-list

/** Send the message on the contact form */
export function setupSendEmail(){
    // Get the form element
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        // Extract the values
        const name = document.getElementById('name').value.trim();
        const course = document.getElementById('classSelect').value;
        const msg = document.getElementById('message').value.trim();
        // Add it to an email message
        const body = encodeURIComponent(
            `Name: ${name}\nCourse: ${course}\nMessage:\n${msg}`
        );
        // Open the default email sender thing
        window.location.href = `mailto:jmccauley4@gulls.salisbury.edu?subject=Tutoring Contact Form Submission - ${name}&body=${body}`;
        // Update with a success message
        document.getElementById('formResponse').textContent = 
            `Thank you for reaching out ${name}! Your message has been opened in your email client, feel free to send it as-is and I will get back to you asap.`;
        this.reset();  // Reset all of the values
    });
}

/** Get the element of the class dropdown, then populate it with the class list */
export function populateClassList(){
    // Get the classList and dropdown element
    const classList = getClassList();
    const classDropdown = document.getElementById('classSelect');
    // Populate the dropdown with the class list
    classList.forEach(singleClass => {
        const option = document.createElement("option");
        option.value = singleClass;
        option.textContent = singleClass;
        classDropdown.appendChild(option);
    });
}

/** Setup the theme toggling functionality */
export function setupThemeToggle(){
    // Get the toggle button element and current theme
    const toggleBtn = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'dark';
    // Set the current theme based off the current button state
    document.documentElement.setAttribute('data-theme', currentTheme);
    toggleBtn.textContent = currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    // Add an event listener to the button to switch theme
    toggleBtn.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        toggleBtn.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    });
}