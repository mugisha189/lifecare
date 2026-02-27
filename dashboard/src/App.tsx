import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import useNetworkStatus from './hooks/useNetwork';
import routes from './routes';

function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

function AppContent() {
  const isOnline = useNetworkStatus();
  return (
    <>
      <AppRoutes />
      {/* Network status indicator */}
      {!isOnline && (
        <div className='fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-md z-50'>
          <span className='text-sm'>No internet connection</span>
        </div>
      )}
    </>
  );
}

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
