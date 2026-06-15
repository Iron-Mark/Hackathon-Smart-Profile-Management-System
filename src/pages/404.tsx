// src/pages/404.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6">
      <h1 className="text-6xl font-extrabold text-foreground mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Oops! The page you’re looking for doesn’t exist.
      </p>
      <Button asChild>
        <Link to="/">Go back home</Link>
      </Button>
    </div>
  );
}
