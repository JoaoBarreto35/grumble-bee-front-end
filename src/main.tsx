import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CatalogProvider } from './context/CatalogContext'
import { CartProvider } from './context/CartContext'
import { CustomerAuthProvider } from './context/CustomerAuthContext'
import './styles.css'
<<<<<<< HEAD
=======
import './home-v534.css'
>>>>>>> 4f4d9b296ae796e667925784c32b760d64fbb98a

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CatalogProvider>
        <CustomerAuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </CustomerAuthProvider>
      </CatalogProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
