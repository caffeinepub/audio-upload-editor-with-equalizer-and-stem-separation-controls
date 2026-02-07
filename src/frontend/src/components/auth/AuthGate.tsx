import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '@/hooks/useQueries';
import { useActorConnection } from '@/hooks/useActorConnection';
import { Loader2 } from 'lucide-react';
import LoginButton from './LoginButton';
import ProfileSetupModal from './ProfileSetupModal';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isLoading: actorLoading } = useActorConnection();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-amber-950/5">
        <div className="text-center space-y-6 max-w-md px-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to AudioForge</h1>
            <p className="text-muted-foreground">
              Professional audio editing with equalizer and stem separation. Please log in to continue.
            </p>
          </div>
          <LoginButton />
        </div>
      </div>
    );
  }

  // Wait for actor to be ready before checking profile
  // This prevents profile setup modal from flashing when actor is still connecting
  const showProfileSetup = isAuthenticated && !!actor && !actorLoading && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      {showProfileSetup && <ProfileSetupModal />}
      {children}
    </>
  );
}
