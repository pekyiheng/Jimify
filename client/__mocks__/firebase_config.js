// For functions, use jest.fn().
// For objects (like `db`, `auth`, `model`), provide a mock object.

// Mock initializeApp (if any component imports it directly, otherwise not strictly needed)
export const initializeApp = jest.fn(() => ({
    name: '__mock_app__',
    options: {},
    // Add other properties that are accessed on the app object if needed
  }));
  
  // Mock getAuth and the 'auth' object
  export const getAuth = jest.fn(() => ({
    // Mock common auth methods your components might call
    currentUser: null, // Or a mock user object if a user is expected
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'mock-uid' } })),
    signOut: jest.fn(() => Promise.resolve()),
    // Add other auth methods you use
  }));
  
  export const auth = getAuth(); 
  
  
  // Mock getFirestore and the 'db' object
  export const getFirestore = jest.fn(() => ({
    collection: jest.fn((firestore, path) => ({
      doc: jest.fn((id) => ({
        get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ id, mockData: true }) })),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
      })),
      where: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ docs: [{ id: 'mockDocId', data: () => ({ mock: 'data' }) }] })),
      })),
      get: jest.fn(() => Promise.resolve({ docs: [] })), // For queries without where
    })),
    // Add other firestore methods you use (e.g., addDoc, updateDoc, deleteDoc, query, getDocs)
    // For query, collection, where, etc., you'd typically chain them
    query: jest.fn(),
    collection: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
    getDoc: jest.fn(() => Promise.resolve({ exists: false, data: () => undefined })),
    setDoc: jest.fn(() => Promise.resolve()),
    doc: jest.fn((db, path, id) => ({ id, path })), // Simplistic mock for doc reference
  }));
  
  export const db = getFirestore(); // Export the result of the mocked getFirestore
  
  // Mock AI/Gemini related functions and objects
  export const getAI = jest.fn(() => ({})); // Return an empty mock object
  export const GoogleAIBackend = jest.fn(); // Mock the class
  export const getGenerativeModel = jest.fn(() => ({
    generateContent: jest.fn(() => Promise.resolve({
      response: {
        text: jest.fn(() => 'Mock AI response'),
        // Add other properties/methods of the response object if used
      }
    })),
    // Add other model methods you use
  }));
  export const model = getGenerativeModel(); // Export the result of the mocked model
  
 
export const firebaseConfig = {};