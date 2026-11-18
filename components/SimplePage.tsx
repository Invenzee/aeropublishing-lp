import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function SimplePage({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="page">
        <article className="page-inner">
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          {children}
        </article>
      </main>
      <Footer />
    </>
  );
}
