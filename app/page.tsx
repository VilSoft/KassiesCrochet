import Layout from '@/components/Layout'
import Patterns from "@/components/Patterns";
import Navbar from "@/components/Navbar";
import { ReduxProvider } from '@/redux/provider';
import { ToastProvider } from '@/components/Toast';

export default function Home() {
  return (
    <ReduxProvider>
      <ToastProvider>
        <Layout>
          <Navbar />
          <Patterns />
        </Layout>
      </ToastProvider>
    </ReduxProvider>
  );
}
