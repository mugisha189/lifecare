import { Redirect } from 'expo-router';

// This is a redirect route for after login
// Users will be redirected to the tabs layout (home with map)
export default function Home() {
  return <Redirect href="/(tabs)" />;
}
