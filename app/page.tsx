import { redirect } from "next/navigation";

/**
 * Root page - Redirects to the hack simulation
 * This catches all captive portal requests
 */
export default function Home() {
  redirect("/hack");
}
