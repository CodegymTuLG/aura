// Khởi tạo EmailJS
(function () {
  emailjs.init("qXsKZq0bboGywnx8C"); // 🔑 thay bằng Public Key của bạn
})();

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("newsletter-form");
  if (!form) return;

  const emailInput = document.getElementById("newsletter-email");
  const loading = form.querySelector(".loading");
  const errorMessage = form.querySelector(".error-message");
  const sentMessage = form.querySelector(".sent-message");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Reset UI
    loading.style.display = "block";
    errorMessage.style.display = "none";
    sentMessage.style.display = "none";

    try {
      // 1. Gửi mail qua EmailJS
      await emailjs.send("service_a7s28vd", "template_1e6rrrl", {
        user_email: emailInput.value,
      });

      // 2. Lưu Firestore
      await firebase.firestore().collection("subscribers").add({
        email: emailInput.value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      // Thành công
      loading.style.display = "none";
      sentMessage.style.display = "block";
      form.reset();
    } catch (err) {
      console.error("Error:", err);
      loading.style.display = "none";
      errorMessage.style.display = "block";
      errorMessage.innerText = "❌ Lỗi: " + (err.message || JSON.stringify(err));
    }
  });
});
