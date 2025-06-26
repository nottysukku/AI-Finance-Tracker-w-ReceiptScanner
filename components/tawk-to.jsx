"use client";

import { useEffect } from "react";

export default function TawkTo() {
  useEffect(() => {
    // Only load if we have the environment variables
    if (!process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || !process.env.NEXT_PUBLIC_TAWK_WIDGET_ID) {
      console.log("Tawk.to not configured - missing environment variables");
      return;
    }

    // Check if Tawk_API already exists
    if (window.Tawk_API) {
      return;
    }

    // Initialize Tawk.to
    var Tawk_API = Tawk_API || {};
    var Tawk_LoadStart = new Date();
    
    window.Tawk_API = Tawk_API;
    window.Tawk_LoadStart = Tawk_LoadStart;
    
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://embed.tawk.to/${process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID}/${process.env.NEXT_PUBLIC_TAWK_WIDGET_ID}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    
    const firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode.insertBefore(script, firstScript);
    
    // Optional: Configure Tawk.to appearance
    Tawk_API.onLoad = function() {
      console.log("Tawk.to loaded successfully");
    };
    
  }, []);

  return null; // This component doesn't render anything visible
}
