import logo from './logo.svg';
import './App.css';
import './App.scss';

function App2() {
  return (
      <div className="App2">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Welcome!
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Welcome to Riemann App!
        </a>
      </header>
      </div>
  );
}

export default App2;
