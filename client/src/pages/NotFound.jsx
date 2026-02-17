/**
 * 404 Not Found Page
 */

import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-slate-200">404</h1>
                <h2 className="text-2xl font-semibold text-slate-900 mt-4">Page Not Found</h2>
                <p className="text-slate-500 mt-2 max-w-md mx-auto">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex items-center justify-center gap-4 mt-8">
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                    <Button asChild className="gradient-primary">
                        <Link to="/">
                            <Home className="h-4 w-4 mr-2" />
                            Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
