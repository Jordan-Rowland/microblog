// Opens new database, name and version number
// Inside .open, must call function that creates a table
// Arguments are name of the table, and primary key
// Use this promise whenever you access the database
// createObjectStore must be called if table does not exist yet
let dbPromise = idb.open('emails', 1, db => {
  if (!db.objectStoreNames.contains('newEmails')) {
    db.createObjectStore('newEmails', {keyPath: 'id'});
  }
});


function writeData(st, data) {
  return dbPromise
    .then(db => {
      // transaction takes 2 arguments, which table we want to access
      // and what kind of transaction it is, readwrite or read only
      let tx = db.transaction(st, 'readwrite');
      let store = tx.objectStore(st);
      store.put(data);
      // return transaction.complete, not a method just a property
      return tx.complete;
    });
}


function readAllData(st) {
  return dbPromise
    .then(db => {
      let tx = db.transaction(st, 'readonly');
      let store = tx.objectStore(st);
      return store.getAll();
    });
}


function clearAllData(st) {
  return dbPromise
    .then(db => {
      let tx = db.transaction(st, 'readwrite');
      let store = tx.objectStore(st);
      store.clear();
      // tx.complete on every write operation
      return tx.complete;
    });
}


function deleteItemFromData(st, id) {
  return dbPromise
    .then(db => {
      let tx = db.transaction(st, 'readwrite');
      let store = tx.objectStore(st);
      store.delete(id);
      // tx.complete on every write operation
      return tx.complete;
    })
      .then(() => console.log('Item deleted'));
}

