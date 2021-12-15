window.addEventListener('DOMContentLoaded', () => {
    const random = document.getElementById("random");
    setInterval(async () => {
        const res = await fetch("/api/random").then(res => res.json());
        random.innerText = res.random;
    }, 3000);
});