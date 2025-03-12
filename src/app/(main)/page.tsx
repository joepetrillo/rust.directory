import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="mb-1 text-2xl font-bold">Rust Directory</h1>
      <p className="mb-2 text-center text-balance text-muted-foreground">
        Your go-to resource for staying ahead in rust.
      </p>
      <Button>Get Started</Button>
    </div>
  );
}
