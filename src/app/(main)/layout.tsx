import Footer from "@/components/footer";
import Header from "@/components/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4">{children}</main>
      <Footer />
    </div>
  );
}
