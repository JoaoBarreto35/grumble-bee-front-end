import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ArchiveCollectionPage } from './pages/ArchiveCollection'
import { CartPage } from './pages/Cart'
import { CheckoutPage } from './pages/Checkout'
import { CollectionsPage } from './pages/Collections'
import { CurrentCollectionPage } from './pages/CurrentCollection'
import { HomePage } from './pages/Home'
import { ProductPage } from './pages/Product'
import { ProductsPage } from './pages/Products'
import { UpcomingCollectionPage } from './pages/UpcomingCollection'
import { CustomerLoginPage } from './pages/Login'
import { CustomerRegisterPage } from './pages/Register'
import { CustomerAccountPage } from './pages/Account'
import { CustomerOrderPage } from './pages/AccountOrder'
import { OrderLookupPage } from './pages/OrderLookup'
import { OrderConfirmationPage } from './pages/OrderConfirmation'
import { PaymentReturnPage } from './pages/PaymentReturn'
import { AdminAuthProvider } from './admin/AdminAuthContext'
import { AdminLoginPage } from './admin/pages/Login'
import { AdminLayout } from './admin/AdminLayout'
import { AdminDashboardPage } from './admin/pages/Dashboard'
import { AdminSeasonsPage } from './admin/pages/Seasons'
import { AdminProductsPage } from './admin/pages/Products'
import { AdminOrdersPage } from './admin/pages/Orders'
import { AdminSettingsPage } from './admin/pages/Settings'

function StoreRoutes() {
  return <AppShell><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/produtos" element={<ProductsPage />} />
    <Route path="/produto/:slug" element={<ProductPage />} />
    <Route path="/carrinho" element={<CartPage />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/pedido-confirmado" element={<OrderConfirmationPage />} />
    <Route path="/pagamento/sucesso" element={<PaymentReturnPage variant="success" />} />
    <Route path="/pagamento/pendente" element={<PaymentReturnPage variant="pending" />} />
    <Route path="/pagamento/falha" element={<PaymentReturnPage variant="failure" />} />
    <Route path="/entrar" element={<CustomerLoginPage />} />
    <Route path="/cadastro" element={<CustomerRegisterPage />} />
    <Route path="/minha-conta" element={<CustomerAccountPage />} />
    <Route path="/minha-conta/pedidos/:orderCode" element={<CustomerOrderPage />} />
    <Route path="/consultar-pedido" element={<OrderLookupPage />} />
    <Route path="/colecoes" element={<CollectionsPage />} />
    <Route path="/colecao-atual" element={<CurrentCollectionPage />} />
    <Route path="/colecao-arquivo" element={<ArchiveCollectionPage />} />
    <Route path="/em-breve" element={<UpcomingCollectionPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></AppShell>
}

export default function App() {
  const isAdmin = window.location.pathname.startsWith('/admin')
  if (isAdmin) return <AdminAuthProvider><Routes>
    <Route path="/admin/login" element={<AdminLoginPage />} />
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<AdminDashboardPage />} />
      <Route path="temporadas" element={<AdminSeasonsPage />} />
      <Route path="produtos" element={<AdminProductsPage />} />
      <Route path="pedidos" element={<AdminOrdersPage />} />
      <Route path="configuracoes" element={<AdminSettingsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/admin" replace />} />
  </Routes></AdminAuthProvider>
  return <StoreRoutes />
}
