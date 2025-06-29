function navigateWithDelay(target) {
    const btn = event.currentTarget;
    btn.style.transform = "scale(0.95)";
    btn.style.boxShadow = "0 0 30px #ff1744";
    setTimeout(() => {
      window.location.href = target;
    }, 400);
}