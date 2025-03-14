import Footer from "@/components/footer";
import Header from "@/components/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-3 flex-1 border-r border-l md:mx-8 lg:mx-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}
