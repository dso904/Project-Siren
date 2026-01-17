import { redirect } from "next/navigation";

/**
 * Root page - Redirects to the captive portal
 * This catches all captive portal requests
 * 
 * Flow: / → /portal → /hack → /digital-arrest → /reveal
 */
export default function Home() {
  redirect("/portal"); // Wi-Fi login form → OSINT demonstration
}
