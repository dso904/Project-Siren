import { redirect } from "next/navigation";

/**
 * Root page - Redirects to the Digital Arrest demonstration
 * This catches all captive portal requests
 * 
 * NOTE: Original redirect was to "/hack" - preserved for future use
 * To switch back: uncomment the /hack redirect and comment out /digital-arrest
 */
export default function Home() {
  // redirect("/hack"); // Original hacking simulation - preserved
  redirect("/digital-arrest"); // Digital Arrest demonstration
}
