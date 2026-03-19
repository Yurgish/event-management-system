import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/constants/routes';

function NotFoundPage() {
  return (
    <section className="space-y-4">
      <p className="text-muted-foreground text-sm font-medium">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
        The page you requested does not exist or has been moved.
      </p>
      <Button asChild>
        <Link to={APP_ROUTES.EVENTS}>Back to Events</Link>
      </Button>
    </section>
  );
}

export default NotFoundPage;
