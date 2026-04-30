import Layout from '@/components/Layout'
import Patterns from "@/components/Patterns";
import Navbar from "@/components/Navbar";
import { ReduxProvider } from '@/redux/provider';

export default function Home() {
  return (
    <ReduxProvider>
      <Layout>
        <Navbar />
        <Patterns />
      </Layout>
    </ReduxProvider>
  );
}
