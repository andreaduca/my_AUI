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

/**
 * Applies the `ui` state to the interface:
 * if ui.myBanner.show === true, show the banner, otherwise hide it.
 */
export function applyUIState(state) {
    if (state.ui.myBanner.show) {
        showBanner();
    } else {
        hideBanner();
    }
}

