document.addEventListener("DOMContentLoaded", function () {
    const backButton = document.getElementById('back-button');
    
    // back to list
    if (backButton) {
        backButton.addEventListener('click', function () {
        console.log('back button click');
        window.location.href = `../index.html`; 
        });
    } else {
        console.error("Back button not found!");
    }

});
