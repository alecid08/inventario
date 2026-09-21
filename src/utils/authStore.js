import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebase.js';
import { setCurrentOperator } from './inventoryStore.js';

export const AUTH_SESSION_KEY = 'stock_movil_auth_session_v1';

/**
 * Lista blanca de los correos autorizados en el sistema (sin contraseñas).
 * Refleja exactamente la regla de seguridad de firestore.rules.
 */
export const AUTHORIZED_EMAILS = [
  'admin@tucellexpress.com',
  'dueno@tucellexpress.com'
];

/**
 * Metadatos descriptivos de los usuarios autorizados (rol y nombre para la UI).
 */
export const AUTHORIZED_USERS_METADATA = {
  'admin@tucellexpress.com': {
    email: 'admin@tucellexpress.com',
    role: 'admin',
    displayName: 'Alejandro (Admin)'
  },
  'dueno@tucellexpress.com': {
    email: 'dueno@tucellexpress.com',
    role: 'dueño',
    displayName: 'Dueño (Propietario)'
  }
};

const ALIAS_MAP = {
  'admin': 'admin@tucellexpress.com',
  'alejandro': 'admin@tucellexpress.com',
  'admin@tucellexpress.com': 'admin@tucellexpress.com',
  'dueno': 'dueno@tucellexpress.com',
  'dueño': 'dueno@tucellexpress.com',
  'jehu': 'dueno@tucellexpress.com',
  'dueno@tucellexpress.com': 'dueno@tucellexpress.com'
};

/**
 * Resuelve un correo o alias al correo autorizado canónico.
 * @param {string} identifier 
 * @returns {string | null}
 */
export function getAuthorizedEmail(identifier) {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  if (AUTHORIZED_EMAILS.includes(clean)) return clean;
  return ALIAS_MAP[clean] || null;
}

/**
 * Busca si un identificador o correo coincide con un usuario autorizado.
 * @param {string} identifier 
 * @returns {{ email: string, role: string, displayName: string } | null}
 */
export function getAuthorizedUserByIdentifier(identifier) {
  const email = getAuthorizedEmail(identifier);
  if (!email) return null;
  return AUTHORIZED_USERS_METADATA[email] || null;
}

/**
 * Verifica si un correo o identificador está en la lista de autorizados.
 * @param {string} identifier
 * @returns {boolean}
 */
export function isUserAuthorized(identifier) {
  return getAuthorizedEmail(identifier) !== null;
}

/**
 * Obtiene la sesión local activa en el navegador.
 * @returns {{ uid: string, email: string, displayName: string, role: string, lastActive: number } | null}
 */
export function getCurrentAuthUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    if (!session || !session.email || !isUserAuthorized(session.email)) {
      localStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }
    return session;
  } catch (e) {
    localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

/**
 * Guarda o actualiza los datos de la sesión activa en localStorage.
 */
function saveAuthSession(user, authDef) {
  if (typeof window === 'undefined') return;
  const session = {
    uid: user.uid || `${authDef.role}-${Date.now()}`,
    email: authDef.email,
    displayName: authDef.displayName,
    role: authDef.role,
    lastActive: Date.now()
  };
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  setCurrentOperator(session.displayName);
  window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: session }));
}

/**
 * Mapea errores de Firebase Auth a mensajes descriptivos en español manteniendo el código.
 */
function formatFirebaseAuthError(err) {
  if (!err) return 'Error de autenticación en Firebase.';
  switch (err.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Contraseña o credenciales incorrectas en Firebase Auth.';
    case 'auth/user-not-found':
      return 'Usuario no encontrado en Firebase Auth. Crea la cuenta en Firebase Console.';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido.';
    case 'auth/user-disabled':
      return 'Esta cuenta ha sido inhabilitada en Firebase Auth.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Acceso temporalmente bloqueado por Firebase Auth.';
    case 'auth/network-request-failed':
      return 'Error de conexión de red al conectar con Firebase Auth.';
    default:
      return err.message || `Error de autenticación en Firebase (${err.code || 'desconocido'}).`;
  }
}

/**
 * Inicia sesión dependiendo EXCLUSIVAMENTE de signInWithEmailAndPassword de Firebase Auth.
 * Valida adicionalmente que el correo pertenezca a la lista autorizada.
 * @param {string} emailOrUser 
 * @param {string} password 
 * @returns {Promise<any>}
 */
export async function loginWithEmail(emailOrUser, password) {
  const authDef = getAuthorizedUserByIdentifier(emailOrUser);

  if (!authDef) {
    throw new Error('Acceso Denegado: Este usuario no está autorizado como Dueño ni Administrador en Tu Cell Express.');
  }

  if (!auth) {
    throw new Error('El servicio de autenticación de Firebase no está disponible.');
  }

  try {
    // Autenticación exclusiva con Firebase Auth
    const cred = await signInWithEmailAndPassword(auth, authDef.email, password);
    const firebaseUser = cred.user;

    // Verificación adicional de que el email autenticado en Firebase es uno de los permitidos
    const verifiedUserDef = getAuthorizedUserByIdentifier(firebaseUser.email || '');
    if (!verifiedUserDef) {
      await signOut(auth).catch(() => {});
      throw new Error('Acceso Denegado: La cuenta autenticada en Firebase no pertenece a los correos autorizados.');
    }

    saveAuthSession(firebaseUser, verifiedUserDef);
    return firebaseUser;
  } catch (err) {
    if (err.code) {
      const friendlyMsg = formatFirebaseAuthError(err);
      const authErr = new Error(friendlyMsg);
      authErr.code = err.code;
      throw authErr;
    }
    throw err;
  }
}

/**
 * Registro de cuenta: El auto-registro está deshabilitado por seguridad para evitar que cualquiera cree cuentas.
 * Las cuentas autorizadas deben crearse directamente en Firebase Console.
 * @param {string} emailOrUser 
 * @param {string} password 
 * @returns {Promise<any>}
 */
export async function registerAuthorizedUser(emailOrUser, password) {
  const authDef = getAuthorizedUserByIdentifier(emailOrUser);

  if (!authDef) {
    throw new Error('Registro Bloqueado: Este correo no está autorizado en Tu Cell Express.');
  }

  throw new Error('El registro automático está deshabilitado por seguridad. Las cuentas deben crearse en Firebase Console por el administrador. Inicia sesión con tu contraseña.');
}

/**
 * Cierra la sesión activa y elimina todos los accesos locales.
 */
export async function logoutUser() {
  if (typeof window === 'undefined') return;
  try {
    if (auth) await signOut(auth);
  } catch (e) {
    console.warn('Error al cerrar sesión en Firebase:', e);
  } finally {
    localStorage.removeItem(AUTH_SESSION_KEY);
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: null }));
    const baseUrl = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + '/';
    window.location.href = `${baseUrl}login/`;
  }
}

/**
 * Listener en tiempo real del estado de autenticación.
 */
export function initAuthListener() {
  if (typeof window === 'undefined' || !auth) return;

  try {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const authDef = getAuthorizedUserByIdentifier(user.email || '');
        if (!authDef) {
          console.warn('Usuario no autorizado detectado en Firebase Auth, cerrando sesión:', user.email);
          signOut(auth).catch(() => {});
          localStorage.removeItem(AUTH_SESSION_KEY);
          window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: null }));
        } else {
          saveAuthSession(user, authDef);
        }
      }
    });
  } catch (e) {
    console.warn('Listener de auth no disponible:', e);
  }
}
