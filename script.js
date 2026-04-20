const topbar = document.querySelector("[data-topbar]");
const accordionItems = document.querySelectorAll("[data-accordion] details");

const syncTopbar = () => {
  if (!topbar) {
    return;
  }

  topbar.classList.toggle("is-scrolled", window.scrollY > 12);
};

for (const item of accordionItems) {
  item.addEventListener("toggle", () => {
    if (!item.open) {
      return;
    }

    for (const sibling of accordionItems) {
      if (sibling !== item) {
        sibling.open = false;
      }
    }
  });
}

syncTopbar();
window.addEventListener("scroll", syncTopbar, { passive: true });
