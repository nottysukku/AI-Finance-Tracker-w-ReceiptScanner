"use client";

import { useEffect } from "react";

export default function Chatbot() {
  useEffect(() => {
    // Only load Tawk.to if we have the required environment variables
    const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
    const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;
    
    if (!propertyId || !widgetId || propertyId === 'your_property_id_here') {
      console.log('Tawk.to not configured. Please add NEXT_PUBLIC_TAWK_PROPERTY_ID and NEXT_PUBLIC_TAWK_WIDGET_ID to your .env file');
      return;
    }

    // Initialize Tawk.to
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);

    // Optional: Customize Tawk.to settings
    window.Tawk_API.onLoad = function(){
      console.log('Tawk.to chat widget loaded successfully');
    };

    // Cleanup function
    return () => {
      // Remove the script when component unmounts
      const tawkScript = document.querySelector(`script[src*="embed.tawk.to"]`);
      if (tawkScript) {
        tawkScript.remove();
      }
    };
  }, []);

  // This component doesn't render anything visible - Tawk.to handles the UI
  return null;
}
