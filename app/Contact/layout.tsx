"use client";

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ backgroundColor: '#d6e2ea', minHeight: '100vh' }}>
      {children}
    </div>
  );
}
