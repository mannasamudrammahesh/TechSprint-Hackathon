"use client";

export default function GuideEvalLayout({
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
