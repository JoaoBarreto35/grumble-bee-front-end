import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ArchiveCollectionPage } from './pages/ArchiveCollectionPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { CollectionsPage } from './pages/CollectionsPage'
import { CurrentCollectionPage } from './pages/CurrentCollectionPage'
import { HomePage } from './pages/HomePage'
import { ProductPage } from './pages/ProductPage'
import { ProductsPage } from './pages/ProductsPage'
import { UpcomingCollectionPage } from './pages/UpcomingCollectionPage'
import { CustomerLoginPage } from './pages/CustomerLoginPage'
import { CustomerRegisterPage } from './pages/CustomerRegisterPage'
import { CustomerAccountPage } from './pages/CustomerAccountPage'
import { CustomerOrderPage } from './pages/CustomerOrderPage'
import { OrderLookupPage } from './pages/OrderLookupPage'
import { OrderConfirmationPage } from './pages/OrderConfirmationPage'
import { PaymentReturnPage } from './pages/PaymentReturnPage'
import { AdminAuthProvider } from './admin/AdminAuthContext'
import { AdminLoginPage } from './admin/AdminLoginPage'
import { AdminLayout } from './admin/AdminLayout'
import { AdminDashboardPage } from './admin/AdminDashboardPage'
import { AdminSeasonsPage } from './admin/AdminSeasonsPage'
import { AdminProductsPage } from './admin/AdminProductsPage'
import { AdminOrdersPage } from './admin/AdminOrdersPage'
import { AdminSettingsPage } from './admin/AdminSettingsPage'

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
