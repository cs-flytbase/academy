// import Layout from "@/components/Layout/layout";
// import { createClient } from "@/utils/supabase/server";
// import { redirect } from "next/navigation";
// export default async function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   const supabase = await createClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   setTimeout(() => {

//   }, 3000);
//   if (!user) {
//     console.log("not logged in");
//     return (
//       <div className="w-full h-full flex justify-center items-center">
//         Not logged in
//       </div>
//     );
//   }
//   return <Layout>{children}</Layout>;
// }
import Layout from "@/components/Layout/layout";
import AuthGuard from "@/components/AuthGuard"; // Import AuthGuard
import { TestProvider } from "@/contexts/TestContext";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <Layout>{children}</Layout>;
    </div>
  );
}
