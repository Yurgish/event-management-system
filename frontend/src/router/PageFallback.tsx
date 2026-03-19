import { Spinner } from '@/components/ui/spinner';

const PageFallback = () => {
  return (
    <div className="text-muted-foreground flex h-full items-center justify-center">
      <div className="flex flex-col items-center">
        <Spinner className="size-6" />
        <span className="mt-2 text-sm">Page is loading...</span>
      </div>
    </div>
  );
};

export default PageFallback;
