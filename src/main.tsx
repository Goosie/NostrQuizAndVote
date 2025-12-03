import { BrowserRouter } from 'react-router-dom';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/NostrQuizAndVote">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
