import { redirect } from "next/navigation";

export default function NotFound() {
    // If the user requests ANY page that doesn't exist (like /generate_204 or /hotspot-detect.html)
    // Redirect them immediately to the hack simulation
    redirect("/hack");
}
