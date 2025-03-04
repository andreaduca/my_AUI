/*
  This file contains the logic for the DOM manipulation, based on what it says in the state.ui.
 */

export function showBanner() {
    const bannerEl = document.getElementById('myBanner');
    if (bannerEl) {
        bannerEl.style.display = 'block';
    }
}

export function hideBanner() {
    const bannerEl = document.getElementById('myBanner');
    if (bannerEl) {
        bannerEl.style.display = 'none';
    }
}

export function applyUIState(state) {
    if (state.ui.myBanner.show) {
        showBanner();
    } else {
        hideBanner();
    }
}

