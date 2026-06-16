import TopNavBar from "./TopNavBar";
import SimpleFooter from "./SimpleFooter";

export default function ShellChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNavBar />
      <main className="flex-1">{children}</main>
      <SimpleFooter />
    </>
  );
}
