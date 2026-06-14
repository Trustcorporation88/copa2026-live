import React from "react";

interface PhoneFrameProps {
  children: React.ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #060d1a 0%, #0a1628 50%, #060d1a 100%)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "32px 24px 48px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 393,
          minHeight: 852,
          background: "#060e1c",
          borderRadius: 55,
          border: "12px solid #1c1c1e",
          boxShadow: [
            "0 0 0 1px #3a3a3c",
            "0 0 0 13px #1c1c1e",
            "0 0 0 14px #3a3a3c",
            "0 40px 100px rgba(0,0,0,0.85)",
            "0 10px 30px rgba(0,0,0,0.6)",
            "inset 0 0 0 1px rgba(255,255,255,0.06)",
          ].join(", "),
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Dynamic Island */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            width: 126,
            height: 34,
            background: "#000",
            borderRadius: 20,
            zIndex: 200,
          }}
        />

        {/* Side buttons (left) */}
        <div
          style={{
            position: "absolute",
            left: -15,
            top: 100,
            width: 4,
            height: 30,
            background: "#2c2c2e",
            borderRadius: "2px 0 0 2px",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -15,
            top: 148,
            width: 4,
            height: 64,
            background: "#2c2c2e",
            borderRadius: "2px 0 0 2px",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -15,
            top: 226,
            width: 4,
            height: 64,
            background: "#2c2c2e",
            borderRadius: "2px 0 0 2px",
          }}
        />

        {/* Side button (right) */}
        <div
          style={{
            position: "absolute",
            right: -15,
            top: 168,
            width: 4,
            height: 96,
            background: "#2c2c2e",
            borderRadius: "0 2px 2px 0",
          }}
        />

        {/* Screen content — starts below the Dynamic Island (46px) */}
        <div
          style={{
            marginTop: 0,
            paddingTop: 46,
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>

        {/* Home indicator */}
        <div
          style={{
            position: "sticky",
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            padding: "6px 0 10px",
            background: "#060e1c",
            zIndex: 50,
          }}
        >
          <div
            style={{
              width: 134,
              height: 5,
              borderRadius: 3,
              background: "rgba(255,255,255,0.25)",
            }}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 500px) {
          .phone-frame-outer { display: contents !important; }
          .phone-frame-outer > div { border-radius: 0 !important; border: none !important; box-shadow: none !important; min-height: 100vh !important; width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
