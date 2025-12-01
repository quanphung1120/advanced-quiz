import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { getToken } = await auth();

  const response = await fetch("http://localhost:3005/api/v1/users/me", {
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  });

  const data = await response.json();
  console.log("User Data:", data);

  return <div>Welcome to your dashboard!</div>;
}
