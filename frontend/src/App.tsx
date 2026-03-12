import { RouterProvider } from 'react-router-dom';

import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import { router } from '@/router';

function App() {
  const { isAuthBootstrapping } = useAuthBootstrap();

  if (isAuthBootstrapping) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return <RouterProvider router={router} />;
}

export default App;
