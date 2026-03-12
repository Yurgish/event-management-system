import Header from '@/components/Header';
import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';

function App() {
  const { isAuthBootstrapping } = useAuthBootstrap();

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthBootstrapping && <Header />}

      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Event Management System</h1>
      </main>
    </div>
  );
}

export default App;
