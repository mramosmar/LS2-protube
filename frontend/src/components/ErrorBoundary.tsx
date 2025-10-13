import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Actualiza el state para mostrar la UI de error
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#0f0f0f',
            color: 'white',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h2 style={{ color: '#ff4444', marginBottom: '20px' }}>Algo salió mal</h2>
          <p style={{ marginBottom: '20px', maxWidth: '600px' }}>
            La aplicación ha encontrado un error inesperado. Esto suele ocurrir cuando hay problemas con los datos del
            servidor o la configuración.
          </p>

          {true && (
            <details
              style={{
                backgroundColor: '#1a1a1a',
                padding: '20px',
                borderRadius: '8px',
                marginTop: '20px',
                width: '100%',
                maxWidth: '800px',
              }}
            >
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>Ver detalles técnicos</summary>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  fontSize: '12px',
                  color: '#ff6b6b',
                  textAlign: 'left',
                }}
              >
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <div style={{ marginTop: '30px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                marginRight: '10px',
              }}
            >
              Recargar Página
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              style={{
                backgroundColor: '#333',
                color: 'white',
                border: '1px solid #666',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              Limpiar Caché y Recargar
            </button>
          </div>

          <div style={{ marginTop: '30px', fontSize: '14px', color: '#aaa' }}>
            <p>
              <strong>Soluciones comunes:</strong>
            </p>
            <ul style={{ textAlign: 'left', maxWidth: '500px' }}>
              <li>Verifica que el backend esté ejecutándose en http://localhost:8080</li>
              <li>Revisa que la variable ENV_PROTUBE_STORE_DIR esté configurada</li>
              <li>Asegúrate de que la carpeta store/ contenga archivos JSON válidos</li>
            </ul>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
