import { redirect } from "next/navigation";

/**
 * Root page - Redirects to the hack simulation
 * This catches all captive portal requests
 * 
 * Flow: / → /hack → /digital-arrest → /digital-arrest/payment → /reveal
 */
export default function Home() {
  redirect("/hack"); // Hacking simulation → leads to Digital Arrest
}
