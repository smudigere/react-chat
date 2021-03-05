import './App.css';

import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useState } from 'react';

import appConfig from './appConfig.json';

console.log(appConfig.firebaseConfig);

firebase.initializeApp(appConfig.firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

function ChatMessage(props) {

  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return(
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  )
}

function ChatRoom() {

  const messageRef = firestore.collection('messages');
  const query = messageRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {

    e.preventDefault();

    const {uid, photoURL} = auth.currentUser;

    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
  }

  return(
    <>
    <SignOut />
      <div>
        {messages && messages.map(msgs => <ChatMessage key={msgs.id} message={msgs} />)}
      </div>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />

        <button type='submit'>Send</button>
      </form>
    </>
  );
}

function SignOut()  {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function SignIn() {

  const signInWithGoogle = () =>  {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return(
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  );
}

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
      {/* The core Firebase JS SDK is always required and must be listed first */}
<script src="https://www.gstatic.com/firebasejs/8.2.10/firebase-app.js"></script>

          {/* TODO: Add SDKs for Firebase products that you want to use
     https://firebase.google.com/docs/web/setup#available-libraries */}
<script src="https://www.gstatic.com/firebasejs/8.2.10/firebase-analytics.js"></script>

      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

export default App;
