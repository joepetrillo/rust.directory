import Footer from "@/components/footer";
import Header from "@/components/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-3 flex-1 border-r border-l md:mx-8 lg:mx-12">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
