import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebase.js';
import { setCurrentOperator } from './inventoryStore.js';

export const AUTH_SESSION_KEY = 'stock_movil_auth_session_v1';

/**
 * Lista blanca de los únicos 2 usuarios autorizados en el sistema
 * con sus respectivas contraseñas maestras configuradas.
 */
export const AUTHORIZED_USERS = [
  {
    email: 'admin@tucellexpress.com',
    role: 'admin',
    displayName: 'Alejandro (Admin)',
    password: 'Ale.3710',
    aliases: ['admin', 'alejandro', 'admin@tucellexpress.com']
  },
  {
    email: 'dueno@tucellexpress.com',
    role: 'dueño',
    displayName: 'Dueño (Propietario)',
    password: 'Jehu2026',
    aliases: ['dueno', 'dueño', 'jehu', 'dueno@tucellexpress.com']
  }
];

/**
 * Busca si un identificador o correo coincide con un usuario autorizado.
 * @param {string} identifier 
 * @returns {{ email: string, role: string, displayName: string, password: string } | null}
 */
export function getAuthorizedUserByIdentifier(identifier) {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  return AUTHORIZED_USERS.find(u => 
    u.email.toLowerCase() === clean || 
    (u.aliases && u.aliases.includes(clean))
  ) || null;
}

/**
 * Verifica si un correo o identificador está en la lista blanca de autorizados.
 * @param {string} identifier
 * @returns {boolean}
 */
export function isUserAuthorized(identifier) {
  return getAuthorizedUserByIdentifier(identifier) !== null;
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
 * Inicia sesión validando credenciales maestras y sincronizando con Firebase.
 * @param {string} emailOrUser 
 * @param {string} password 
 * @returns {Promise<any>}
 */
export async function loginWithEmail(emailOrUser, password) {
  const authDef = getAuthorizedUserByIdentifier(emailOrUser);

  if (!authDef) {
    throw new Error('Acceso Denegado: Este usuario no está autorizado como Dueño ni Administrador en Tu Cell Express.');
  }

  // Validación de contraseña maestra configurada
  if (authDef.password !== password) {
    throw new Error('Contraseña incorrecta. Por favor verifica tu clave de acceso.');
  }

  // Intento de conexión y sincronización con Firebase Auth en segundo plano
  let firebaseUser = null;
  try {
    if (auth) {
      const cred = await signInWithEmailAndPassword(auth, authDef.email, password).catch(async (err) => {
        if (err.code === 'auth/user-not-found') {
          return await createUserWithEmailAndPassword(auth, authDef.email, password);
        }
        return null;
      });
      if (cred?.user) {
        firebaseUser = cred.user;
      }
    }
  } catch (cloudErr) {
    // Si la consola de Firebase no tiene habilitado Email/Password aún,
    // el sistema autentica de manera local sin trabar el acceso.
    console.warn('Aviso de sincronización Firebase Auth:', cloudErr);
  }

  const activeUser = firebaseUser || {
    uid: `${authDef.role}-${Date.now()}`,
    email: authDef.email,
    displayName: authDef.displayName
  };

  saveAuthSession(activeUser, authDef);
  return activeUser;
}

/**
 * Registro o verificación de cuenta autorizada.
 * @param {string} emailOrUser 
 * @param {string} password 
 * @returns {Promise<any>}
 */
export async function registerAuthorizedUser(emailOrUser, password) {
  const authDef = getAuthorizedUserByIdentifier(emailOrUser);

  if (!authDef) {
    throw new Error('Registro Bloqueado: Solo se permite registrar las cuentas autorizadas del Dueño y Administrador.');
  }

  if (password.length < 6) {
    throw new Error('La contraseña debe tener un mínimo de 6 caracteres.');
  }

  // Si la contraseña coincide con la maestra o se define nueva
  if (password !== authDef.password) {
    throw new Error(`Para esta cuenta, por favor utiliza la contraseña oficial asignada (${authDef.displayName}).`);
  }

  return await loginWithEmail(emailOrUser, password);
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
      if (!user) {
        // No forzamos cierre local si el login fue validado por credenciales maestras locales
      } else {
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
