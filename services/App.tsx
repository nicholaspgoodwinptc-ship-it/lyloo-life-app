import { useEffect } from 'react';
import { supabase } from './services/supabaseClient';

function App() {
    useEffect(() => {
        // This will print the initialized Supabase object to your browser console
        console.log('Supabase Connection Test:', supabase);
    }, []);

    return (
    // ... your existing component tree
  );
}