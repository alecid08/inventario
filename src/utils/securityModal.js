import { getCurrentAuthUser, loginWithEmail } from './authStore.js';

/**
 * Creates and renders a dynamic 2FA double-confirmation modal.
 * Requires:
 * 1. Confirmation check ("Estoy seguro de querer hacerlo").
 * 2. Entering a dynamic 4-digit 2FA challenge code.
 * 3. Validating the active operator's password against Firebase Auth.
 *
 * @param {{ title: string, description: string, confirmText?: string, danger?: boolean }} options
 * @returns {Promise<boolean>} Resolves true if 2FA & password check succeeds.
 */
export function request2FAConfirmation(options) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('No disponible en servidor'));
    }

    const currentUser = getCurrentAuthUser();
    if (!currentUser) {
      alert('Debes tener una sesión activa de Dueño o Administrador para autorizar esta operación.');
      return reject(new Error('Sesión no activa'));
    }

    // Generate random 4-digit 2FA code
    const random2FACode = Math.floor(1000 + Math.random() * 9000).toString();

    // Create Modal HTML element
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/60 backdrop-blur-sm animate-in fade-in duration-200';
    modalOverlay.id = 'sec-2fa-modal-overlay';

    modalOverlay.innerHTML = `
      <div class="w-full max-w-md bg-surface-container-lowest rounded-2xl p-5 shadow-2xl border border-surface-container flex flex-col gap-4 animate-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="flex items-start justify-between border-b border-surface-container pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl ${options.danger !== false ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary'} flex items-center justify-center font-bold shrink-0">
              <span class="material-symbols-outlined text-[22px]">security</span>
            </div>
            <div>
              <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight">${options.title || 'Autorización de Seguridad (2FA)'}</h3>
              <p class="text-xs text-secondary font-medium">Verificación obligatoria de doble factor</p>
            </div>
          </div>
          <button type="button" id="sec2faCloseBtn" class="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:bg-surface-container transition-colors cursor-pointer">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- Description -->
        <div class="p-3 bg-surface-container-low rounded-xl border border-surface-container text-xs text-on-surface-variant font-medium leading-relaxed">
          ${options.description || 'Esta acción modificará o eliminará datos críticos en el sistema y en la nube.'}
        </div>

        <!-- Feedback Error Banner -->
        <div id="sec2faErrorBanner" class="hidden p-2.5 bg-error-container text-on-error-container rounded-xl text-xs font-bold items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">error</span>
          <span id="sec2faErrorText"></span>
        </div>

        <!-- Form fields -->
        <form id="sec2faForm" class="flex flex-col gap-3">
          <!-- Step 1: Double factor checkbox -->
          <label class="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-surface-container-low transition-colors">
            <input type="checkbox" id="sec2faCheckbox" class="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary" required />
            <span class="text-xs text-on-surface font-bold leading-tight">
              Confirmo que estoy completamente seguro de querer realizar esta acción.
            </span>
          </label>

          <!-- Step 2: Double factor challenge code -->
          <div class="bg-surface-container-low p-3 rounded-xl border border-surface-container space-y-1.5">
            <div class="flex items-center justify-between">
              <label for="sec2faCodeInput" class="text-xs font-bold text-on-surface">
                Doble Factor (2FA) - Código de Confirmación:
              </label>
              <span class="px-2 py-0.5 rounded-md bg-primary text-on-primary font-mono text-xs font-extrabold tracking-widest" id="sec2faChallengeBadge">${random2FACode}</span>
            </div>
            <p class="text-[11px] text-secondary">Escribe el código numérico <strong class="text-on-surface">${random2FACode}</strong> mostrado arriba:</p>
            <input
              type="text"
              id="sec2faCodeInput"
              maxlength="4"
              placeholder="Ej. ${random2FACode}"
              class="w-full h-10 px-3 rounded-xl bg-surface-container-lowest text-on-surface font-mono font-bold text-center tracking-widest text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <!-- Step 3: Password verification -->
          <div class="space-y-1">
            <label for="sec2faPasswordInput" class="text-xs font-bold text-on-surface">
              Contraseña de <strong class="text-primary">${currentUser.displayName}</strong> (${currentUser.email}):
            </label>
            <input
              type="password"
              id="sec2faPasswordInput"
              placeholder="Ingresa tu contraseña para autorizar"
              class="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              required
            />
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 pt-2 border-t border-surface-container">
            <button type="button" id="sec2faCancelBtn" class="flex-1 h-11 rounded-xl bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high transition-colors">
              Cancelar
            </button>
            <button type="submit" id="sec2faSubmitBtn" class="flex-1 h-11 rounded-xl ${options.danger !== false ? 'bg-error text-on-error' : 'bg-primary text-on-primary'} font-bold text-xs shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">verified_user</span>
              <span id="sec2faSubmitText">${options.confirmText || 'Confirmar y Ejecutar'}</span>
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalOverlay);
    document.body.classList.add('overflow-hidden');

    const closeBtn = modalOverlay.querySelector('#sec2faCloseBtn');
    const cancelBtn = modalOverlay.querySelector('#sec2faCancelBtn');
    const form = modalOverlay.querySelector('#sec2faForm');
    const errorBanner = modalOverlay.querySelector('#sec2faErrorBanner');
    const errorText = modalOverlay.querySelector('#sec2faErrorText');
    const submitBtn = modalOverlay.querySelector('#sec2faSubmitBtn');
    const submitText = modalOverlay.querySelector('#sec2faSubmitText');

    function showError(msg) {
      if (errorBanner && errorText) {
        errorText.textContent = msg;
        errorBanner.classList.remove('hidden');
        errorBanner.classList.add('flex');
      }
    }

    function hideError() {
      if (errorBanner) {
        errorBanner.classList.add('hidden');
        errorBanner.classList.remove('flex');
      }
    }

    function destroyModal() {
      document.body.classList.remove('overflow-hidden');
      modalOverlay.remove();
    }

    closeBtn?.addEventListener('click', () => {
      destroyModal();
      reject(new Error('Operación cancelada por el usuario'));
    });

    cancelBtn?.addEventListener('click', () => {
      destroyModal();
      reject(new Error('Operación cancelada por el usuario'));
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideError();

      const checkbox = modalOverlay.querySelector('#sec2faCheckbox');
      const codeInput = modalOverlay.querySelector('#sec2faCodeInput');
      const passwordInput = modalOverlay.querySelector('#sec2faPasswordInput');

      if (!checkbox?.checked) {
        showError('Debes marcar la casilla confirmando que estás seguro.');
        return;
      }

      if (codeInput?.value.trim() !== random2FACode) {
        showError(`El código 2FA ingresado (${codeInput?.value}) no coincide con el código requerido (${random2FACode}).`);
        return;
      }

      const password = passwordInput?.value || '';
      if (!password) {
        showError('Ingresa tu contraseña de usuario para verificar tu identidad.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        if (submitText) submitText.textContent = 'Verificando credenciales...';
      }

      try {
        // Authenticate password with Firebase Auth
        await loginWithEmail(currentUser.email, password);
        destroyModal();
        resolve(true);
      } catch (err) {
        if (submitBtn) submitBtn.disabled = false;
        if (submitText) submitText.textContent = options.confirmText || 'Confirmar y Ejecutar';
        showError(err.message || 'Contraseña incorrecta o error de verificación.');
      }
    });
  });
}
