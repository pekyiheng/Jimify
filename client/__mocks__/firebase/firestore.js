// __mocks__/firebase/firestore.js

// Mock a DocumentSnapshot for `getDoc` and `getDocs` results
const createMockDocumentSnapshot = (id, data = {}, exists = true) => ({
    id,
    exists: exists,
    data: jest.fn(() => {
      if (!exists) {
        return undefined;
      }
      const defaultData = {
        Meal_Map: {
            Breakfast: {},
            Lunch: {},
            Dinner: {},
            Snacks: {},
        },
    };
    return { ...defaultData, ...data };
    })
  });
  
  const createMockQuerySnapshot = (docsArray = []) => ({
    empty: docsArray.length === 0,
    docs: docsArray.map(doc => createMockDocumentSnapshot(doc.id, doc.data)),
    size: docsArray.length,
    forEach: jest.fn((callback) => docsArray.forEach(doc => callback(createMockDocumentSnapshot(doc.id, doc.data)))),
  });
  
  // Mock for a DocumentReference. This is what `doc()` returns.
  const createMockDocRef = (firestoreInstance, collectionPath, docId, ...subPaths) => {
    const fullPath = [collectionPath, docId, ...subPaths].join('/');
    return {
      id: docId,
      path: fullPath,
      firestore: firestoreInstance, // Include a reference to the mock firestore instance
      // Mock standard methods on a DocumentReference
      get: jest.fn(() => Promise.resolve(createMockDocumentSnapshot(docId))),
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve()),
      delete: jest.fn(() => Promise.resolve()),
      onSnapshot: jest.fn((callback) => {
        // Basic mock: immediately call with initial data, then do nothing
        callback(createMockDocumentSnapshot(docId));
        return jest.fn(); // Return an unsubscribe function
      }),
      collection: jest.fn((subcollectionName) =>
        // Allow subcollections on doc refs: doc(db, "users", "uid").collection("items")
        collection(firestoreInstance, fullPath, subcollectionName)
      ),
    };
  };
  
  // Mock for a CollectionReference. This is what `collection()` returns.
  const createMockCollectionRef = (firestoreInstance, path, ...pathSegments) => {
    const fullPath = [path, ...pathSegments].join('/');
    return {
      id: path, // Or the last segment for subcollections
      path: fullPath,
      firestore: firestoreInstance, // Include a reference to the mock firestore instance
      // Mock standard methods on a CollectionReference
      doc: jest.fn((docId) => createMockDocRef(firestoreInstance, fullPath, docId)),
      add: jest.fn(() => Promise.resolve(createMockDocRef(firestoreInstance, fullPath, 'mock-new-doc-id'))),
      onSnapshot: jest.fn((callback) => {
        callback(createMockQuerySnapshot()); // Default empty snapshot
        return jest.fn();
      }),
      // For queries on a collection (e.g., collection(...).where(...).get())
      where: jest.fn(() => createMockQuery(firestoreInstance, fullPath)),
      orderBy: jest.fn(() => createMockQuery(firestoreInstance, fullPath)),
      limit: jest.fn(() => createMockQuery(firestoreInstance, fullPath)),
      get: jest.fn(() => Promise.resolve(createMockQuerySnapshot())),
    };
  };
  
  // Mock for a Query. This is what `query()` returns, or what chaining methods return.
  const createMockQuery = (firestoreInstance, collectionPath, constraints = []) => {
    const mockQuery = {
      // This is the key method called by `getDocs(query)`.
      get: jest.fn(() => Promise.resolve(createMockQuerySnapshot())),
      // Allow chaining for query constraints
      where: jest.fn((field, op, value) => {
        // In a real mock, you might store these for more advanced assertions.
        // For now, just return a new mock query for chaining.
        return createMockQuery(firestoreInstance, collectionPath, [...constraints, { type: 'where', field, op, value }]);
      }),
      orderBy: jest.fn(() => mockQuery),
      limit: jest.fn(() => mockQuery),
      // For snapshot listeners on queries
      onSnapshot: jest.fn((callback) => {
        callback(createMockQuerySnapshot());
        return jest.fn();
      }),
    };
    // Add a way to identify the query, e.g., for `getDocs` in your tests
    mockQuery.path = collectionPath;
    mockQuery.queryConstraints = constraints;
    return mockQuery;
  };
  
  
  // -------------------------------------------------------------------------
  // Export the individual mocked Firebase Firestore functions
  // -------------------------------------------------------------------------
  
  export const getFirestore = jest.fn(() => ({
    // This mock `db` object might be used as the first argument to `collection`, `doc`, etc.
    // Although we are mocking `collection` and `doc` directly below, some internal Firebase logic
    // or a component's direct use of `db.collection` might rely on this.
    // We'll provide mock methods on it just in case, but the global mocks below take precedence.
    collection: jest.fn((path, ...segments) => collection(getFirestore(), path, ...segments)),
    doc: jest.fn((path, docId, ...segments) => doc(getFirestore(), path, docId, ...segments)),
    // Add other top-level Firestore methods you use, if any
  }));
  
  
  // Functions imported directly by OnboardUser.jsx
  // `db` in collection(db, "Users") will be the mocked `db` from firebase_config.js.
  // Since we're mocking `collection` itself, it doesn't strictly care about the type of `db`.
  export const collection = jest.fn((firestore, path, ...pathSegments) => {
    return createMockCollectionRef(firestore, path, ...pathSegments);
  });
  
  export const doc = jest.fn((firestore, collectionPath, docId, ...subCollectionPathSegments) => {
    return createMockDocRef(firestore, collectionPath, docId, ...subCollectionPathSegments);
  });
  
  export const query = jest.fn((_collectionRef, ...queryConstraints) => {
    // `_collectionRef` will be the result of our `collection` mock.
    // We need to pass the "path" through if we want to assert on it in `getDocs`.
    const collectionPath = _collectionRef.path; // Access the path from the mocked CollectionRef
    return createMockQuery(_collectionRef.firestore, collectionPath, queryConstraints);
  });
  
  export const where = jest.fn((field, op, value) => ({ field, op, value, type: 'where' })); // Returns a simple object representing the constraint
  
  export const getDocs = jest.fn((queryRef) => {
    // This is called like `await getDocs(toUserIdQuery);`
    // It needs to call the `.get()` method on the mocked `queryRef`
    return queryRef.get();
  });
  
  export const getDoc = jest.fn((docRef) => {
    // This is called like `await getDoc(userProfileDocRef);`
    return docRef.get();
  });
  
  export const setDoc = jest.fn((docRef, data, options) => {
    // This is called like `await setDoc(userProfileDocRef, data, options);`
    // It needs to call the `.set()` method on the mocked `docRef`
    return docRef.set(data, options);
  });
  
  // Add other imports from 'firebase/firestore' that your app uses, e.g.:
  // export const addDoc = jest.fn((collectionRef, data) => collectionRef.add(data));
  // export const updateDoc = jest.fn((docRef, data) => docRef.update(data));
  // export const deleteDoc = jest.fn((docRef) => docRef.delete());
  // export const onSnapshot = jest.fn((ref, callback) => ref.onSnapshot(callback));