import './App.css';
import { useAllVideos } from './useAllVideos';

interface Video {
    id: number;
    title: string;
    user: string;
    duration: number;
    width: number;
    height: number;
}

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <div className="logo-container">
                    <img src="/protube-logo-removebg-preview.png" className="App-logo" alt="logo" />
                    <h1 className="app-title">ProTube</h1>
                </div>
            </header>
            <main className="main-content">
                <ContentApp />
            </main>
        </div>
    );
}

function ContentApp() {
    const { loading, message, value } = useAllVideos();

    switch (loading) {
        case 'loading':
            return <div className="loading">Loading...</div>;

        case 'error':
            return (
                <div className="error">
                    <h3>Error</h3>
                    <p>{message}</p>
                </div>
            );

        case 'success':
            const videos = value || [];

            return (
                <div className="video-grid">
                    {videos.map((video) => (
                        <div key={video.id} className="video-card">
                            <div className="video-thumbnail">
                                <div className="thumbnail-placeholder">
                                    <span className="video-id">{video.id}</span>
                                </div>
                                <div className="video-duration">
                                    {formatDuration(video.duration)}
                                </div>
                            </div>
                            <div className="video-info">
                                <h3 className="video-title">{video.title}</h3>
                                <p className="video-user">{video.user}</p>
                                <p className="video-subtitle">ProTube · reproducción directa</p>
                            </div>
                        </div>
                    ))}
                </div>
            );
    }

    return <div>Idle...</div>;
}

// Función para formatear la duración en minutos:segundos
function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default App;
