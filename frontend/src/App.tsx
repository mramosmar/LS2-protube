import './App.css';
import { useAllVideos } from './useAllVideos';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src="/protube-logo-removebg-preview.png" className="App-logo" alt="logo" />
        <ContentApp />
      </header>
    </div>
  );
}

function ContentApp() {
  const { loading, message, value } = useAllVideos();

  switch (loading) {
    case 'loading':
      return <div>Loading...</div>;

    case 'error':
      return (
        <div>
          <h3>Error</h3>
          <p>{message}</p>
        </div>
      );

    case 'success': {
      // convertir el JSON en un array de valores
      const myarray = Object.values(value || {});

      return (
        <>
          <strong>Videos available:</strong>
          <ul>
            {myarray.map((item, index) => (
              <li key={index}>
                {item.id ? item.id : JSON.stringify(item)} {/* por si no hay "title", mostrar algo */}
              </li>
            ))}
          </ul>
        </>
      );
    }
  }

  return <div>Idle...</div>;
}

export default App;
