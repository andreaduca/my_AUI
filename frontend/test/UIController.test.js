import { showBanner, hideBanner, applyUIState } from '../action/UIController.js';

describe('UIController', () => {
    beforeEach(() => {
        // Imposta un semplice DOM per i test
        document.body.innerHTML = `<div id="myBanner" style="display: none;"></div>`;
    });

    test('dovrebbe mostrare il banner con showBanner()', () => {
        showBanner();
        const bannerEl = document.getElementById('myBanner');
        expect(bannerEl.style.display).toBe('block');
    });

    test('dovrebbe nascondere il banner con hideBanner()', () => {
        hideBanner();
        const bannerEl = document.getElementById('myBanner');
        expect(bannerEl.style.display).toBe('none');
    });

    test('applyUIState dovrebbe sincronizzare la UI in base allo state', () => {
        // Crea uno state di test
        const state = {
            ui: {
                myBanner: {
                    show: true
                }
            }
        };
        applyUIState(state);
        const bannerEl = document.getElementById('myBanner');
        expect(bannerEl.style.display).toBe('block');

        state.ui.myBanner.show = false;
        applyUIState(state);
        expect(bannerEl.style.display).toBe('none');
    });
});