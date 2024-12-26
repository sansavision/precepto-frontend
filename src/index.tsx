import { AppIntializer } from './app';

// fonts
import '@fontsource-variable/open-sans';
import '@/lib/styles/globals.css';

import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './lib/providers/auth-provider';
import { NatsProvider } from './lib/providers/nats-provider';

// Render the app
const rootElement = document.getElementById('root') as HTMLElement
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <NatsProvider>
        <AuthProvider>
            <AppIntializer />
        </AuthProvider>
      </NatsProvider>
    </StrictMode>,
  )
}


// const root = ReactDOM.createRoot(
//   document.getElementById('root') as HTMLElement,
// );
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// );
