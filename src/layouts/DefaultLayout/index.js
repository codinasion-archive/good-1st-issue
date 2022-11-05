// navbar
import Navbar from "@/components/Navbar";

// footer
import Footer from "@/components/Footer";

export default function DefaultLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
